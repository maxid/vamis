import { describe, expect, it } from 'vitest'
import { tplMaxLine, tplPlainText } from '../src/utils/tpl'

describe('tplMaxLine', () => {
  it('keeps positive integers and drops the rest', () => {
    expect(tplMaxLine({ maxLine: 2 })).toBe(2)
    expect(tplMaxLine({ maxLine: '3' })).toBe(3)
    expect(tplMaxLine({ maxLine: 0 })).toBe(0)
    expect(tplMaxLine({ maxLine: -1 })).toBe(0)
    expect(tplMaxLine({})).toBe(0)
  })
})

describe('tplPlainText', () => {
  it('strips tags for showNativeTitle', () => {
    expect(tplPlainText('<b>Hello</b> World')).toBe('Hello World')
    expect(tplPlainText('plain')).toBe('plain')
    expect(tplPlainText('')).toBe('')
  })
})
