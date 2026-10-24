/** 属性 badge。对齐 Amis：可挂在 avatar / action / tpl / link / icon 上，不是独立 type。 */

import { evalExpression, filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type BadgeMode = 'text' | 'dot' | 'ribbon'
export type BadgeLevel = 'info' | 'success' | 'warning' | 'danger'

const MODES = new Set(['text', 'dot', 'ribbon'])
const LEVELS = new Set(['info', 'success', 'warning', 'danger'])
const POSITIONS = new Set(['top-right', 'top-left', 'bottom-right', 'bottom-left'])

function badgeRaw(schema: unknown): unknown {
  return asRecord(schema).badge
}

function badgeRecord(schema: unknown): Record<string, unknown> | null {
  const badge = badgeRaw(schema)
  if (badge == null || badge === false) return null
  if (typeof badge === 'object' && !Array.isArray(badge)) return badge as Record<string, unknown>
  if (typeof badge === 'number' || typeof badge === 'boolean') return { text: badge, mode: 'text' }
  if (typeof badge === 'string') return { expression: badge }
  return { text: badge }
}

export function badgeVisible(schema: unknown, data: PlainObject = {}): boolean {
  const rec = badgeRecord(schema)
  if (!rec) return false
  const raw = badgeRaw(schema)
  if (typeof raw === 'string') return evalExpression(raw, data)
  if (typeof rec.visibleOn === 'string' && rec.visibleOn) return evalExpression(rec.visibleOn, data)
  if (badgeMode(schema) === 'text') {
    const text = badgeDisplayText(schema, data)
    if (text === '' || text === '0') return false
  }
  return true
}

export function badgeMode(schema: unknown): BadgeMode {
  const rec = badgeRecord(schema)
  const mode = String(rec?.mode || '')
  if (MODES.has(mode)) return mode as BadgeMode
  if (typeof badgeRaw(schema) === 'number') return 'text'
  return 'dot'
}

export function badgeText(schema: unknown, data: PlainObject = {}): string {
  const rec = badgeRecord(schema)
  if (!rec) return ''
  const raw = rec.text ?? rec.value
  if (raw == null || raw === false) return ''
  return filterTpl(raw, data)
}

export function badgeOverflowCount(schema: unknown): number {
  const n = Number(badgeRecord(schema)?.overflowCount)
  return Number.isFinite(n) ? n : 99
}

export function badgeDisplayText(schema: unknown, data: PlainObject = {}): string {
  const text = badgeText(schema, data)
  if (text === '') return ''
  const count = Number(text)
  if (!Number.isFinite(count)) return text
  const cap = badgeOverflowCount(schema)
  return count > cap ? `${cap}+` : String(count === 0 ? 0 : text)
}

export function badgePosition(schema: unknown): string {
  const value = String(badgeRecord(schema)?.position || '')
  return POSITIONS.has(value) ? value : 'top-right'
}

export function badgeLevel(schema: unknown): BadgeLevel {
  const value = String(badgeRecord(schema)?.level || '')
  return LEVELS.has(value) ? (value as BadgeLevel) : 'danger'
}

export function badgeSizePx(schema: unknown): number {
  const rec = badgeRecord(schema)
  const raw = rec?.size
  const n = Number(raw)
  if (Number.isFinite(n) && n > 0) return n
  const mode = badgeMode(schema)
  if (mode === 'dot') return 6
  if (mode === 'ribbon') return 12
  return 16
}

export function badgeOffset(schema: unknown): [number, number] {
  const raw = badgeRecord(schema)?.offset
  if (!Array.isArray(raw) || raw.length < 2) return [0, 0]
  const x = Number(raw[0])
  const y = Number(raw[1])
  return [Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0]
}

export function badgeAnimation(schema: unknown): boolean {
  return badgeRecord(schema)?.animation === true
}
