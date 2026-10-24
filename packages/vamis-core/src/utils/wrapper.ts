/** Wrapper。对齐 Amis：默认 size md、none 无内边距、wrap false 不再包一层。 */

import type { SchemaNode } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export type WrapperSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'

const SIZES = new Set<WrapperSize>(['xs', 'sm', 'md', 'lg', 'xl', 'none'])

export function wrapperSize(schema: unknown): WrapperSize {
  const size = asRecord(schema).size
  return typeof size === 'string' && SIZES.has(size as WrapperSize) ? (size as WrapperSize) : 'md'
}

export function wrapperWrap(schema: unknown): boolean {
  return asRecord(schema).wrap !== false
}

export function wrapperPaddingToken(schema: unknown): string | undefined {
  const size = wrapperSize(schema)
  if (size === 'none') return undefined
  return `var(--gap-${size})`
}

export function wrapperBody(schema: unknown): SchemaNode[] {
  return toNodes(asRecord(schema).body)
}
