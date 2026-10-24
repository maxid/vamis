import { describe, expect, it } from 'vitest'
import {
  collapseItemKey,
  normalizeActiveKeys,
  standaloneCollapsed,
  toggleCollapse,
} from '../src/utils/collapse'

describe('normalizeActiveKeys', () => {
  it('wraps a scalar and stringifies', () => {
    expect(normalizeActiveKeys(1)).toEqual(['1'])
    expect(normalizeActiveKeys('2')).toEqual(['2'])
  })

  it('keeps an array of keys', () => {
    expect(normalizeActiveKeys(['1', 2])).toEqual(['1', '2'])
  })

  it('is empty when missing', () => {
    expect(normalizeActiveKeys(undefined)).toEqual([])
    expect(normalizeActiveKeys(null)).toEqual([])
  })

  it('accordion keeps only the first key', () => {
    expect(normalizeActiveKeys(['1', '2'], true)).toEqual(['1'])
  })
})

describe('collapseItemKey', () => {
  it('prefers schema.key then index', () => {
    expect(collapseItemKey({ key: 'a' }, 3)).toBe('a')
    expect(collapseItemKey({}, 2)).toBe('2')
  })
})

describe('standaloneCollapsed', () => {
  it('defaults to collapsed', () => {
    expect(standaloneCollapsed({})).toBe(true)
  })

  it('opens when collapsed is false or active is true', () => {
    expect(standaloneCollapsed({ collapsed: false })).toBe(false)
    expect(standaloneCollapsed({ active: true })).toBe(false)
  })
})

describe('toggleCollapse', () => {
  it('opens a closed panel and closes an open one', () => {
    expect(toggleCollapse(['1'], '2', false)).toEqual({ activeKeys: ['1', '2'], collapsed: false })
    expect(toggleCollapse(['1', '2'], '1', false)).toEqual({ activeKeys: ['2'], collapsed: true })
  })

  it('accordion opens one and clears the rest', () => {
    expect(toggleCollapse(['1'], '2', true)).toEqual({ activeKeys: ['2'], collapsed: false })
    expect(toggleCollapse(['1'], '1', true)).toEqual({ activeKeys: [], collapsed: true })
  })
})
