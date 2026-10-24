import { describe, expect, it } from 'vitest'
import {
  flexAlignContent,
  flexAlignItems,
  flexDirection,
  flexItemStyle,
  flexJustify,
  flexLayoutStyle,
  flexResolvedSchema,
} from '../src/utils/flex'

describe('flexJustify', () => {
  it('defaults to center like Amis', () => {
    expect(flexJustify({})).toBe('center')
  })

  it('passes through flex-start / space-evenly / start', () => {
    expect(flexJustify({ justify: 'flex-start' })).toBe('flex-start')
    expect(flexJustify({ justify: 'space-evenly' })).toBe('space-evenly')
    expect(flexJustify({ justify: 'start' })).toBe('start')
  })
})

describe('flexAlignItems', () => {
  it('defaults to stretch like Amis defaultProps', () => {
    expect(flexAlignItems({})).toBe('stretch')
  })

  it('passes through center / flex-end', () => {
    expect(flexAlignItems({ alignItems: 'center' })).toBe('center')
    expect(flexAlignItems({ alignItems: 'flex-end' })).toBe('flex-end')
  })
})

describe('flexAlignContent', () => {
  it('defaults to center', () => {
    expect(flexAlignContent({})).toBe('center')
  })
})

describe('flexDirection', () => {
  it('defaults to row', () => {
    expect(flexDirection({})).toBe('row')
  })

  it('keeps column and reverse', () => {
    expect(flexDirection({ direction: 'column' })).toBe('column')
    expect(flexDirection({ direction: 'row-reverse' })).toBe('row-reverse')
  })
})

describe('flexLayoutStyle', () => {
  it('emits Amis inline flex style', () => {
    expect(flexLayoutStyle({})).toEqual({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      alignContent: 'center',
      width: '100%',
      height: '100%',
    })
  })
})

describe('flexResolvedSchema', () => {
  it('merges schema.mobile only on mobile', () => {
    const schema = { direction: 'row', mobile: { direction: 'column' } }
    expect(flexResolvedSchema(schema, false).direction).toBe('row')
    expect(flexResolvedSchema(schema, true).direction).toBe('column')
  })
})

describe('flexItemStyle', () => {
  it('is empty without flex / grow', () => {
    expect(flexItemStyle({})).toEqual({})
  })

  it('uses flex, otherwise grow', () => {
    expect(flexItemStyle({ flex: '1 1 0' })).toEqual({ flex: '1 1 0' })
    expect(flexItemStyle({ grow: 1 })).toEqual({ flexGrow: '1' })
  })
})
