/** Spinner。对齐 Amis：show / showOn、size sm|lg|''、overlay 默认 false、tip / tipPlacement、delay、body 容器、URL icon。 */

import { evalExpression, filterTpl } from '../formula'
import type { PlainObject, SchemaNode } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const SIZES = new Set(['sm', 'lg'])
const PLACES = new Set(['top', 'right', 'bottom', 'left'])

export type SpinnerSize = 'sm' | 'lg' | ''
export type SpinnerTipPlacement = 'top' | 'right' | 'bottom' | 'left'

export function spinnerShow(schema: unknown, data: PlainObject = {}): boolean {
  const rec = asRecord(schema)
  if (typeof rec.showOn === 'string' && rec.showOn) {
    return evalExpression(rec.showOn, data)
  }
  return rec.show !== false
}

export function spinnerSize(schema: unknown): SpinnerSize {
  const value = String(asRecord(schema).size || '')
  return SIZES.has(value) ? (value as SpinnerSize) : ''
}

export function spinnerOverlay(schema: unknown): boolean {
  return asRecord(schema).overlay === true
}

export function spinnerTipPlacement(schema: unknown): SpinnerTipPlacement {
  const value = String(asRecord(schema).tipPlacement || 'bottom')
  return PLACES.has(value) ? (value as SpinnerTipPlacement) : 'bottom'
}

export function spinnerDelay(schema: unknown): number {
  const n = Number(asRecord(schema).delay)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function spinnerTip(schema: unknown, data: PlainObject = {}): string {
  const tip = asRecord(schema).tip
  if (tip == null || tip === false) return ''
  return filterTpl(tip, data)
}

export function spinnerBody(schema: unknown): SchemaNode[] {
  const body = asRecord(schema).body
  if (body == null || body === false || body === '') return []
  return Array.isArray(body) ? (body as SchemaNode[]) : [body as SchemaNode]
}

export function spinnerIconSrc(schema: unknown): string {
  const icon = asRecord(schema).icon
  if (typeof icon !== 'string' || !icon) return ''
  if (icon.includes('/') || icon.startsWith('data:')) return icon
  return ''
}
