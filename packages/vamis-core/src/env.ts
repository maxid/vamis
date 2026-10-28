import type { NotifyConf, RendererEnv } from './types'
import { defaultFetcher } from './utils/api'
import { pushToast } from './toast-store'

export function createDefaultEnv(overrides: Partial<RendererEnv> = {}): RendererEnv {
  return {
    session: 'global',
    theme: 'vamis',
    fetcher: defaultFetcher,
    notify(type, msg, conf?: NotifyConf) {
      pushToast(type, msg, conf)
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
