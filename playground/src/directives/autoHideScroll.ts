const HIDE_MS = 800

type ScrollEl = HTMLElement & { __autoHideScroll?: () => void }

/** 只藏指令挂上的那条栏。scrollbar-color 会继承，子级滚动条靠 `.auto-hide-scroll > *` 打断。 */
export const vAutoHideScroll = {
  mounted(el: ScrollEl) {
    el.classList.add('auto-hide-scroll')
    let timer = 0
    const onScroll = () => {
      el.classList.add('is-scrolling')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        el.classList.remove('is-scrolling')
      }, HIDE_MS)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    el.__autoHideScroll = () => {
      window.clearTimeout(timer)
      el.removeEventListener('scroll', onScroll)
      el.classList.remove('is-scrolling', 'auto-hide-scroll')
    }
  },
  unmounted(el: ScrollEl) {
    el.__autoHideScroll?.()
  },
}
