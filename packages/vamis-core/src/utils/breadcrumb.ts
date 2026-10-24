/** Breadcrumb。对齐 Amis：items 或 source；默认分隔符 `>`；中间项按 labelMaxLength 省略。 */

import { filterTpl, resolveValue } from '../formula'
import type { SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function tplField(value: unknown, data: Record<string, unknown>): string {
  if (value == null || value === false) return ''
  if (typeof value === 'string') {
    const resolved = resolveValue(value, data)
    return resolved == null || resolved === false ? '' : String(resolved)
  }
  return filterTpl(String(value), data)
}

function mapItem(raw: unknown, data: Record<string, unknown>): SchemaObject | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const rec = raw as Record<string, unknown>
  const dropdown = Array.isArray(rec.dropdown)
    ? rec.dropdown.map((item) => mapItem(item, data)).filter((item): item is SchemaObject => !!item)
    : []
  const href = tplField(rec.href ?? rec.to, data)
  const label = rec.label == null || rec.label === false ? '' : tplField(rec.label, data)
  return {
    ...(rec as SchemaObject),
    label,
    href,
    dropdown,
  }
}

export function breadcrumbItems(schema: unknown, data: Record<string, unknown> = {}): SchemaObject[] {
  const rec = asRecord(schema)
  let raw: unknown = rec.items ?? rec.links ?? rec.options
  if (raw == null || raw === false || raw === '') raw = resolveValue(rec.source, data)
  if (!Array.isArray(raw)) return []
  return raw.map((item) => mapItem(item, data)).filter((item): item is SchemaObject => !!item)
}

export function breadcrumbSeparator(schema: unknown): string {
  const value = asRecord(schema).separator
  return typeof value === 'string' && value !== '' ? value : '>'
}

export function breadcrumbLabelMaxLength(schema: unknown): number {
  const n = Number(asRecord(schema).labelMaxLength)
  return Number.isFinite(n) && n > 1 ? n : 16
}

export function breadcrumbDisplayLabel(
  item: unknown,
  index: number,
  total: number,
  maxLength: number,
  data: Record<string, unknown> = {},
): { text: string; title: string; truncated: boolean } {
  const rec = asRecord(item)
  const text = rec.label == null || rec.label === false ? '' : tplField(rec.label ?? rec.title, data)
  const place = index === 0 ? 'start' : index === total - 1 ? 'end' : 'middle'
  const max = maxLength > 1 ? maxLength : 1
  if (text.length > max && place === 'middle') {
    return { text: `${text.slice(0, max)}...`, title: text, truncated: true }
  }
  return { text, title: '', truncated: false }
}
