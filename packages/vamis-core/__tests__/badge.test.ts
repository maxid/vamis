import { describe, expect, it } from 'vitest'
import {
  badgeDisplayText,
  badgeLevel,
  badgeMode,
  badgeOverflowCount,
  badgePosition,
  badgeSizePx,
  badgeText,
  badgeVisible,
} from '../src/utils/badge'

describe('badge visibility', () => {
  it('hides empty / zero text, and respects visibleOn / string expression', () => {
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
  it('defaults mode dot / position top-right / overflow 99, number shorthand is text', () => {
    expect(badgeMode({ badge: {} })).toBe('dot')
    expect(badgeMode({ badge: { mode: 'text' } })).toBe('text')
    expect(badgeMode({ badge: { mode: 'ribbon' } })).toBe('ribbon')
    expect(badgeMode({ badge: 3 })).toBe('text')
    expect(badgePosition({})).toBe('top-right')
    expect(badgeLevel({ badge: {} })).toBe('danger')
    expect(badgeLevel({ badge: { level: 'success' } })).toBe('success')
    expect(badgeOverflowCount({ badge: {} })).toBe(99)
    expect(badgeOverflowCount({ badge: { overflowCount: 9 } })).toBe(9)
    expect(badgeDisplayText({ badge: { mode: 'text', text: 10, overflowCount: 9 } })).toBe('9+')
    expect(badgeDisplayText({ badge: { mode: 'text', text: 10 } })).toBe('10')
    expect(badgeText({ badge: 3 })).toBe('3')
    expect(badgeSizePx({ badge: { mode: 'dot' } })).toBe(6)
    expect(badgeSizePx({ badge: { mode: 'text' } })).toBe(16)
    expect(badgeSizePx({ badge: { mode: 'ribbon' } })).toBe(12)
    expect(badgeSizePx({ badge: { size: 20 } })).toBe(20)
  })
})
