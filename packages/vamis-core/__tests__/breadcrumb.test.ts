import { describe, expect, it } from 'vitest'
import {
  breadcrumbDisplayLabel,
  breadcrumbItems,
  breadcrumbLabelMaxLength,
  breadcrumbSeparator,
} from '../src/utils/breadcrumb'

describe('breadcrumbItems', () => {
  it('prefers items then source, and interpolates labels', () => {
    expect(breadcrumbItems({})).toEqual([])
    expect(breadcrumbItems({ items: [{ label: '首页' }] })[0].label).toBe('首页')
    const fromSource = breadcrumbItems(
      { source: '${breadcrumb}' },
      { name: 'Ada', breadcrumb: [{ label: '首页 ${name}', href: '/${name}' }] },
    )
    expect(fromSource[0].label).toBe('首页 Ada')
    expect(fromSource[0].href).toBe('/Ada')
  })
})

describe('breadcrumbSeparator / labelMaxLength', () => {
  it('defaults separator to > and max length to 16', () => {
    expect(breadcrumbSeparator({})).toBe('>')
    expect(breadcrumbSeparator({ separator: '/' })).toBe('/')
    expect(breadcrumbLabelMaxLength({})).toBe(16)
    expect(breadcrumbLabelMaxLength({ labelMaxLength: 8 })).toBe(8)
  })
})

describe('breadcrumbDisplayLabel', () => {
  it('ellipsis only middle items longer than max', () => {
    const long = '上级页面上级页面上级页面上级页面上级页面'
    expect(breadcrumbDisplayLabel({ label: long }, 0, 3, 16).text).toBe(long)
    expect(breadcrumbDisplayLabel({ label: long }, 1, 3, 16).text).toBe(`${long.slice(0, 16)}...`)
    expect(breadcrumbDisplayLabel({ label: long }, 1, 3, 16).title).toBe(long)
    expect(breadcrumbDisplayLabel({ label: '当前页面' }, 2, 3, 16).text).toBe('当前页面')
  })
})
