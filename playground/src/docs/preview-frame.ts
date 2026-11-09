/** 文档活示例移动端预览：独立 HTML 入口（不要走整站 SPA）。 */

export const PREVIEW_FRAME_PATH = '/preview-frame.html'

export const PREVIEW_READY = 'vamis-preview-ready'
export const PREVIEW_SCHEMA = 'vamis-preview-schema'
export const PREVIEW_PAINTED = 'vamis-preview-painted'

/** 对照 / Amis Play 移动 iframe 宽度。外框在外侧，不要吃进这 375。 */
export const MOBILE_PREVIEW_WIDTH = 375

/**
 * 屏幕高度钉 iPhone X CSS 视口 375×812（约 19.5:9），
 * 和 `pnpm compare --mobile` 同一档。不要跟示例 fence `height` 或 500 矮框走，否则外框不像手机。
 */
export const MOBILE_PREVIEW_HEIGHT = 812

export type PreviewChrome = {
  dark: boolean
  density: string
  accent: string
}

export function readPreviewChrome(): PreviewChrome {
  const root = document.documentElement
  return {
    dark: root.classList.contains('dark'),
    density: root.dataset.density || 'compact',
    accent: root.dataset.accent || 'blue',
  }
}

export function applyPreviewChrome(chrome: PreviewChrome | undefined) {
  if (!chrome) return
  const root = document.documentElement
  root.classList.toggle('dark', chrome.dark)
  root.dataset.density = chrome.density || 'compact'
  root.dataset.accent = chrome.accent || 'blue'
}

/** 所有移动预览 iframe 共用；后打开的示例也能收到当前浅色/深色。 */
export const PREVIEW_CHROME_CHANNEL = 'vamis-preview-chrome'

let chromeChannel: BroadcastChannel | undefined

function chromeChannelOrNull(): BroadcastChannel | undefined {
  if (typeof BroadcastChannel === 'undefined') return undefined
  chromeChannel ??= new BroadcastChannel(PREVIEW_CHROME_CHANNEL)
  return chromeChannel
}

/** 顶栏切主题时广播。iframe 只改 chrome，不要重推 schema。 */
export function publishPreviewChrome(chrome: PreviewChrome = readPreviewChrome()) {
  try {
    chromeChannelOrNull()?.postMessage(chrome)
  } catch {
    /* 无 BroadcastChannel 的环境忽略 */
  }
}

export function subscribePreviewChrome(onChrome: (chrome: PreviewChrome) => void): () => void {
  const ch = chromeChannelOrNull()
  if (!ch) return () => {}
  const onMessage = (event: MessageEvent<PreviewChrome>) => {
    if (!event.data || typeof event.data.dark !== 'boolean') return
    onChrome(event.data)
  }
  ch.addEventListener('message', onMessage)
  return () => ch.removeEventListener('message', onMessage)
}

/** 打开 iframe 时把当前主题写进 URL，避免后挂载的预览先按浅色 HTML 画。 */
export function previewFrameSrc(baseHref: string, chrome: PreviewChrome = readPreviewChrome()): string {
  const params = new URLSearchParams({
    dark: chrome.dark ? '1' : '0',
    density: chrome.density || 'compact',
    accent: chrome.accent || 'blue',
  })
  const join = baseHref.includes('?') ? '&' : '?'
  return `${baseHref}${join}${params.toString()}`
}
