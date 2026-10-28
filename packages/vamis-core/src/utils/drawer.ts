/** Drawer。对齐 Amis：position 默认 right、size 空=400px、showCloseButton / overlay 默认 true、closeOnEsc / closeOnOutside false、未写 actions 则关闭+确认。 */

import { filterTpl } from '../formula'
import type { PlainObject, SchemaNode } from '../types'
import { overlayEmbedForm, overlayFooterActions } from './dialog'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const POSITIONS = new Set<DrawerPosition>(['left', 'right', 'top', 'bottom'])
const SIZES = new Set<DrawerSize>(['xs', 'sm', 'md', 'lg', 'xl'])

const DRAWER_LEN: Record<DrawerSize, string> = {
  '': '400px',
  xs: '200px',
  sm: '300px',
  md: '500px',
  lg: '800px',
  xl: '90%',
}

export function drawerPosition(schema: unknown): DrawerPosition {
  const value = String(asRecord(schema).position || '')
  return POSITIONS.has(value as DrawerPosition) ? (value as DrawerPosition) : 'right'
}

export function drawerSize(schema: unknown): DrawerSize {
  const value = String(asRecord(schema).size ?? '')
  return SIZES.has(value as DrawerSize) ? (value as DrawerSize) : ''
}

export function drawerSizeClass(schema: unknown): string {
  const len = DRAWER_LEN[drawerSize(schema)]
  const pos = drawerPosition(schema)
  if (pos === 'top' || pos === 'bottom') return `h-[${len}] max-h-[${len}]`
  return `w-[${len}] sm:max-w-[${len}]`
}

export function drawerShowClose(schema: unknown): boolean {
  return asRecord(schema).showCloseButton !== false
}

export function drawerShowOverlay(schema: unknown): boolean {
  return asRecord(schema).overlay !== false
}

export function drawerCloseOnEsc(schema: unknown): boolean {
  return asRecord(schema).closeOnEsc === true
}

export function drawerCloseOnOutside(schema: unknown): boolean {
  return asRecord(schema).closeOnOutside === true
}

export function drawerTitle(schema: unknown, data: PlainObject = {}): string {
  const title = asRecord(schema).title
  if (title == null || title === false || typeof title === 'object') return ''
  return filterTpl(title, data)
}

export function drawerTitleNode(schema: unknown): SchemaNode | null {
  const title = asRecord(schema).title
  if (title && typeof title === 'object') return title as SchemaNode
  return null
}

export function drawerBody(schema: unknown): SchemaNode[] {
  const body = asRecord(schema).body
  if (body == null || body === false || body === '') return []
  const nodes = Array.isArray(body) ? (body as SchemaNode[]) : [body as SchemaNode]
  return nodes.map(overlayEmbedForm)
}

export function drawerActions(schema: unknown): SchemaNode[] {
  return overlayFooterActions(schema, 'close')
}
