/** FormItem `validations`：对齐 Amis `packages/amis-core/src/utils/validations.ts`。 */

import type { SchemaObject } from './types'
import type { PlainObject } from './types'
import { filterTpl } from './formula'
import { formItemRequired } from './utils/form-item'
import { dayjs } from './utils/dayjs'

export type ValidationRules = Record<string, unknown>
type RuleArgs = unknown[]
type ValidateFnResult = boolean | { error: true; msg?: string }
type ValidateFn = (values: PlainObject, value: unknown, ...args: RuleArgs) => ValidateFnResult

const ID_PROVINCE = new Set([
  '11', '12', '13', '14', '15', '21', '22', '23', '31', '32', '33', '34', '35', '36', '37',
  '41', '42', '43', '44', '45', '46', '50', '51', '52', '53', '54', '61', '62', '63', '64', '65',
  '71', '81', '82', '91',
])

function parseScalar(raw: string): unknown {
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return raw
}

export function parseValidations(schema: SchemaObject): ValidationRules {
  const rules: ValidationRules = {}
  if (schema.required === true) rules.isRequired = true
  if (schema.minLength != null) rules.minLength = schema.minLength
  if (schema.maxLength != null) rules.maxLength = schema.maxLength
  if (schema.maximum != null) rules.maximum = schema.maximum
  if (schema.minimum != null) rules.minimum = schema.minimum
  if (schema.matchRegexp) rules.matchRegexp = schema.matchRegexp

  const type = String(schema.type || '')
  if (type === 'input-email') rules.isEmail = true
  if (type === 'input-url') rules.isUrl = true

  const raw = schema.validations
  if (type === 'input-number' && (raw == null || raw === '')) rules.isNumeric = true
  if (typeof raw === 'string' && raw.trim()) {
    for (const part of raw.split(',')) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const colon = trimmed.indexOf(':')
      if (colon < 0) rules[trimmed] = true
      else rules[trimmed.slice(0, colon)] = parseScalar(trimmed.slice(colon + 1))
    }
  } else if (raw && typeof raw === 'object') {
    Object.assign(rules, raw as ValidationRules)
  }
  return rules
}

function isExisty(value: unknown): boolean {
  return value !== null && value !== undefined
}

function isEmptyValue(value: unknown): boolean {
  return value === ''
}

function valueToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function asRegexp(raw: unknown): RegExp {
  if (raw instanceof RegExp) return raw
  if (typeof raw === 'string' && raw) {
    const match = raw.match(/^(?:matchRegexp:)?\/(.+)\/([gimuy]*)$/)
    try {
      return match ? new RegExp(match[1], match[2] || '') : new RegExp(raw)
    } catch {
      return /^$/
    }
  }
  return /^$/
}

function makeUrlRegexp(options: unknown): RegExp {
  const opt = options && typeof options === 'object' ? (options as PlainObject) : {}
  const schemes = Array.isArray(opt.schemes) ? opt.schemes : ['http', 'https', 'ftp', 'sftp']
  const allowLocal = opt.allowLocal !== false
  const allowDataUrl = opt.allowDataUrl === true
  let regex =
    '^' +
    '(?:(?:' +
    schemes.join('|') +
    ')://)' +
    '(?:\\S+(?::\\S*)?@)?' +
    '(?:'
  const tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + (allowLocal ? '?' : '')
  if (!allowLocal) {
    regex +=
      '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
      '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
      '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})'
  }
  regex +=
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
    tld +
    ')' +
    '(?::\\d{2,5})?' +
    '(?:[/?#]\\S*)?' +
    '$'
  if (allowDataUrl) {
    regex = `(?:${regex})|(?:^data:(?:\\w+\\/[-+.\\w]+(?:;[\\w=]+)*)?(?:;base64)?,[A-Za-z0-9-_.!~*'();\\/?:@&=+$,%]*$)`
  }
  return new RegExp(regex, 'i')
}

function verifyId18(id: string): boolean {
  if (!/^\d{17}[\dX]$/.test(id)) return false
  const province = id.slice(0, 2)
  const city = id.slice(2, 4)
  if (!ID_PROVINCE.has(province) || !/^(?:[0-6]\d|70|90)$/.test(city)) return false
  const year = id.slice(6, 10)
  const month = id.slice(10, 12)
  const day = id.slice(12, 14)
  const born = new Date(`${year}/${month}/${day}`)
  if (Number.isNaN(+born) || +born < +new Date('1850-01-01') || +born > Date.now()) return false
  const arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) sum += Number(id[i]) * arrInt[i]
  return arrCh[sum % 11] === id[17]
}

