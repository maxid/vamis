import { describe, expect, it } from 'vitest'
import {
  dividerDirection,
  dividerHasTitle,
  dividerLineColor,
  dividerLineStyle,
  dividerTitlePosition,
  dividerTransform,
} from '../src/utils/divider'

describe('dividerLineStyle', () => {
  it('defaults to solid', () => {
    expect(dividerLineStyle({})).toBe('solid')
    expect(dividerLineStyle({ lineStyle: 'solid' })).toBe('solid')
  })

  it('keeps dashed', () => {
    expect(dividerLineStyle({ lineStyle: 'dashed' })).toBe('dashed')
  })
})

describe('dividerDirection', () => {
  it('defaults to horizontal', () => {
    expect(dividerDirection({})).toBe('horizontal')
    expect(dividerDirection({ direction: 'horizontal' })).toBe('horizontal')
  })

  it('keeps vertical', () => {
    expect(dividerDirection({ direction: 'vertical' })).toBe('vertical')
  })
})

describe('dividerTitlePosition', () => {
  it('defaults to center', () => {
    expect(dividerTitlePosition({})).toBe('center')
    expect(dividerTitlePosition({ titlePosition: 'center' })).toBe('center')
  })

  it('keeps left and right', () => {
    expect(dividerTitlePosition({ titlePosition: 'left' })).toBe('left')
    expect(dividerTitlePosition({ titlePosition: 'right' })).toBe('right')
  })
})

describe('dividerHasTitle', () => {
  it('is false without title', () => {
    expect(dividerHasTitle({})).toBe(false)
    expect(dividerHasTitle({ title: '' })).toBe(false)
  })

  it('is true with a title on a horizontal line', () => {
    expect(dividerHasTitle({ title: 'Text' })).toBe(true)
  })

  it('hides title on a vertical line', () => {
    expect(dividerHasTitle({ title: 'Text', direction: 'vertical' })).toBe(false)
  })
})

describe('dividerLineColor', () => {
  it('is empty when color is missing', () => {
    expect(dividerLineColor(undefined)).toEqual({})
  })

  it('sets borderColor for a plain color', () => {
    expect(dividerLineColor('#f00')).toEqual({ borderColor: '#f00' })
  })

  it('sets borderImage for a linear-gradient', () => {
    expect(dividerLineColor('linear-gradient(red, blue)')).toEqual({
      borderImage: 'linear-gradient(red, blue) 10',
    })
  })
})

describe('dividerTransform', () => {
  it('is empty without rotate', () => {
    expect(dividerTransform(undefined, undefined)).toBe('')
  })

  it('appends rotate degrees', () => {
    expect(dividerTransform(undefined, 15)).toBe(' rotate(15deg)')
  })

  it('keeps an existing transform then appends rotate', () => {
    expect(dividerTransform({ transform: 'scale(1)' }, 15)).toBe('scale(1) rotate(15deg)')
  })
})
