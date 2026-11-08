import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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

describe('collapse renderer mobile', () => {
  it('uses VamisCaret and floats the arrow right under 768', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/Collapse.vue'), 'utf8')
    const group = readFileSync(resolve(here, '../../vamis/src/renderers/CollapseGroup.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(vue).toContain('VamisCaret')
    expect(vue).toContain('variant="tree"')
    expect(vue).toContain('vamis-collapse__arrow')
    expect(group).toContain('vamis-collapse-group')
    expect(css).toContain('@media (max-width: 767px)')
    expect(css).toContain('.vamis-collapse__arrow')
    expect(css).toContain('order: 2')
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
