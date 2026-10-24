/** AnchorNav。对齐 Amis：flatten links/children；active 可以是 href 或索引。 */

import { filterTpl, isVisible } from '../formula'
import type { SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export type AnchorNavSection = {
  key: string
  title: string
  body: SchemaNode[]
  schema: SchemaObject
}

export function anchorNavHorizontal(schema: unknown): boolean {
  return asRecord(schema).direction === 'horizontal'
}

export function anchorNavSections(schema: unknown, data: Record<string, unknown> = {}): AnchorNavSection[] {
  const links = asRecord(schema).links
  const list = Array.isArray(links) ? links : []
  const out: AnchorNavSection[] = []
  const walk = (items: unknown[], prefix: string) => {
    items.forEach((raw, i) => {
      const rec = asRecord(raw)
      if (!isVisible(rec as SchemaObject, data)) return
      const href = rec.href != null && rec.href !== '' ? String(rec.href) : ''
      const key = href || `${prefix}${i}`
      const title = filterTpl(String(rec.title || rec.label || key), data)
      out.push({ key, title, body: toNodes(rec.body), schema: rec as SchemaObject })
      if (Array.isArray(rec.children)) walk(rec.children, `${key}-`)
    })
  }
  walk(list, '')
  return out
}

export function anchorNavActive(schema: unknown, sections: AnchorNavSection[]): string {
  if (!sections.length) return ''
  const active = asRecord(schema).active
  if (typeof active === 'number' && Number.isInteger(active) && sections[active]) return sections[active].key
  if (active != null && active !== '') {
    const key = String(active)
    if (sections.some((row) => row.key === key)) return key
  }
  return sections[0].key
}
