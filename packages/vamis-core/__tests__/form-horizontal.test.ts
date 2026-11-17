import { describe, expect, it } from 'vitest'
import {
  formHorizontalFromSchema,
  formHorizontalItemClass,
  formHorizontalLabelClass,
  formHorizontalOf,
  formHorizontalRate,
  formHorizontalValueClass,
  formLabelAlignOf,
  formLabelWidthCss,
} from '../src/utils/form-horizontal'

describe('formHorizontalRate', () => {
  it('reads col-sm-4 and numbers', () => {
    expect(formHorizontalRate('col-sm-4')).toBe(4)
    expect(formHorizontalRate(2)).toBe(2)
    expect(formHorizontalRate('10')).toBe(10)
    expect(formHorizontalRate(undefined)).toBe(0)
  })
})

describe('formHorizontalOf', () => {
  it('defaults to cxd leftFixed when neither side wrote horizontal', () => {
    expect(formHorizontalOf({})).toEqual({ leftFixed: true })
    expect(formHorizontalFromSchema({})).toEqual({ leftFixed: true })
  })

  it('lets the item override the form', () => {
    expect(formHorizontalOf({ horizontal: { left: 3, right: 9 } }, { leftFixed: true })).toEqual({
      left: 3,
      right: 9,
    })
    expect(formHorizontalOf({}, { left: 2, right: 10, offset: 2 })).toEqual({
      left: 2,
      right: 10,
      offset: 2,
    })
  })
})

describe('formHorizontal classes', () => {
  it('uses normal width when leftFixed is true', () => {
    expect(formHorizontalLabelClass({ leftFixed: true }, 'right')).toBe(
      'vamis-form-col--normal vamis-form-item__label--right',
    )
    expect(formHorizontalValueClass({ leftFixed: true })).toBe('')
  })

  it('uses xs|sm|md|lg token when leftFixed is a size', () => {
    expect(formHorizontalLabelClass({ leftFixed: 'sm' }, 'right')).toContain('vamis-form-col--sm')
  })

  it('uses 12-column flex when left/right are set', () => {
    const h = { left: 2, right: 10, offset: 2 }
    expect(formHorizontalLabelClass(h, 'right')).toBe('vamis-form-col--2 vamis-form-item__label--right')
    expect(formHorizontalValueClass(h)).toBe('')
    expect(formHorizontalValueClass({ left: 2, right: 8 })).toBe('vamis-form-col--8')
  })

  it('marks justify on the item', () => {
    expect(formHorizontalItemClass({ justify: true, left: 3, right: 9 })).toBe(
      'vamis-form-item--horizontal-justify',
    )
    expect(formHorizontalItemClass({ leftFixed: true })).toBe('')
  })
})

describe('formLabelAlignOf', () => {
  it('lets the item override the form, default right', () => {
    expect(formLabelAlignOf({}, undefined)).toBe('right')
    expect(formLabelAlignOf({}, 'left')).toBe('left')
    expect(formLabelAlignOf({ labelAlign: 'right' }, 'left')).toBe('right')
    expect(formLabelAlignOf({ labelAlign: 'inherit' }, 'left')).toBe('left')
  })
})

describe('formLabelWidthCss', () => {
  it('only emits item-level width', () => {
    expect(formLabelWidthCss({})).toBeUndefined()
    expect(formLabelWidthCss({ labelWidth: 200 })).toEqual({ width: '200px' })
    expect(formLabelWidthCss({ labelWidth: '80' })).toEqual({ width: '80px' })
    expect(formLabelWidthCss({ labelWidth: '10%' })).toEqual({ width: '10%' })
  })
})
