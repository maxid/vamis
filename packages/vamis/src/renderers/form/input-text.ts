import type { SchemaObject } from '@vamis/core'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

export type TextTransform = {
  lowerCase?: boolean
  upperCase?: boolean
}

export type NormalizedAddOn =
  | { kind: 'action'; schema: SchemaObject; position: 'left' | 'right' }
  | { kind: 'text'; label: string; icon?: unknown; className?: unknown; position: 'left' | 'right' }

export function transformInputText(value: string, transform?: TextTransform | null): string {
  if (!transform) return value
  let next = value
  if (transform.lowerCase) next = next.toLowerCase()
  if (transform.upperCase) next = next.toUpperCase()
  return next
}

export function applyTextEmptyValue(value: string, clearValueOnEmpty?: boolean): string | undefined {
  if (clearValueOnEmpty && value === '') return undefined
  return value
}

export function textValueToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

export function inputNativeType(type: unknown): string {
  if (type === 'input-email') return 'email'
  if (type === 'input-password') return 'password'
  if (type === 'input-url') return 'url'
  if (type === 'native-number' || type === 'input-number') return 'number'
  if (type === 'native-date') return 'date'
  if (type === 'native-time') return 'time'
  return 'text'
}

export function isTextSuggestMode(schema: SchemaObject): boolean {
  if (schema.autoComplete === false) return false
  const options = schema.options
  return !!(schema.source || schema.autoComplete || (Array.isArray(options) && options.length))
}

export function addOnPosition(raw: unknown): 'left' | 'right' {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && (raw as SchemaObject).position === 'left') {
    return 'left'
  }
  return 'right'
}

export function normalizeAddOn(raw: unknown): NormalizedAddOn | null {
  if (raw == null || raw === false) return null
  const position = addOnPosition(raw)
  if (typeof raw === 'string') return { kind: 'text', label: raw, position }
  if (typeof raw !== 'object' || Array.isArray(raw)) return null
  const rec = raw as SchemaObject
  const type = String(rec.type || rec.actionType || '')
  if (rec.actionType || ['button', 'submit', 'reset', 'action'].includes(type)) {
    return { kind: 'action', schema: rec.type ? rec : ({ type: 'button', ...rec } as SchemaObject), position }
  }
  return {
    kind: 'text',
    label: rec.label != null ? String(rec.label) : '',
    icon: rec.icon,
    className: rec.className,
    position,
  }
}

export function readTextOptions(
  raw: unknown,
  labelField = 'label',
  valueField = 'value',
): OptionItem[] {
  const normalized = normalizeOptions(raw)
  if (labelField === 'label' && valueField === 'value') return flattenOptions(normalized)
  if (!Array.isArray(raw)) return flattenOptions(normalized)
  return flattenOptions(
    raw.map((item) => {
      if (item == null || typeof item !== 'object') return { label: String(item ?? ''), value: item }
      const node = item as Record<string, unknown>
      return {
        label: String(node[labelField] ?? node.label ?? node.name ?? node[valueField] ?? node.value ?? ''),
        value: node[valueField] ?? node.value ?? node.id ?? node[labelField] ?? node.label ?? '',
        disabled: !!node.disabled,
        children: Array.isArray(node.children) ? readTextOptions(node.children, labelField, valueField) : undefined,
      }
    }),
  )
}

export function filterTextOptions(options: OptionItem[], keyword: string, selected: unknown[]): OptionItem[] {
  const q = keyword.trim().toLowerCase()
  return options.filter((item) => {
    if (selected.some((value) => optionValuesEqual(value, item.value))) return false
    if (!q) return true
    return String(item.label).toLowerCase().includes(q) || String(item.value ?? '').toLowerCase().includes(q)
  })
}

export function dumpTextValue(
  items: OptionItem[],
  multiple: boolean,
  joinValues: boolean,
  extractValue: boolean,
  delimiter: string,
): unknown {
  if (joinValues) return dumpJoined(items.map((item) => item.value), multiple, true, delimiter)
  if (extractValue) return multiple ? items.map((item) => item.value) : items[0]?.value
  return multiple ? items : items[0]
}

export function parseTextValue(
  value: unknown,
  options: OptionItem[],
  multiple: boolean,
  joinValues: boolean,
  delimiter: string,
): OptionItem[] {
  const raw = parseJoined(value, multiple, joinValues, delimiter)
  return raw.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const node = item as Record<string, unknown>
      return {
        label: String(node.label ?? node.value ?? ''),
        value: node.value ?? node.label ?? '',
      }
    }
    const hit = options.find((option) => optionValuesEqual(option.value, item))
    return hit || { label: String(item ?? ''), value: item }
  })
}
