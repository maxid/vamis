/** Tabs。对齐 Amis：hash / 索引作 key，source 重复模板，body 或 tab。 */

import { filterTpl, isDisabled, isVisible, resolveValue } from '../formula'
import type { SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export type TabsMode =
  | 'line'
  | 'card'
  | 'radio'
  | 'vertical'
  | 'chrome'
  | 'simple'
  | 'strong'
  | 'tiled'
  | 'sidebar'

const TAB_MODES = new Set<TabsMode>([
  'line',
  'card',
  'radio',
  'vertical',
  'chrome',
  'simple',
  'strong',
  'tiled',
  'sidebar',
])

export type TabItem = SchemaObject & { __item?: unknown }

export function tabsMode(schema: unknown): TabsMode {
  const mode = asRecord(schema).tabsMode
  return typeof mode === 'string' && TAB_MODES.has(mode as TabsMode) ? (mode as TabsMode) : 'line'
}

export function tabsTemplates(schema: unknown): SchemaObject[] {
  const raw = asRecord(schema).tabs
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is SchemaObject => Boolean(item && typeof item === 'object' && !Array.isArray(item)))
}

export function tabsFromSource(schema: unknown, data: Record<string, unknown> = {}): TabItem[] {
  const templates = tabsTemplates(schema)
  const source = asRecord(schema).source
  if (source == null || source === false || source === '') return templates
  const arr = resolveValue(source, data)
  if (!Array.isArray(arr)) return templates
  const out: TabItem[] = []
  for (const value of arr) {
    for (const tab of templates) out.push({ ...tab, __item: value })
  }
  return out
}

export function tabScope(tab: TabItem | undefined, data: Record<string, unknown> = {}): Record<string, unknown> {
  const item = tab?.__item
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return { ...data, ...(item as Record<string, unknown>) }
  }
  return data
}

export function tabKey(tab: unknown, index: number, data: Record<string, unknown> = {}): string {
  const rec = asRecord(tab)
  if (rec.hash != null && rec.hash !== '') {
    const hash = filterTpl(String(rec.hash), data)
    if (hash) return hash
  }
  if (rec.key != null && rec.key !== '') return String(rec.key)
  return String(index)
}

export function tabBody(tab: unknown): SchemaNode[] {
  const rec = asRecord(tab)
  return toNodes(rec.body ?? rec.tab)
}

export function tabTitle(tab: unknown, data: Record<string, unknown> = {}): unknown {
  const title = asRecord(tab).title
  if (typeof title === 'string') return filterTpl(title, data)
  return title
}

export function tabsVisible(tabs: TabItem[], data: Record<string, unknown> = {}): TabItem[] {
  return tabs.filter((tab) => isVisible(tab, tabScope(tab, data)))
}

export function tabsNormalizeActive(
  key: unknown,
  tabs: TabItem[],
  data: Record<string, unknown> = {},
): string {
  const keys = tabs.map((tab, index) => tabKey(tab, index, tabScope(tab, data)))
  if (!keys.length) return '0'
  if (key != null && key !== '') {
    const raw = String(resolveValue(key, data) ?? key)
    if (keys.includes(raw)) return raw
    const n = Number(raw)
    if (Number.isInteger(n) && n >= 0 && n < keys.length) return keys[n]
  }
  return keys[0]
}

export function tabsInitialActive(schema: unknown, tabs: TabItem[], data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  if (rec.activeKey != null && rec.activeKey !== '') return tabsNormalizeActive(rec.activeKey, tabs, data)
  if (rec.defaultKey != null && rec.defaultKey !== '') return tabsNormalizeActive(rec.defaultKey, tabs, data)
  return tabsNormalizeActive(undefined, tabs, data)
}

export function tabsMountOnEnter(schema: unknown): boolean {
  return asRecord(schema).mountOnEnter !== false
}

export function tabsUnmountOnExit(schema: unknown): boolean {
  return asRecord(schema).unmountOnExit === true
}

export function tabDisabled(tab: unknown, data: Record<string, unknown> = {}): boolean {
  return isDisabled(asRecord(tab), data)
}
