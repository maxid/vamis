import type { NotifyConf, RendererEnv } from './types'
import { defaultFetcher } from './utils/api'
import { hasConfirmHost, openConfirm, type ConfirmOptions } from './confirm-store'
import { pushToast } from './toast-store'

export function createDefaultEnv(overrides: Partial<RendererEnv> = {}): RendererEnv {
  return {
    session: 'global',
    theme: 'vamis',
    fetcher: defaultFetcher,
    notify(type, msg, conf?: NotifyConf) {
      pushToast(type, msg, conf)
    },
    jumpTo(to, opts) {
      if (to === 'goBack') {
        window.history.back()
        return
      }
      if (opts?.blank && typeof window !== 'undefined' && window.open) {
        window.open(to, '_blank', 'noopener,noreferrer')
        return
      }
      window.location.assign(to)
    },
    alert(msg) {
      window.alert(msg)
    },
    async confirm(msg, title, options?: ConfirmOptions) {
      if (hasConfirmHost()) return openConfirm(msg, title, options)
      // 无 ConfirmHost（单测 / 裸 VamisRoot）才回落原生，避免 Promise 挂死。
      const text = title ? `${title}\n\n${msg}` : msg
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        return window.confirm(text)
      }
      return true
    },
    getModalContainer() {
      return typeof document !== 'undefined' ? document.body : undefined
    },
    ...overrides,
  }
}
