/** Table。对齐 Amis `store/table.ts` 的行树、合并单元格、超级表头、总结行与动作目标匹配。 */

import { evalExpression, filterTpl, resolveValue } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function readPath(data: PlainObject, path: string): unknown {
  if (Object.prototype.hasOwnProperty.call(data, path)) return data[path]
  let cur: unknown = data
  for (const key of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

export interface TableRowNode {
  /** 稳定 id：同一个行对象在排序 / 筛选 / 展开之间不变。 */
  id: string
  data: PlainObject
  /** 在兄弟里的下标。 */
  index: number
  /** Amis `item.path`：`0` / `0.1` / `0.1.2`。 */
  path: string
  /** 顶层为 1。 */
  depth: number
  parent?: TableRowNode
  children: TableRowNode[]
}

export type TableRowIdOf = (row: PlainObject, path: string) => string

/** 按 `children`（可改名）建行树。 */
export function tableBuildRows(
  items: unknown,
  childrenField = 'children',
  idOf: TableRowIdOf = (_row, path) => path,
): TableRowNode[] {
  const walk = (list: unknown[], parent: TableRowNode | undefined, base: string, depth: number): TableRowNode[] =>
    list.map((item, index) => {
      const data = (item && typeof item === 'object' && !Array.isArray(item) ? item : { item }) as PlainObject
      const path = base ? `${base}.${index}` : String(index)
      const node: TableRowNode = { id: idOf(data, path), data, index, path, depth, parent, children: [] }
      const kids = data[childrenField]
      if (Array.isArray(kids) && kids.length) node.children = walk(kids, node, path, depth + 1)
      return node
    })
  return Array.isArray(items) ? walk(items, undefined, '', 1) : []
}

/** 展开后的可见行；不传 `isExpanded` 则铺平整棵树。 */
export function tableFlattenRows(
  rows: TableRowNode[],
  isExpanded?: (row: TableRowNode) => boolean,
): TableRowNode[] {
  const out: TableRowNode[] = []
  const walk = (list: TableRowNode[]) => {
    for (const row of list) {
      out.push(row)
      if (row.children.length && (!isExpanded || isExpanded(row))) walk(row.children)
    }
  }
  walk(rows)
  return out
}

/** 序号列：`0.1` → `1.2`。 */
export function tableIndexText(path: string): string {
  return path
    .split('.')
    .map((part) => Number(part) + 1)
    .join('.')
}

/** 按下标路径取行：`[0, 1]` → 第一行的第二个子行。 */
export function tableRowByPath(rows: TableRowNode[], path: number[]): TableRowNode | undefined {
  let list = rows
  let hit: TableRowNode | undefined
  for (const index of path) {
    hit = list[index]
    if (!hit) return undefined
    list = hit.children
  }
  return hit
}

type ConditionNode = {
  conjunction?: string
  not?: boolean
  children?: ConditionNode[]
  left?: { field?: string } | string
  field?: string
  op?: string
  right?: unknown
  value?: unknown
}

function conditionRule(rule: ConditionNode, data: PlainObject): boolean {
  const field = typeof rule.left === 'string' ? rule.left : rule.left?.field ?? rule.field
  if (!field) return false
  const left = readPath(data, String(field))
  const rawRight = rule.right !== undefined ? rule.right : rule.value
  const right = typeof rawRight === 'string' && rawRight.includes('${') ? resolveValue(rawRight, data) : rawRight
  const l = left == null ? '' : String(left)
  const r = right == null ? '' : String(right)
  const ln = Number(left)
  const rn = Number(right)
  const numeric = l !== '' && r !== '' && Number.isFinite(ln) && Number.isFinite(rn)
  switch (rule.op || 'equal') {
    case 'equal':
    case 'select_equals':
      return numeric ? ln === rn : l === r
    case 'not_equal':
    case 'select_not_equals':
      return numeric ? ln !== rn : l !== r
    case 'less':
      return numeric ? ln < rn : l < r
    case 'less_or_equal':
      return numeric ? ln <= rn : l <= r
    case 'greater':
      return numeric ? ln > rn : l > r
    case 'greater_or_equal':
      return numeric ? ln >= rn : l >= r
    case 'like':
    case 'contains':
      return l.includes(r)
    case 'not_like':
    case 'not_contains':
      return !l.includes(r)
    case 'starts_with':
      return l.startsWith(r)
    case 'ends_with':
      return l.endsWith(r)
    case 'is_empty':
      return left == null || left === ''
    case 'is_not_empty':
      return !(left == null || left === '')
    case 'select_any_in':
      return Array.isArray(right) ? right.map(String).includes(l) : false
    case 'select_not_any_in':
      return Array.isArray(right) ? !right.map(String).includes(l) : true
    default:
      return false
  }
}

/** 表达式字符串或 ConditionBuilder 对象（`conjunction` + `children`）。 */
export function tableConditionMatch(condition: unknown, data: PlainObject): boolean {
  if (condition == null || condition === '') return false
  if (typeof condition === 'string') return evalExpression(condition, data)
  if (typeof condition !== 'object' || Array.isArray(condition)) return false
  const node = condition as ConditionNode
  let result: boolean
  if (Array.isArray(node.children)) {
    if (!node.children.length) return false
    const tests = node.children.map((child) => tableConditionMatch(child, data))
    result = node.conjunction === 'or' ? tests.some(Boolean) : tests.every(Boolean)
  } else {
    result = conditionRule(node, data)
  }
  return node.not ? !result : result
}

/**
 * 对齐 Amis `getMatchedEventTargets`：
 * `index` 数字 / `"0,1"` / 树路径 `"0.1"` / 表达式优先；否则按 `condition` 走整棵树。
 */
export function tableMatchRows(
  rows: TableRowNode[],
  ctx: PlainObject,
  index?: unknown,
  condition?: unknown,
): TableRowNode[] {
  const targets: TableRowNode[] = []
  if (typeof index === 'number') {
    const row = rows[index]
    if (row) targets.push(row)
    return targets
  }
  if (typeof index === 'string' && index.trim() !== '') {
    const raw = index.includes('${') ? filterTpl(index, ctx) : index
    for (const part of raw.split(',')) {
      const text = part.trim()
      if (!text) continue
      const path = text.split('.').map((n) => parseInt(n, 10))
      if (path.some((n) => !Number.isFinite(n))) continue
      const row = tableRowByPath(rows, path)
      if (row && !targets.includes(row)) targets.push(row)
    }
    return targets
  }
  if (condition != null && condition !== '') {
    for (const row of tableFlattenRows(rows)) {
      if (tableConditionMatch(condition, { ...ctx, ...row.data })) targets.push(row)
    }
  }
  return targets
}

/**
 * 指定行 `setData`：对齐 Amis `IRow.updateData`，始终 merge。
 * `args.replace` 不会从 Amis `CmptAction` 传进来（那边只认 `dataMergeMode`），
 * 即便传了也不能把没写的字段清掉，否则 version 等格子会空。
 */
export function tableMergeRowData(data: PlainObject, patch: PlainObject): PlainObject {
  return { ...data, ...patch }
}

/** `combineNum` 支持数字、数字串、`${var}`。 */
export function tableCombineNum(value: unknown, data: PlainObject = {}): number {
  const raw = typeof value === 'string' && value.includes('$') ? resolveValue(value, data) : value
  const n = parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** 参与合并的列名：从 `fromIndex` 起连续 `num` 列，遇到没有 `name` 的列就停。 */
export function tableCombineKeys(columns: PlainObject[], num: number, fromIndex = 0): string[] {
  const keys: string[] = []
  if (!num) return keys
  for (const col of columns.slice(Math.max(0, fromIndex), Math.max(0, fromIndex) + num)) {
    const name = col?.name
    if (name == null || name === '') break
    keys.push(String(name))
  }
  return keys
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      return false
    }
  }
  return false
}

/**
 * 分层合并（Amis `combineCell`）：第二列只在第一列同值的那段里再合并。
 * 返回与 `rows` 等长的数组；`spans[i][key]` 为 0 表示该格不渲染，>1 为 rowspan。
 */
export function tableCombineSpans(rows: PlainObject[], keys: string[]): Array<Record<string, number>> {
  const spans: Array<Record<string, number>> = rows.map(() => ({}))
  const walk = (start: number, end: number, rest: string[]) => {
    if (!rest.length || end <= start) return
    const [key, ...next] = rest
    let head = start
    let value = readPath(rows[head], key)
    spans[head][key] = 1
    for (let i = start + 1; i < end; i++) {
      const current = readPath(rows[i], key)
      if (sameValue(current, value)) {
        spans[head][key] += 1
        spans[i][key] = 0
      } else {
        if (spans[head][key] > 1) walk(head, i, next)
        head = i
        value = current
        spans[head][key] = 1
      }
    }
    if (spans[head][key] > 1) walk(head, end, next)
  }
  walk(0, rows.length, keys)
  return spans
}

export interface TableColumnGroup {
  label: string
  colSpan: number
  /** 没有 `groupName` 的列在分组行里占两行。 */
  rowSpan: number
  /** 组内第一列在可见列里的下标。 */
  index: number
  fixed: '' | 'left' | 'right'
}

/** 超级表头：相邻同 `groupName` 合并；只有一组且无标题时不出分组行。 */
export function tableColumnGroups(columns: PlainObject[]): TableColumnGroup[] {
  const groups: TableColumnGroup[] = []
  let any = false
  columns.forEach((col, index) => {
    const name = col?.groupName == null ? '' : String(col.groupName)
    const fixed = col?.fixed === 'left' || col?.fixed === 'right' ? col.fixed : ''
    if (!name) {
      groups.push({ label: '', colSpan: 1, rowSpan: 2, index, fixed })
      return
    }
    any = true
    const last = groups[groups.length - 1]
    if (last && last.rowSpan === 1 && last.label === name) {
      last.colSpan += 1
      if (last.fixed !== fixed) last.fixed = ''
    } else {
      groups.push({ label: name, colSpan: 1, rowSpan: 1, index, fixed })
    }
  })
  return any ? groups : []
}

export interface TableSummaryCell extends Record<string, unknown> {
  colSpan: number
  /** 首 / 末覆盖列在可见列里的下标（定固定列偏移用）。 */
  firstIndex: number
  lastIndex: number
}

/**
 * 总结行布局（Amis `renderSummaryRow`）。
 * `visible[rawIndex]` 标出该原始列是否显示；隐藏列会把对应 `colSpan` 收掉。
 * `lead` 是前置内置列数（拖拽 / 勾选 / 展开 / 序号），有的话补一个空格子。
 */
export function tableSummaryRow(
  items: unknown,
  visible: boolean[],
  lead = 0,
): TableSummaryCell[] {
  if (!Array.isArray(items) || !items.length) return []
  const visibleIndex: number[] = []
  let count = 0
  visible.forEach((show, raw) => {
    visibleIndex[raw] = show ? count++ : -1
  })
  let offset = 0
  const result: TableSummaryCell[] = []
  items.forEach((item, index) => {
    const cell = asRecord(item)
    const span = Number(cell.colSpan) > 1 ? Number(cell.colSpan) : 1
    const raws: number[] = []
    for (let i = 0; i < span; i++) raws.push(offset + index + i)
    offset += span - 1
    const hits = raws.map((raw) => visibleIndex[raw]).filter((n) => n != null && n >= 0)
    if (!hits.length) return
    result.push({ ...cell, colSpan: hits.length, firstIndex: hits[0], lastIndex: hits[hits.length - 1] })
  })
  if (!result.length) return result
  let used = result.reduce((sum, cell) => sum + cell.colSpan, 0)
  while (used > count && result.length) used -= result.pop()!.colSpan
  for (let i = used; i < count; i++) {
    result.push({ type: 'html', html: '&nbsp;', colSpan: 1, firstIndex: i, lastIndex: i })
  }
  // 内置列（拖拽 / 勾选 / 展开 / 序号）前面补一个空格子，总结项才和数据列对齐
  if (lead > 0) result.unshift({ type: 'html', html: '&nbsp;', colSpan: lead, firstIndex: -1, lastIndex: -1 })
  return result
}

/** 总结行可以是一维（单行）或二维（多行）。 */
export function tableSummaryRows(config: unknown): unknown[][] {
  if (!Array.isArray(config) || !config.length) return []
  if (config.some((item) => Array.isArray(item))) {
    return config.map((item) => (Array.isArray(item) ? item : [item]))
  }
  return [config]
}

function hexToRgb(hex: string): [number, number, number] | null {
  let text = hex.trim()
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    text = `#${text
      .slice(1)
      .split('')
      .map((ch) => ch + ch)
      .join('')}`
  }
  const hit = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(text)
  return hit ? [parseInt(hit[1], 16), parseInt(hit[2], 16), parseInt(hit[3], 16)] : null
}

