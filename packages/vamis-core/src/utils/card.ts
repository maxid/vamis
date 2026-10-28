/** Card / Cards。对齐 Amis Card、Cards：header/body/actions、href 优先于 itemAction、source 默认 `$items`。 */

import { filterTpl, isVisible } from '../formula'
import type { ActionSchema, PlainObject, SchemaObject } from '../types'
import { table2Source } from './table2'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function asNodes(value: unknown): unknown[] {
  if (value == null || value === false) return []
  return Array.isArray(value) ? value : [value]
}

function headerOrRoot(schema: unknown, key: string): unknown {
  const rec = asRecord(schema)
  const header = asRecord(rec.header)
  if (header[key] != null && header[key] !== '') return header[key]
  return rec[key]
}

const MEDIA_POS = new Set(['left', 'right', 'top', 'bottom'])

export type CardMediaPosition = 'left' | 'right' | 'top' | 'bottom'

/** 对齐 Amis `hashCode`：`s.split('').reduce((a,b)=>{a=(a<<5)-a+b.charCodeAt(0);return a&a},0)`。 */
export function cardHashCode(s: string): number {
  return s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
}

export function cardHeader(schema: unknown): Record<string, unknown> {
  return asRecord(asRecord(schema).header)
}

export function cardTitle(schema: unknown, data: PlainObject = {}): string {
  return filterTpl(headerOrRoot(schema, 'title') ?? '', data)
}

export function cardSubTitle(schema: unknown, data: PlainObject = {}): string {
  return filterTpl(headerOrRoot(schema, 'subTitle') ?? '', data)
}

export function cardDescription(schema: unknown, data: PlainObject = {}): string {
  const raw = headerOrRoot(schema, 'description') ?? headerOrRoot(schema, 'desc')
  return filterTpl(raw ?? '', data)
}

export function cardAvatar(schema: unknown, data: PlainObject = {}): string {
  return filterTpl(String(headerOrRoot(schema, 'avatar') ?? ''), data)
}

export function cardAvatarText(schema: unknown, data: PlainObject = {}): string {
  return filterTpl(String(headerOrRoot(schema, 'avatarText') ?? ''), data)
}

export function cardAvatarTextBackground(text: string, colors: unknown): string {
  if (!text || !Array.isArray(colors) || !colors.length) return ''
  const i = Math.abs(cardHashCode(text)) % colors.length
  return String(colors[i] ?? '')
}

export function cardHighlight(schema: unknown): boolean {
  return headerOrRoot(schema, 'highlight') === true
}

export function cardUseCardLabel(schema: unknown): boolean {
  return asRecord(schema).useCardLabel !== false
}

export function cardBlank(schema: unknown): boolean {
  return asRecord(schema).blank !== false
}

export function cardHref(schema: unknown, data: PlainObject = {}): string {
  const href = asRecord(schema).href
  if (href == null || href === false || href === '') return ''
  return filterTpl(String(href), data).trim()
}

export function cardItemAction(schema: unknown): ActionSchema | null {
  const action = asRecord(schema).itemAction
  if (!action || typeof action !== 'object' || Array.isArray(action)) return null
  return action as ActionSchema
}

export function cardClickable(schema: unknown, data: PlainObject = {}): boolean {
  return !!cardHref(schema, data) || !!cardItemAction(schema)
}

export function cardSecondary(schema: unknown, data: PlainObject = {}): string {
  return filterTpl(asRecord(schema).secondary ?? '', data)
}

export function cardActions(schema: unknown, data: PlainObject = {}): SchemaObject[] {
  const actions = asRecord(schema).actions
  if (!Array.isArray(actions)) return []
  return actions.filter((item) => item && typeof item === 'object' && isVisible(item as PlainObject, data)) as SchemaObject[]
}

export function cardActionsCount(schema: unknown): number {
  const n = Number(asRecord(schema).actionsCount)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 4
}

