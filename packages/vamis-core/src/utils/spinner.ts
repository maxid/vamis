/** Spinner。对齐 Amis：show / showOn、size sm|lg|''、overlay 默认 false、tip / tipPlacement、delay、body、icon、loadingConfig。 */

import { evalExpression, filterTpl } from '../formula'
import type { PlainObject, SchemaNode } from '../types'
import { resolveIcon } from './icon'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const SIZES = new Set(['sm', 'lg'])
const PLACES = new Set(['top', 'right', 'bottom', 'left'])
const BUILTIN_ICONS = new Set(['reload'])

export type SpinnerSize = 'sm' | 'lg' | ''
export type SpinnerTipPlacement = 'top' | 'right' | 'bottom' | 'left'
export type SpinnerLoadingConfig = { root?: string; show?: boolean }
export type SpinnerIcon =
  | { kind: 'default' }
  | { kind: 'url'; src: string }
  | { kind: 'class'; className: string }
  | { kind: 'svg'; html: string }
  | { kind: 'builtin'; name: string }

export function spinnerLoadingConfig(schema: unknown): SpinnerLoadingConfig {
  const rec = asRecord(asRecord(schema).loadingConfig)
  const root = typeof rec.root === 'string' ? rec.root.trim() : ''
  const show = rec.show === false ? false : rec.show === true ? true : undefined
  return { root: root || undefined, show }
}

export function spinnerShow(schema: unknown, data: PlainObject = {}): boolean {
  if (spinnerLoadingConfig(schema).show === false) return false
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
  if (spinnerLoadingConfig(schema).root) return true
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

export function spinnerIcon(schema: unknown): SpinnerIcon {
  if (spinnerLoadingConfig(schema).root) return { kind: 'default' }
  const raw = asRecord(schema).icon
  const resolved = resolveIcon(raw)
  if (resolved.kind === 'empty' || resolved.kind === 'missing') return { kind: 'default' }
  if (resolved.kind === 'url' || resolved.kind === 'svg') return resolved
  if (resolved.kind === 'class') {
    const name = typeof raw === 'string' ? raw.trim() : resolved.className
    if (BUILTIN_ICONS.has(name)) return { kind: 'builtin', name }
    return resolved
  }
  return { kind: 'default' }
}

/** @deprecated 用 spinnerIcon；只认 URL。 */
export function spinnerIconSrc(schema: unknown): string {
  const icon = spinnerIcon(schema)
  return icon.kind === 'url' ? icon.src : ''
}
