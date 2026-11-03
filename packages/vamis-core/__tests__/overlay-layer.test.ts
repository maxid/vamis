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
    ;(globalThis as { window?: { scrollY: number; scrollX: number; innerWidth: number } }).window = {
      scrollY: 100,
      scrollX: 5,
      innerWidth: 1280,
    }
    expect(overlayPosition(target, { gap: 2 })).toEqual({ top: 142, left: 25 })
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
})
