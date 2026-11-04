import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  overlayContainerFrom,
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
    expect(vue).toContain("placement: 'auto'")
    expect(vue).toContain('ResizeObserver')
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
