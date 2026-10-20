export function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function parseDate(raw: unknown): Date | null {
  if (raw == null || raw === '') return null
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw
  if (typeof raw === 'number') {
    const ms = raw < 1e12 ? raw * 1000 : raw
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(String(raw))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(raw: unknown, pattern: string): string {
  const date = parseDate(raw)
  if (!date) return raw == null ? '' : String(raw)
  return pattern
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, pad(date.getMonth() + 1))
    .replace(/DD/g, pad(date.getDate()))
    .replace(/HH/g, pad(date.getHours()))
    .replace(/mm/g, pad(date.getMinutes()))
    .replace(/ss/g, pad(date.getSeconds()))
}

export function defaultDatePattern(type?: string) {
  if (type === 'datetime') return 'YYYY-MM-DD HH:mm:ss'
  if (type === 'time') return 'HH:mm:ss'
  if (type === 'month') return 'YYYY-MM'
  return 'YYYY-MM-DD'
}

import { filterTpl } from '@vamis/core'

export function readValue(schema: { value?: unknown; name?: string }, data: Record<string, any>) {
  const value =
    schema.value != null && schema.value !== ''
      ? schema.value
      : schema.name
        ? data?.[schema.name]
        : undefined
  return typeof value === 'string' ? filterTpl(value, data) : value
}
