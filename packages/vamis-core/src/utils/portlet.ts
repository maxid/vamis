/** Portlet。对齐 Amis：默认有分隔线、mountOnEnter 默认 false、工具栏缺省 button/link/sm。 */

import { filterTpl } from '../formula'
import type { SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export function portletHideHeader(schema: unknown): boolean {
  return asRecord(schema).hideHeader === true
}

export function portletDivider(schema: unknown): boolean {
  return asRecord(schema).divider !== false
}

export function portletDescription(schema: unknown, data: Record<string, unknown> = {}): string {
  const raw = asRecord(schema).description
  if (raw == null || raw === false || raw === '') return ''
  return filterTpl(String(raw), data)
}

export function portletMountOnEnter(schema: unknown): boolean {
  return asRecord(schema).mountOnEnter === true
}

export function portletToolbarItems(toolbar: unknown): SchemaObject[] {
  const out: SchemaObject[] = []
  for (const node of toNodes(toolbar)) {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      out.push({
        type: 'button',
        level: 'link',
        size: 'sm',
        ...(node as SchemaObject),
      })
      continue
    }
    if (node == null || node === false) continue
    out.push({ type: 'button', level: 'link', size: 'sm', label: String(node) })
  }
  return out
}
