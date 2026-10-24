import { describe, expect, it } from 'vitest'
import { wrapperBody, wrapperPaddingToken, wrapperSize, wrapperWrap } from '../src/utils/wrapper'

describe('wrapperSize', () => {
  it('defaults to md like Amis, and none is a real size', () => {
    expect(wrapperSize({})).toBe('md')
    expect(wrapperSize({ size: 'xs' })).toBe('xs')
    expect(wrapperSize({ size: 'none' })).toBe('none')
    expect(wrapperSize({ size: 'nope' })).toBe('md')
  })
})

describe('wrapperPaddingToken', () => {
  it('maps size to --gap-* and skips none', () => {
    expect(wrapperPaddingToken({})).toBe('var(--gap-md)')
    expect(wrapperPaddingToken({ size: 'xs' })).toBe('var(--gap-xs)')
    expect(wrapperPaddingToken({ size: 'none' })).toBeUndefined()
  })
})

describe('wrapperWrap / wrapperBody', () => {
  it('unwraps when wrap is false and keeps body nodes', () => {
    expect(wrapperWrap({})).toBe(true)
    expect(wrapperWrap({ wrap: false })).toBe(false)
    expect(wrapperBody({ body: '内容' })).toEqual(['内容'])
    expect(wrapperBody({ body: [{ type: 'tpl', tpl: 'a' }] })).toHaveLength(1)
  })
})
