import { toast } from 'vue-sonner'
import type { RendererEnv } from './types'
import { defaultFetcher } from './utils/api'

export function createDefaultEnv(overrides: Partial<RendererEnv> = {}): RendererEnv {
  return {
    session: 'global',
    theme: 'vamis',
    fetcher: defaultFetcher,
    notify(type, msg) {
      if (type === 'success') toast.success(msg)
      else if (type === 'warning') toast.warning(msg)
      else if (type === 'error') toast.error(msg)
      else toast(msg)
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
