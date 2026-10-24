/** Service。对齐 Amis：schemaApi 的 data 当作子 schema 渲染。 */

import type { SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

/** schemaApi 返回的 data：有 type 就整棵渲染；否则取 body。 */
export function serviceRemoteSchema(data: unknown): SchemaNode[] {
  if (data == null || data === false) return []
  if (Array.isArray(data)) return data as SchemaNode[]
  if (typeof data !== 'object') return []
  const rec = asRecord(data)
  if (typeof rec.type === 'string' && rec.type) return [rec as SchemaObject]
  if (rec.body != null) return toNodes(rec.body)
  return []
}
