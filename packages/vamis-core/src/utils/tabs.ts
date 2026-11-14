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

export function tabsMode(schema: unknown, data: Record<string, unknown> = {}): TabsMode {
  const rec = asRecord(schema)
  const mode = rec.tabsMode ?? rec.mode
  const resolved = typeof mode === 'string' ? String(resolveValue(mode, data) ?? mode) : mode
  return typeof resolved === 'string' && TAB_MODES.has(resolved as TabsMode) ? (resolved as TabsMode) : 'line'
}

export function tabsSidePosition(schema: unknown): 'left' | 'right' {
  return asRecord(schema).sidePosition === 'right' ? 'right' : 'left'
}

export function tabsAddBtnText(schema: unknown): string {
  const text = asRecord(schema).addBtnText
  return text != null && String(text).trim() ? String(text) : '新增'
}

export function tabsCollapseOnExceed(schema: unknown): number {
  const n = Number(asRecord(schema).collapseOnExceed)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

const TABS_LOCALE: Record<string, string> = { more: '更多' }

export function tabsCollapseBtnLabel(schema: unknown): string {
  const text = asRecord(schema).collapseBtnLabel
  const raw = text != null && String(text).trim() ? String(text) : 'more'
  return TABS_LOCALE[raw] || raw
}

export function tabsUseAutoOverflow(schema: unknown): boolean {
  return tabsCollapseOnExceed(schema) === 0
}

/** 拖完按对象身份把 active / visited 从旧索引 key 映到新槽位。 */
export function tabsRemapAfterReorder<T>(
  prev: T[],
  next: T[],
  active: string,
  visited: Iterable<string>,
  keyOf: (tab: T, index: number) => string,
): { active: string; visited: Set<string> } {
  const map = new Map<string, string>()
  for (let oldI = 0; oldI < prev.length; oldI++) {
    const tab = prev[oldI]
    const newI = next.indexOf(tab)
    if (newI < 0) continue
    map.set(keyOf(tab, oldI), keyOf(tab, newI))
  }
  const nextVisited = new Set<string>()
  for (const key of visited) nextVisited.add(map.get(key) ?? key)
  return { active: map.get(active) ?? active, visited: nextVisited }
}

export function tabsIndexesEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((n, i) => n === b[i])
}

/** 相对滚动视口不完全可见的项下标。 */
export function tabsHiddenIndexesByBox(
  items: Array<{ getBoundingClientRect: () => DOMRect }>,
  viewport: { getBoundingClientRect: () => DOMRect },
  vertical: boolean,
): number[] {
  const vr = viewport.getBoundingClientRect()
  const slack = 1
  const hidden: number[] = []
  for (let i = 0; i < items.length; i++) {
    const r = items[i].getBoundingClientRect()
    const fully = vertical
      ? r.top >= vr.top - slack && r.bottom <= vr.bottom + slack
      : r.left >= vr.left - slack && r.right <= vr.right + slack
    if (!fully) hidden.push(i)
  }
  return hidden
}

export function tabClosable(schema: unknown, tab: unknown): boolean {
  const rec = asRecord(tab)
  if (rec.closable === false) return false
  if (rec.closable === true) return true
  return asRecord(schema).closable === true
}

export function tabIconPosition(tab: unknown): 'left' | 'right' {
  return asRecord(tab).iconPosition === 'right' ? 'right' : 'left'
}

export function tabFormValue(tab: unknown, key: string, data: Record<string, unknown> = {}): unknown {
  const rec = asRecord(tab)
  if (rec.value != null) return rec.value
  const title = tabTitle(tab, data)
  if (typeof title === 'string' && title) return title
  return key
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

export function tabsLocationHash(): string {
  if (typeof window === 'undefined' || !window.location) return ''
  return String(window.location.hash || '').replace(/^#/, '')
}

export function tabHasHash(tab: unknown, data: Record<string, unknown> = {}): boolean {
  const rec = asRecord(tab)
  if (rec.hash == null || rec.hash === '') return false
  return Boolean(filterTpl(String(rec.hash), data))
}

function tabsEmptyActive(value: unknown): boolean {
  if (value == null || value === '') return true
  if (typeof value === 'number' && Number.isNaN(value)) return true
  return false
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

/** schema.activeKey 求值；公式空 / NaN 视为未指定，好落到 defaultKey / hash。 */
export function tabsResolveActiveKey(
  schema: unknown,
  tabs: TabItem[],
  data: Record<string, unknown> = {},
): string | undefined {
  const rec = asRecord(schema)
  if (rec.activeKey == null || rec.activeKey === '') return undefined
  const raw = resolveValue(rec.activeKey, data)
  if (tabsEmptyActive(raw)) return undefined
  return tabsNormalizeActive(raw, tabs, data)
}

export function tabsInitialActive(schema: unknown, tabs: TabItem[], data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  const fromActive = tabsResolveActiveKey(schema, tabs, data)
  if (fromActive != null) return fromActive
  const hash = tabsLocationHash()
  if (hash) {
    const keys = tabs.map((tab, index) => tabKey(tab, index, tabScope(tab, data)))
    if (keys.includes(hash)) return hash
  }
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
