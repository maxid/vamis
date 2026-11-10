/** Image 展示。对齐 Amis：默认 110×110 缩略图；height/width / thumbMode 走模板插值。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

export type ImageThumbMode = 'contain' | 'cover' | 'w-full' | 'h-full' | 'h-stretch'
export type ImageThumbRatio = '1:1' | '4:3' | '16:9'
export type ImageMode = 'thumb' | 'original'
export type ImageToolbarKey = 'rotateRight' | 'rotateLeft' | 'zoomIn' | 'zoomOut' | 'scaleOrigin'

export type ImageToolbarAction = {
  key: ImageToolbarKey
  label?: string
  icon?: string
  iconClassName?: string
  disabled?: boolean
}

const THUMB_MODES = new Set<string>(['contain', 'cover', 'w-full', 'h-full', 'h-stretch'])
const THUMB_RATIOS = new Set<string>(['1:1', '4:3', '16:9'])
const TOOLBAR_KEYS = new Set<string>(['rotateRight', 'rotateLeft', 'zoomIn', 'zoomOut', 'scaleOrigin'])

export const IMAGE_TOOLBAR_DEFAULT: ImageToolbarAction[] = [
  { key: 'rotateLeft', label: '左旋转', icon: 'rotate-left' },
  { key: 'rotateRight', label: '右旋转', icon: 'rotate-right' },
  { key: 'zoomIn', label: '放大', icon: 'zoom-in' },
  { key: 'zoomOut', label: '缩小', icon: 'zoom-out' },
  { key: 'scaleOrigin', label: '原始比例', icon: 'scale-origin' },
]

/** Amis ImageField.defaultImage：无 src 时的占位图。 */
export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'%3E%3Cpath fill='%23bfbfbf' d='M960 64H64C28.8 64 0 92.8 0 128v768c0 35.2 28.8 64 64 64h896c35.2 64-28.8 64-64-64V128c0-35.2 28.8-64 64-64z'/%3E%3Cpath fill='%23bfbfbf' d='M832 288c0 53-43 96-96 96s-96-43-96-96 43-96 96-96 96 43 96 96zM896 832H128V704l224-384 256 320h64l224-192z'/%3E%3C/svg%3E"

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function tpl(raw: unknown, data: PlainObject): string {
  if (raw == null || raw === false) return ''
  return filterTpl(String(raw), data).trim()
}

/** 把 schema height/width 收成 CSS 长度。`${imageHeight}` 插值成 `200px`；插值后仍含 `$` 则丢掉。 */
export function imageBoxSize(raw: unknown, data: PlainObject = {}): string {
  if (raw == null || raw === false || raw === '') return ''
  const out = filterTpl(String(raw).trim(), data).trim()
  if (!out || out.includes('$')) return ''
  return /^\d+$/.test(out) ? `${out}px` : out
}

/** `h-stretch`：按 `height` 拉伸，宽度吃满父级。其余模式走 110px 缩略图（可再写 width/height）。 */
export function imageFillsParent(mode: ImageThumbMode): boolean {
  return mode === 'h-stretch'
}

export function imageThumbMode(schema: unknown, data: PlainObject = {}): ImageThumbMode {
  const raw = asRecord(schema).thumbMode
  const mode = filterTpl(String(raw || 'contain'), data).trim()
  return THUMB_MODES.has(mode) ? (mode as ImageThumbMode) : 'contain'
}

export function imageThumbRatio(schema: unknown, data: PlainObject = {}): ImageThumbRatio {
  const raw = asRecord(schema).thumbRatio
  const ratio = filterTpl(String(raw || '1:1'), data).trim()
  return THUMB_RATIOS.has(ratio) ? (ratio as ImageThumbRatio) : '1:1'
}

export function imageMode(schema: unknown): ImageMode {
  return asRecord(schema).imageMode === 'original' ? 'original' : 'thumb'
}

export function imageSrc(schema: unknown, data: PlainObject = {}): string {
  const rec = asRecord(schema)
  const fromSchema = rec.src || rec.url
  if (fromSchema != null && fromSchema !== false && fromSchema !== '') {
    return filterTpl(String(fromSchema), data)
  }
  const name = String(rec.name || '')
  if (name && data[name] != null) return filterTpl(String(data[name]), data)
  return ''
}

export function imageOriginalSrc(schema: unknown, data: PlainObject = {}, fallback = ''): string {
  const rec = asRecord(schema)
  if (rec.originalSrc != null && rec.originalSrc !== false && rec.originalSrc !== '') {
    return filterTpl(String(rec.originalSrc), data)
  }
  return fallback
}

export function imageHref(schema: unknown, data: PlainObject = {}): string {
  return tpl(asRecord(schema).href, data)
}

export function imageTitle(schema: unknown, data: PlainObject = {}): string {
  return tpl(asRecord(schema).title, data)
}

export function imageCaption(schema: unknown, data: PlainObject = {}): string {
  const rec = asRecord(schema)
  return tpl(rec.imageCaption ?? rec.caption, data)
}

export function imageAlt(schema: unknown, data: PlainObject = {}): string {
  const rec = asRecord(schema)
  return tpl(rec.alt, data) || imageTitle(schema, data) || String(rec.name || 'image')
}

export function imageDefaultSrc(schema: unknown, data: PlainObject = {}): string {
  const rec = asRecord(schema)
  if (rec.defaultImage != null && rec.defaultImage !== false && rec.defaultImage !== '') {
    return filterTpl(String(rec.defaultImage), data)
  }
  return IMAGE_PLACEHOLDER
}

export function imagePlaceholderText(schema: unknown, data: PlainObject = {}): string {
  return tpl(asRecord(schema).placeholder, data)
}

export function imageEnlargeAble(schema: unknown): boolean {
  return asRecord(schema).enlargeAble === true
}

export function imageShowToolbar(schema: unknown): boolean {
  return asRecord(schema).showToolbar === true
}

export function imageToolbarActions(schema: unknown): ImageToolbarAction[] {
  const raw = asRecord(schema).toolbarActions
  if (!Array.isArray(raw) || !raw.length) return IMAGE_TOOLBAR_DEFAULT
  return raw
    .map((item) => asRecord(item))
    .filter((item) => TOOLBAR_KEYS.has(String(item.key || '')))
    .map((item) => ({
      key: item.key as ImageToolbarKey,
      label: item.label != null ? String(item.label) : undefined,
      icon: item.icon != null ? String(item.icon) : undefined,
      iconClassName: item.iconClassName != null ? String(item.iconClassName) : undefined,
      disabled: item.disabled === true,
    }))
}

export function imageScaleNumber(raw: unknown, data: PlainObject, fallback: number): number {
  const text = tpl(raw, data)
  const num = text ? Number(text) : Number(raw)
  return Number.isFinite(num) ? num : fallback
}

/** Amis ImageField zoom：`scale` 是百分点，正放大负缩小；夹在 minScale/maxScale。 */
export function imageZoomNext(current: number, deltaPercent: number, minScale = 50, maxScale = 200): number {
  const next = current + deltaPercent / 100
  const min = minScale / 100
  const max = maxScale / 100
  if (deltaPercent >= 0) return next < max ? next : max
  return next > min ? next : min
}
