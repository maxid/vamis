/** Toast 动作。对齐 Amis：items / position / timeout / closeButton / showIcon / allowHtml。 */

import { filterTpl } from '../formula'
import type { NotifyConf, NotifyType, PlainObject, SchemaNode, SchemaObject } from '../types'

/** 对齐 Amis `isMobile()`：`max-width: 768px`。对照桌面 iframe ~768 也走 Toast-mobile。 */
export function isMobileToast(): boolean {
  const media = (globalThis as { matchMedia?: (query: string) => { matches: boolean } }).matchMedia
  if (typeof media !== 'function') return false
  return media('(max-width: 768px)').matches
}

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
  bodySchema?: SchemaObject
  titleSchema?: SchemaObject
  /** 写了 msg/body 但公式算出空（如 `${event.data.value|json}` 的 undefined）时不要改成「提示」。 */
  allowEmpty?: boolean
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
  mobile?: boolean
  bodySchema?: SchemaObject
  titleSchema?: SchemaObject
  data?: PlainObject
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

/** Amis `render('body', body)`：有 `type` 的对象或节点数组当 SchemaNode，不再抽成纯文本。 */
export function toastSchemaObject(value: unknown): SchemaObject | null {
  if (Array.isArray(value)) {
    if (!value.length) return null
    return { type: 'wrapper', body: value as SchemaNode[] }
  }
  if (value && typeof value === 'object') {
    const rec = value as SchemaObject
    if (typeof rec.type === 'string' && rec.type) return rec
  }
  return null
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
  const bodyRaw = item.body ?? item.msg ?? item.message ?? parent.msg ?? parent.message
  const titleRaw = item.title ?? parent.title
  const bodySchema = toastSchemaObject(bodyRaw)
  const titleSchema = toastSchemaObject(titleRaw)
  const body = bodySchema ? '' : toastText(bodyRaw, data)
  return {
    level,
    body,
    title: titleSchema ? '' : toastText(titleRaw, data),
    ...(bodySchema ? { bodySchema } : {}),
    ...(titleSchema ? { titleSchema } : {}),
    ...(bodyRaw != null && bodyRaw !== false && !body && !bodySchema ? { allowEmpty: true } : {}),
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

export function toastNotifyConf(notice: ToastNotice, data: PlainObject = {}, mobile = false): ToastConf {
  return {
    position: notice.position,
    timeout: notice.timeout,
    closeButton: notice.closeButton,
    showIcon: notice.showIcon,
    title: notice.title || undefined,
    allowHtml: notice.allowHtml,
    mobile,
    bodySchema: notice.bodySchema,
    titleSchema: notice.titleSchema,
    data,
  }
}

function toastFallbackText(notice: ToastNotice): string {
  if (notice.body) return notice.body
  if (notice.title) return notice.title
  if (notice.bodySchema || notice.titleSchema || notice.allowEmpty) return ''
  return '提示'
}

/** 抽出 notices 并 `env.notify`。移动端默认 center / 3000，且一次只留一条。 */
export function notifyToasts(
  notify: (type: NotifyType, msg: string, conf?: NotifyConf) => void,
  action: unknown,
  data: PlainObject = {},
) {
  const mobile = isMobileToast()
  for (const notice of toastNotices(action, data, mobile)) {
    notify(notice.level, toastFallbackText(notice), toastNotifyConf(notice, data, mobile))
  }
}
