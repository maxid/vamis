/** Action 按钮外观与行为辅助。对齐 Amis：未写 label 不补「按钮」；空 label 只留图标；primary 当 level；icon 走 resolveIcon。 */

import { evalExpression, filterTpl } from '../formula'
import type { SchemaNode } from '../types'
import { resolveIcon } from './icon'
import {
  tooltipContent,
  tooltipDisabled,
  tooltipPlacement,
  tooltipTitle,
  tooltipTriggers,
  type TooltipPlacement,
  type TooltipTrigger,
} from './tooltip-wrapper'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function tplField(value: unknown, data: Record<string, unknown>): string {
  if (value == null || value === false || typeof value === 'object') return ''
  return filterTpl(String(value), data)
}

export function actionKind(schema: unknown): string {
  const rec = asRecord(schema)
  if (typeof rec.actionType === 'string' && rec.actionType) return rec.actionType
  if (rec.type === 'submit') return 'submit'
  if (rec.type === 'reset') return 'reset'
  return 'button'
}

export function actionLevel(schema: unknown): string {
  const rec = asRecord(schema)
  if (typeof rec.level === 'string' && rec.level) return rec.level
  if (rec.primary === true) return 'primary'
  return ''
}

export function actionLabel(schema: unknown, data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  if (rec.label === false || rec.label === '') return ''
  if (typeof rec.label === 'string') return filterTpl(rec.label, data)
  if (typeof rec.title === 'string' && rec.title) return filterTpl(rec.title, data)
  return ''
}

export function actionShowLabel(schema: unknown): boolean {
  const rec = asRecord(schema)
  if (rec.iconOnly === true) return false
  if (rec.label === false || rec.label === '') return false
  if (typeof rec.label === 'string') return true
  return typeof rec.title === 'string' && !!rec.title
}

/** 对齐 Amis Action：`iconOnly={!!(icon && !label && level !== 'link')}`，并认 schema `iconOnly: true`。 */
export function actionIconOnly(schema: unknown): boolean {
  const rec = asRecord(schema)
  if (actionLevel(schema) === 'link') return false
  if (rec.iconOnly === true) return true
  const icon = rec.icon
  if (icon == null || icon === false || icon === '') return false
  return !actionShowLabel(schema)
}

export function actionIconSrc(schema: unknown, key = 'icon'): string {
  const resolved = resolveIcon(asRecord(schema)[key])
  return resolved.kind === 'url' ? resolved.src : ''
}

export function actionIconClass(schema: unknown, key = 'icon'): string {
  const resolved = resolveIcon(asRecord(schema)[key])
  return resolved.kind === 'class' ? resolved.className : ''
}

/** Amis：Action 的 TooltipObject 不收 type / body / wrapperComponent / className / inline。 */
const TOOLTIP_OBJECT_SKIP = new Set(['type', 'body', 'wrapperComponent', 'className', 'inline'])

function filterTipField(value: unknown, data: Record<string, unknown>): string {
  if (value == null || value === false) return ''
  return filterTpl(String(value), data)
}

function tooltipTextOf(cfg: Record<string, unknown> | null): string {
  if (!cfg) return ''
  return tooltipContent(cfg) || tooltipTitle(cfg)
}

/** 对齐 Amis Button：`disabled ? disabledTip : tooltip`。禁用且未写 disabledTip 时不回落到 tooltip。 */
export function actionTooltipSource(schema: unknown, disabled = false): unknown {
  const rec = asRecord(schema)
  if (disabled) return rec.disabledTip
  if (rec.tooltip != null && rec.tooltip !== false && rec.tooltip !== '') return rec.tooltip
  return typeof rec.title === 'string' ? rec.title : undefined
}

/** 把 string / TooltipObject 收成 tooltip-wrapper 同形配置（对象字段优先于 Action 级 placement/trigger）。 */
export function actionTooltipConfig(
  schema: unknown,
  data: Record<string, unknown> = {},
  disabled = false,
): Record<string, unknown> | null {
  const rec = asRecord(schema)
  const raw = actionTooltipSource(schema, disabled)
  if (raw == null || raw === false || raw === '') return null

  const defaults: Record<string, unknown> = {}
  if (rec.tooltipPlacement) defaults.placement = rec.tooltipPlacement
  if (rec.tooltipTrigger != null) defaults.trigger = rec.tooltipTrigger
  if (rec.tooltipRootClose != null) defaults.rootClose = rec.tooltipRootClose

  let obj: Record<string, unknown>
  if (typeof raw === 'string') {
    obj = { ...defaults, content: filterTipField(raw, data) }
  } else if (typeof raw === 'object' && !Array.isArray(raw)) {
    const src = asRecord(raw)
    obj = { ...defaults }
    for (const [key, value] of Object.entries(src)) {
      if (TOOLTIP_OBJECT_SKIP.has(key)) continue
      obj[key] = value
    }
    obj.title = filterTipField(src.title, data)
    obj.content = filterTipField(src.content ?? src.body, data)
  } else {
    return null
  }

  if (tooltipDisabled(obj)) return null
  if (!tooltipTextOf(obj)) return null
  return obj
}

