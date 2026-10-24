/** Avatar。对齐 Amis：shape 默认 circle、size 空/default/normal=40、small 32、large 48、fit cover、gap 4；src > text > icon；icon 默认 fa fa-user。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type AvatarShape = 'circle' | 'square' | 'rounded'
export type AvatarFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
export type AvatarKind = 'src' | 'text' | 'icon'

const SHAPES = new Set<AvatarShape>(['circle', 'square', 'rounded'])
const FITS = new Set<AvatarFit>(['contain', 'cover', 'fill', 'none', 'scale-down'])
const PURE_VAR = /^\$[a-zA-Z_][\w.]*$/
const DEFAULT_ICON = 'fa fa-user'

export function avatarResolve(raw: unknown, data: PlainObject = {}): string {
  if (raw == null || raw === false) return ''
  if (typeof raw !== 'string') return String(raw)
  if (PURE_VAR.test(raw)) {
    let cur: unknown = data
    for (const key of raw.slice(1).split('.')) {
      if (cur == null || typeof cur !== 'object') return ''
      cur = (cur as Record<string, unknown>)[key]
    }
    if (cur == null || cur === false) return ''
    return String(cur)
  }
  return filterTpl(raw, data)
}

export function avatarShape(schema: unknown): AvatarShape {
  const value = String(asRecord(schema).shape || '')
  return SHAPES.has(value as AvatarShape) ? (value as AvatarShape) : 'circle'
}

export function avatarSizePx(schema: unknown): number {
  const size = asRecord(schema).size
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) return size
  const key = String(size || '')
  if (key === 'small') return 32
  if (key === 'large') return 48
  return 40
}

export function avatarFit(schema: unknown): AvatarFit {
  const value = String(asRecord(schema).fit || '')
  return FITS.has(value as AvatarFit) ? (value as AvatarFit) : 'cover'
}

export function avatarGap(schema: unknown): number {
  const gap = asRecord(schema).gap
  if (typeof gap === 'number' && Number.isFinite(gap)) return gap
  if (typeof gap === 'string' && gap && Number.isFinite(Number(gap))) return Number(gap)
  return 4
}

export function avatarSrc(schema: unknown, data: PlainObject = {}): string {
  const rec = asRecord(schema)
  const src = avatarResolve(rec.src, data)
  if (src) return src
  return avatarResolve(rec.defaultAvatar, data)
}

export function avatarText(schema: unknown, data: PlainObject = {}): string {
  return avatarResolve(asRecord(schema).text, data)
}

export function avatarAlt(schema: unknown, data: PlainObject = {}): string {
  return avatarResolve(asRecord(schema).alt, data)
}

export function avatarIcon(schema: unknown, data: PlainObject = {}): string {
  const raw = asRecord(schema).icon
  if (raw == null || raw === false || raw === '') return DEFAULT_ICON
  return avatarResolve(raw, data) || DEFAULT_ICON
}

export function avatarIconKind(icon: string): 'url' | 'class' {
  if (/^https?:/i.test(icon) || icon.includes('/')) return 'url'
  return 'class'
}

export function avatarIconSizePx(schema: unknown): number {
  const size = asRecord(schema).size
  if (size === 'small') return 12
  if (size === 'large') return 20
  return 18
}

export function avatarKind(schema: unknown, data: PlainObject = {}): AvatarKind {
  if (avatarSrc(schema, data)) return 'src'
  if (avatarText(schema, data)) return 'text'
  return 'icon'
}

export function avatarDraggable(schema: unknown): boolean | undefined {
  const value = asRecord(schema).draggable
  if (value === true) return true
  if (value === false) return false
  return undefined
}

export function avatarCrossOrigin(schema: unknown): 'anonymous' | 'use-credentials' | '' | undefined {
  const value = asRecord(schema).crossOrigin
  if (value === 'anonymous' || value === 'use-credentials' || value === '') return value
  return undefined
}

export function avatarRadius(schema: unknown): string {
  const shape = avatarShape(schema)
  if (shape === 'square') return '0'
  if (shape === 'rounded') return '10%'
  return '50%'
}

/** Amis：文字绝对定位后按 (宽 − 2×gap) / 文字宽 缩放，保证左右 gap 像素。 */
export function avatarTextScale(nodeWidth: number, childrenWidth: number, gap: number): number {
  if (!childrenWidth || !nodeWidth) return 1
  if (gap * 2 >= nodeWidth) return 1
  const diff = nodeWidth - gap * 2
  return diff < childrenWidth ? diff / childrenWidth : 1
}

/**
 * 图片 onError 后是否继续显示 img。对齐 Amis：`hasImg = onError ? !onError(event) : false`，
 * 渲染器默认 `() => false` 所以失败不置换。字符串函数体只在 `env.trusted` 编译。
 */
export function avatarKeepImageAfterError(
  schema: unknown,
  trusted: boolean,
  event?: Event,
): boolean {
  const onError = asRecord(schema).onError
  if (typeof onError === 'function') return !Boolean((onError as (ev?: Event) => unknown)(event))
  if (typeof onError === 'string' && onError && trusted) {
    try {
      const fn = new Function('event', onError) as (ev?: Event) => unknown
      return !Boolean(fn(event))
    } catch {
      return true
    }
  }
  return true
}