export function cardPadActions(actions: SchemaObject[], count = 4): SchemaObject[][] {
  const size = count > 0 ? count : 4
  const groups: SchemaObject[][] = []
  for (let i = 0; i < actions.length; i += size) groups.push(actions.slice(i, i + size))
  return groups
}

export function cardToolbar(schema: unknown): unknown[] {
  const rec = asRecord(schema)
  return asNodes(rec.toolbar ?? cardHeader(schema).toolbar)
}

export function cardMedia(schema: unknown): Record<string, unknown> | null {
  const rec = asRecord(asRecord(schema).media)
  return Object.keys(rec).length ? rec : null
}

export function cardMediaPosition(schema: unknown): CardMediaPosition {
  const rec = asRecord(schema)
  const media = cardMedia(schema)
  const raw = String(rec.mediaPosition || media?.position || 'left')
  return MEDIA_POS.has(raw) ? (raw as CardMediaPosition) : 'left'
}

export function cardMediaType(schema: unknown): string {
  return String(cardMedia(schema)?.type || 'image')
}

export function cardMediaUrl(schema: unknown, data: PlainObject = {}): string {
  const media = cardMedia(schema)
  if (!media) return ''
  return filterTpl(String(media.url ?? media.src ?? ''), data)
}

export function cardBodyNodes(schema: unknown): unknown[] {
  const body = asRecord(schema).body
  if (body == null || body === false) return []
  if (Array.isArray(body)) return body
  if (typeof body === 'object') return [body]
  return [{ type: 'tpl', tpl: String(body) }]
}

export function cardFieldLabel(node: unknown): string {
  const label = asRecord(node).label
  if (label == null || label === false) return ''
  return String(label)
}

export function cardFieldValueSchema(node: unknown): SchemaObject {
  const rec = asRecord(node)
  if (typeof rec.type === 'string' && rec.type) return rec as SchemaObject
  if (typeof rec.tpl === 'string') return { type: 'tpl', tpl: rec.tpl }
  if (rec.value != null && rec.value !== '') return { type: 'tpl', tpl: String(rec.value) }
  const name = rec.name
  if (typeof name === 'string' && name) return { type: 'tpl', tpl: `\${${name}}` }
  return { type: 'tpl', tpl: '' }
}

export function cardsSource(schema: unknown, data: PlainObject = {}, items?: PlainObject[]): PlainObject[] {
  const rec = asRecord(schema)
  const source = rec.source == null || rec.source === '' ? '$items' : rec.source
  return table2Source({ ...rec, source }, data, items)
}

export function cardsPlaceholder(schema: unknown): string {
  const value = asRecord(schema).placeholder
  if (value == null || value === '' || value === 'placeholder.noData') return '暂无数据'
  if (typeof value === 'object') return '暂无数据'
  return String(value)
}

export function cardsPlaceholderNode(schema: unknown): unknown {
  const value = asRecord(schema).placeholder
  return value && typeof value === 'object' ? value : null
}

export function cardsCardSchema(schema: unknown): SchemaObject {
  const card = asRecord(schema).card
  if (card && typeof card === 'object' && !Array.isArray(card) && Object.keys(card).length) {
    return { type: 'card', ...card } as SchemaObject
  }
  return { type: 'card', header: { title: '${name}' } }
}

export function cardsTitle(schema: unknown, data: PlainObject = {}): string {
  return filterTpl(asRecord(schema).title ?? '', data)
}

export function cardsMasonry(schema: unknown): boolean {
  return asRecord(schema).masonryLayout === true
}

export function cardsColumnsCount(schema: unknown): number {
  const n = Number(asRecord(schema).columnsCount)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

export function cardsHeader(schema: unknown): unknown[] {
  return asNodes(asRecord(schema).header)
}

export function cardsFooter(schema: unknown): unknown[] {
  return asNodes(asRecord(schema).footer)
}
