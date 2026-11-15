import { shallowReactive } from 'vue'
import type { PlainObject } from './types'

export type ChangeReason = 'init' | 'input' | 'api' | 'formula' | 'hide' | 'action'

export interface Scope {
  readonly parent?: Scope
  readonly data: PlainObject
  get(path: string): unknown
  set(path: string, value: unknown, reason?: ChangeReason): void
  merge(values: PlainObject, mode?: 'merge' | 'override', reason?: ChangeReason): void
  superData(): PlainObject
  resolved(): PlainObject
}

/** 按路径取值。先认字面 key（`a.b` 本身就是字段名），再按 `.` / `[n]` 逐级走。 */
export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj
  if (obj != null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, path)) {
    return (obj as PlainObject)[path]
  }
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  let cur: unknown = obj
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as PlainObject)[part]
  }
  return cur
}

function setByPath(obj: PlainObject, path: string, value: unknown): void {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  if (!parts.length) return
  const top = parts[0]
  if (parts.length === 1) {
    obj[top] = value
    return
  }
  const next = { ...(typeof obj[top] === 'object' && obj[top] ? (obj[top] as PlainObject) : {}) }
  let cursor: PlainObject = next
  for (let i = 1; i < parts.length - 1; i++) {
    const key = parts[i]
    const child = cursor[key]
    cursor[key] = { ...(typeof child === 'object' && child ? (child as PlainObject) : {}) }
    cursor = cursor[key] as PlainObject
  }
  cursor[parts[parts.length - 1]] = value
  obj[top] = next
}

/** 按路径写值，返回新对象：沿途每一层都浅拷贝，原对象不动（行记录、快照都靠这个保持不可变）。 */
export function setByPathCopy(obj: PlainObject, path: string, value: unknown): PlainObject {
  const next = { ...obj }
  setByPath(next, path, value)
  return next
}

export function parseSearch(search?: string): PlainObject {
  const raw =
    search ??
    (typeof window !== 'undefined' && typeof window.location?.search === 'string'
      ? window.location.search
      : '')
  const q = raw.startsWith('?') ? raw.slice(1) : raw
  if (!q) return {}
  const params = new URLSearchParams(q)
  const out: PlainObject = {}
  for (const [key, value] of params.entries()) out[key] = value
  return out
}

export function createScope(
  init: PlainObject = {},
  parent?: Scope,
  options: { isolate?: boolean } = {},
): Scope {
  const own = shallowReactive<PlainObject>({ ...init })
  let prev: PlainObject = {}
  let changeReason: ChangeReason = 'init'
  const parentRef = options.isolate ? undefined : parent

  const scope: Scope = {
    get parent() {
      return parentRef
    },
    get data() {
      return own
    },
    get(path: string) {
      const local = getByPath(own, path)
      if (local !== undefined) return local
      return parentRef?.get(path)
    },
    set(path: string, value: unknown, reason: ChangeReason = 'action') {
      prev = { ...own }
      changeReason = reason
      setByPath(own, path, value)
    },
    merge(values: PlainObject, mode: 'merge' | 'override' = 'merge', reason: ChangeReason = 'action') {
      prev = { ...own }
      changeReason = reason
      if (mode === 'override') {
        for (const key of Object.keys(own)) delete own[key]
      }
      if (values && typeof values === 'object' && !Array.isArray(values)) {
        Object.assign(own, values)
      }
    },
    superData() {
      return parentRef?.resolved() ?? {}
    },
    resolved() {
      const superData = parentRef?.resolved() ?? {}
      return {
        ...superData,
        ...own,
        __super: superData,
        __prev: prev,
        __changeReason: { type: changeReason },
      }
    },
  }
  return scope
}
