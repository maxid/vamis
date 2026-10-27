/** Web Component。对齐 Amis：tag 默认 div；props 字符串走模板，空结果回退原文；body 为子节点。 */

import { filterTpl } from '../formula'
import type { PlainObject, SchemaCollection } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export function webComponentTag(schema: unknown): string {
  const tag = String(asRecord(schema).tag || '').trim()
  return tag || 'div'
}

export function webComponentProps(schema: unknown, data: PlainObject = {}): Record<string, unknown> {
  const raw = asRecord(schema).props
  const props = asRecord(raw)
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      const mapped = filterTpl(value, data)
      out[key] = mapped || value
    } else {
      out[key] = value
    }
  }
  return out
}

export function webComponentBody(schema: unknown): SchemaCollection | undefined {
  const body = asRecord(schema).body
  if (body == null || body === false) return undefined
  return body as SchemaCollection
}
