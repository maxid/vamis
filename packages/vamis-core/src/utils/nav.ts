/** Nav。对齐 Amis：默认 stacked；stacked:false 或 mode:horizontal 横排；source 或 links。 */

import { filterTpl, isVisible, resolveValue } from '../formula'
import type { SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type NavLink = {
  label: string
  to: string
  active: boolean
  unfolded: boolean
  disabled: boolean
  icon: string
  children: NavLink[]
  schema: SchemaObject
}

export function navStacked(schema: unknown): boolean {
  const rec = asRecord(schema)
  if (rec.stacked === false) return false
  if (rec.mode === 'horizontal') return false
  return true
}

function mapLink(raw: unknown, data: Record<string, unknown>): NavLink | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const rec = raw as SchemaObject
  if (!isVisible(rec, data)) return null
  const childrenRaw = Array.isArray(rec.children) ? rec.children : []
  return {
    label: rec.label == null || rec.label === false ? '' : filterTpl(String(rec.label ?? rec.title ?? ''), data),
    to: filterTpl(String(rec.to || rec.href || rec.link || ''), data),
    active: rec.active === true,
    unfolded: rec.unfolded === true,
    disabled: rec.disabled === true,
    icon: typeof rec.icon === 'string' ? rec.icon : '',
    children: childrenRaw.map((item) => mapLink(item, data)).filter((item): item is NavLink => !!item),
    schema: rec,
  }
}

export function navLinks(schema: unknown, data: Record<string, unknown> = {}): NavLink[] {
  const rec = asRecord(schema)
  let raw: unknown = rec.links ?? rec.body
  if (raw == null || raw === false || raw === '') raw = resolveValue(rec.source, data)
  if (!Array.isArray(raw)) return []
  return raw.map((item) => mapLink(item, data)).filter((item): item is NavLink => !!item)
}