const SCALE_DEFAULT = ['#FFEF9C', '#FF7127']

/** 色阶插值（Amis `ColorScale`）：min==max 时 max+1，颠倒时交换，少于两色用默认黄→橙。 */
export function tableColorScale(min: number, max: number, colors?: unknown): (value: number) => string {
  let lo = Number.isFinite(min) ? min : 0
  let hi = Number.isFinite(max) ? max : 0
  if (lo === hi) hi = lo + 1
  if (hi < lo) [lo, hi] = [hi, lo]
  const raw = Array.isArray(colors) && colors.length >= 2 ? colors.map(String) : SCALE_DEFAULT
  const parsed = raw.map(hexToRgb)
  const stops = (parsed.every(Boolean) ? parsed : SCALE_DEFAULT.map(hexToRgb)) as Array<[number, number, number]>
  const hex = (rgb: [number, number, number]) =>
    `#${rgb.map((n) => Math.max(0, Math.min(255, Math.floor(n))).toString(16).padStart(2, '0')).join('')}`
  return (value: number) => {
    if (value < lo) return hex(stops[0])
    if (value > hi) return hex(stops[stops.length - 1])
    let weight = (value - lo) / (hi - lo)
    const at = Math.max(Math.ceil(weight * (stops.length - 1)), 1)
    const from = stops[at - 1]
    const to = stops[at]
    weight = weight * (stops.length - 1) - (at - 1)
    return hex([0, 1, 2].map((i) => Math.floor(weight * to[i] + (1 - weight) * from[i])) as [number, number, number])
  }
}

