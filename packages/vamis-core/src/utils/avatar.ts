/** Avatar。对齐 Amis：shape 默认 circle、size 空/default/normal=40、small 32、large 48、fit cover、gap 4；src > text > icon。 */

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
  const src = rec.src == null || rec.src === false ? '' : filterTpl(rec.src, data)
  if (src) return src
  if (rec.defaultAvatar == null || rec.defaultAvatar === false) return ''
  return filterTpl(rec.defaultAvatar, data)
}

export function avatarText(schema: unknown, data: PlainObject = {}): string {
  const text = asRecord(schema).text
  if (text == null || text === false) return ''
  return filterTpl(text, data)
}

export function avatarAlt(schema: unknown, data: PlainObject = {}): string {
  const alt = asRecord(schema).alt
  if (alt == null || alt === false) return ''
  return filterTpl(alt, data)
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

export function avatarRadius(schema: unknown): string {
  const shape = avatarShape(schema)
  if (shape === 'square') return '0'
  if (shape === 'rounded') return '10%'
  return '50%'
}
