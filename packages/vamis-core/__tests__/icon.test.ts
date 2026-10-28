import { describe, expect, it } from 'vitest'
import { iconVendor, resolveIcon } from '../src/utils/icon'

describe('resolveIcon', () => {
  it('treats a path with a dot as url, matching Amis indexOf(".")', () => {
    expect(resolveIcon('https://suda.cdn.bcebos.com/diamond.svg')).toEqual({
      kind: 'url',
      src: 'https://suda.cdn.bcebos.com/diamond.svg',
    })
    expect(resolveIcon('plus.png')).toEqual({ kind: 'url', src: 'plus.png' })
    expect(resolveIcon('fa fa-plus')).toEqual({ kind: 'class', className: 'fa fa-plus' })
    expect(resolveIcon('')).toEqual({ kind: 'empty' })
  })

  it('renders inline svg and svg- sprite ids', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>'
    expect(resolveIcon(svg)).toEqual({ kind: 'svg', html: svg })
    expect(resolveIcon({ id: 'svg-cloud', svg: '<svg></svg>' })).toEqual({ kind: 'symbol', id: 'cloud' })
    expect(resolveIcon({ type: 'icon', icon: { id: 'svg-star' } })).toEqual({ kind: 'symbol', id: 'star' })
  })

  it('prefixes vendor fa / iconfont like Amis Icon', () => {
    expect(resolveIcon('cloud', { vendor: 'fa' })).toEqual({
      kind: 'class',
      className: 'cloud fa fa-cloud',
    })
    expect(resolveIcon('star', { vendor: 'iconfont' })).toEqual({
      kind: 'class',
      className: 'star iconfont icon-star',
    })
    expect(resolveIcon('fas fa-plus', { vendor: '' })).toEqual({
      kind: 'class',
      className: 'fas fa-plus',
    })
    expect(resolveIcon('fa fa-home', { vendor: 'fa' })).toEqual({
      kind: 'class',
      className: 'fa fa-home',
    })
  })
})

describe('iconVendor', () => {
  it('defaults only when vendor is omitted', () => {
    expect(iconVendor({}, 'fa')).toBe('fa')
    expect(iconVendor({ vendor: '' }, 'fa')).toBe('')
    expect(iconVendor({ vendor: 'iconfont' }, 'fa')).toBe('iconfont')
    expect(iconVendor({})).toBeUndefined()
  })
})
