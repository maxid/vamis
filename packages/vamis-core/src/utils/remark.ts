/** Remark 标记。对齐 Amis：问号徽标 + TooltipWrapper；移动端 `mobileUI` 走 Dialog。 */

import { filterTpl } from '../formula'
import type { PlainObject, SchemaObject } from '../types'
import {
  tooltipLayerSchema,
  tooltipMouseEnterDelay,
  tooltipMouseLeaveDelay,
  tooltipPlacement,
  tooltipRootClose,
  type TooltipPlacement,
  type TooltipTrigger,
} from './tooltip-wrapper'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const TRIGGERS = new Set(['hover', 'click', 'focus'])

/** 作者写在 `tooltip` 对象上的宿主字段（icon / label / shape / className / trigger…）。 */
export function remarkTooltipOverlay(schema: unknown): Record<string, unknown> {
  const tip = asRecord(schema).tooltip
  if (tip && typeof tip === 'object' && !Array.isArray(tip)) return tip as Record<string, unknown>
  return {}
}

export function remarkIconRaw(schema: unknown): unknown {
  const overlay = remarkTooltipOverlay(schema)
  return overlay.icon ?? asRecord(schema).icon
}

export function remarkLabel(schema: unknown, data: PlainObject = {}): string {
  const overlay = remarkTooltipOverlay(schema)
  const raw = overlay.label ?? asRecord(schema).label
  if (raw == null || raw === false) return ''
  return filterTpl(String(raw), data)
}

export function remarkShape(schema: unknown): 'circle' | 'square' | '' {
  const overlay = remarkTooltipOverlay(schema)
    const raw = String(overlay.shape ?? asRecord(schema).shape ?? '')
  if (raw === 'circle' || raw === 'square') return raw
  return ''
}

export function remarkPlacement(schema: unknown): TooltipPlacement {
  const overlay = remarkTooltipOverlay(schema)
  return tooltipPlacement({ placement: overlay.placement ?? asRecord(schema).placement })
}

export function remarkTriggers(schema: unknown): TooltipTrigger[] {
  const overlay = remarkTooltipOverlay(schema)
  const raw = overlay.trigger ?? asRecord(schema).trigger
  const list = Array.isArray(raw) ? raw : raw != null ? [raw] : ['hover', 'focus']
  const out = list.map((item) => String(item)).filter((item): item is TooltipTrigger => TRIGGERS.has(item))
  return out.length ? out : ['hover', 'focus']
}

export function remarkRootClose(schema: unknown): boolean {
  const overlay = remarkTooltipOverlay(schema)
  if (overlay.rootClose != null) return overlay.rootClose !== false
  return tooltipRootClose(schema)
}

function delayShowHide(value: unknown): { show?: unknown; hide?: unknown } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as { show?: unknown; hide?: unknown }
}

export function remarkMouseEnterDelay(schema: unknown): number {
  const overlay = remarkTooltipOverlay(schema)
  const delay = overlay.delay ?? asRecord(schema).delay
  if (typeof delay === 'number') return delay >= 0 ? delay : 0
  const pair = delayShowHide(delay)
  if (pair) {
    const n = Number(pair.show)
    if (Number.isFinite(n) && n >= 0) return n
  }
  const fromOverlay = tooltipMouseEnterDelay(overlay)
  if (fromOverlay) return fromOverlay
  return tooltipMouseEnterDelay(schema)
}

export function remarkMouseLeaveDelay(schema: unknown): number {
  const overlay = remarkTooltipOverlay(schema)
  const delay = overlay.delay ?? asRecord(schema).delay
  if (typeof delay === 'number') return delay >= 0 ? delay : 0
  const pair = delayShowHide(delay)
  if (pair) {
    const n = Number(pair.hide)
    if (Number.isFinite(n) && n >= 0) return n
  }
  const fromOverlay = asRecord(overlay).mouseLeaveDelay
  if (fromOverlay != null) return tooltipMouseLeaveDelay(overlay)
  return tooltipMouseLeaveDelay(schema)
}

/** 对齐 Amis `filterContents(tooltip || content)`。 */
export function remarkFilterContents(
  schema: unknown,
  data: PlainObject = {},
): Record<string, unknown> | undefined {
  const rec = asRecord(schema)
  const tooltip = rec.tooltip ?? rec.content
  if (typeof tooltip === 'string') {
    const text = filterTpl(tooltip, data)
    return text ? { content: text } : undefined
  }
  if (tooltip && typeof tooltip === 'object' && !Array.isArray(tooltip)) {
    const tip = tooltip as Record<string, unknown>
    const title = tip.title != null && tip.title !== false ? filterTpl(String(tip.title), data) : ''
    const raw = tip.content ?? tip.body
    const content = raw != null && raw !== false ? filterTpl(String(raw), data) : ''
    if (!title && !content) return undefined
    return { ...tip, title, content: content || undefined }
  }
  return undefined
}

export function remarkHasTip(schema: unknown, data: PlainObject = {}): boolean {
  const filtered = remarkFilterContents(schema, data)
  if (!filtered) return false
  return Boolean(filtered.title || filtered.content)
}

export function remarkLayerSchema(schema: unknown, data: PlainObject = {}): Record<string, unknown> {
  const rec = asRecord(schema)
  const overlay = remarkTooltipOverlay(schema)
  const filtered = remarkFilterContents(schema, data) || {}
  return tooltipLayerSchema({
    title: filtered.title,
    content: filtered.content,
    placement: overlay.placement ?? rec.placement,
    tooltipTheme: overlay.tooltipTheme ?? rec.tooltipTheme,
    offset: overlay.offset ?? rec.offset,
    showArrow: overlay.showArrow ?? rec.showArrow,
    enterable: overlay.enterable ?? rec.enterable,
    tooltipStyle: overlay.tooltipStyle ?? rec.tooltipStyle,
    tooltipClassName: overlay.tooltipClassName ?? rec.tooltipClassName,
    tooltipArrowClassName: overlay.tooltipArrowClassName ?? rec.tooltipArrowClassName,
    tooltipBodyClassName: overlay.tooltipBodyClassName ?? rec.tooltipBodyClassName,
  })
}

export function remarkHostClassName(schema: unknown): unknown {
  const overlay = remarkTooltipOverlay(schema)
  return overlay.className ?? asRecord(schema).className
}

/** 只认 schema / env 显式 `mobileUI`，不要用 768 视口误判（对照 iframe ~768）。 */
export function remarkIsMobile(schema: unknown, env?: { mobileUI?: unknown } | null): boolean {
  const rec = asRecord(schema)
  if (rec.mobileUI === true) return true
  if (rec.mobileUI === false) return false
  return env?.mobileUI === true
}

export function remarkDialogSchema(schema: unknown, data: PlainObject = {}): SchemaObject {
  const filtered = remarkFilterContents(schema, data) || {}
  return {
    type: 'dialog',
    title: filtered.title ? String(filtered.title) : '',
    body: filtered.content ? String(filtered.content) : '',
    actions: [],
  }
}
