/** env.confirm 队列。对齐 Amis `amis-ui` Alert.confirm：单例 Modal，不走 window.confirm。 */

import { reactive } from 'vue'

export type ConfirmSize = '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type ConfirmOptions = {
  closeOnEsc?: boolean
  size?: ConfirmSize | string
  confirmBtnLevel?: string
  cancelBtnLevel?: string
  confirmText?: string
  cancelText?: string
  className?: string
  /** false = Alert.alert，只留确认钮。 */
  showCancel?: boolean
}

export type ConfirmRequest = {
  id: string
  msg: string
  title: string
  confirmText: string
  cancelText: string
  confirmBtnLevel: string
  cancelBtnLevel: string
  closeOnEsc: boolean
  size: ConfirmSize
  className: string
  showCancel: boolean
}

type PendingConfirm = ConfirmRequest & { resolve: (ok: boolean) => void }

const SIZES = new Set<ConfirmSize>(['', 'xs', 'sm', 'md', 'lg', 'xl', 'full'])

const queue: PendingConfirm[] = []
const pendingById = new Map<string, PendingConfirm>()
const state = reactive({ current: null as ConfirmRequest | null, primaryHost: 0 })
let seq = 0
let nextHost = 0
const liveHosts = new Set<number>()

function asSize(value: unknown): ConfirmSize {
  const size = String(value ?? '') as ConfirmSize
  return SIZES.has(size) ? size : ''
}

function publicView(item: PendingConfirm): ConfirmRequest {
  return {
    id: item.id,
    msg: item.msg,
    title: item.title,
    confirmText: item.confirmText,
    cancelText: item.cancelText,
    confirmBtnLevel: item.confirmBtnLevel,
    cancelBtnLevel: item.cancelBtnLevel,
    closeOnEsc: item.closeOnEsc,
    size: item.size,
    className: item.className,
    showCancel: item.showCancel,
  }
}

function flush() {
  if (state.current || !queue.length) return
  const next = queue.shift()!
  state.current = publicView(next)
}

export function useConfirmState() {
  return state
}

export function hasConfirmHost() {
  return liveHosts.size > 0
}

/** 文档页每个预览一份 VamisApp：卸掉当前 primary 后把绘画权交给还活着的 Host。 */
export function claimConfirmHost(): number {
  const id = ++nextHost
  liveHosts.add(id)
  if (!state.primaryHost) state.primaryHost = id
  return id
}

export function releaseConfirmHost(id?: number): void {
  const target = id ?? liveHosts.values().next().value
  if (target == null) return
  liveHosts.delete(target)
  if (state.primaryHost === target) {
    state.primaryHost = liveHosts.values().next().value ?? 0
  }
  if (liveHosts.size === 0) resetConfirms()
}

/** 未写 title 时 Amis 回落到 `Alert.info` → 中文「系统消息」。空字符串不画标题。 */
export function confirmTitleOf(title?: string): string {
  return title == null ? '系统消息' : title
}

export function openConfirm(msg: string, title?: string, options?: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const item: PendingConfirm = {
      id: `confirm-${++seq}`,
      msg: String(msg ?? ''),
      title: confirmTitleOf(title),
      confirmText: options?.confirmText || '确认',
      cancelText: options?.cancelText || '取消',
      confirmBtnLevel: options?.confirmBtnLevel || 'danger',
      cancelBtnLevel: options?.cancelBtnLevel || 'default',
      closeOnEsc: options?.closeOnEsc === true,
      size: asSize(options?.size),
      className: options?.className ? String(options.className) : '',
      showCancel: options?.showCancel !== false,
      resolve,
    }
    pendingById.set(item.id, item)
    queue.push(item)
    flush()
  })
}

export function settleConfirm(ok: boolean) {
  const live = state.current
  if (!live) return
  const pending = pendingById.get(live.id)
  pendingById.delete(live.id)
  state.current = null
  pending?.resolve(ok)
  flush()
}

export function resetConfirms() {
  for (const item of queue) item.resolve(false)
  if (state.current) pendingById.get(state.current.id)?.resolve(false)
  queue.length = 0
  pendingById.clear()
  state.current = null
}
