import type { PlainObject } from '../types'

export const DEFAULT_REPLACE_TEXT_IGNORE_KEYS = [
  'type',
  'name',
  'mode',
  'target',
  'reload',
  'persistData',
]

function isPlainObject(value: unknown): value is PlainObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function mapSchema(value: unknown, visit: (object: PlainObject) => PlainObject, seen = new WeakMap<object, unknown>()): unknown {
  if (Array.isArray(value)) {
    if (seen.has(value)) return seen.get(value)
    const output: unknown[] = []
    seen.set(value, output)
    for (const item of value) output.push(mapSchema(item, visit, seen))
    return output
  }
  if (!isPlainObject(value)) return value
  if (seen.has(value)) return seen.get(value)
  const output: PlainObject = {}
  seen.set(value, output)
  for (const [key, child] of Object.entries(value)) output[key] = mapSchema(child, visit, seen)
  return visit(output)
}

export function applySchemaLocale<T>(schema: T, locale?: string): T {
  if (!locale || !schema || typeof schema !== 'object') return schema
  return mapSchema(schema, (object) => {
    const overrides = object[locale]
    if (!isPlainObject(overrides)) return object
    const merged = { ...object, ...overrides }
    delete merged[locale]
    return merged
  }) as T
}

export type ReplaceTextIgnoreKeys =
  | string[]
  | ((key: string, value: unknown, object: PlainObject) => boolean)

export function replaceSchemaText<T>(
  schema: T,
  replacements?: Record<string, unknown>,
  replaceTextIgnoreKeys: ReplaceTextIgnoreKeys = DEFAULT_REPLACE_TEXT_IGNORE_KEYS,
): T {
  if (!replacements || !schema || typeof schema !== 'object') return schema
  const replacementMap = replacements
  const replaceKeys = Object.keys(replacementMap).filter((key) => key.length > 0).sort((a, b) => b.length - a.length)
  if (!replaceKeys.length) return schema
  const ignored = new Set(Array.isArray(replaceTextIgnoreKeys)
    ? [...DEFAULT_REPLACE_TEXT_IGNORE_KEYS, ...replaceTextIgnoreKeys]
    : DEFAULT_REPLACE_TEXT_IGNORE_KEYS)
  const shouldIgnore = typeof replaceTextIgnoreKeys === 'function'
    ? replaceTextIgnoreKeys
    : (key: string) => ignored.has(key)

  function map(value: unknown, seen = new WeakMap<object, unknown>()): unknown {
    if (Array.isArray(value)) {
      if (seen.has(value)) return seen.get(value)
      const output: unknown[] = []
      seen.set(value, output)
      for (const item of value) output.push(map(item, seen))
      return output
    }
    if (!isPlainObject(value)) return value
    if (seen.has(value)) return seen.get(value)
    const output: PlainObject = {}
    seen.set(value, output)
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'string' && !shouldIgnore(key, child, value)) {
        let next = child
        for (const replaceKey of replaceKeys) {
          if (!next.includes(replaceKey)) continue
          next = next.replaceAll(replaceKey, String(replacementMap[replaceKey] ?? ''))
          break
        }
        output[key] = next
      } else {
        output[key] = map(child, seen)
      }
    }
    return output
  }

  return map(schema) as T
}
