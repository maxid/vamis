import { describe, expect, it } from 'vitest'
import {
  paginationActivePage,
  paginationEllipsisGap,
  paginationLastPage,
  paginationLayout,
  paginationMaxButtons,
  paginationMode,
  paginationNum,
  paginationPagerItems,
  paginationPerPage,
  paginationPerPageAvailable,
  paginationSize,
} from '../src/utils/pagination'

describe('paginationNum', () => {
  it('keeps finite numbers and parses digit strings', () => {
    expect(paginationNum(7)).toBe(7)
    expect(paginationNum('12')).toBe(12)
    expect(paginationNum('x', 3)).toBe(3)
    expect(paginationNum(undefined, 1)).toBe(1)
  })
})

describe('paginationMode / paginationSize', () => {
  it('defaults to normal / md', () => {
    expect(paginationMode({})).toBe('normal')
    expect(paginationSize({})).toBe('md')
  })

  it('keeps simple and sm', () => {
    expect(paginationMode({ mode: 'simple' })).toBe('simple')
    expect(paginationSize({ size: 'sm' })).toBe('sm')
  })
})

describe('paginationLastPage', () => {
  it('recomputes from total / perPage like Amis', () => {
    expect(paginationLastPage({ total: 999, perPage: 10, lastPage: 99999 }, 10, 2)).toBe(100)
  })

  it('falls back to lastPage, hasNext, then activePage', () => {
    expect(paginationLastPage({ lastPage: 8 }, 10, 1)).toBe(8)
    expect(paginationLastPage({ hasNext: true }, 10, 2)).toBe(3)
    expect(paginationLastPage({}, 10, 4)).toBe(4)
  })
})

describe('paginationLayout', () => {
  it('defaults to pager and is case-insensitive', () => {
    expect(paginationLayout({})).toEqual(['pager'])
    expect(paginationLayout({ layout: 'total,perPage,pager,go' })).toEqual(['total', 'perpage', 'pager', 'go'])
  })

  it('always includes pager and honors showPerPage / showPageInput', () => {
    expect(paginationLayout({ layout: 'total,go' })).toEqual(['pager', 'total', 'go'])
    expect(paginationLayout({ showPerPage: true, showPageInput: true })).toEqual(['perpage', 'pager', 'go'])
  })
})

describe('paginationMaxButtons / ellipsis / perPage', () => {
  it('uses Amis defaults', () => {
    expect(paginationMaxButtons({})).toBe(5)
    expect(paginationMaxButtons({ maxButtons: 7 })).toBe(7)
    expect(paginationEllipsisGap({})).toBe(5)
    expect(paginationEllipsisGap({ ellipsisPageGap: 0 })).toBe(5)
    expect(paginationPerPage({})).toBe(10)
    expect(paginationActivePage({})).toBe(1)
    expect(paginationPerPageAvailable({})).toEqual([10, 20, 50, 100])
    expect(paginationPerPageAvailable({ perPageAvailable: [2, 11, 0, 37] })).toEqual([2, 11, 37])
  })
})

describe('paginationPagerItems', () => {
  it('lists every page when lastPage fits maxButtons', () => {
    const items = paginationPagerItems({ activePage: 2, lastPage: 4, maxButtons: 5 })
    expect(items.map((item) => (item.kind === 'page' ? item.page : item.kind))).toEqual([
      'prev',
      1,
      2,
      3,
      4,
      'next',
    ])
    expect(items.find((item) => item.kind === 'prev')).toMatchObject({ disabled: false })
    expect(items.find((item) => item.kind === 'next')).toMatchObject({ disabled: false })
  })

  it('puts trailing ellipsis near the start', () => {
    const items = paginationPagerItems({ activePage: 2, lastPage: 12, maxButtons: 7 })
    expect(items.map((item) => (item.kind === 'page' ? item.page : item.kind === 'ellipsis' ? `${item.dir}-ellipsis` : item.kind))).toEqual([
      'prev',
      1,
      2,
      3,
      4,
      5,
      'forward-ellipsis',
      12,
      'next',
    ])
  })

  it('puts leading ellipsis near the end', () => {
    const items = paginationPagerItems({ activePage: 20, lastPage: 20, maxButtons: 7 })
    expect(items.some((item) => item.kind === 'ellipsis' && item.dir === 'backward')).toBe(true)
    expect(items.filter((item) => item.kind === 'page').map((item) => item.page).at(-1)).toBe(20)
  })

  it('jumps ellipsis by ellipsisPageGap', () => {
    const items = paginationPagerItems({ activePage: 1, lastPage: 10, maxButtons: 7, ellipsisPageGap: 7 })
    const ellipsis = items.find((item) => item.kind === 'ellipsis')
    expect(ellipsis).toMatchObject({ kind: 'ellipsis', dir: 'forward', page: 8 })
  })
})
