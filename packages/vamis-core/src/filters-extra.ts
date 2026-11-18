import { extendsFilters, getFilters } from '@vamis/formula'
import { dayjs, parseDate } from './utils/dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { getByPath } from './scope'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

type FilterContext = {
  data: Record<string, any>
  filter?: { name: string; args: any[] }
  restFilters: Array<{ name: string; args: any[] }>
}

function asFiniteNumber(value: unknown): number {
  const number = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(number) ? number : 0
}

function cleanNumber(value: number): number {
  return Number.isFinite(value) ? Number.parseFloat(value.toPrecision(12)) : 0
}

function variableValue(this: FilterContext, value: unknown): unknown {
  if (typeof value !== 'string') return value
  const resolved = getByPath(this.data, value)
  return resolved === undefined ? value : resolved
}

function conditional(
  input: unknown,
  test: boolean,
  trueValue: unknown,
  falseValue: unknown,
  hasAlternate: boolean,
): unknown {
  if (!test && !hasAlternate) return input
  return test ? trueValue : falseValue
}

function regexOf(value: unknown): RegExp {
  const text = String(value ?? '')
  const match = text.match(/^\/(.*)\/([a-z]*)$/)
  return match ? new RegExp(match[1], match[2]) : new RegExp(text)
}

function duration(value: number): string {
  const units = ['秒', '分', '时', '天', '月', '季', '年']
  const steps = [1, 60, 3600, 86400, 2592000, 7776000, 31104000]
  const parts: string[] = []
  for (let i = steps.length - 1; i >= 0; i--) {
    if (value >= steps[i]) {
      parts.push(`${Math.floor(value / steps[i])}${units[i]}`)
      value %= steps[i]
    } else if (i === 0 && value) {
      parts.push(`${value.toFixed(2)}${units[0]}`)
    }
  }
  return parts.join('')
}

function bytes(value: unknown, step = 1000): unknown {
  if (!value) return value
  if (typeof value === 'string' && value.endsWith('B')) return value
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const negative = number < 0
  const absolute = Math.abs(number)
  if (absolute < 1) return `${negative ? '-' : ''}${absolute} B`
  const exponent = Math.min(Math.floor(Math.log(absolute) / Math.log(step)), units.length - 1)
  const display = Number((absolute / Math.pow(step, exponent)).toPrecision(3))
  return `${negative ? '-' : ''}${display} ${units[exponent]}`
}

function toBase64(value: unknown): string {
  const text = String(value ?? '')
  if (typeof btoa === 'function') {
    return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))))
  }
  return Buffer.from(text, 'utf8').toString('base64')
}

function fromBase64(value: unknown): string {
  const text = String(value ?? '')
  if (typeof atob === 'function') {
    return decodeURIComponent(atob(text).split('').map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''))
  }
  return Buffer.from(text, 'base64').toString('utf8')
}

