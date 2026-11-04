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
  // Amis 对非对象 badge 解构，字段全空，落到默认 dot。
  if (typeof badge === 'number' || typeof badge === 'boolean') return {}
  if (typeof badge === 'string') return { expression: badge }
  return {}
}

export function hasBadge(schema: unknown): boolean {
  return Boolean(badgeRaw(schema))
}

export function badgeVisible(schema: unknown, data: PlainObject = {}): boolean {
  const rec = badgeRecord(schema)
  if (!rec) return false
  const raw = badgeRaw(schema)
  if (typeof raw === 'string') return evalExpression(raw, data)
  if (typeof rec.visibleOn === 'string' && rec.visibleOn) return evalExpression(rec.visibleOn, data)
  if (badgeMode(schema) === 'text') {
    const raw = rec.text ?? rec.value
    if (raw == null || raw === false || raw === '') return false
    if (raw === 0) return false
    if (badgeDisplayText(schema, data) === '') return false
  }
  return true
}

export function badgeMode(schema: unknown): BadgeMode {
  const rec = badgeRecord(schema)
  const mode = String(rec?.mode || '')
  if (MODES.has(mode)) return mode as BadgeMode
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

export function badgeLevel(schema: unknown, data: PlainObject = {}): BadgeLevel {
  let value = String(badgeRecord(schema)?.level || '')
  if (value.startsWith('$')) value = filterTpl(value, data)
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

/** Amis：有 offset 时整段替换定位 transform，不跟 position 四向。 */
export function badgeOffsetStyle(schema: unknown): Record<string, string> {
  const raw = badgeRecord(schema)?.offset
  if (!Array.isArray(raw) || !raw.length) return {}
  const x = Number.parseInt(String(raw[0]), 10) || 0
  const y = Number.parseInt(String(raw[1]), 10) || 0
  return { transform: `translate(calc(50% + ${x}px), calc(-50% + ${y}px))` }
}

export function badgeRibbonOutSize(schema: unknown): number {
  return badgeSizePx(schema) * Math.SQRT2 + 5
}

export function badgeClassName(schema: unknown, data: PlainObject = {}): unknown {
  return badgeRecord(schema)?.className
}

export function badgeStyle(schema: unknown): unknown {
  return badgeRecord(schema)?.style
}

export function badgeAnimation(schema: unknown): boolean {
  return badgeRecord(schema)?.animation === true
}
