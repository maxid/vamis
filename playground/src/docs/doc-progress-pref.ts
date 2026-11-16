import { ref } from 'vue'

export const DOC_PROGRESS_KEY = 'vamis-doc-progress'

function readStored(): boolean {
  try {
    const value = localStorage.getItem(DOC_PROGRESS_KEY)
    if (value === 'off' || value === '0') return false
    return true
  } catch {
    return true
  }
}

/** 站点顶栏：侧栏是否显示实现进度。默认开。 */
export const showDocProgress = ref(typeof localStorage === 'undefined' ? true : readStored())

export function hydrateDocProgress() {
  showDocProgress.value = readStored()
}

export function setShowDocProgress(next: boolean) {
  showDocProgress.value = next
  try {
    localStorage.setItem(DOC_PROGRESS_KEY, next ? 'on' : 'off')
  } catch {
    /* ignore quota / private mode */
  }
}