extendsFilters({
  toJson: (input) => {
    if (typeof input !== 'string') return input
    try { return JSON.parse(input) } catch { return null }
  },
  toFloat: (input) => typeof input === 'string' ? Number.parseFloat(input) : input,
  now: () => new Date(),
  toDate: (input, inputFormat = '') => {
    const parsed = parseDate(input, inputFormat)
    return parsed.isValid() ? parsed.toDate() : undefined
  },
  fromNow: (input, inputFormat = '') => parseDate(input, inputFormat).fromNow(),
  dateModify: (input, modifier = 'add', amount = 0, unit = 'days') => {
    let date = parseDate(input)
    if (!date.isValid()) date = dayjs()
    if (modifier === 'endOf') return date.endOf(amount || 'day').toDate()
    if (modifier === 'startOf') return date.startOf(amount || 'day').toDate()
    const value = Number.parseInt(String(amount), 10) || 0
    return (modifier === 'subtract' ? date.subtract(value, unit) : date.add(value, unit)).toDate()
  },
  trim: (input) => typeof input === 'string' ? input.trim() : input,
  round: (input, decimals = 2) => {
    if (Number.isNaN(input)) return 0
    const places = Number.parseInt(String(decimals), 10)
    const multiplier = Math.pow(10, places)
    return (Math.round(input * multiplier) / multiplier).toFixed(places)
  },
  duration: (input) => input ? duration(Number(input)) : input,
  bytes,
  url_encode: (input) => input == null ? '' : encodeURIComponent(input),
  url_decode: (input) => {
    try { return decodeURIComponent(input) } catch { return undefined }
  },
  join: (input, glue) => input && typeof input.join === 'function' ? input.join(glue) : input,
  split: (input, delimiter = ',') => typeof input === 'string' ? input.split(delimiter) : input,
  sortBy: (input, key = '&', method = 'alpha', order = 'asc') => {
    if (!Array.isArray(input)) return input
    return input.sort((a, b) => {
      const left = key === '&' ? a : getByPath(a, key)
      const right = key === '&' ? b : getByPath(b, key)
      const result = method === 'numerical'
        ? asFiniteNumber(left) - asFiniteNumber(right)
        : String(left ?? '').localeCompare(String(right ?? ''))
      return order === 'desc' ? -result : result
    })
  },
  objectToArray: (input, label = 'label', value = 'value') => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return input
    return Object.entries(input).map(([key, nested]) => ({ [label]: nested, [value]: key }))
  },
  unique: (input, key) => {
    if (!Array.isArray(input)) return input
    const seen = new Set()
    return input.filter((item) => {
      const value = key ? getByPath(item, key) : item
      const id = typeof value === 'object' ? JSON.stringify(value) : value
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
  },
  topAndOther: (input, len = 10, labelField = 'name', restLabel = '其他') => {
    if (!Array.isArray(input) || !len) return input
    const groups: Record<string, any>[] = []
    input.forEach((item, index) => {
      const groupIndex = Math.min(index, Number(len) - 1)
      const target = groups[groupIndex] || {}
      for (const [key, value] of Object.entries(item || {})) {
        if (!(key in target) || key === 'labelField') target[key] = value
        else if (typeof value === 'number' && typeof target[key] === 'number') target[key] += value
        else if (typeof value === 'string' && typeof target[key] === 'string') target[key] += `, ${value}`
        else target[key] = value
      }
      groups[groupIndex] = target
    })
    const result = groups.filter(Boolean)
    if (input.length >= len && result.length) result[result.length - 1][labelField] = restLabel || '其他'
    return result
  },
  nth: (input, nth = 0) => input?.[nth],
  minus: (input, step = 1) => cleanNumber((Number(input) || 0) - Number(step)),
  plus: (input, step = 1) => cleanNumber((Number(input) || 0) + Number(step)),
  times: (input, step = 1) => cleanNumber((Number(input) || 0) * Number(step)),
  division: (input, step = 1) => cleanNumber((Number(input) || 0) / Number(step)),
  count: (input) => Array.isArray(input) || typeof input === 'string' ? input.length : 0,
  abs: (input) => typeof input === 'number' ? Math.abs(input) : input,
  asArray: (input) => Array.isArray(input) ? input : input ? [input] : input,
  concat: (input, ...args) => Array.isArray(input) ? input.concat(...args) : input,
  map: function (this: FilterContext, input, name, ...args) {
    const fn = getFilters()[name]
    return Array.isArray(input) && fn ? input.map((item) => fn.call(this, item, ...args)) : input
  },
  filter: function (this: FilterContext, input, keys, directive = 'match', arg1) {
    if (!Array.isArray(input) || !keys || !directive) return input
    if (directive !== 'match' && !['isTrue', 'isFalse', 'isExists', 'equals', 'equal', 'isIn', 'notIn'].includes(directive)) {
      arg1 = directive
      directive = 'match'
    }
    const fields = String(keys).trim() === '*' ? [] : String(keys).split(/\s*,\s*/)
    const regex = directive === 'match' ? regexOf(arg1) : null
    if (regex && !arg1) return input
    return input.filter((item) => (fields.length ? fields : Object.keys(item || {})).some((key) => {
      const value = getByPath(item, key)
      if (directive === 'isTrue') return !!value
      if (directive === 'isFalse') return !value
      if (directive === 'isExists') return value !== undefined
      if (directive === 'equals' || directive === 'equal') return value == arg1
      if (directive === 'isIn' || directive === 'notIn') {
        const list = Array.isArray(arg1) ? arg1 : String(arg1 ?? '').split(/\s*,\s*/).filter(Boolean)
        return directive === 'isIn' ? list.includes(value) : !list.includes(value)
      }
      return regex?.test(String(value)) ?? false
    }))
  },
  base64Encode: toBase64,
  base64Decode: fromBase64,
  isTrue: function (input, trueValue, falseValue) {
    return conditional(input, !!input, trueValue, falseValue, arguments.length > 2)
  },
  isFalse: function (input, trueValue, falseValue) {
    return conditional(input, !input, trueValue, falseValue, arguments.length > 2)
  },
  isMatch: function (input, match, trueValue, falseValue) {
    return conditional(input, !!match && regexOf(match).test(String(input)), trueValue, falseValue, arguments.length > 3)
  },
  notMatch: function (input, match, trueValue, falseValue) {
    return conditional(input, !!match && !regexOf(match).test(String(input)), trueValue, falseValue, arguments.length > 3)
  },
  isEquals: function (input, value, trueValue, falseValue) {
    return conditional(input, input === value, trueValue, falseValue, arguments.length > 3)
  },
  notEquals: function (input, value, trueValue, falseValue) {
    return conditional(input, input !== value, trueValue, falseValue, arguments.length > 3)
  },
})
