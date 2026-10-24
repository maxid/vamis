/** Panel。对齐 Amis heading / body / footer / actions / affixFooter。 */

import type { SchemaCollection, SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export function panelHeader(schema: unknown): SchemaCollection | undefined {
  const header = asRecord(schema).header
  if (header == null || header === false) return undefined
  return header as SchemaCollection
}

export function panelTitle(schema: unknown): unknown {
  if (panelHeader(schema) != null) return undefined
  const title = asRecord(schema).title
  if (title === false || title == null || title === '') return undefined
  return title
}

export function panelShowHeading(schema: unknown): boolean {
  return panelHeader(schema) != null || panelTitle(schema) != null
}

export function panelShowBody(schema: unknown): boolean {
  const body = asRecord(schema).body
  return body != null && body !== false && body !== ''
}

export function panelBody(schema: unknown): SchemaNode[] {
  return toNodes(asRecord(schema).body)
}

export function panelFooter(schema: unknown): SchemaNode[] {
  return toNodes(asRecord(schema).footer)
}

export function panelActions(schema: unknown): SchemaObject[] {
  const raw = asRecord(schema).actions
  if (!Array.isArray(raw)) return []
  const out: SchemaObject[] = []
  for (const item of raw) {
    if (item == null || item === false) continue
    if (typeof item === 'string' || typeof item === 'number') {
      out.push({ type: 'button', label: String(item) })
      continue
    }
    if (typeof item !== 'object' || Array.isArray(item)) continue
    const rec = item as SchemaObject
    out.push(rec.type ? rec : { ...rec, type: 'button' })
  }
  return out
}

export function panelAffixFooter(schema: unknown): boolean {
  const value = asRecord(schema).affixFooter
  return value === true || value === 'always'
}

export function panelCollapsible(schema: unknown): boolean {
  return asRecord(schema).collapsible === true
}
