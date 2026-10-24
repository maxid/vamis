/** TooltipWrapper。对齐 Amis：hover/click/focus、placement、theme、offset、delay、wrapperComponent 白名单。 */

import { filterTpl } from '../formula'
import type { SchemaNode } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const TRIGGERS = new Set(['hover', 'click', 'focus'])
const PLACES = new Set(['top', 'left', 'right', 'bottom'])
const WRAP_TAGS = new Set(['div', 'span', 'pre', 'p', 'section', 'article', 'main', 'header', 'footer', 'aside', 'nav'])

export type TooltipTrigger = 'hover' | 'click' | 'focus'
export type TooltipPlacement = 'top' | 'left' | 'right' | 'bottom'

export function tooltipTriggers(schema: unknown): TooltipTrigger[] {
  const raw = asRecord(schema).trigger
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : ['hover']
  const out = list.map((item) => String(item)).filter((item): item is TooltipTrigger => TRIGGERS.has(item))
  return out.length ? out : ['hover']
}

export function tooltipPlacement(schema: unknown): TooltipPlacement {
  const value = String(asRecord(schema).placement || 'top')
  return PLACES.has(value) ? (value as TooltipPlacement) : 'top'
}

export function tooltipTheme(schema: unknown): 'light' | 'dark' {
  return asRecord(schema).tooltipTheme === 'dark' ? 'dark' : 'light'
}

export function tooltipShowArrow(schema: unknown): boolean {
  return asRecord(schema).showArrow !== false
}

export function tooltipEnterable(schema: unknown): boolean {
  return asRecord(schema).enterable !== false
}

export function tooltipRootClose(schema: unknown): boolean {
  return asRecord(schema).rootClose !== false
}

export function tooltipInline(schema: unknown): boolean {
  return asRecord(schema).inline === true
}

export function tooltipWrapperTag(schema: unknown): string {
  const rec = asRecord(schema)
  const raw = typeof rec.wrapperComponent === 'string' ? rec.wrapperComponent.toLowerCase() : ''
  if (WRAP_TAGS.has(raw)) return raw
  return tooltipInline(schema) ? 'span' : 'div'
}

export function tooltipOffset(schema: unknown): [number, number] {
  const raw = asRecord(schema).offset
  if (!Array.isArray(raw) || raw.length < 2) return [0, 0]
  const x = Number(raw[0])
  const y = Number(raw[1])
  return [Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0]
}

function delayOf(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export function tooltipMouseEnterDelay(schema: unknown): number {
  return delayOf(asRecord(schema).mouseEnterDelay, 0)
}

export function tooltipMouseLeaveDelay(schema: unknown): number {
  return delayOf(asRecord(schema).mouseLeaveDelay, 200)
}

export function tooltipBody(schema: unknown): SchemaNode[] {
  const body = asRecord(schema).body
  if (body == null || body === false || body === '') return []
  return Array.isArray(body) ? (body as SchemaNode[]) : [body as SchemaNode]
}

export function tooltipTitle(schema: unknown, data: Record<string, unknown> = {}): string {
  const title = asRecord(schema).title
  if (title == null || title === false) return ''
  return filterTpl(String(title), data)
}

export function tooltipContent(schema: unknown, data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  const raw = rec.content ?? rec.tooltip
  if (raw == null || raw === false) return ''
  return filterTpl(String(raw), data)
}

export function tooltipDisabled(schema: unknown): boolean {
  return asRecord(schema).disabled === true
}
