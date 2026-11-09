import type { SchemaObject } from '../types'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from './options'

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

/** schema `revealPassword` 默认 true：是否画显隐钮。state 另存当前是否明文。 */
export function showPasswordReveal(schema: SchemaObject): boolean {
  if (inputNativeType(schema.type) !== 'password') return false
  return schema.revealPassword !== false
}

export type TextMatchPart = { text: string; matched: boolean }

/** 对齐 Amis `matchSorter.rankings`（threshold = CONTAINS）。数字越大越靠前。 */
export const TEXT_MATCH_RANK = {
  EQUAL: 6,
  STARTS_WITH: 5,
  WORD_STARTS_WITH: 4,
  CONTAINS: 3,
  NONE: 0,
} as const

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

function rankHaystack(haystack: string, query: string): number {
  if (!query) return TEXT_MATCH_RANK.EQUAL
  const s = haystack.toLowerCase()
  const q = query.toLowerCase()
  if (s === q) return TEXT_MATCH_RANK.EQUAL
  if (s.startsWith(q)) return TEXT_MATCH_RANK.STARTS_WITH
  if (new RegExp(`(?:^|\\s)${escapeRegExp(q)}`).test(s)) return TEXT_MATCH_RANK.WORD_STARTS_WITH
  if (s.includes(q)) return TEXT_MATCH_RANK.CONTAINS
  return TEXT_MATCH_RANK.NONE
}

export function rankTextOption(item: OptionItem, query: string): number {
  return Math.max(rankHaystack(String(item.label ?? ''), query), rankHaystack(String(item.value ?? ''), query))
}

export type FilterTextOptionsOpts = {
  /** Amis：配了 `autoComplete` 时不下本地 match-sorter，用远端结果。 */
  skipLocal?: boolean
}

export function highlightTextMatches(text: string, input?: string): TextMatchPart[] {
  const value = String(text ?? '')
  if (!input) return value ? [{ text: value, matched: false }] : []
  const reg = new RegExp(escapeRegExp(input), 'gi')
  if (!reg.test(value)) return [{ text: value, matched: false }]
  const parts: TextMatchPart[] = []
  let start = 0
  let match: RegExpExecArray | null
  reg.lastIndex = 0
  while ((match = reg.exec(value))) {
    if (match.index > start) parts.push({ text: value.slice(start, match.index), matched: false })
    if (match[0]) parts.push({ text: match[0], matched: true })
    start = match.index + match[0].length
    if (!match[0].length) break
  }
  if (start < value.length) parts.push({ text: value.slice(start), matched: false })
  return parts
}

export function appendCreatableOption(
  options: OptionItem[],
  keyword: string,
  selected: unknown[],
  creatable: boolean,
  multiple: boolean,
): OptionItem[] {
  const typed = keyword.trim()
  if (!typed || creatable === false || !multiple) return options
  if (options.some((item) => optionValuesEqual(item.value, typed))) return options
  if (selected.some((value) => optionValuesEqual(value, typed))) return options
  return [...options, { label: typed, value: typed, isNew: true }]
}

export function isTextSuggestMode(schema: SchemaObject): boolean {
  if (schema.autoComplete === false) return false
  const options = schema.options
  return !!(schema.source || schema.autoComplete || (Array.isArray(options) && options.length))
}

/**
 * 对齐 Amis InputText 选中态：multiple 永远画 tag；`creatable: false` 单选在未输入筛选时画
 * `TextControl-value`（不要只在 blur 把 label 写进 native input，focus 会空）。
 */
export function showTextSelectedMarks(opts: {
  multiple: boolean
  creatable: boolean
  draft: string
  open: boolean
  selectedCount: number
}): boolean {
  if (!opts.selectedCount) return false
  if (opts.multiple) return true
  if (opts.creatable) return false
  return !(opts.draft && opts.open)
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

export function filterTextOptions(
  options: OptionItem[],
  keyword: string,
  selected: unknown[],
  opts?: FilterTextOptionsOpts,
): OptionItem[] {
  const unused = options.filter((item) => !selected.some((value) => optionValuesEqual(value, item.value)))
  const q = keyword.trim()
  if (opts?.skipLocal || !q) return unused
  return unused
    .map((item, index) => ({ item, index, rank: rankTextOption(item, q) }))
    .filter((row) => row.rank >= TEXT_MATCH_RANK.CONTAINS)
    .sort((a, b) => b.rank - a.rank || a.index - b.index)
    .map((row) => row.item)
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
