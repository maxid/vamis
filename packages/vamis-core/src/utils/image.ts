/** Image 展示。对齐 Amis：默认 110×110 缩略图；height/width / thumbMode 走模板插值。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

export type ImageThumbMode = 'contain' | 'cover' | 'w-full' | 'h-full' | 'h-stretch'

const THUMB_MODES = new Set<string>(['contain', 'cover', 'w-full', 'h-full', 'h-stretch'])

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
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
