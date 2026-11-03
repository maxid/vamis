/** 浮层容器 / 定位。对齐 Amis Overlay + getModalContainer，不搬 cxd-。 */

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 900,
  fixed: 1200,
  modal: 1400,
  popover: 1400,
  contextmenu: 1500,
  tooltip: 1600,
  toast: 2000,
} as const

export type OverlayContainer =
  | string
  | HTMLElement
  | (() => HTMLElement | undefined | null)
  | null
  | undefined

export function resolveOverlayContainer(input?: OverlayContainer): string | HTMLElement {
  if (typeof input === 'string' && input.trim()) return input.trim()
  if (typeof input === 'function') {
    try {
      const el = input()
      if (el) return el
    } catch {
      /* fall through */
    }
  }
  if (input && typeof input === 'object' && 'nodeType' in input) return input
  return 'body'
}

/** schema.popOverContainerSelector > env.getModalContainer > body。 */
export function overlayContainerFrom(
  schema?: { popOverContainerSelector?: unknown },
  env?: { getModalContainer?: () => HTMLElement | undefined },
): string | HTMLElement {
  const sel = schema?.popOverContainerSelector
  if (typeof sel === 'string' && sel.trim()) return sel.trim()
  return resolveOverlayContainer(env?.getModalContainer)
}

export type OverlayCoords = { top: number; left: number }

/** 触发器下方起点。page 坐标，配合 position:absolute 挂到 body。 */
export function overlayPosition(
  target: HTMLElement,
  opts?: { gap?: number; width?: number },
): OverlayCoords {
  const gap = opts?.gap ?? 2
  const r = target.getBoundingClientRect()
  const scrollY = typeof window === 'undefined' ? 0 : window.scrollY
  const scrollX = typeof window === 'undefined' ? 0 : window.scrollX
  const viewW = typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerWidth
  const top = r.bottom + scrollY + gap
  let left = r.left + scrollX
  const width = opts?.width
  if (width && left + width > scrollX + viewW - 8) {
    left = Math.max(scrollX + 8, scrollX + viewW - width - 8)
  }
  return { top, left }
}
