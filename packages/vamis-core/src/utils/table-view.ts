/** Table View。对齐 Amis：默认宽 100%、有边框；trs/tds 可合并；属性字符串走 `${}`。 */

import { filterTpl, isVisible, resolveValue } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function cssSize(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  const text = String(value)
  if (/^\d+(\.\d+)?$/.test(text)) return `${text}px`
  return text
}

function mapExpr(value: unknown, data: PlainObject): unknown {
  if (typeof value !== 'string') return value
  if (!value.includes('${') && !value.includes('$')) return value
  return resolveValue(value, data)
}

function mapStyle(style: unknown, data: PlainObject): Record<string, unknown> | undefined {
  const rec = asRecord(style)
  const keys = Object.keys(rec)
  if (!keys.length) return undefined
  const out: Record<string, unknown> = {}
  for (const key of keys) out[key] = mapExpr(rec[key], data)
  return out
}

function mapNode(node: unknown, data: PlainObject, skip: Set<string>): Record<string, unknown> {
  const rec = asRecord(node)
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rec)) {
    if (skip.has(key)) {
      out[key] = value
      continue
    }
    if (key === 'style') {
      out[key] = mapStyle(value, data)
      continue
    }
    out[key] = mapExpr(value, data)
  }
  return out
}

export type TableViewTd = Record<string, unknown> & {
  body?: unknown
  colspan?: number
  rowspan?: number
  align?: string
  valign?: string
}

export type TableViewTr = Record<string, unknown> & {
  tds: TableViewTd[]
}

export type TableViewCol = {
  span?: number
  style?: Record<string, unknown>
}

export function tableViewWidth(schema: unknown): string {
  return cssSize(asRecord(schema).width) || '100%'
}

export function tableViewPadding(schema: unknown): string {
  const padding = asRecord(schema).padding
  return cssSize(padding) || 'var(--TableCell-paddingY) var(--TableCell-paddingX)'
}

export function tableViewBorder(schema: unknown): boolean {
  return asRecord(schema).border !== false
}

export function tableViewBorderColor(schema: unknown): string {
  const color = asRecord(schema).borderColor
  return color == null || color === '' ? 'var(--borderColor)' : String(color)
}

export function tableViewCaption(schema: unknown, data: PlainObject = {}): string {
  const caption = asRecord(schema).caption
  if (caption == null || caption === false) return ''
  return filterTpl(caption, data)
}

export function tableViewCaptionSide(schema: unknown): 'top' | 'bottom' {
  return asRecord(schema).captionSide === 'bottom' ? 'bottom' : 'top'
}

export function tableViewRows(schema: unknown, data: PlainObject = {}): TableViewTr[] {
  const trs = asRecord(schema).trs
  if (!Array.isArray(trs)) return []
  const rows: TableViewTr[] = []
  for (const raw of trs) {
    const tr = mapNode(raw, data, new Set(['tds', 'body']))
    if (!isVisible(tr, data)) continue
    const tdsRaw = Array.isArray(tr.tds) ? tr.tds : []
    const tds: TableViewTd[] = []
    for (const cell of tdsRaw) {
      const td = mapNode(cell, data, new Set(['body'])) as TableViewTd
      if (!isVisible(td, data)) continue
      tds.push(td)
    }
    rows.push({ ...tr, tds })
  }
  return rows
}

/** HTML colspan/rowspan。0 在规范里表示「撑到表段结束」，缺省必须省略属性。 */
export function tableViewSpan(value: unknown): number | undefined {
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 ? n : undefined
}

export function tableViewCols(schema: unknown, data: PlainObject = {}): TableViewCol[] {
  const cols = asRecord(schema).cols
  if (!Array.isArray(cols)) return []
  return cols.map((col) => {
    const mapped = mapNode(col, data, new Set())
    const span = Number(mapped.span)
    return {
      span: Number.isFinite(span) && span > 0 ? span : undefined,
      style: mapStyle(mapped.style ?? asRecord(col).style, data),
    }
  })
}

export function tableViewTdStyle(
  td: TableViewTd,
  table: { border?: boolean; borderColor?: string; padding?: string },
): Record<string, string | number | undefined> {
  const valignRaw = String(td.valign || '')
  const valign = !valignRaw || valignRaw === 'center' ? 'middle' : valignRaw
  const style: Record<string, string | number | undefined> = {
    border: table.border !== false ? `1px solid ${table.borderColor || 'var(--borderColor)'}` : undefined,
    color: td.color == null ? undefined : String(td.color),
    fontWeight: td.bold ? 'bold' : 'normal',
    background: td.background == null ? undefined : String(td.background),
    padding: cssSize(td.padding) || table.padding,
    width: cssSize(td.width) || 'auto',
    textAlign: String(td.align || 'left'),
    verticalAlign: valign,
  }
  const extra = asRecord(td.style)
  for (const [key, value] of Object.entries(extra)) {
    if (value == null) continue
    style[key] = typeof value === 'number' ? value : String(value)
  }
  return style
}

export function tableViewTrStyle(tr: TableViewTr): Record<string, string | number | undefined> {
  const style: Record<string, string | number | undefined> = {
    height: cssSize(tr.height),
    background: tr.background == null ? undefined : String(tr.background),
  }
  const extra = asRecord(tr.style)
  for (const [key, value] of Object.entries(extra)) {
    if (value == null) continue
    style[key] = typeof value === 'number' ? value : String(value)
  }
  return style
}
