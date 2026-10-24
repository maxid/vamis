/** ButtonGroup。对齐 Amis：buttons 或 body；btnLevel 被按钮自己的 level 覆盖；vertical / tiled。 */

import type { SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export function buttonGroupVertical(schema: unknown): boolean {
  return asRecord(schema).vertical === true
}

export function buttonGroupTiled(schema: unknown): boolean {
  return asRecord(schema).tiled === true
}

export function buttonGroupButtons(schema: unknown): SchemaObject[] {
  const rec = asRecord(schema)
  const raw = rec.buttons ?? rec.body
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : []
  const btnLevel = typeof rec.btnLevel === 'string' ? rec.btnLevel : ''
  const size = rec.size
  const disabled = rec.disabled === true
  const fill = buttonGroupVertical(schema) || buttonGroupTiled(schema)
  const out: SchemaObject[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const next: SchemaObject = { ...(item as SchemaObject) }
    if (size != null && next.size == null) next.size = size
    if (disabled) next.disabled = true
    if (btnLevel && !next.level) next.level = btnLevel
    if (fill && next.block == null) next.block = true
    out.push(next)
  }
  return out
}