const PURE_VAR = /^\$\{[^{}]+\}$|^\$[a-zA-Z_][\w.]*$/

/**
 * 列 `backgroundScale` → 单元格背景色。
 * `min` / `max` 可为变量；未写时取这一列所有行的最小 / 最大值。`source` 可换取值字段。
 */
export function tableBackgroundScale(
  column: PlainObject,
  row: PlainObject,
  ctx: PlainObject,
  rows: PlainObject[],
): string {
  const scale = asRecord(column.backgroundScale)
  if (!column.backgroundScale || typeof column.backgroundScale !== 'object') return ''
  const name = column.name == null ? '' : String(column.name)
  const bound = (raw: unknown, pick: (list: number[]) => number): number => {
    if (typeof raw === 'string' && PURE_VAR.test(raw)) return Number(resolveValue(raw, { ...ctx, ...row }))
    if (raw != null && raw !== '') return Number(raw)
    const list = rows.map((item) => Number(readPath(item, name))).filter((n) => Number.isFinite(n))
    return list.length ? pick(list) : 0
  }
  const min = bound(scale.min, (list) => Math.min(...list))
  const max = bound(scale.max, (list) => Math.max(...list))
  const source = scale.source
  const value =
    typeof source === 'string' && PURE_VAR.test(source)
      ? resolveValue(source, { ...ctx, ...row })
      : name
        ? readPath(row, name)
        : undefined
  const num = Number(value)
  if (value == null || value === '' || !Number.isFinite(num)) return ''
  return tableColorScale(min, max, scale.colors)(num)
}

