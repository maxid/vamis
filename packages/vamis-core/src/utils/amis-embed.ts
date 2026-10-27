/** type: amis。对齐 Amis：getPropValue(name/value) || schema；JSON 字符串；props 盖到内层。 */

import type { PlainObject, SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function readNamed(schema: Record<string, unknown>, data: PlainObject): unknown {
  const name = schema.name
  if (typeof name !== 'string' || !name) return undefined
  if (Object.prototype.hasOwnProperty.call(data, name)) return data[name]
  return undefined
}

function parseInner(raw: unknown): unknown {
  if (raw == null || raw === false) return null
  if (typeof raw === 'string') {
    const text = raw.trim()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return null
    }
  }
  if (typeof raw === 'object') return raw
  return null
}

export function amisEmbedInner(schema: unknown, data: PlainObject = {}): SchemaObject | null {
  const rec = asRecord(schema)
  const named = readNamed(rec, data)
  const raw = named !== undefined ? named : rec.value !== undefined && rec.value !== null ? rec.value : rec.schema ?? rec.body
  const parsed = parseInner(raw)
  if (!parsed || typeof parsed !== 'object') return null
  const extra =
    rec.props && typeof rec.props === 'object' && !Array.isArray(rec.props)
      ? (rec.props as Record<string, unknown>)
      : {}
  if (Array.isArray(parsed)) {
    return {
      type: 'container',
      body: parsed.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? { ...(item as SchemaObject), ...extra }
          : item,
      ) as SchemaNode[],
    }
  }
  return { ...(parsed as SchemaObject), ...extra }
}
