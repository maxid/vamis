/** Toast 动作。对齐 Amis：items / position / timeout / closeButton / showIcon / allowHtml。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

const LEVELS = new Set(['info', 'success', 'warning', 'error'])
const PLACES = new Set([
  'top-right',
  'top-center',
  'top-left',
  'bottom-center',
  'bottom-left',
  'bottom-right',
  'center',
])

export type ToastLevel = 'info' | 'success' | 'warning' | 'error'
export type ToastPosition =
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

export type ToastNotice = {
  level: ToastLevel
  body: string
  title: string
  position: ToastPosition
  timeout: number
  closeButton: boolean
  showIcon: boolean
  allowHtml: boolean
}

export type ToastConf = {
  position?: ToastPosition
  timeout?: number
  closeButton?: boolean
  showIcon?: boolean
  title?: string
  allowHtml?: boolean
}

export function toastPosition(value?: unknown, mobile = false): ToastPosition {
  const raw = String(value || '')
  if (PLACES.has(raw)) return raw as ToastPosition
  return mobile ? 'center' : 'top-center'
}

export function toastLevel(value?: unknown): ToastLevel {
  const raw = String(value || '')
  return LEVELS.has(raw) ? (raw as ToastLevel) : 'info'
}

export function toastTimeout(level: ToastLevel, timeout?: unknown, mobile = false): number {
  const n = Number(timeout)
  if (Number.isFinite(n) && n >= 0) return n
  if (mobile) return 3000
  return level === 'error' ? 6000 : 4000
}

function toastText(value: unknown, data: PlainObject): string {
  if (value == null || value === false) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return filterTpl(String(value), data)
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const rec = value as Record<string, unknown>
    const tpl = rec.tpl ?? rec.html ?? rec.body ?? rec.title
    if (tpl != null && tpl !== value) return toastText(tpl, data)
  }
  return ''
}

function flag(value: unknown, fallback: boolean): boolean {
  if (value === true) return true
  if (value === false) return false
  return fallback
}

function noticeFrom(
  item: Record<string, unknown>,
  parent: Record<string, unknown>,
  data: PlainObject,
  mobile: boolean,
): ToastNotice {
  const merged = { ...parent, ...item }
  const level = toastLevel(merged.level || merged.msgType)
  return {
    level,
    body: toastText(item.body ?? item.msg ?? item.message ?? parent.msg ?? parent.message, data),
    title: toastText(item.title ?? parent.title, data),
    position: toastPosition(merged.position, mobile),
    timeout: toastTimeout(level, merged.timeout, mobile),
    closeButton: flag(merged.closeButton, false),
    showIcon: flag(merged.showIcon, true),
    allowHtml: flag(merged.allowHtml, true),
  }
}

/** 从 action / toast.items / args.msg 抽出要弹出的条。 */
export function toastNotices(action: unknown, data: PlainObject = {}, mobile = false): ToastNotice[] {
  const rec = asRecord(action)
  const args = asRecord(rec.args)
  const toast = asRecord(rec.toast)
  const parent = { ...args, ...toast, msg: rec.msg ?? rec.message ?? toast.msg ?? args.msg, message: rec.message, level: rec.level ?? toast.level ?? args.level ?? args.msgType }
  const items = toast.items
  if (Array.isArray(items)) {
    return items.map((item) => noticeFrom(asRecord(item), parent, data, mobile))
  }
  return [noticeFrom({}, parent, data, mobile)]
}

export function sonnerPosition(value?: unknown): Exclude<ToastPosition, 'center'> {
  const place = toastPosition(value)
  return place === 'center' ? 'top-center' : place
}

export function toastNotifyConf(notice: ToastNotice): ToastConf {
  return {
    position: notice.position,
    timeout: notice.timeout,
    closeButton: notice.closeButton,
    showIcon: notice.showIcon,
    title: notice.title || undefined,
    allowHtml: notice.allowHtml,
  }
}
