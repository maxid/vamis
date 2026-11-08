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

/**
 * 移动端 PopUp（底部滑入）开关。schema / env 显式 `mobileUI` 优先；
 * 否则 `matchMedia('(max-width: 768px)')`，对齐 Amis `isMobile()`。
 * 对照桌面 iframe ~768 / 1100 不进 PopUp；`?vp=mobile` 靠 env.mobileUI。
 */
export function overlayIsMobile(
  schema?: { mobileUI?: unknown } | null,
  env?: { mobileUI?: unknown } | null,
): boolean {
  if (schema?.mobileUI === true) return true
  if (schema?.mobileUI === false) return false
  if (env?.mobileUI === true) return true
  if (env?.mobileUI === false) return false
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(max-width: 768px)').matches
}

export type OverlayCoords = { top: number; left: number }

/**
 * Amis Overlay `placement: auto` 试探顺序（DatePicker 默认）。
 * `atX-atY-myX-myY`：触发器锚点 → 浮层锚点。下左 → 下右 → 上左 → 上右。
 */
export const OVERLAY_AUTO_PLACEMENTS = [
  'left-bottom-left-top',
  'right-bottom-right-top',
  'left-top-left-bottom',
  'right-top-right-bottom',
] as const

/** Amis `PopOver--v-top { margin-top: 4px }` / `--v-bottom { margin-bottom: 4px }`。auto 只上下翻。 */
export const OVERLAY_POPOVER_GAP = 4

export type OverlayPositionOpts = {
  gap?: number
  width?: number
  height?: number
  placement?: string
  offset?: [number, number]
}

function viewSize(): { scrollX: number; scrollY: number; viewW: number; viewH: number } {
  if (typeof window === 'undefined') {
    return { scrollX: 0, scrollY: 0, viewW: Number.POSITIVE_INFINITY, viewH: Number.POSITIVE_INFINITY }
  }
  return {
    scrollX: window.scrollX || 0,
    scrollY: window.scrollY || 0,
    viewW: window.innerWidth || Number.POSITIVE_INFINITY,
    viewH: window.innerHeight || Number.POSITIVE_INFINITY,
  }
}

function anchor(at: string, start: number, size: number): number {
  if (at === 'right' || at === 'bottom') return start + size
  if (at === 'center') return start + size / 2
  return start
}

function overlayOffset(my: string, size: number): number {
  if (my === 'right' || my === 'bottom') return size
  if (my === 'center') return size / 2
  return 0
}

function coordsForPlacement(
  placement: string,
  child: { left: number; top: number; width: number; height: number },
  overlayW: number,
  overlayH: number,
  gap: number,
): OverlayCoords {
  const [atX, atY, myX = atX, myY = atY] = placement.split('-')
  let left = anchor(atX, child.left, child.width) - overlayOffset(myX, overlayW)
  let top = anchor(atY, child.top, child.height) - overlayOffset(myY, overlayH)
  if (myY === 'top') top += gap
  else if (myY === 'bottom') top -= gap
  else if (myX === 'left') left += gap
  else if (myX === 'right') left -= gap
  return { top, left }
}

function fullyVisible(coords: OverlayCoords, overlayW: number, overlayH: number, viewW: number, viewH: number, scrollX: number, scrollY: number) {
  const x = coords.left - scrollX
  const y = coords.top - scrollY
  const visibleX = !overlayW || (x >= 0 && x + overlayW < viewW)
  const visibleY = !overlayH || (y >= 0 && y + overlayH < viewH)
  return { visibleX, visibleY, ok: visibleX && visibleY }
}

/**
 * 所有非 embed 弹层的定位准则，对齐 Amis `calculatePosition` + `placement: auto`。
 * page 坐标，配合 `position:absolute` 挂到 body。
 */
export function overlayPosition(target: HTMLElement, opts?: OverlayPositionOpts): OverlayCoords {
  const gap = opts?.gap ?? OVERLAY_POPOVER_GAP
  const r = target.getBoundingClientRect()
  const { scrollX, scrollY, viewW, viewH } = viewSize()
  const overlayW = opts?.width || 0
  const overlayH = opts?.height || 0
  const child = {
    left: r.left + scrollX,
    top: r.top + scrollY,
    width: r.width,
    height: r.height,
  }
  const ox = Number(opts?.offset?.[0]) || 0
  const oy = Number(opts?.offset?.[1]) || 0
  const shift = (c: OverlayCoords): OverlayCoords =>
    ox || oy ? { top: c.top + oy, left: c.left + ox } : c

  const placement = opts?.placement && opts.placement !== 'auto' ? opts.placement : 'auto'
  const tests =
    placement === 'auto'
      ? [...OVERLAY_AUTO_PLACEMENTS]
      : placement.split(/\s+/).filter(Boolean)

  let visible: { atX?: string; atY?: string; myX?: string; myY?: string } = {}
  let coords: OverlayCoords = coordsForPlacement(tests[0] || OVERLAY_AUTO_PLACEMENTS[0], child, overlayW, overlayH, gap)

  for (let i = 0; i < tests.length; i += 1) {
    const current = tests[i]
    coords = coordsForPlacement(current, child, overlayW, overlayH, gap)
    const { visibleX, visibleY, ok } = fullyVisible(coords, overlayW, overlayH, viewW, viewH, scrollX, scrollY)
    const [atX, atY, myX = atX, myY = atY] = current.split('-')
    if (visibleX) {
      visible.atX ??= atX
      visible.myX ??= myX
    }
    if (visibleY) {
      visible.atY ??= atY
      visible.myY ??= myY
    }
    if (ok) return shift(coords)

    const last = i === tests.length - 1
    if (!last) continue

    const fallback = [
      visible.atX || 'left',
      visible.atY || 'bottom',
      visible.myX || 'left',
      visible.myY || 'top',
    ].join('-')
    coords = coordsForPlacement(fallback, child, overlayW, overlayH, gap)
    const still = fullyVisible(coords, overlayW, overlayH, viewW, viewH, scrollX, scrollY)
    if (still.ok) return shift(coords)
    const triggerOnScreen = r.bottom > 0 && r.top < viewH && r.right > 0 && r.left < viewW
    if (triggerOnScreen) {
      if (!still.visibleY && overlayH) {
        coords = { ...coords, top: scrollY + Math.max(10, viewH - overlayH) - 10 }
      }
      if (!still.visibleX && overlayW) {
        coords = { ...coords, left: scrollX + Math.max(10, viewW - overlayW) }
      }
    }
    return shift(coords)
  }

  return shift(coords)
}
