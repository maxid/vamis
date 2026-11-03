/** D6：表单 `name` 路径。`a.b` / `a.b[0].c`；字面量键（`data['a.b']`）优先于拆路径。 */

import type { PlainObject } from '../types'

export function keyToPath(key: string): string[] {
  if (!key) return []
  return key
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/\["([^"]+)"\]/g, '.$1')
    .replace(/\['([^']+)'\]/g, '.$1')
    .split('.')
    .filter((part) => part !== '')
}

function isIndex(part: string): boolean {
  return /^\d+$/.test(part)
}

export function getPathValue(data: unknown, key: string | undefined): unknown {
  if (!data || typeof data !== 'object' || !key) return undefined
  const rec = data as PlainObject
  if (Object.prototype.hasOwnProperty.call(rec, key)) return rec[key]
  let cursor: unknown = rec
  for (const part of keyToPath(key)) {
    if (cursor == null || typeof cursor !== 'object') return undefined
    cursor = (cursor as PlainObject)[part]
  }
  return cursor
}

export function setPathValue(data: PlainObject, key: string, value: unknown): void {
  if (!key) return
  if (Object.prototype.hasOwnProperty.call(data, key) && !/[.[\]]/.test(key)) {
    data[key] = value
    return
  }
  const parts = keyToPath(key)
  if (!parts.length) return
  let cursor: PlainObject | unknown[] = data
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const nextKey = parts[i + 1]
    const host = cursor as PlainObject
    const cur = host[part]
    if (cur == null || typeof cur !== 'object') {
      host[part] = isIndex(nextKey) ? [] : {}
    }
    cursor = host[part] as PlainObject
  }
  const last = parts[parts.length - 1]
  ;(cursor as PlainObject)[last] = value
}

export function deletePathValue(data: PlainObject, key: string): void {
  if (!data || !key) return
  if (Object.prototype.hasOwnProperty.call(data, key)) {
    delete data[key]
    return
  }
  const parts = keyToPath(key)
  if (!parts.length) return
  let cursor: unknown = data
  for (let i = 0; i < parts.length - 1; i++) {
    if (cursor == null || typeof cursor !== 'object') return
    cursor = (cursor as PlainObject)[parts[i]]
  }
  if (cursor && typeof cursor === 'object') delete (cursor as PlainObject)[parts[parts.length - 1]]
}
