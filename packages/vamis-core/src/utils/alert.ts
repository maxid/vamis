/** Alert。对齐 Amis：level 默认 info、showIcon / showCloseButton 默认 false、title / body / actions、表达式 level。 */

import { filterTpl, resolveValue } from '../formula'
import type { PlainObject, SchemaNode } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const LEVELS = new Set(['info', 'success', 'warning', 'danger'])

export type AlertLevel = 'info' | 'success' | 'warning' | 'danger'

export function alertLevel(schema: unknown, data: PlainObject = {}): AlertLevel {
  const raw = asRecord(schema).level
  const resolved = raw == null || raw === '' ? 'info' : resolveValue(raw, data)
  const value = String(resolved ?? '')
  if (value === 'error') return 'danger'
  return LEVELS.has(value) ? (value as AlertLevel) : 'info'
}

export function alertShowIcon(schema: unknown, data: PlainObject = {}): boolean {
  const raw = asRecord(schema).showIcon
  if (typeof raw === 'string' && raw) return Boolean(resolveValue(raw, data))
  return raw === true
}

export function alertShowClose(schema: unknown): boolean {
  return asRecord(schema).showCloseButton === true
}

export function alertTitle(schema: unknown, data: PlainObject = {}): string {
  const title = asRecord(schema).title
  if (title == null || title === false) return ''
  if (typeof title === 'object') return ''
  return filterTpl(title, data)
}

export function alertTitleNode(schema: unknown): SchemaNode | null {
  const title = asRecord(schema).title
  if (title && typeof title === 'object') return title as SchemaNode
  return null
}

export function alertBody(schema: unknown): SchemaNode[] {
  const rec = asRecord(schema)
  const body = rec.body ?? rec.msg ?? rec.tpl
  if (body == null || body === false || body === '') return []
  return Array.isArray(body) ? (body as SchemaNode[]) : [body as SchemaNode]
}

export function alertActions(schema: unknown): SchemaNode[] {
  const actions = asRecord(schema).actions
  if (actions == null || actions === false || actions === '') return []
  return Array.isArray(actions) ? (actions as SchemaNode[]) : [actions as SchemaNode]
}

export function alertIconSrc(schema: unknown, data: PlainObject = {}): string {
  const raw = asRecord(schema).icon
  const icon = raw == null || raw === '' ? '' : String(resolveValue(raw, data) ?? '')
  if (!icon) return ''
  if (icon.includes('/') || icon.startsWith('data:')) return icon
  return ''
}
