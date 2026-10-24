import { describe, expect, it } from 'vitest'
import {
  paginationWrapperInputName,
  paginationWrapperItems,
  paginationWrapperLastPage,
  paginationWrapperLocals,
  paginationWrapperOutputName,
  paginationWrapperPagerSchema,
  paginationWrapperPerPage,
  paginationWrapperPosition,
  paginationWrapperSlice,
} from '../src/utils/pagination-wrapper'

describe('paginationWrapper names / perPage / position', () => {
  it('defaults like Amis PaginationStore / defaultProps', () => {
    expect(paginationWrapperInputName({})).toBe('items')
    expect(paginationWrapperOutputName({})).toBe('items')
    expect(paginationWrapperPerPage({})).toBe(10)
    expect(paginationWrapperPosition({})).toBe('top')
  })

  it('keeps configured names, perPage and position', () => {
    expect(paginationWrapperInputName({ inputName: 'rows' })).toBe('rows')
    expect(paginationWrapperOutputName({ outputName: 'rows' })).toBe('rows')
    expect(paginationWrapperPerPage({ perPage: 2 })).toBe(2)
    expect(paginationWrapperPosition({ position: 'bottom' })).toBe('bottom')
    expect(paginationWrapperPosition({ position: 'none' })).toBe('none')
  })

  it('falls empty names back to items, unknown position to top', () => {
    expect(paginationWrapperInputName({ inputName: '' })).toBe('items')
    expect(paginationWrapperOutputName({ outputName: '' })).toBe('items')
    expect(paginationWrapperPosition({ position: 'both' })).toBe('top')
  })
})

describe('paginationWrapperItems', () => {
  it('reads inputName from data, including nested paths', () => {
    expect(paginationWrapperItems({ items: [1, 2] }, 'items')).toEqual([1, 2])
    expect(paginationWrapperItems({ rows: ['a'] }, 'rows')).toEqual(['a'])
    expect(paginationWrapperItems({ foo: { bar: [9] } }, 'foo.bar')).toEqual([9])
  })

  it('returns [] when the field is missing or not an array', () => {
    expect(paginationWrapperItems({}, 'items')).toEqual([])
    expect(paginationWrapperItems({ items: { a: 1 } }, 'items')).toEqual([])
  })
})

describe('paginationWrapperLastPage / slice', () => {
  it('matches Amis store lastPage Math.ceil(length / perPage)', () => {
    expect(paginationWrapperLastPage(0, 10)).toBe(0)
    expect(paginationWrapperLastPage(5, 2)).toBe(3)
    expect(paginationWrapperLastPage(4, 2)).toBe(2)
  })

  it('slices the current page like store.locals', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    expect(paginationWrapperSlice(items, 1, 2)).toEqual(['a', 'b'])
    expect(paginationWrapperSlice(items, 2, 2)).toEqual(['c', 'd'])
    expect(paginationWrapperSlice(items, 3, 2)).toEqual(['e'])
    expect(paginationWrapperSlice(items, 0, 2)).toEqual(['a', 'b'])
  })
})

describe('paginationWrapperLocals', () => {
  it('overlays currentPage, lastPage and outputName', () => {
    expect(
      paginationWrapperLocals({
        page: 2,
        lastPage: 3,
        outputName: 'rows',
        items: ['c', 'd'],
      }),
    ).toEqual({
      currentPage: 2,
      lastPage: 3,
      rows: ['c', 'd'],
    })
  })
})

describe('paginationWrapperPagerSchema', () => {
  it('builds a pagination schema from the wrapper store', () => {
    expect(
      paginationWrapperPagerSchema(
        { mode: 'simple', maxButtons: 4, showPageInput: true, ellipsisPageGap: 3 },
        { page: 2, lastPage: 5, perPage: 2 },
      ),
    ).toEqual({
      type: 'pagination',
      activePage: 2,
      lastPage: 5,
      perPage: 2,
      mode: 'simple',
      ellipsisPageGap: 3,
      maxButtons: 4,
      showPageInput: true,
    })
  })
})
