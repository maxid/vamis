import type { SchemaObject } from '../types'

export function resolveSchemaRef(
  schema: unknown,
  definitions: Record<string, SchemaObject> = {},
): SchemaObject | null {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return null
  const node = schema as SchemaObject
  if (!node.$ref) return node
  const target = definitions[node.$ref]
  if (!target || typeof target !== 'object' || Array.isArray(target)) return null
  const merged = { ...target, ...node }
  delete merged.$ref
  return merged
}