export function actionTooltip(schema: unknown, data: Record<string, unknown> = {}): string {
  return tooltipTextOf(actionTooltipConfig(schema, data, false))
}

export function actionDisabledTip(schema: unknown, data: Record<string, unknown> = {}): string {
  return tooltipTextOf(actionTooltipConfig(schema, data, true))
}

export function actionTooltipPlacement(schema: unknown, disabled = false): TooltipPlacement {
  const rec = asRecord(schema)
  const raw = actionTooltipSource(schema, disabled)
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && asRecord(raw).placement) {
    return tooltipPlacement(raw)
  }
  return tooltipPlacement({ placement: rec.tooltipPlacement })
}

export function actionTooltipTriggers(cfg: Record<string, unknown> | null): TooltipTrigger[] {
  if (cfg?.trigger != null) return tooltipTriggers(cfg)
  return ['hover', 'focus']
}

export function actionTooltipRootClose(cfg: Record<string, unknown> | null): boolean {
  return cfg?.rootClose === true
}

/** 把 Action `tooltipPlacement` 映到 overlayPosition 的 at-my 串。 */
export const ACTION_TOOLTIP_OVERLAY: Record<'top' | 'bottom' | 'left' | 'right', string> = {
  top: 'center-top-center-bottom',
  bottom: 'center-bottom-center-top',
  left: 'left-center-right-center',
  right: 'right-center-left-center',
}

export function actionTooltipOverlayPlacement(schema: unknown, disabled = false): string {
  const rec = asRecord(schema)
  const raw = actionTooltipSource(schema, disabled)
  const fromObj = raw && typeof raw === 'object' && !Array.isArray(raw) ? asRecord(raw).placement : undefined
  const place = String(fromObj || rec.tooltipPlacement || 'top')
  if (place === 'auto') return 'auto'
  return ACTION_TOOLTIP_OVERLAY[actionTooltipPlacement(schema, disabled)]
}

export function actionMailto(schema: unknown, data: Record<string, unknown> = {}): string {
  const rec = asRecord(schema)
  const to = tplField(rec.to, data)
  const params = new URLSearchParams()
  const cc = tplField(rec.cc, data)
  const bcc = tplField(rec.bcc, data)
  const subject = tplField(rec.subject, data)
  const body = tplField(rec.body, data)
  if (cc) params.set('cc', cc)
  if (bcc) params.set('bcc', bcc)
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return query ? `mailto:${to}?${query}` : `mailto:${to}`
}

export function actionCountDown(schema: unknown): number {
  const n = Number(asRecord(schema).countDown)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

export function actionCountDownTpl(schema: unknown): string {
  const raw = asRecord(schema).countDownTpl
  if (typeof raw === 'string' && raw) return raw
  return '${timeLeft} 秒'
}

export function actionHotKey(schema: unknown): string {
  const raw = asRecord(schema).hotKey
  return typeof raw === 'string' ? raw.trim() : ''
}

export function actionIsContainer(schema: unknown): boolean {
  if (actionKind(schema) === 'email') return false
  return actionBody(schema).length > 0
}

export function actionBody(schema: unknown): SchemaNode[] {
  if (actionKind(schema) === 'email') return []
  const body = asRecord(schema).body
  if (body == null || body === false || body === '') return []
  return Array.isArray(body) ? (body as SchemaNode[]) : [body as SchemaNode]
}

export function actionBlank(schema: unknown): boolean {
  return asRecord(schema).blank === true
}

export function actionCopyFormat(schema: unknown): string {
  const raw = asRecord(schema).copyFormat
  return typeof raw === 'string' && raw ? raw : 'text/plain'
}

export function actionActive(schema: unknown): boolean {
  return asRecord(schema).active === true
}

export function actionActiveLevel(schema: unknown): string {
  const raw = asRecord(schema).activeLevel
  return typeof raw === 'string' ? raw : ''
}

export function actionActiveClassName(schema: unknown): string {
  const raw = asRecord(schema).activeClassName
  return typeof raw === 'string' && raw ? raw : 'is-active'
}

export function actionSchemaLoading(schema: unknown, data: Record<string, unknown> = {}): boolean {
  const rec = asRecord(schema)
  if (rec.loading === true) return true
  if (rec.loading === false) return false
  if (typeof rec.loadingOn === 'string' && rec.loadingOn) return evalExpression(rec.loadingOn, data)
  return false
}

export function actionRequiredNames(schema: unknown): string[] {
  const raw = asRecord(schema).required
  if (!Array.isArray(raw)) return []
  return raw.map((item) => String(item)).filter(Boolean)
}

export function countdownStorageKey(schema: unknown, fallback: string): string {
  const rec = asRecord(schema)
  const id = String(rec.name || rec.id || fallback)
  return `vamis-countdownend-${id}`
}

export function countdownRemaining(end: number, now = Date.now()): number {
  if (!end) return 0
  return Math.max(0, Math.floor((end - now) / 1000))
}

export function readCountdownEnd(key: string, storage?: Storage | null): number {
  try {
    const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!store) return 0
    return parseInt(store.getItem(key) || '0', 10) || 0
  } catch {
    return 0
  }
}

