/** 文档里直接嵌的运行时 iframe。顶栏桌面时内部布局宽必须大于 767，否则 @media (max-width: 767px) 会画成移动表单。 */

export const DOC_DESKTOP_MIN = 768

export type DesktopFrameLayout = {
  scaled: boolean
  layoutWidth: number
  scale: number
  iframeHeight: number
  visualHeight: number
}

/** 外框视觉高度保持作者给的高度；窄屏只把布局宽撑到 768 再缩小。 */
export function desktopFrameLayout(
  paneWidth: number,
  visualHeight: number,
  desktop: boolean,
): DesktopFrameLayout {
  const pane = Number.isFinite(paneWidth) ? Math.max(0, paneWidth) : 0
  const visual = visualHeight > 0 ? visualHeight : 420
  if (!desktop || pane === 0 || pane >= DOC_DESKTOP_MIN) {
    return {
      scaled: false,
      layoutWidth: pane,
      scale: 1,
      iframeHeight: visual,
      visualHeight: visual,
    }
  }
  const scale = pane / DOC_DESKTOP_MIN
  return {
    scaled: true,
    layoutWidth: DOC_DESKTOP_MIN,
    scale,
    iframeHeight: Math.ceil(visual / scale),
    visualHeight: visual,
  }
}

function ensureWrap(iframe: HTMLIFrameElement): HTMLElement {
  const parent = iframe.parentElement
  if (parent?.classList.contains('doc-sdk-hello-wrap')) return parent
  const wrap = document.createElement('span')
  wrap.className = 'doc-sdk-hello-wrap'
  parent?.insertBefore(wrap, iframe)
  wrap.appendChild(iframe)
  return wrap
}

function applyFrame(iframe: HTMLIFrameElement, desktop: boolean) {
  const wrap = ensureWrap(iframe)
  const visual = Number(iframe.dataset.visualHeight) || 420
  const layout = desktopFrameLayout(wrap.clientWidth, visual, desktop)
  iframe.style.maxWidth = 'none'
  iframe.style.transformOrigin = 'top left'
  if (!layout.scaled) {
    iframe.style.width = '100%'
    iframe.style.height = layout.visualHeight + 'px'
    iframe.style.transform = 'none'
    iframe.removeAttribute('scrolling')
    wrap.style.height = layout.visualHeight + 'px'
    return
  }
  iframe.style.width = layout.layoutWidth + 'px'
  iframe.style.height = layout.iframeHeight + 'px'
  iframe.style.transform = 'scale(' + layout.scale + ')'
  iframe.setAttribute('scrolling', 'no')
  wrap.style.height = layout.visualHeight + 'px'
}

/** 顶栏桌面且外框宽小于 768 时，把 iframe 布局宽撑到 768 再 scale 进外框。 */
export function fitDesktopEmbedFrames(root: ParentNode, desktop: boolean) {
  root.querySelectorAll<HTMLIFrameElement>('iframe.doc-sdk-hello').forEach((iframe) => {
    applyFrame(iframe, desktop)
  })
}