/** Amis `isBreakpoint`：`*` 永远命中；xs <768、sm 768–991、md 992–1199、lg ≥1200。 */
export function tableBreakpointMatch(breakpoint: unknown, width: number): boolean {
  if (typeof breakpoint !== 'string') return !!breakpoint
  return breakpoint
    .split(/\s*,\s*|\s+/)
    .filter(Boolean)
    .some(
      (item) =>
        item === '*' ||
        (item === 'xs' && width < 768) ||
        (item === 'sm' && width >= 768 && width < 992) ||
        (item === 'md' && width >= 992 && width < 1200) ||
        (item === 'lg' && width >= 1200),
    )
}

export interface TableFootable {
  enabled: boolean
  expand: 'first' | 'all' | 'none'
  accordion: boolean
}

export function tableFootable(schema: unknown): TableFootable {
  const raw = asRecord(schema).footable
  if (!raw) return { enabled: false, expand: 'none', accordion: false }
  const conf = asRecord(raw)
  const expand = conf.expand === 'first' || conf.expand === 'all' ? conf.expand : 'none'
  return { enabled: true, expand, accordion: conf.accordion === true }
}

/** 本地排序：数字按数值，其余按字符串；空值排最后。 */
export function tableSortRows<T>(rows: T[], dir: 'asc' | 'desc', valueOf: (row: T) => unknown): T[] {
  const sign = dir === 'desc' ? -1 : 1
  return rows.slice().sort((a, b) => {
    const av = valueOf(a)
    const bv = valueOf(b)
    const ae = av == null || av === ''
    const be = bv == null || bv === ''
    if (ae && be) return 0
    if (ae) return 1
    if (be) return -1
    const an = Number(av)
    const bn = Number(bv)
    if (Number.isFinite(an) && Number.isFinite(bn)) return (an - bn) * sign
    return String(av).localeCompare(String(bv), 'zh-CN', { numeric: true }) * sign
  })
}

