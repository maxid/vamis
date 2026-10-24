import { describe, expect, it } from 'vitest'
import { navLinks, navStacked } from '../src/utils/nav'

describe('navStacked', () => {
  it('defaults to stacked unless stacked is false or mode is horizontal', () => {
    expect(navStacked({})).toBe(true)
    expect(navStacked({ stacked: false })).toBe(false)
    expect(navStacked({ mode: 'horizontal' })).toBe(false)
  })
})

describe('navLinks', () => {
  it('reads links, source, nested children and skips hidden', () => {
    const links = navLinks({
      links: [
        { label: 'Nav 1', to: '/docs/index', active: true },
        { label: 'Nav 2', unfolded: true, children: [{ label: 'Nav 2-1', to: '/docs/api' }] },
        { label: '隐藏', visible: false, to: '/x' },
      ],
    })
    expect(links).toHaveLength(2)
    expect(links[0].active).toBe(true)
    expect(links[1].children?.[0].label).toBe('Nav 2-1')
    const fromSource = navLinks({ source: '${nav}' }, { name: 'Ada', nav: [{ label: '动态 ${name}' }] })
    expect(fromSource[0].label).toBe('动态 Ada')
  })
})
