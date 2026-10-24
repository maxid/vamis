/** Grid 水平分栏。对齐 Amis 12 栏 flex：`Grid-col--md` 均分，`md: 1–12` / `auto`，gap / align / valign。 */

import type { SchemaCollection, SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function toArray(node?: SchemaCollection | null): SchemaNode[] {
  if (node == null) return []
  return Array.isArray(node) ? node : [node]
}

const COL_BREAKPOINTS = ['lg', 'md', 'sm', 'xs'] as const
const GAP_TOKENS = new Set(['xs', 'sm', 'base', 'none', 'md', 'lg'])
const H_ALIGNS = new Set(['left', 'right', 'between', 'center'])
const V_ALIGNS = new Set(['top', 'middle', 'bottom', 'between'])

function colToken(bp: string, value: unknown): string | undefined {
  if (value === 'auto') return `${bp}Auto`
  const n = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  if (Number.isFinite(n) && n > 0 && n <= 12) return `${bp}${n}`
  return undefined
}

export function gridColumnClass(col: unknown): string {
  const rec = asRecord(col)
  const parts: string[] = []
  for (const bp of COL_BREAKPOINTS) {
    const token = colToken(bp, rec[bp])
    if (token) parts.push(token)
  }
  if (!parts.length) {
    const span = colToken('md', rec.span)
    if (span) return span
    return 'md'
  }
  return parts.join(' ')
}

export function gridGapToken(schema: unknown): string | undefined {
  const gap = asRecord(schema).gap
  return typeof gap === 'string' && GAP_TOKENS.has(gap) ? gap : undefined
}

export function gridHAlign(schema: unknown): string | undefined {
  const align = asRecord(schema).align
  return typeof align === 'string' && H_ALIGNS.has(align) ? align : undefined
}

export function gridVAlign(schema: unknown): string | undefined {
  const valign = asRecord(schema).valign
  return typeof valign === 'string' && V_ALIGNS.has(valign) ? valign : undefined
}

export function gridColumnVAlign(col: unknown): string | undefined {
  return gridVAlign(col)
}

export function gridColumnBody(col: unknown): SchemaNode[] {
  if (col == null) return []
  if (typeof col !== 'object') return toArray(col as SchemaCollection)
  const rec = col as SchemaObject
  if (rec.body != null) return toArray(rec.body)
  if (typeof rec.type === 'string' && rec.type !== 'grid-column') return [rec]
  return []
}
