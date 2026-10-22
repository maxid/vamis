import { registerFilter } from '@vamis/formula'
import moment from 'moment'

registerFilter('json', (input: unknown) => {
  try {
    return JSON.stringify(input ?? null)
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

registerFilter('date', (input: unknown, format = 'LLL', inputFormat = 'X') => {
  const parsed = moment(input as moment.MomentInput, inputFormat as string)
  return parsed.isValid() ? parsed.format(format as string) : ''
})

registerFilter('datetime', (input: unknown, format = 'YYYY-MM-DD HH:mm:ss', inputFormat = '') => {
  const parsed = inputFormat
    ? moment(input as moment.MomentInput, inputFormat as string)
    : moment(input as moment.MomentInput)
  return parsed.isValid() ? parsed.format(format as string) : ''
})

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
