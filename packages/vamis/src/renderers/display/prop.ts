import { asArray, filterTpl, resolveValue, type SchemaObject } from '@vamis/core'

export function readRaw(schema: SchemaObject, data: Record<string, any>, keys: string[] = ['value']): unknown {
  for (const key of keys) {
    if (schema[key] !== undefined && schema[key] !== null) {
      const value = schema[key]
      if (typeof value === 'string') {
        return value.includes('${') ? resolveValue(value, data) : filterTpl(value, data)
      }
      return value
    }
  }
  if (typeof schema.source === 'string' && schema.source) {
    return resolveValue(schema.source, data)
  }
  if (schema.name != null && schema.name !== '') return data[schema.name]
  return undefined
}

export function readText(schema: SchemaObject, data: Record<string, any>, keys: string[] = ['value']): string {
  const raw = readRaw(schema, data, keys)
  if (raw == null) return ''
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw)
  try {
    return JSON.stringify(raw, null, 2)
  } catch {
    return String(raw)
  }
}

export function readSrc(schema: SchemaObject, data: Record<string, any>): string {
  const raw = schema.src ?? schema.url
  if (typeof raw === 'string') return filterTpl(raw, data)
  if (raw && typeof raw === 'object' && typeof (raw as { url?: string }).url === 'string') {
    return filterTpl((raw as { url: string }).url, data)
  }
  const named = schema.name ? data[schema.name] : undefined
  if (typeof named === 'string') return named
  return ''
}

export function readList(schema: SchemaObject, data: Record<string, any>): unknown[] {
  if (schema.options != null) return Array.isArray(schema.options) ? schema.options : [schema.options]
  if (schema.source) {
    const value = resolveValue(schema.source, data)
    return Array.isArray(value) ? value : value == null ? [] : [value]
  }
  if (schema.name && data[schema.name] != null) {
    const value = data[schema.name]
    return Array.isArray(value) ? value : [value]
  }
  if (schema.value != null) return Array.isArray(schema.value) ? schema.value : [schema.value]
  return []
}

export function cssSize(value: unknown, fallback: string): string {
  if (value == null || value === '') return fallback
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  const text = String(value)
  if (/^\d+(\.\d+)?$/.test(text)) return `${text}px`
  return text
}

export function fileNameOf(src: string, fallback = '未命名文件'): string {
  if (!src) return fallback
  const path = src.split('?')[0].split('#')[0]
  const name = path.split('/').filter(Boolean).pop()
  if (!name) return fallback
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

export function schemaNodes(value: unknown) {
  return asArray(value as any)
}
