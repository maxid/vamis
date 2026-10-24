/** DropDownButton。对齐 Amis：buttons 或 body；children 分组；visible:false 丢掉；默认 click / 点外侧关 / 点项不关。 */

import { isVisible } from '../formula'
import type { SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type DropdownButtonItem = {
  kind: 'item' | 'group' | 'divider'
  label: string
  schema: SchemaObject
  disabled: boolean
  children?: DropdownButtonItem[]
}

export function dropdownButtonTrigger(schema: unknown): 'click' | 'hover' {
  return asRecord(schema).trigger === 'hover' ? 'hover' : 'click'
}

export function dropdownButtonCloseOnClick(schema: unknown): boolean {
  return asRecord(schema).closeOnClick === true
}

export function dropdownButtonCloseOnOutside(schema: unknown): boolean {
  return asRecord(schema).closeOnOutside !== false
}

export function dropdownButtonHideCaret(schema: unknown): boolean {
  return asRecord(schema).hideCaret === true || asRecord(schema).iconOnly === true
}

export function dropdownButtonAlign(schema: unknown): 'left' | 'right' {
  return asRecord(schema).align === 'right' ? 'right' : 'left'
}

function mapItem(raw: unknown, data: Record<string, unknown>): DropdownButtonItem | null {
  if (raw == null || raw === false) return null
  if (typeof raw === 'string') {
    return { kind: 'item', label: raw, schema: { type: 'button', label: raw }, disabled: false }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) return null
  const rec = raw as SchemaObject
  if (!isVisible(rec, data)) return null
  if (rec.type === 'divider' || rec.type === 'separator') {
    return { kind: 'divider', label: '', schema: rec, disabled: false }
  }
  const childrenRaw = Array.isArray(rec.children) ? rec.children : []
  const children = childrenRaw.map((item) => mapItem(item, data)).filter((item): item is DropdownButtonItem => !!item)
  const label = rec.label == null || rec.label === false ? '' : String(rec.label)
  if (children.length && rec.type !== 'button') {
    return { kind: 'group', label, schema: rec, disabled: rec.disabled === true, children }
  }
  return {
    kind: 'item',
    label,
    schema: rec.type ? rec : { type: 'button', ...rec },
    disabled: rec.disabled === true,
  }
}

export function dropdownButtonItems(schema: unknown, data: Record<string, unknown> = {}): DropdownButtonItem[] {
  const rec = asRecord(schema)
  const raw = rec.buttons ?? rec.body
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : []
  return list.map((item) => mapItem(item, data)).filter((item): item is DropdownButtonItem => !!item)
}
