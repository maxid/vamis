/** Toast 队列。对齐 Amis ToastComponent：移动端一条、按 position 分组由 Host 画。 */

import { reactive } from 'vue'
import type { NotifyConf, PlainObject, SchemaObject } from './types'
import {
  isMobileToast,
  toastLevel,
  toastPosition,
  toastTimeout,
  type ToastLevel,
  type ToastPosition,
} from './utils/toast'

export type ToastItem = {
  id: string
  level: ToastLevel
  body: string
  title: string
  bodySchema?: SchemaObject
  titleSchema?: SchemaObject
  data?: PlainObject
  position: ToastPosition
  timeout: number
  closeButton: boolean
  showIcon: boolean
  allowHtml: boolean
  mobile: boolean
}

const state = reactive({ items: [] as ToastItem[], primaryHost: 0 })
let seq = 0
let nextHost = 0
const liveHosts = new Set<number>()

/** 文档页每个预览一份 VamisApp：卸掉当前 primary 后把绘画权交给还活着的 Host。 */
export function claimToastHost(): number {
  const id = ++nextHost
  liveHosts.add(id)
  if (!state.primaryHost) state.primaryHost = id
  return id
}

export function releaseToastHost(id?: number): void {
  const target = id ?? liveHosts.values().next().value
  if (target == null) return
  liveHosts.delete(target)
  if (state.primaryHost === target) {
    state.primaryHost = liveHosts.values().next().value ?? 0
  }
}

export function useToastState() {
  return state
}

export function resetToasts() {
  state.items = []
}

export function dismissToast(id: string) {
  state.items = state.items.filter((item) => item.id !== id)
}

export function pushToast(level: string, body: string, conf?: NotifyConf) {
  const mobile = conf?.mobile ?? isMobileToast()
  const lv = toastLevel(level)
  const item: ToastItem = {
    id: `toast-${++seq}`,
    level: lv,
    body,
    title: conf?.title ?? '',
    bodySchema: conf?.bodySchema,
    titleSchema: conf?.titleSchema,
    data: conf?.data ? { ...conf.data } : undefined,
    position: toastPosition(conf?.position, mobile),
    timeout: toastTimeout(lv, conf?.timeout, mobile),
    closeButton: mobile ? false : conf?.closeButton === true,
    showIcon: conf?.showIcon !== false,
    allowHtml: conf?.allowHtml !== false,
    mobile,
  }
  state.items = mobile ? [item] : [...state.items, item]
  return item
}
