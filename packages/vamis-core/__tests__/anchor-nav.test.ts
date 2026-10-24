import { describe, expect, it } from 'vitest'
import { anchorNavActive, anchorNavHorizontal, anchorNavSections } from '../src/utils/anchor-nav'

const links = [
  { title: '基本信息', href: 'base', body: '基本信息内容' },
  { title: '工作信息', href: 'work', body: '工作信息内容', children: [{ title: '工作信息-1', href: 'work-1', body: '子内容' }] },
]

describe('anchorNavSections', () => {
  it('flattens links and children', () => {
    const sections = anchorNavSections({ links })
    expect(sections.map((row) => row.key)).toEqual(['base', 'work', 'work-1'])
    expect(sections[2].title).toBe('工作信息-1')
  })
})

describe('anchorNavActive / direction', () => {
  it('resolves href, index, and horizontal', () => {
    const sections = anchorNavSections({ links })
    expect(anchorNavActive({ active: 'work' }, sections)).toBe('work')
    expect(anchorNavActive({ active: 1 }, sections)).toBe('work')
    expect(anchorNavActive({}, sections)).toBe('base')
    expect(anchorNavHorizontal({ direction: 'horizontal' })).toBe(true)
    expect(anchorNavHorizontal({})).toBe(false)
  })
})
