/** Toast 队列。对齐 Amis ToastComponent：移动端一条、按 position 分组由 Host 画。 */

import { reactive } from 'vue'
import type { NotifyConf } from './types'
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
  position: ToastPosition
  timeout: number
  closeButton: boolean
  showIcon: boolean
  allowHtml: boolean
  mobile: boolean
}

const state = reactive({ items: [] as ToastItem[] })
let seq = 0
let liveHosts = 0

export function claimToastHost() {
  const primary = liveHosts === 0
  liveHosts += 1
  return primary
}

export function releaseToastHost() {
  liveHosts = Math.max(0, liveHosts - 1)
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