export function writeCountdownEnd(key: string, end: number, storage?: Storage | null): void {
  try {
    const store = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!store) return
    if (end <= 0) store.removeItem(key)
    else store.setItem(key, String(end))
  } catch {
    /* private mode / node */
  }
}

const KEY_ALIASES: Record<string, string> = {
  command: 'meta',
  cmd: 'meta',
  meta: 'meta',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  shift: 'shift',
  enter: 'enter',
  return: 'enter',
  esc: 'escape',
  escape: 'escape',
  space: ' ',
  plus: '+',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  del: 'delete',
  delete: 'delete',
  backspace: 'backspace',
  tab: 'tab',
  home: 'home',
  end: 'end',
  pageup: 'pageup',
  pagedown: 'pagedown',
}

function eventKeyName(event: KeyboardEvent): string {
  if (event.key === ' ') return ' '
  if (event.key.length === 1) return event.key.toLowerCase()
  return event.key.toLowerCase()
}

function matchCombo(combo: string, event: KeyboardEvent): boolean {
  const parts = combo
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return false
  let needMeta = false
  let needCtrl = false
  let needAlt = false
  let needShift = false
  let key = ''
  for (const part of parts) {
    const alias = KEY_ALIASES[part] || part
    if (alias === 'meta') needMeta = true
    else if (alias === 'ctrl') needCtrl = true
    else if (alias === 'alt') needAlt = true
    else if (alias === 'shift') needShift = true
    else key = alias
  }
  if (!!event.metaKey !== needMeta) return false
  if (!!event.ctrlKey !== needCtrl) return false
  if (!!event.altKey !== needAlt) return false
  if (!!event.shiftKey !== needShift) return false
  if (!key) return false
  const pressed = eventKeyName(event)
  if (pressed === key) return true
  if (event.code && event.code.toLowerCase() === key) return true
  if (key.startsWith('num_')) {
    const digit = key.slice(4)
    return event.code === `Numpad${digit.toUpperCase()}` || pressed === digit
  }
  return false
}

export function matchHotKey(hotKey: string, event: KeyboardEvent): boolean {
  if (!hotKey) return false
  return hotKey
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .some((combo) => matchCombo(combo, event))
}

export function parseContentDisposition(header?: string | null): string {
  if (!header) return ''
  const utf = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header)
  if (utf?.[1]) {
    try {
      return decodeURIComponent(utf[1].trim().replace(/^["']|["']$/g, ''))
    } catch {
      return utf[1].trim().replace(/^["']|["']$/g, '')
    }
  }
  const plain = /filename="([^"]+)"|filename=([^;]+)/i.exec(header)
  if (plain) return (plain[1] || plain[2] || '').trim()
  return ''
}

export function fileNameFromUrl(url: string): string {
  if (!url) return 'download'
  try {
    const path = new URL(url, 'http://localhost').pathname
    const last = path.split('/').pop() || ''
    const name = decodeURIComponent(last.split('?')[0] || '')
    return name || 'download'
  } catch {
    const last = url.split('/').pop() || ''
    return last.split('?')[0] || 'download'
  }
}

export function triggerSaveAs(url: string, fileName = ''): void {
  if (typeof document === 'undefined' || !url) return
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || fileNameFromUrl(url)
  a.rel = 'noopener'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  if (typeof URL === 'undefined' || !blob) return
  const url = URL.createObjectURL(blob)
  triggerSaveAs(url, fileName || 'download')
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
  }, 1000)
}

export async function copyToClipboard(text: string, format = 'text/plain'): Promise<void> {
  if (typeof navigator === 'undefined') return
  if (format === 'text/html' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    const html = new Blob([text], { type: 'text/html' })
    const plain = new Blob([text.replace(/<[^>]+>/g, '')], { type: 'text/plain' })
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': html, 'text/plain': plain })])
    return
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
  }
}
