import { asArray, resolveValue, type SchemaNode, type SchemaObject } from '@vamis/core'

const LAYOUT_ONLY = new Set(['grid-column', 'hbox-column', 'vbox-row'])

export function layoutChild(node: SchemaObject): SchemaNode | SchemaNode[] {
  if (node.body != null && (!node.type || LAYOUT_ONLY.has(String(node.type)))) {
    return node.body as SchemaNode | SchemaNode[]
  }
  if (node.type) return node
  return (node.body as SchemaNode | SchemaNode[]) ?? node
}

export function layoutNodes(node: SchemaObject): SchemaNode[] {
  return asArray(layoutChild(node))
}

export function cssSize(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  return String(value)
}

export function styleObject(style: unknown): Record<string, string> {
  if (style && typeof style === 'object' && !Array.isArray(style)) {
    return style as Record<string, string>
  }
  return {}
}

export function resolveItems(
  schema: SchemaObject,
  data: Record<string, any>,
  keys: string[] = ['options', 'items'],
): unknown[] {
  if (schema.source != null) {
    const resolved = resolveValue(schema.source, data)
    if (Array.isArray(resolved)) return resolved
  }
  if (schema.name && Array.isArray(data?.[schema.name])) return data[schema.name]
  for (const key of keys) {
    if (Array.isArray(schema[key])) return schema[key] as unknown[]
  }
  return []
}

export function tabKey(tab: SchemaObject, index: number) {
  return String(tab.key ?? tab.href ?? tab.title ?? tab.label ?? index)
}
