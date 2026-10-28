/** Dialog / 浮层尺寸。对齐 Amis：默认 500px、showCloseButton true、closeOnEsc / closeOnOutside false、未写 actions 则取消+确认。 */

import { filterTpl } from '../formula'
import type { PlainObject, SchemaNode } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type DialogSize = '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

const DIALOG_SIZES = new Set<DialogSize>(['xs', 'sm', 'md', 'lg', 'xl', 'full'])

const DIALOG_MAX: Record<Exclude<DialogSize, 'full'>, string> = {
  '': '500px',
  xs: '200px',
  sm: '350px',
  md: '800px',
  lg: '1100px',
  xl: '90%',
}

export function dialogSize(schema: unknown): DialogSize {
  const value = String(asRecord(schema).size ?? '')
  return DIALOG_SIZES.has(value as DialogSize) ? (value as DialogSize) : ''
}

export function dialogSizeClass(schema: unknown): string {
  const size = dialogSize(schema)
  if (size === 'full') return 'w-[calc(100%-60px)] h-[calc(100%-60px)] max-w-none sm:max-w-none'
  const max = DIALOG_MAX[size]
  return `max-w-[${max}] sm:max-w-[${max}]`
}

export function dialogShowClose(schema: unknown): boolean {
  return asRecord(schema).showCloseButton !== false
}

export function dialogCloseOnEsc(schema: unknown): boolean {
  return asRecord(schema).closeOnEsc === true
}

export function dialogCloseOnOutside(schema: unknown): boolean {
  return asRecord(schema).closeOnOutside === true
}

export function dialogTitle(schema: unknown, data: PlainObject = {}): string {
  const title = asRecord(schema).title
  if (title == null || title === false || typeof title === 'object') return ''
  return filterTpl(title, data)
}

export function dialogTitleNode(schema: unknown): SchemaNode | null {
  const title = asRecord(schema).title
  if (title && typeof title === 'object') return title as SchemaNode
  return null
}

/**
 * Dialog / Drawer 的 body 若是 `type: form`，对齐 Amis `Dialog.renderBody`：
 * 默认 `mode: horizontal`、`wrapWithPanel: false`，作者字段覆盖。
 */
export function overlayEmbedForm(node: SchemaNode): SchemaNode {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node
  const rec = node as Record<string, unknown>
  if (String(rec.type || '') !== 'form') return node
  return {
    mode: 'horizontal',
    wrapWithPanel: false,
    ...rec,
  } as SchemaNode
}

export function dialogBody(schema: unknown): SchemaNode[] {
  const body = asRecord(schema).body
  if (body == null || body === false || body === '') return []
  const nodes = Array.isArray(body) ? (body as SchemaNode[]) : [body as SchemaNode]
  return nodes.map(overlayEmbedForm)
}

export function overlayFooterActions(
  schema: unknown,
  cancelType: 'cancel' | 'close',
): SchemaNode[] {
  const rec = asRecord(schema)
  if (Object.prototype.hasOwnProperty.call(rec, 'actions')) {
    const actions = rec.actions
    if (actions == null || actions === false) return []
    return Array.isArray(actions) ? (actions as SchemaNode[]) : [actions as SchemaNode]
  }
  const out: SchemaNode[] = [{ type: 'button', actionType: cancelType, label: '取消' }]
  if (rec.confirm !== false) {
    out.push({ type: 'button', actionType: 'confirm', label: '确认', primary: true })
  }
  return out
}

export function dialogActions(schema: unknown): SchemaNode[] {
  return overlayFooterActions(schema, 'cancel')
}

function cssLen(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`
  return String(value)
}

const DRAWER_LEN: Record<string, string> = {
  '': '400px',
  xs: '200px',
  sm: '300px',
  md: '500px',
  lg: '800px',
  xl: '90%',
}

export function overlayFrameStyle(
  schema: unknown,
  kind: 'dialog' | 'drawer',
): Record<string, string> {
  const rec = asRecord(schema)
  const style: Record<string, string> = {}
  if (kind === 'dialog') {
    const size = dialogSize(schema)
    if (size === 'full') {
      style.width = 'calc(100% - 60px)'
      style.height = 'calc(100% - 60px)'
      style.maxWidth = 'none'
    } else {
      style.maxWidth = DIALOG_MAX[size]
    }
    if (rec.width != null && rec.width !== '') style.maxWidth = cssLen(rec.width)
    if (rec.height != null && rec.height !== '') style.height = cssLen(rec.height)
    return style
  }
  const position = String(rec.position || '')
  const vertical = position === 'top' || position === 'bottom'
  const size = String(rec.size ?? '')
  const len = DRAWER_LEN[size] || DRAWER_LEN['']
  if (vertical) {
    style.height = len
    style.maxHeight = len
  } else {
    style.width = len
    style.maxWidth = len
  }
  if (rec.width != null && rec.width !== '') {
    style.width = cssLen(rec.width)
    style.maxWidth = cssLen(rec.width)
  }
  if (rec.height != null && rec.height !== '') {
    style.height = cssLen(rec.height)
    style.maxHeight = cssLen(rec.height)
  }
  return style
}
