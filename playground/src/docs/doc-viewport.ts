import { ref } from 'vue'

export type DocViewport = 'desktop' | 'mobile'

export const DOC_VIEWPORT_KEY = 'vamis-doc-viewport'

function readStored(): DocViewport {
  try {
    return localStorage.getItem(DOC_VIEWPORT_KEY) === 'mobile' ? 'mobile' : 'desktop'
  } catch {
    return 'desktop'
  }
}

/** 站点顶栏桌面/移动：默认桌面，管全部活示例。 */
export const docViewport = ref<DocViewport>(typeof localStorage === 'undefined' ? 'desktop' : readStored())

export function hydrateDocViewport() {
  docViewport.value = readStored()
}

export function setDocViewport(next: DocViewport) {
  docViewport.value = next
  try {
    localStorage.setItem(DOC_VIEWPORT_KEY, next)
  } catch {
    /* ignore quota / private mode */
  }
}
