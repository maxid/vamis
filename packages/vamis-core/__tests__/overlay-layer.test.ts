import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  OVERLAY_AUTO_PLACEMENTS,
  OVERLAY_POPOVER_GAP,
  overlayContainerFrom,
  overlayIsMobile,
  overlayPosition,
  resolveOverlayContainer,
  Z_INDEX,
} from '../src/utils/overlay-layer'

describe('overlay-layer', () => {
  it('matches Amis z-index ladder', () => {
    expect(Z_INDEX.dropdown).toBe(1000)
    expect(Z_INDEX.modal).toBe(1400)
    expect(Z_INDEX.popover).toBe(1400)
    expect(Z_INDEX.tooltip).toBe(1600)
    expect(Z_INDEX.toast).toBe(2000)
  })

  it('resolves selector, element, getter, then body', () => {
    expect(resolveOverlayContainer('#host')).toBe('#host')
    expect(resolveOverlayContainer('  .modal  ')).toBe('.modal')
    const node = { nodeType: 1 } as HTMLElement
    expect(resolveOverlayContainer(node)).toBe(node)
    expect(resolveOverlayContainer(() => node)).toBe(node)
    expect(resolveOverlayContainer(() => undefined)).toBe('body')
    expect(resolveOverlayContainer()).toBe('body')
  })

  it('prefers popOverContainerSelector over getModalContainer', () => {
    const box = { nodeType: 1 } as HTMLElement
    expect(
      overlayContainerFrom({ popOverContainerSelector: '#date-host' }, { getModalContainer: () => box }),
    ).toBe('#date-host')
    expect(overlayContainerFrom({}, { getModalContainer: () => box })).toBe(box)
    expect(overlayContainerFrom({})).toBe('body')
  })

  it('defaults dropdown popover gap to 4px and only flips above/below', () => {
    const target = {
      getBoundingClientRect: () => ({ top: 10, bottom: 40, left: 20, right: 120, width: 100, height: 30 }),
    } as HTMLElement
    stubViewport({ scrollY: 100, scrollX: 5, innerWidth: 1280, innerHeight: 800 })
    expect(OVERLAY_POPOVER_GAP).toBe(4)
    expect(overlayPosition(target)).toEqual({ top: 144, left: 25 })
    expect(OVERLAY_AUTO_PLACEMENTS).toEqual([
      'left-bottom-left-top',
      'right-bottom-right-top',
      'left-top-left-bottom',
      'right-top-right-bottom',
    ])
    expect(OVERLAY_AUTO_PLACEMENTS.every((item) => item.split('-')[1] === 'bottom' || item.split('-')[1] === 'top')).toBe(
      true,
    )
  })

  it('places the layer below the trigger in page coordinates', () => {
    const target = {
      getBoundingClientRect: () => ({ top: 10, bottom: 40, left: 20, right: 120, width: 100, height: 30 }),
    } as HTMLElement
    stubViewport({ scrollY: 100, scrollX: 5, innerWidth: 1280, innerHeight: 800 })
    expect(overlayPosition(target, { gap: 2 })).toEqual({ top: 142, left: 25 })
  })

  it('keeps auto placement below-left when the viewport has room', () => {
    const target = rect(40, 20, 200, 32)
    stubViewport({ scrollY: 80, scrollX: 0, innerWidth: 1280, innerHeight: 900 })
    expect(overlayPosition(target, { gap: 2, width: 242, height: 292 })).toEqual({ top: 154, left: 20 })
  })

  it('flips above-left when remaining viewport below the trigger is shorter than the layer', () => {
    const target = rect(400, 20, 200, 32)
    stubViewport({ scrollY: 0, scrollX: 0, innerWidth: 1280, innerHeight: 500 })
    expect(overlayPosition(target, { gap: 2, width: 242, height: 292 })).toEqual({ top: 106, left: 20 })
  })

  it('tries below-right before flipping when the layer overflows the right edge', () => {
    const target = rect(40, 1100, 160, 32)
    stubViewport({ scrollY: 0, scrollX: 0, innerWidth: 1280, innerHeight: 900 })
    expect(overlayPosition(target, { gap: 2, width: 242, height: 292 })).toEqual({ top: 74, left: 1018 })
  })

  it('clamps 10px from the viewport when no auto direction fully fits', () => {
    const target = rect(40, 20, 100, 32)
    stubViewport({ scrollY: 50, scrollX: 0, innerWidth: 200, innerHeight: 120 })
    expect(overlayPosition(target, { gap: 2, width: 242, height: 292 })).toEqual({ top: 50, left: 10 })
  })

  it('follows an off-screen trigger instead of pinning to the viewport bottom', () => {
    const target = rect(-400, 20, 200, 32)
    stubViewport({ scrollY: 0, scrollX: 0, innerWidth: 1280, innerHeight: 800 })
    const pos = overlayPosition(target, { gap: 4, width: 300, height: 200 })
    expect(pos.top).toBeLessThan(0)
    expect(pos.top).not.toBe(590)
    expect(pos.left).toBe(20)
  })

  it('writes Amis z-index tokens and overlay class into styles.css', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--z-dropdown: 1000')
    expect(css).toContain('--z-modal: 1400')
    expect(css).toContain('--z-popover: 1400')
    expect(css).toContain('.vamis-overlay {')
    expect(css).toContain('z-index: var(--z-dropdown, 1000)')
    const popover = css.slice(css.indexOf('.vamis-date-picker__popover {'), css.indexOf('.vamis-date-picker__shortcuts'))
    expect(popover).not.toContain('z-index: 20')
    expect(popover).not.toContain('position: absolute')
    const sheet = css.slice(css.indexOf('.vamis-date-sheet {'), css.indexOf('.vamis-date-sheet__mask'))
    expect(sheet).toContain('z-index: var(--z-modal)')
    expect(sheet).toContain('position: fixed')
    const panel = css.slice(css.indexOf('.vamis-date-sheet__panel {'), css.indexOf('.vamis-date-sheet__bar'))
    expect(panel).toContain('height: 320px')
    expect(panel).toContain('border: 1px solid var(--border)')
    expect(css).toContain('@keyframes vamis-date-sheet-in')
    expect(css).toContain('@keyframes vamis-date-sheet-out')
    expect(css).toContain('animation-name: vamis-date-sheet-in')
    const popup = css.slice(css.indexOf('.vamis-popup {'), css.indexOf('.vamis-popup > *'))
    expect(popup).toContain('z-index: var(--z-modal)')
    expect(popup).toContain('position: fixed')
    expect(popup).toContain('height: var(--vamis-popup-height, 400px)')
    expect(popup).toContain('border: 1px solid var(--border)')
    expect(popup).toContain('background: var(--select-menu-bg)')
    expect(popup).not.toContain('inset: 0')
    expect(css).toContain('.vamis-popup.is-in {\n    animation-name: vamis-date-sheet-in')
    expect(css).toContain('position: fixed !important')
    expect(css).toContain('box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15)')
    const popupBody = css.slice(css.indexOf('.vamis-popup__body {'), css.indexOf('.vamis-popup__picker {'))
    expect(popupBody).toContain('justify-content: flex-start')
    expect(popupBody).not.toContain('justify-content: center')
  })

  it('overlayIsMobile honors schema/env mobileUI before the 768 viewport', () => {
    expect(overlayIsMobile({ mobileUI: true })).toBe(true)
    expect(overlayIsMobile({ mobileUI: false }, { mobileUI: true })).toBe(false)
    expect(overlayIsMobile({}, { mobileUI: true })).toBe(true)
    expect(overlayIsMobile({}, { mobileUI: false })).toBe(false)
  })

  it('VamisPopUp is the shared bottom sheet shell', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const popup = readFileSync(resolve(here, '../../vamis/src/overlay/VamisPopUp.vue'), 'utf8')
    expect(popup).toContain('class="vamis-popup"')
    expect(popup).toContain("'is-in': phase === 'in'")
    expect(popup).toContain("'is-out': phase === 'out'")
    expect(popup).toContain('取消')
    expect(popup).toContain('确认')
    expect(popup).toContain('Teleport')
    expect(popup).toContain('@animationend')
    expect(popup).toContain('POPUP_DEFAULT_HEIGHT')
    expect(popup).toContain('heightStyle')
  })

  it('places a top / right tooltip with side gap', () => {
    const target = rect(40, 20, 200, 32)
    stubViewport({ scrollY: 0, scrollX: 0, innerWidth: 1280, innerHeight: 900 })
    expect(overlayPosition(target, { gap: 8, width: 100, height: 30, placement: 'center-top-center-bottom' })).toEqual({
      top: 2,
      left: 70,
    })
    expect(overlayPosition(target, { gap: 8, width: 100, height: 30, placement: 'right-center-left-center' })).toEqual({
      top: 41,
      left: 228,
    })
    expect(
      overlayPosition(target, {
        gap: 8,
        width: 100,
        height: 30,
        placement: 'center-top-center-bottom',
        offset: [10, -4],
      }),
    ).toEqual({ top: -2, left: 80 })
  })

  it('VamisOverlay feeds overlay size into auto placement', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis/src/overlay/VamisOverlay.vue'), 'utf8')
    expect(vue).toContain('height: layer?.offsetHeight')
    expect(vue).toContain('OVERLAY_POPOVER_GAP')
    expect(vue).toContain("placement: 'auto'")
    expect(vue).toContain('ResizeObserver')
    expect(vue).toContain('targetObserver')
    expect(vue).toContain("visibility: ready ? 'visible' : 'hidden'")
  })
})

function rect(top: number, left: number, width: number, height: number): HTMLElement {
  return {
    getBoundingClientRect: () => ({
      top,
      left,
      width,
      height,
      bottom: top + height,
      right: left + width,
    }),
  } as HTMLElement
}

function stubViewport(view: { scrollY: number; scrollX: number; innerWidth: number; innerHeight: number }) {
  ;(globalThis as { window?: typeof view }).window = view
}
