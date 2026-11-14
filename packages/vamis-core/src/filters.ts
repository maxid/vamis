import { registerFilter } from '@vamis/formula'
import { parseDate } from './utils/dayjs'

registerFilter('json', (input: unknown, tabSize: number | string = 0) => {
  try {
    const n = parseInt(String(tabSize), 10)
    const text = n ? JSON.stringify(input, null, n) : JSON.stringify(input)
    // Amis JSON.stringify(undefined) 是 undefined，不要 ?? null 编成 "null"。
    return text ?? ''
  } catch {
    return ''
  }
})

registerFilter('default', (input: unknown, fallback = '') => {
  if (input == null || input === '') return fallback
  return input
})

registerFilter('first', (input: unknown) => {
  if (Array.isArray(input)) return input[0]
  return input
})

registerFilter('last', (input: unknown) => {
  if (Array.isArray(input)) return input[input.length - 1]
  return input
})

/** Amis `|pick:field`：对象取字段，数组则逐项取。 */
registerFilter('pick', (input: unknown, field = 'label') => {
  const key = String(field || 'label')
  if (Array.isArray(input)) {
    return input.map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : item))
  }
  if (itemIsRecord(input)) return input[key]
  return input
})

function itemIsRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

registerFilter('date', (input: unknown, format = 'LLL', inputFormat = 'X') => {
  const parsed = parseDate(input, inputFormat as string)
  return parsed.isValid() ? parsed.format(format as string) : ''
})

registerFilter('datetime', (input: unknown, format = 'YYYY-MM-DD HH:mm:ss', inputFormat = '') => {
  const parsed = inputFormat ? parseDate(input, inputFormat as string) : parseDate(input)
  return parsed.isValid() ? parsed.format(format as string) : ''
})

/** Amis `|toInt`：字符串 parseInt，其它原样（数字 radios 值保持 number）。 */
registerFilter('toInt', (input: unknown) => (typeof input === 'string' ? parseInt(input, 10) : input))

registerFilter('number', (input: unknown) => {
  const parts = String(input ?? '').split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
})

registerFilter('percent', (input: unknown, decimals = 0) => {
  const value = parseFloat(String(input)) || 0
  const places = parseInt(String(decimals), 10) || 0
  const whole = value * 100
  const multiplier = Math.pow(10, places)
  return `${(Math.round(whole * multiplier) / multiplier).toFixed(places)}%`
})

registerFilter('truncate', (input: unknown, length?: unknown, end?: unknown) => {
  if (typeof input !== 'string') return input
  const suffix = (end as string) || '...'
  if (length == null) return input
  const max = parseInt(String(length), 10) || 200
  return input.substring(0, max) + (input.length > max ? suffix : '')
})

/** Amis `tpl-builtin`：`${engine|substring:0:2|upperCase}`。 */
registerFilter('substring', (input: unknown, start?: unknown, end?: unknown) => {
  if (typeof input !== 'string') return input
  const from = start == null || start === '' ? 0 : Number(start)
  if (end == null || end === '') return input.substring(from)
  return input.substring(from, Number(end))
})

registerFilter('upperCase', (input: unknown) =>
  typeof input === 'string' ? input.toUpperCase() : input,
)

registerFilter('lowerCase', (input: unknown) =>
  typeof input === 'string' ? input.toLowerCase() : input,
)
