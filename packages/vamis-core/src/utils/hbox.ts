/** HBox 水平布局。对齐 Amis：默认 gap xs、列均分、width auto/custom、align / valign。 */

import type { SchemaCollection, SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toArray(node?: SchemaCollection | null): SchemaNode[] {
  if (node == null) return []
  return Array.isArray(node) ? node : [node]
}

const GAP_TOKENS = new Set(['xs', 'sm', 'base', 'none', 'md', 'lg'])
const H_ALIGNS = new Set(['left', 'right', 'between', 'center'])
const V_ALIGNS = new Set(['top', 'middle', 'bottom', 'between'])

export function hboxGapToken(schema: unknown): string {
  const gap = asRecord(schema).gap
  return typeof gap === 'string' && GAP_TOKENS.has(gap) ? gap : 'xs'
}

export function hboxHAlign(schema: unknown): string | undefined {
  const align = asRecord(schema).align
  return typeof align === 'string' && H_ALIGNS.has(align) ? align : undefined
}

export function hboxVAlign(schema: unknown): string | undefined {
  const valign = asRecord(schema).valign
  return typeof valign === 'string' && V_ALIGNS.has(valign) ? valign : undefined
}

export function hboxColumnVAlign(col: unknown): string | undefined {
  return hboxVAlign(col)
}

export function hboxColumnStyle(col: unknown): Record<string, unknown> {
  const rec = asRecord(col)
  const style: Record<string, unknown> = {}
  if (rec.width != null && rec.width !== '') style.width = rec.width
  if (rec.height != null && rec.height !== '') style.height = rec.height
  if (rec.style && typeof rec.style === 'object' && !Array.isArray(rec.style)) {
    Object.assign(style, rec.style as Record<string, unknown>)
  }
  return style
}

export function hboxColumnWidthMode(col: unknown): 'auto' | 'custom' | undefined {
  const width = hboxColumnStyle(col).width
  if (width === 'auto') return 'auto'
  if (width != null && width !== '' && width !== 0 && width !== false) return 'custom'
  return undefined
}

export function hboxColumnBody(col: unknown): SchemaNode[] {
  if (col == null) return []
  if (typeof col !== 'object') return toArray(col as SchemaCollection)
  const rec = col as SchemaObject
  if (rec.body != null) return toArray(rec.body)
  if (typeof rec.type === 'string' && rec.type !== 'hbox-column') return [rec]
  return []
}
