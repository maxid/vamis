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
 * 文档移动预览只跑一份运行时。每个示例再挂 iframe 会把同一份
 * `register.ts` + `@vamis/ui` 再解码一遍（两个框 ≈ 11MB 资源）。
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
let parkHost: HTMLElement | null = null
let assignedId: number | null = null
let frameReady = false

export function allocPreviewId(): number {
  return nextId++
}

function ensureIframe() {
  if (iframe) return
  parkHost = document.createElement('div')
  parkHost.dataset.vamisPreviewPark = '1'
  parkHost.style.cssText =
    'position:absolute;left:-9999px;top:0;width:375px;height:812px;overflow:hidden;pointer-events:none'
  document.body.appendChild(parkHost)

  iframe = document.createElement('iframe')
  iframe.className = 'doc-play__mobile-frame'
  iframe.title = '移动端预览'
  iframe.width = String(MOBILE_PREVIEW_WIDTH)
  iframe.height = String(MOBILE_PREVIEW_HEIGHT)
  iframe.src = previewFrameSrc(withBase(PREVIEW_FRAME_PATH))
  iframe.addEventListener('load', postAssigned)
  parkHost.appendChild(iframe)
  window.addEventListener('message', onMessage)
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
  win.postMessage(
    { type: PREVIEW_SCHEMA, schema: claim.schema, chrome: readPreviewChrome() },
    window.location.origin,
  )
}

function park() {
  if (iframe && parkHost && iframe.parentElement !== parkHost) parkHost.appendChild(iframe)
}

function pick() {
  ensureIframe()
  let best: PreviewClaim | undefined
  for (const claim of claims.values()) {
    if (claim.ratio <= 0) continue
    if (!best || claim.ratio > best.ratio) best = claim
  }
  const next = best?.id ?? null
  if (next !== assignedId) {
    assignedId = next
    iframe?.classList.remove('is-ready')
    if (!best) {
      park()
      return
    }
    best.screen.appendChild(iframe!)
  } else if (!best) {
    park()
    return
  }
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
