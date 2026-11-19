import { cloneSchema, type SchemaObject } from '@vamis/core'

let seed = 0

export function guid(): string {
  seed += 1
  return `u:${Date.now().toString(36)}${seed.toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export function camelize(value: string): string {
  return value.replace(/\W+(.)/g, (_match, char: string) => char.toUpperCase())
}

export function JSONPipeIn<T>(value: T, reGenerateId = false, idMap: Record<string, string> = {}): T {
  if (Array.isArray(value)) {
    return value.map((item) => JSONPipeIn(item, reGenerateId, idMap)) as T
  }
  if (!value || typeof value !== 'object') return value

  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === '__editorPath') continue
    result[key] = JSONPipeIn(child, reGenerateId, idMap)
  }
  if (reGenerateId || typeof result.$$id !== 'string' || !result.$$id) {
    const previous = typeof result.$$id === 'string' ? result.$$id : ''
    const next = guid()
    result.$$id = next
    if (previous) idMap[previous] = next
  }
  return result as T
}

export function JSONPipeOut<T>(
  value: T,
  filterHiddenProps?: boolean | ((key: string, prop: unknown) => boolean),
): T {
  if (Array.isArray(value)) {
    return value.map((item) => JSONPipeOut(item, filterHiddenProps)) as T
  }
  if (!value || typeof value !== 'object') return value

  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === '$$id') continue
    const hidden =
      typeof filterHiddenProps === 'function'
        ? filterHiddenProps(key, child)
        : filterHiddenProps !== false && key.startsWith('__')
    if (!hidden) result[key] = JSONPipeOut(child, filterHiddenProps)
  }
  return result as T
}

export function reGenerateID<T>(value: T): T {
  return JSONPipeIn(cloneSchema(value), true)
}

export function schemaLabel(schema: SchemaObject): string {
  if (typeof schema.title === 'string' && schema.title) return schema.title
  if (typeof schema.label === 'string' && schema.label) return schema.label
  return schema.name || schema.type || 'node'
}
