/** 属性 badge。对齐 Amis：可挂在 avatar / action / tpl 上，不是独立 type。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type BadgeMode = 'text' | 'dot' | 'ribbon'

function badgeRecord(schema: unknown): Record<string, unknown> | null {
  const badge = asRecord(schema).badge
  if (badge == null || badge === false) return null
  if (typeof badge === 'object' && !Array.isArray(badge)) return badge as Record<string, unknown>
  return { text: badge }
}

export function badgeVisible(schema: unknown): boolean {
  return badgeRecord(schema) != null
}

export function badgeMode(schema: unknown): BadgeMode {
  const mode = String(badgeRecord(schema)?.mode || '')
  if (mode === 'dot' || mode === 'ribbon') return mode
  return 'text'
}

export function badgeText(schema: unknown, data: PlainObject = {}): string {
  const rec = badgeRecord(schema)
  if (!rec) return ''
  const raw = rec.text ?? rec.value
  if (raw == null || raw === false) return ''
  return filterTpl(raw, data)
}

export function badgePosition(schema: unknown): string {
  const value = String(badgeRecord(schema)?.position || '')
  return value || 'top-right'
}
