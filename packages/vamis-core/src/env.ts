import type { NotifyConf, RendererEnv } from './types'
import { defaultFetcher } from './utils/api'
import { hasConfirmHost, openConfirm, type ConfirmOptions } from './confirm-store'
import { pushToast } from './toast-store'
import { createEventBus } from './event-bus'

export function createDefaultEnv(overrides: Partial<RendererEnv> = {}): RendererEnv {
  return {
    session: 'global',
    theme: 'vamis',
    bus: createEventBus(),
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
    updateLocation(to, replace) {
      if (typeof window === 'undefined') return
      if (to === 'goBack') {
        window.history.back()
        return
      }
      if (to.startsWith('#')) {
        const hash = to === '#' ? '' : to.replace(/^#/, '')
        const url = new URL(window.location.href)
        const href = `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`
        const current = `${url.pathname}${url.search}${url.hash}`
        if (current === href) return
        if (replace && window.history.replaceState) {
          window.history.replaceState(window.history.state, '', href)
          window.dispatchEvent(new HashChangeEvent('hashchange'))
          return
        }
        if (window.history.pushState) {
          window.history.pushState(window.history.state, '', href)
          window.dispatchEvent(new HashChangeEvent('hashchange'))
          return
        }
        window.location.hash = hash
        return
      }
      if (replace && window.history.replaceState) {
        window.history.replaceState(window.history.state, '', to)
        return
      }
      window.location.assign(to)
    },
    alert(msg, title?: string, className?: string) {
      if (hasConfirmHost()) {
        void openConfirm(msg, title ?? '系统提示', {
          showCancel: false,
          confirmBtnLevel: 'primary',
          className,
        })
        return
      }
      const text = title ? `${title}\n\n${msg}` : msg
      window.alert(text)
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
