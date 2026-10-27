/** Table2。对齐 Amis Table2：默认 source `${items}`、keyField id、columnsTogglable auto（叶列 > 5）。 */

import { evalExpression, filterTpl, resolveValue } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const PURE_VAR = /^\$[a-zA-Z_][\w.]*$/
const SIZES = new Set(['large', 'default', 'small'])

export type Table2Size = 'large' | 'default' | 'small'
export type Table2SelectionType = '' | 'checkbox' | 'radio'
export type Table2SelectionAction = 'all' | 'none' | 'invert' | 'odd' | 'even'
export type Table2Column = Record<string, unknown> & {
  name?: string
  title?: unknown
  label?: unknown
  type?: string
  tpl?: unknown
  sorter?: unknown
  sortable?: unknown
  children?: Table2Column[]
  width?: unknown
}

function readPath(data: PlainObject, path: string): unknown {
  let cur: unknown = data
  for (const key of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

function asRows(value: unknown): PlainObject[] {
  if (Array.isArray(value)) return value as PlainObject[]
  const rec = asRecord(value)
  if (Array.isArray(rec.items)) return rec.items as PlainObject[]
  if (Array.isArray(rec.rows)) return rec.rows as PlainObject[]
  return []
}

export function table2Source(
  schema: unknown,
  data: PlainObject = {},
  items?: PlainObject[],
): PlainObject[] {
  if (Array.isArray(items)) return items
  const rec = asRecord(schema)
  const source = rec.source == null || rec.source === '' ? '${items}' : rec.source
  if (typeof source === 'string') {
    if (PURE_VAR.test(source)) {
      const hit = readPath(data, source.slice(1))
      const rows = asRows(hit)
      if (rows.length || Array.isArray(hit)) return rows
    } else if (source.includes('$')) {
      const hit = resolveValue(source, data)
      const rows = asRows(hit)
      if (rows.length || Array.isArray(hit)) return rows
    }
  }
  if (Array.isArray(rec.data)) return rec.data as PlainObject[]
  return asRows(rec.data)
}

export function table2KeyField(schema: unknown): string {
  const rec = asRecord(schema)
  const selection = asRecord(rec.rowSelection)
  if (rec.primaryField != null && rec.primaryField !== '') return String(rec.primaryField)
  if (selection.keyField != null && selection.keyField !== '') return String(selection.keyField)
  if (rec.keyField != null && rec.keyField !== '') return String(rec.keyField)
  return 'id'
}

export function table2SelectionType(schema: unknown): Table2SelectionType {
  const rec = asRecord(schema)
  if (rec.selectable === false) return ''
  if (rec.selectable === true) return rec.multiple === false ? 'radio' : 'checkbox'
  const selection = rec.rowSelection
  if (selection === true) return 'checkbox'
  if (!selection || typeof selection !== 'object') return ''
  return asRecord(selection).type === 'radio' ? 'radio' : 'checkbox'
}

export function table2RowClick(schema: unknown): boolean {
  return asRecord(asRecord(schema).rowSelection).rowClick === true
}

export function table2MaxKeep(schema: unknown): number {
  const n = Number(asRecord(schema).maxKeepItemSelectionLength)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function table2RowId(row: PlainObject, index: number, keyField: string): string | number {
  const value = row[keyField]
  return value == null || value === '' ? index : (value as string | number)
}

export function table2RowDisabled(schema: unknown, row: PlainObject, rowIndex: number): boolean {
  const disableOn = asRecord(asRecord(schema).rowSelection).disableOn
  if (typeof disableOn !== 'string' || !disableOn) return false
  return evalExpression(disableOn, { record: row, rowIndex, ...row })
}

export function table2SelectedKeys(schema: unknown, rows: PlainObject[]): Array<string | number> {
  const raw = asRecord(asRecord(schema).rowSelection).selectedRowKeys
  if (!Array.isArray(raw)) return []
  const field = table2KeyField(schema)
  const allowed = new Set(rows.map((row, i) => table2RowId(row, i, field)))
  return raw.filter((key) => allowed.has(key as string | number)) as Array<string | number>
}

export function table2ApplySelection(
  action: string,
  keys: Array<string | number>,
  current: Array<string | number>,
): Array<string | number> {
  if (action === 'none') return []
  if (action === 'all') return keys.slice()
  if (action === 'invert') return keys.filter((key) => !current.includes(key))
  if (action === 'odd') return keys.filter((_, index) => index % 2 === 0)
  if (action === 'even') return keys.filter((_, index) => index % 2 !== 0)
  return keys.slice()
}

export function table2Selections(schema: unknown): Array<{ key: string; text: string }> {
  const raw = asRecord(asRecord(schema).rowSelection).selections
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      const rec = asRecord(item)
      return { key: String(rec.key || ''), text: String(rec.text || rec.key || '') }
    })
    .filter((item) => item.key)
}

export function table2LeafColumns(schema: unknown): Table2Column[] {
  const walk = (list: unknown[]): Table2Column[] => {
    const out: Table2Column[] = []
    for (const item of list) {
      const col = asRecord(item) as Table2Column
      if (Array.isArray(col.children) && col.children.length) out.push(...walk(col.children))
      else out.push(col)
    }
    return out
  }
  const columns = asRecord(schema).columns
  return Array.isArray(columns) ? walk(columns) : []
}

export function table2ColumnsTogglable(schema: unknown, leafCount: number): boolean {
  const value = asRecord(schema).columnsTogglable
  if (value === true) return true
  if (value === false) return false
  return leafCount > 5
}

export function table2Placeholder(schema: unknown): string {
  const value = asRecord(schema).placeholder
  if (value == null || value === '') return '暂无数据'
  if (typeof value === 'object') return '暂无数据'
  return String(value)
}

export function table2PlaceholderNode(schema: unknown): unknown {
  const value = asRecord(schema).placeholder
  return value && typeof value === 'object' ? value : null
}

export function table2Bordered(schema: unknown): boolean {
  return asRecord(schema).bordered === true
}

export function table2Size(schema: unknown): Table2Size {
  const value = String(asRecord(schema).size || 'default')
  return SIZES.has(value) ? (value as Table2Size) : 'default'
}

export function table2ShowHeader(schema: unknown): boolean {
  return asRecord(schema).showHeader !== false
}

export function table2CanAccessSuperData(schema: unknown): boolean {
  return asRecord(schema).canAccessSuperData === true
}

export function table2Loading(schema: unknown): boolean {
  return asRecord(schema).loading === true
}

export function table2CellIsRenderer(col: unknown): boolean {
  const rec = asRecord(col)
  if (rec.tpl != null && rec.tpl !== '') return true
  const type = String(rec.type || '')
  return !!type && type !== 'text' && type !== 'plain'
}

export function table2CanSort(col: unknown): boolean {
  const rec = asRecord(col)
  return !!(rec.name && (rec.sorter || rec.sortable) && rec.type !== 'operation')
}

export type Table2SortDir = '' | 'asc' | 'desc'

export function table2NextSort(
  colName: string,
  current: { orderBy?: string; orderDir?: string },
): { orderBy: string; orderDir: Table2SortDir } {
  if (current.orderBy !== colName || !current.orderDir) {
    return { orderBy: colName, orderDir: 'asc' }
  }
  if (current.orderDir === 'asc') return { orderBy: colName, orderDir: 'desc' }
  return { orderBy: '', orderDir: '' }
}

export function table2Footer(schema: unknown, data: PlainObject = {}): string {
  const footer = asRecord(schema).footer
  if (footer == null || typeof footer === 'object') return ''
  return filterTpl(String(footer), data)
}

export function table2Title(schema: unknown, data: PlainObject = {}): string {
  const title = asRecord(schema).title
  if (title == null || typeof title === 'object') return ''
  return filterTpl(String(title), data)
}

export function table2ColumnWidth(col: unknown): string | undefined {
  const width = asRecord(col).width
  if (width == null || width === '') return undefined
  if (typeof width === 'number' && Number.isFinite(width)) return `${width}px`
  const text = String(width)
  if (/^\d+(\.\d+)?$/.test(text)) return `${text}px`
  return text
}
