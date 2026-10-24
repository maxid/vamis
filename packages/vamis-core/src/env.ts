import { h } from 'vue'
import { toast } from 'vue-sonner'
import type { NotifyConf, RendererEnv } from './types'
import { defaultFetcher } from './utils/api'
import { sonnerPosition } from './utils/toast'

function toastContent(msg: string, conf?: NotifyConf) {
  if (conf?.allowHtml === false) return msg
  if (!msg || !/[<>]/.test(msg)) return msg
  return h('div', { innerHTML: msg })
}

function toastOptions(conf?: NotifyConf) {
  const showIcon = conf?.showIcon !== false
  return {
    duration: typeof conf?.timeout === 'number' ? conf.timeout : undefined,
    closeButton: conf?.closeButton === true,
    position: sonnerPosition(conf?.position),
    description: conf?.title ? toastContent(conf.title, conf) : undefined,
    classes: showIcon ? undefined : { icon: 'hidden' },
  }
}

export function createDefaultEnv(overrides: Partial<RendererEnv> = {}): RendererEnv {
  return {
    session: 'global',
    theme: 'vamis',
    fetcher: defaultFetcher,
    notify(type, msg, conf) {
      const content = toastContent(msg, conf)
      const options = toastOptions(conf)
      if (type === 'success') toast.success(content, options)
      else if (type === 'warning') toast.warning(content, options)
      else if (type === 'error') toast.error(content, options)
      else toast(content, options)
    },
    jumpTo(to) {
      if (to === 'goBack') {
        window.history.back()
        return
      }
      window.location.assign(to)
    },
    alert(msg) {
      window.alert(msg)
    },
    async confirm(msg) {
      return window.confirm(msg)
    },
    ...overrides,
  }
}