/** 表头检索（包含）与筛选（相等，逗号分隔表示多选）。 */
export function tableRowPasses(
  row: PlainObject,
  searches: Record<string, unknown>,
  filters: Record<string, unknown>,
): boolean {
  for (const [key, raw] of Object.entries(searches)) {
    if (raw == null || raw === '') continue
    const hay = String(readPath(row, key) ?? '').toLowerCase()
    if (!hay.includes(String(raw).toLowerCase())) return false
  }
  for (const [key, raw] of Object.entries(filters)) {
    if (raw == null || raw === '') continue
    const value = String(readPath(row, key) ?? '')
    const wanted = Array.isArray(raw) ? raw.map(String) : String(raw).split(',')
    if (!wanted.includes(value)) return false
  }
  return true
}

export interface TableFilterOption {
  label: string
  value: string
}

/** `filterable.options`；没写就取这一列的去重值。 */
export function tableFilterOptions(column: PlainObject, rows: PlainObject[], data: PlainObject = {}): TableFilterOption[] {
  const conf = asRecord(column.filterable)
  let raw: unknown = conf.options
  if (!Array.isArray(raw) && typeof conf.source === 'string' && conf.source.includes('$')) {
    const hit = resolveValue(conf.source, data)
    raw = Array.isArray(hit) ? hit : asRecord(hit).options
  }
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>
        return { label: String(rec.label ?? rec.value ?? ''), value: String(rec.value ?? rec.label ?? '') }
      }
      return { label: String(item), value: String(item) }
    })
  }
  const name = column.name == null ? '' : String(column.name)
  const seen = new Set<string>()
  const out: TableFilterOption[] = []
  for (const row of rows) {
    const value = readPath(row, name)
    if (value == null || value === '') continue
    const text = String(value)
    if (seen.has(text)) continue
    seen.add(text)
    out.push({ label: text, value: text })
  }
  return out
}

/** Vamis 优化：`bordered: true` 给表格内容区画圆角外框。不是 Table2 的单元格网格。 */
export function tableBordered(schema: unknown): boolean {
  return asRecord(schema).bordered === true
}

/** `autoFillHeight`：`true` 吃满剩余高度；`{height}` 固定；`{maxHeight}` 封顶。 */
export function tableAutoFillHeight(schema: unknown): { enabled: boolean; height?: number; maxHeight?: number } {
  const raw = asRecord(schema).autoFillHeight
  if (!raw) return { enabled: false }
  const conf = asRecord(raw)
  const height = Number(conf.height)
  const maxHeight = Number(conf.maxHeight)
  return {
    enabled: true,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
    maxHeight: Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : undefined,
  }
}
