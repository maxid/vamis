import { withBase } from './base'
import {
  MOBILE_PREVIEW_HEIGHT,
  MOBILE_PREVIEW_WIDTH,
  PREVIEW_FRAME_PATH,
  PREVIEW_PAINTED,
  PREVIEW_READY,
  PREVIEW_SCHEMA,
  previewFrameSrc,
  readPreviewChrome,
} from './preview-frame'

/**
 * 文档移动预览只跑一份运行时。iframe 固定挂在 body，按当前手机屏
 * getBoundingClientRect 定位。禁止 appendChild 搬进手机壳：浏览器会
 * 把整个 preview-frame 再加载一遍。
 */
type PreviewClaim = {
  id: number
  screen: HTMLElement
  schema: unknown
  ratio: number
}

const claims = new Map<number, PreviewClaim>()
let nextId = 1
let iframe: HTMLIFrameElement | null = null
let host: HTMLElement | null = null
let assignedId: number | null = null
let frameReady = false
let lastPosted: unknown
let placeRaf = 0
let scroller: HTMLElement | Window | null = null
let screenObserver: ResizeObserver | null = null

export function allocPreviewId(): number {
  return nextId++
}

function overflowAncestor(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement
  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    if (/(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflow)) return node
    node = node.parentElement
  }
  return window
}

function clipRectOf(el: HTMLElement) {
  let clip = { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 }
  let node: HTMLElement | null = el.parentElement
  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    if (style.overflowY !== 'visible' || style.overflowX !== 'visible') {
      const r = node.getBoundingClientRect()
      clip = {
        top: Math.max(clip.top, r.top),
        right: Math.min(clip.right, r.right),
        bottom: Math.min(clip.bottom, r.bottom),
        left: Math.max(clip.left, r.left),
      }
    }
    node = node.parentElement
  }
  return clip
}

function ensureIframe() {
  if (iframe) return
  host = document.createElement('div')
  host.dataset.vamisPreviewPark = '1'
  host.style.cssText = [
    'position:fixed',
    'z-index:20',
    `width:${MOBILE_PREVIEW_WIDTH}px`,
    `height:${MOBILE_PREVIEW_HEIGHT}px`,
    'overflow:hidden',
    'visibility:hidden',
    'pointer-events:none',
    'box-sizing:border-box',
  ].join(';')
  document.body.appendChild(host)

  iframe = document.createElement('iframe')
  iframe.className = 'doc-play__mobile-frame'
  iframe.title = '移动端预览'
  iframe.width = String(MOBILE_PREVIEW_WIDTH)
  iframe.height = String(MOBILE_PREVIEW_HEIGHT)
  iframe.src = previewFrameSrc(withBase(PREVIEW_FRAME_PATH))
  iframe.style.cssText = 'display:block;width:100%;height:100%;border:0'
  iframe.addEventListener('load', postAssigned)
  host.appendChild(iframe)
  window.addEventListener('message', onMessage)
  window.addEventListener('resize', schedulePlace)
}

function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  if (!iframe || event.source !== iframe.contentWindow) return
  if (event.data?.type === PREVIEW_READY) {
    frameReady = true
    postAssigned()
  }
  if (event.data?.type === PREVIEW_PAINTED) iframe.classList.add('is-ready')
}

function postAssigned() {
  const claim = assignedId != null ? claims.get(assignedId) : undefined
  const win = iframe?.contentWindow
  if (!claim || !win || !frameReady) return
  if (claim.schema === lastPosted) return
  lastPosted = claim.schema
  win.postMessage(
    { type: PREVIEW_SCHEMA, schema: claim.schema, chrome: readPreviewChrome() },
    window.location.origin,
  )
}

function schedulePlace() {
  if (placeRaf) return
  placeRaf = window.requestAnimationFrame(() => {
    placeRaf = 0
    place()
  })
}

function bindScroller(screen: HTMLElement) {
  const next = overflowAncestor(screen)
  if (scroller === next) return
  scroller?.removeEventListener('scroll', schedulePlace)
  scroller = next
  scroller.addEventListener('scroll', schedulePlace, { passive: true })
}

function watchScreen(screen: HTMLElement) {
  screenObserver ??= new ResizeObserver(schedulePlace)
  screenObserver.disconnect()
  screenObserver.observe(screen)
}

function hideHost() {
  if (!host) return
  host.style.visibility = 'hidden'
  host.style.pointerEvents = 'none'
}

function place() {
  const claim = assignedId != null ? claims.get(assignedId) : undefined
  if (!host || !iframe) return
  if (!claim) {
    hideHost()
    return
  }
  const screen = claim.screen.getBoundingClientRect()
  const clip = clipRectOf(claim.screen)
  const fullyOutside =
    screen.bottom <= clip.top ||
    screen.top >= clip.bottom ||
    screen.right <= clip.left ||
    screen.left >= clip.right
  if (fullyOutside) {
    hideHost()
    return
  }
  host.style.visibility = 'visible'
  host.style.pointerEvents = 'auto'
  host.style.left = `${screen.left}px`
  host.style.top = `${screen.top}px`
  host.style.width = `${screen.width}px`
  host.style.height = `${screen.height}px`
  host.style.borderRadius = getComputedStyle(claim.screen).borderRadius
  const insetTop = Math.max(0, clip.top - screen.top)
  const insetRight = Math.max(0, screen.right - clip.right)
  const insetBottom = Math.max(0, screen.bottom - clip.bottom)
  const insetLeft = Math.max(0, clip.left - screen.left)
  host.style.clipPath = `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px)`
}

function pick() {
  ensureIframe()
  let best: PreviewClaim | undefined
  for (const claim of claims.values()) {
    if (claim.ratio <= 0) continue
    if (!best || claim.ratio > best.ratio) best = claim
  }
  assignedId = best?.id ?? null
  if (best) {
    bindScroller(best.screen)
    watchScreen(best.screen)
  }
  place()
  postAssigned()
}

export function claimPreview(id: number, screen: HTMLElement, schema: unknown, ratio = 1) {
  claims.set(id, { id, screen, schema, ratio })
  pick()
}

export function updatePreviewSchema(id: number, schema: unknown) {
  const claim = claims.get(id)
  if (!claim) return
  claim.schema = schema
  if (assignedId === id) postAssigned()
}

export function setPreviewRatio(id: number, ratio: number) {
  const claim = claims.get(id)
  if (!claim) return
  claim.ratio = ratio
  pick()
}

export function releasePreview(id: number) {
  claims.delete(id)
  if (assignedId === id) assignedId = null
  pick()
}
