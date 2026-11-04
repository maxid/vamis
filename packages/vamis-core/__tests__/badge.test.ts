import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  badgeDisplayText,
  badgeLevel,
  badgeMode,
  badgeOffsetStyle,
  badgeOverflowCount,
  badgePosition,
  badgeRibbonOutSize,
  badgeSizePx,
  badgeText,
  badgeVisible,
  hasBadge,
} from '../src/utils/badge'

describe('badge visibility', () => {
  it('hides empty / zero text, and respects visibleOn / string expression', () => {
    expect(hasBadge({})).toBe(false)
    expect(badgeVisible({})).toBe(false)
    expect(badgeVisible({ badge: false })).toBe(false)
    expect(badgeVisible({ badge: { mode: 'dot' } })).toBe(true)
    expect(badgeVisible({ badge: { mode: 'text', text: 0 } })).toBe(false)
    expect(badgeVisible({ badge: { mode: 'text', text: 10 } })).toBe(true)
    expect(badgeVisible({ badge: { visibleOn: 'this.myData > 1' } }, { myData: 10 })).toBe(true)
    expect(badgeVisible({ badge: { visibleOn: 'this.myData > 1' } }, { myData: 0 })).toBe(false)
    expect(badgeVisible({ badge: 'this.myData > 1' }, { myData: 10 })).toBe(true)
    expect(badgeVisible({ badge: 'this.myData > 10' }, { myData: 10 })).toBe(false)
  })
})

describe('badge display', () => {
  it('defaults mode dot / position top-right / overflow 99; number shorthand is dot', () => {
    expect(badgeMode({ badge: {} })).toBe('dot')
    expect(badgeMode({ badge: { mode: 'text' } })).toBe('text')
    expect(badgeMode({ badge: { mode: 'ribbon' } })).toBe('ribbon')
    expect(badgeMode({ badge: 3 })).toBe('dot')
    expect(hasBadge({ badge: 3 })).toBe(true)
    expect(badgeText({ badge: 3 })).toBe('')
    expect(badgePosition({})).toBe('top-right')
    expect(badgeLevel({ badge: {} })).toBe('danger')
    expect(badgeLevel({ badge: { level: 'success' } })).toBe('success')
    expect(badgeOverflowCount({ badge: {} })).toBe(99)
    expect(badgeOverflowCount({ badge: { overflowCount: 9 } })).toBe(9)
    expect(badgeDisplayText({ badge: { mode: 'text', text: 10, overflowCount: 9 } })).toBe('9+')
    expect(badgeDisplayText({ badge: { mode: 'text', text: 10 } })).toBe('10')
    expect(badgeDisplayText({ badge: { mode: 'text', text: '${myData}' } }, { myData: 10 })).toBe('10')
    expect(badgeSizePx({ badge: { mode: 'dot' } })).toBe(6)
    expect(badgeSizePx({ badge: { mode: 'text' } })).toBe(16)
    expect(badgeSizePx({ badge: { mode: 'ribbon' } })).toBe(12)
    expect(badgeSizePx({ badge: { size: 20 } })).toBe(20)
    expect(badgeRibbonOutSize({ badge: { mode: 'ribbon' } })).toBe(12 * Math.SQRT2 + 5)
    expect(badgeOffsetStyle({ badge: { offset: [10, 10] } })).toEqual({
      transform: 'translate(calc(50% + 10px), calc(-50% + 10px))',
    })
    expect(badgeOffsetStyle({ badge: {} })).toEqual({})
  })
})

describe('badge overlay skin', () => {
  it('uses --badge-* tokens, ribbon overflow clip, and cxd dot keyframes', () => {
    const host = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis/src/renderers/BadgeHost.vue'),
      'utf8',
    )
    expect(host).toContain('vamis-badge')
    expect(host).toContain('vamis-badge__ribbon-out')
    expect(host).toContain('vamis-badge__anim')
    expect(host).not.toContain('inline-flex')
    expect(host).not.toContain('animate-ping')
    expect(host).not.toContain('rotate-45')
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis-ui/src/styles.css'),
      'utf8',
    )
    expect(css).toContain('--badge-size: var(--gap-md)')
    expect(css).toContain('background: var(--badge-danger-bg)')
    expect(css).toContain('width: var(--badge-ribbon-width)')
    expect(css).toContain('@keyframes vamis-badge-dot')
    expect(css).toContain('scale(3.2)')
    expect(css).not.toMatch(/\.vamis-badge__text[^{]*\{[^}]*content-box/)
  })
})
