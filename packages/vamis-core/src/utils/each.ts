/** Each。对齐 Amis Each.tsx：value ?? source ?? name；对象转 {key,value}；占位默认暂无数据。 */

import { asArray } from '../context'
import { filterTpl, resolveValue } from '../formula'
import type { PlainObject, SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function isPlainItem(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** Amis getPropValue：value ?? source ?? name。Field 把 name 映射进 value，所以文档说 name 高于 source。 */
export function eachResolvedValue(schema: unknown, data: PlainObject = {}): unknown {
  const rec = asRecord(schema)
  if (rec.value !== undefined && rec.value !== null) return rec.value
  if (rec.source != null) return resolveValue(rec.source, data)
  if (typeof rec.name === 'string' && rec.name) return resolveValue(rec.name, data)
  return undefined
}

export function eachList(schema: unknown, data: PlainObject = {}): unknown[] {
  const value = eachResolvedValue(schema, data)
  let arr: unknown[] = []
  if (Array.isArray(value)) arr = value
  else if (isPlainItem(value)) {
    arr = Object.keys(value).map((key) => ({ key, value: value[key] }))
  }
  const rec = asRecord(schema)
  const maxRaw = rec.maxLength
  const max =
    typeof maxRaw === 'string' && (maxRaw.includes('$') || maxRaw.includes('${'))
      ? Number(resolveValue(maxRaw, data))
      : Number(maxRaw)
  return Number.isFinite(max) && max >= 1 ? arr.slice(0, max) : arr
}

export function eachPlaceholder(schema: unknown): string {
  const raw = asRecord(schema).placeholder
  if (raw == null || raw === '' || raw === 'placeholder.noData') return '暂无数据'
  if (typeof raw === 'object') return '暂无数据'
  return String(raw)
}

export function eachRowData(
  schema: unknown,
  item: unknown,
  index: number,
): PlainObject {
  const rec = asRecord(schema)
  const name = typeof rec.name === 'string' ? rec.name : ''
  const itemKey = String(rec.itemKeyName || 'item')
  const indexKey = String(rec.indexKeyName || 'index')
  const extra: PlainObject = isPlainItem(item)
    ? { index, ...item }
    : name
      ? { [name]: item }
      : {}
  extra[itemKey] = item
  extra[indexKey] = index
  return extra
}

function eachItemsRaw(schema: unknown): unknown {
  const rec = asRecord(schema)
  return rec.items ?? rec.body ?? { type: 'tpl', tpl: '${item}' }
}

/** 只展开当前层 name/label（对齐 wrapControl tokenize）；不要 dataMapping 整棵 items，否则嵌套 each 模板会被外层烤死。 */
export function eachItemNodes(
  schema: unknown,
  item: unknown,
  index: number,
): SchemaNode[] {
  const ctx = eachRowData(schema, item, index)
  return asArray(eachItemsRaw(schema) as SchemaObject | SchemaObject[] | null).map((node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return node
    const rec = { ...(node as SchemaObject) }
    if (typeof rec.name === 'string' && rec.name.includes('${')) rec.name = filterTpl(rec.name, ctx)
    if (typeof rec.label === 'string' && rec.label.includes('${')) rec.label = filterTpl(rec.label, ctx)
    return rec
  })
}