function verifyId15(id: string): boolean {
  if (!/^\d{15}$/.test(id)) return false
  const province = id.slice(0, 2)
  const city = id.slice(2, 4)
  if (!ID_PROVINCE.has(province) || !/^(?:[0-6]\d|70|90)$/.test(city)) return false
  const year = `19${id.slice(6, 8)}`
  const month = id.slice(8, 10)
  const day = id.slice(10, 12)
  const born = new Date(`${year}/${month}/${day}`)
  return !Number.isNaN(+born) && +born >= +new Date('1850-01-01') && +born <= Date.now()
}

function unitOf(raw: unknown): 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | undefined {
  if (typeof raw === 'string' && raw) return raw as 'millisecond'
  return undefined
}

const EMAIL_RE =
  /^((([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

/** 对齐 Amis `validateMessages`：默认是多语言 key，文案在 zh-CN locale。 */
export const validateMessageKeys: Record<string, string> = {
  isEmail: 'validate.isEmail',
  isRequired: 'validate.isRequired',
  isUrl: 'validate.isUrl',
  isInt: 'validate.isInt',
  isAlpha: 'validate.isAlpha',
  isNumeric: 'validate.isNumeric',
  isAlphanumeric: 'validate.isAlphanumeric',
  isFloat: 'validate.isFloat',
  isWords: 'validate.isWords',
  isUrlPath: 'validate.isUrlPath',
  matchRegexp: 'validate.matchRegexp',
  minLength: 'validate.minLength',
  maxLength: 'validate.maxLength',
  minLengthArray: 'validate.array.minLength',
  maxLengthArray: 'validate.array.maxLength',
  maximum: 'validate.maximum',
  lt: 'validate.lt',
  minimum: 'validate.minimum',
  gt: 'validate.gt',
  isJson: 'validate.isJson',
  isLength: 'validate.isLength',
  notEmptyString: 'validate.notEmptyString',
  notEmpty: 'validate.notEmptyString',
  equalsField: 'validate.equalsField',
  equals: 'validate.equals',
  isPhoneNumber: 'validate.isPhoneNumber',
  isTelNumber: 'validate.isTelNumber',
  isZipcode: 'validate.isZipcode',
  isId: 'validate.isId',
  isId18: 'validate.isId',
  isId15: 'validate.isId',
  isDateTimeSame: 'validate.isDateTimeSame',
  isDateTimeBefore: 'validate.isDateTimeBefore',
  isDateTimeAfter: 'validate.isDateTimeAfter',
  isDateTimeSameOrBefore: 'validate.isDateTimeSameOrBefore',
  isDateTimeSameOrAfter: 'validate.isDateTimeSameOrAfter',
  isDateTimeBetween: 'validate.isDateTimeBetween',
  isTimeSame: 'validate.isTimeSame',
  isTimeBefore: 'validate.isTimeBefore',
  isTimeAfter: 'validate.isTimeAfter',
  isTimeSameOrBefore: 'validate.isTimeSameOrBefore',
  isTimeSameOrAfter: 'validate.isTimeSameOrAfter',
  isTimeBetween: 'validate.isTimeBetween',
  isVariableName: 'validate.isVariableName',
}

/** 默认校验信息：Amis `validateMessages` 的 key。实际中文由 `translateValidateMessage` 解。 */
export const validateMessages: Record<string, string> = {
  ...validateMessageKeys,
  required: 'validate.isRequired',
}

/** 对齐 `amis-ui/src/locale/zh-CN.ts` `validate.*`。 */
export const validateLocaleZh: Record<string, string> = {
  'validate.equals': '输入的数据与 $1 不一致',
  'validate.equalsField': '输入的数据与 $1 值不一致',
  'validate.gt': '请输入大于 $1 的值',
  'validate.isAlpha': '请输入字母',
  'validate.isAlphanumeric': '请输入字母或者数字',
  'validate.isEmail': 'Email 格式不正确',
  'validate.isFloat': '请输入浮点型数值',
  'validate.isId': '请输入合法的身份证号',
  'validate.isInt': '请输入整型数字',
  'validate.isJson': 'JSON 格式不正确',
  'validate.isLength': '请输入长度为 $1 的内容',
  'validate.isNumeric': '请输入数字',
  'validate.isPhoneNumber': '请输入合法的手机号码',
  'validate.isRequired': '这是必填项',
  'validate.isTelNumber': '请输入合法的电话号码',
  'validate.isUrl': 'URL 格式不正确',
  'validate.isUrlPath': '只能输入字母、数字、`-` 和 `_`.',
  'validate.isWords': '请输入单词',
  'validate.isZipcode': '请输入合法的邮编地址',
  'validate.lt': '请输入小于 $1 的值',
  'validate.matchRegexp': '格式不正确, 请输入符合规则为 $1 的内容。',
  'validate.maximum': '当前输入值超出最大值 $1',
  'validate.maxLength': '请控制内容长度, 不要输入 $1 个以上字符',
  'validate.array.maxLength': '请控制成员个数, 不能超过 $1 个',
  'validate.minimum': '当前输入值低于最小值 $1',
  'validate.minLength': '请输入更多的内容，至少输入 $1 个字符。',
  'validate.array.minLength': '请添加更多的成员，成员数至少 $1 个。',
  'validate.notEmptyString': '请不要全输入空白字符',
  'validate.isDateTimeSame': '当前日期值不合法，请输入和 $1 相同的日期值',
  'validate.isDateTimeBefore': '当前日期值不合法，请输入 $1 之前的日期值',
  'validate.isDateTimeAfter': '当前日期值不合法，请输入 $1 之后的日期值',
  'validate.isDateTimeSameOrBefore': '当前日期值不合法，请输入和 $1 相同或之前的日期值',
  'validate.isDateTimeSameOrAfter': '当前日期值不合法，请输入和 $1 相同或之后的日期值',
  'validate.isDateTimeBetween': '当前日期值不合法，请输入 $1 和 $2 之间的日期值',
  'validate.isTimeSame': '当前时间值不合法，请输入和 $1 相同的时间值',
  'validate.isTimeBefore': '当前时间值不合法，请输入 $1 之前的时间值',
  'validate.isTimeAfter': '当前时间值不合法，请输入 $1 之后的时间值',
  'validate.isTimeSameOrBefore': '当前时间值不合法，请输入和 $1 相同或之前的时间值',
  'validate.isTimeSameOrAfter': '当前时间值不合法，请输入和 $1 相同或之后的时间值',
  'validate.isTimeBetween': '当前时间值不合法，请输入 $1 和 $2 之间的时间值',
  'validate.isVariableName':
    '请输入合法的变量名，变量名只能以字母或下划线开头，后续可包含字母、数字和下划线',
}

export function translateValidateMessage(raw: string): string {
  return validateLocaleZh[raw] || raw
}

const validations: Record<string, ValidateFn> = {
  isRequired: (_values, value) =>
    value !== undefined && value !== '' && value !== null && (!Array.isArray(value) || value.length > 0),
  matchRegexp: (_values, value, regexp) =>
    !isExisty(value) || isEmptyValue(value) || asRegexp(regexp).test(valueToString(value)),
  isEmail: (values, value) => validations.matchRegexp(values, value, EMAIL_RE),
  isUrl: (_values, value, options) =>
    !isExisty(value) || isEmptyValue(value) || makeUrlRegexp(options).test(valueToString(value)),
  isNumeric: (_values, value) =>
    typeof value === 'number' ||
    !isExisty(value) ||
    isEmptyValue(value) ||
    /^[-+]?(?:\d*[.])?\d+$/.test(valueToString(value)),
  isAlpha: (values, value) => validations.matchRegexp(values, value, /^[A-Z]+$/i),
  isAlphanumeric: (values, value) => validations.matchRegexp(values, value, /^[0-9A-Z]+$/i),
  isInt: (values, value) => validations.matchRegexp(values, value, /^(?:[-+]?(?:0|[1-9]\d*))$/),
  isFloat: (values, value) =>
    validations.matchRegexp(values, value, /^(?:[-+]?(?:\d+))?(?:\.\d*)?(?:[eE][+-]?(?:\d+))?$/),
  isWords: (values, value) => validations.matchRegexp(values, value, /^[A-Z\s]+$/i),
  isLength: (_values, value, length) => {
    const text = valueToString(value)
    return !isExisty(value) || isEmptyValue(value) || text.length === Number(length)
  },
  equals: (_values, value, eql) => !isExisty(value) || isEmptyValue(value) || value == eql,
  equalsField: (values, value, field) => value == values[String(field)],
  maxLength: (_values, value, length) =>
    !isExisty(value) || valueToString(value).length <= Number(length),
  minLength: (_values, value, length) =>
    !isExisty(value) || isEmptyValue(value) || valueToString(value).length >= Number(length),
  isUrlPath: (_values, value) =>
    !isExisty(value) || isEmptyValue(value) || /^[a-z0-9_-]+$/i.test(valueToString(value)),
  maximum: (_values, value, maximum) =>
    !isExisty(value) || isEmptyValue(value) || (parseFloat(valueToString(value)) || 0) <= (parseFloat(String(maximum)) || 0),
  lt: (_values, value, maximum) =>
    !isExisty(value) || isEmptyValue(value) || (parseFloat(valueToString(value)) || 0) < (parseFloat(String(maximum)) || 0),
  minimum: (_values, value, minimum) =>
    !isExisty(value) || isEmptyValue(value) || (parseFloat(valueToString(value)) || 0) >= (parseFloat(String(minimum)) || 0),
  gt: (_values, value, minimum) =>
    !isExisty(value) || isEmptyValue(value) || (parseFloat(valueToString(value)) || 0) > (parseFloat(String(minimum)) || 0),
  isJson: (_values, value) => {
    if (isExisty(value) && !isEmptyValue(value) && typeof value === 'string') {
      try {
        const result = JSON.parse(value)
        return typeof result === 'object' && result != null
      } catch {
        return false
      }
    }
    return true
  },
  isPhoneNumber: (_values, value) =>
    !isExisty(value) || isEmptyValue(value) || /^(\+\d{2}-)?[1]([3-9])[0-9]{9}$/.test(valueToString(value)),
  isTelNumber: (_values, value) =>
    !isExisty(value) ||
    isEmptyValue(value) ||
    /^(\+\d{2}-)?(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(valueToString(value)),
  isZipcode: (_values, value) => !isExisty(value) || isEmptyValue(value) || /^\d{6}$/.test(valueToString(value)),
  isId: (_values, value) => {
    if (!isExisty(value) || isEmptyValue(value)) return true
    const id = String(value)
    return verifyId18(id) || verifyId15(id)
  },
  isId18: (_values, value) => !isExisty(value) || isEmptyValue(value) || verifyId18(String(value)),
  isId15: (_values, value) => !isExisty(value) || isEmptyValue(value) || verifyId15(String(value)),
  notEmptyString: (_values, value) => !isExisty(value) || String(value).trim() !== '',
  notEmpty: (_values, value) => !isExisty(value) || String(value).trim() !== '',
  isDateTimeSame: (_v, value, target, granularity) =>
    dayjs(value as string).isSame(dayjs(target as string), unitOf(granularity)),
  isDateTimeBefore: (_v, value, target, granularity) =>
    dayjs(value as string).isBefore(dayjs(target as string), unitOf(granularity)),
  isDateTimeAfter: (_v, value, target, granularity) =>
    dayjs(value as string).isAfter(dayjs(target as string), unitOf(granularity)),
  isDateTimeSameOrBefore: (_v, value, target, granularity) =>
    dayjs(value as string).isSameOrBefore(dayjs(target as string), unitOf(granularity)),
  isDateTimeSameOrAfter: (_v, value, target, granularity) =>
    dayjs(value as string).isSameOrAfter(dayjs(target as string), unitOf(granularity)),
  isDateTimeBetween: (_v, value, lhs, rhs, granularity, inclusivity) =>
    dayjs(value as string).isBetween(
      dayjs(lhs as string),
      dayjs(rhs as string),
      unitOf(granularity) || null,
      (inclusivity as '()' | '[)' | '(]' | '[]') || '()',
    ),
  isTimeSame: (_v, value, target, granularity, format) => {
    const fmt = String(format || 'HH:mm:ss')
    return dayjs(valueToString(value), fmt).isSame(dayjs(valueToString(target), fmt), unitOf(granularity))
  },
  isTimeBefore: (_v, value, target, granularity, format) => {
    const fmt = String(format || 'HH:mm:ss')
    return dayjs(valueToString(value), fmt).isBefore(dayjs(valueToString(target), fmt), unitOf(granularity))
  },
  isTimeAfter: (_v, value, target, granularity, format) => {
    const fmt = String(format || 'HH:mm:ss')
    return dayjs(valueToString(value), fmt).isAfter(dayjs(valueToString(target), fmt), unitOf(granularity))
  },
  isTimeSameOrBefore: (_v, value, target, granularity, format) => {
    const fmt = String(format || 'HH:mm:ss')
    return dayjs(valueToString(value), fmt).isSameOrBefore(dayjs(valueToString(target), fmt), unitOf(granularity))
  },
  isTimeSameOrAfter: (_v, value, target, granularity, format) => {
    const fmt = String(format || 'HH:mm:ss')
    return dayjs(valueToString(value), fmt).isSameOrAfter(dayjs(valueToString(target), fmt), unitOf(granularity))
  },
  isTimeBetween: (_v, value, lhs, rhs, granularity, inclusivity, format) => {
    const fmt = String(format || 'HH:mm:ss')
    return dayjs(valueToString(value), fmt).isBetween(
      dayjs(valueToString(lhs), fmt),
      dayjs(valueToString(rhs), fmt),
      unitOf(granularity) || null,
      (inclusivity as '()' | '[)' | '(]' | '[]') || '()',
    )
  },
  isVariableName: (values, value, regexp) =>
    validations.matchRegexp(values, value, regexp instanceof RegExp ? regexp : /^[a-zA-Z_]+[a-zA-Z0-9_]*$/),
}

for (let i = 1; i <= 9; i++) {
  validations[`matchRegexp${i}`] = validations.matchRegexp
}

function interpolate(msg: string, args: RuleArgs): string {
  const data: PlainObject = {}
  args.forEach((arg, i) => {
    data[String(i + 1)] = arg
    data[`$${i + 1}`] = arg
  })
  let out = filterTpl(msg, data, 'raw')
  args.forEach((arg, i) => {
    const n = String(i + 1)
    const text = String(arg ?? '')
    out = out.replaceAll(`$${n}`, text).replaceAll(`\${${n}|raw}`, text).replaceAll(`\${${n}}`, text)
  })
  return out
}

function messageOf(schema: SchemaObject, key: string, args: RuleArgs, value?: unknown): string {
  const custom = schema.validationErrors
  const msgKey = Array.isArray(value) ? `${key}Array` : key
  const raw =
    custom && typeof custom === 'object' && custom[key] != null
      ? String(custom[key])
      : validateMessages[msgKey] || validateMessages[key] || '格式不正确'
  return interpolate(translateValidateMessage(raw), args)
}

function resolveArg(arg: unknown, data: PlainObject): unknown {
  if (typeof arg === 'string' && arg.includes('${')) return filterTpl(arg, data, 'raw')
  return arg
}

export function addRule(ruleName: string, fn: ValidateFn, message = '') {
  validations[ruleName] = fn
  if (message) validateMessages[ruleName] = message
}

export function validateValue(schema: SchemaObject, value: unknown, data: PlainObject = {}): string | null {
  const rules = parseValidations(schema)
  if (formItemRequired(schema, data) && !rules.isRequired && !rules.required) {
    rules.isRequired = true
  }

  for (const ruleName of Object.keys(rules)) {
    const raw = rules[ruleName]
    if (!raw && raw !== 0) continue
    const fn =
      validations[ruleName] ||
      (ruleName.startsWith('matchRegexp') ? validations.matchRegexp : undefined)
    if (!fn) continue
    const args = (Array.isArray(raw) ? raw : [raw]).map((item) => resolveArg(item, data))
    const validateRes = fn(data, value, ...args)
    let fnResErrorMsg = ''
    if (validateRes && typeof validateRes === 'object' && validateRes.error === true) {
      fnResErrorMsg = validateRes.msg ?? ''
    }
    if (!validateRes || fnResErrorMsg) {
      const key = ruleName === 'required' ? 'isRequired' : ruleName
      if (fnResErrorMsg) return interpolate(translateValidateMessage(fnResErrorMsg), args)
      return messageOf(schema, key, args, value)
    }
  }
  return null
}
