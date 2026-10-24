import { describe, expect, it } from 'vitest'
import {
  gridColumnBody,
  gridColumnClass,
  gridColumnVAlign,
  gridGapToken,
  gridHAlign,
  gridVAlign,
} from '../src/utils/grid'

describe('gridColumnClass', () => {
  it('defaults to md equal-share like Amis Grid-col--md', () => {
    expect(gridColumnClass({})).toBe('md')
  })

  it('maps md 1–12 and skips 0', () => {
    expect(gridColumnClass({ md: 9 })).toBe('md9')
    expect(gridColumnClass({ md: 0 })).toBe('md')
  })

  it('keeps auto and stacked breakpoints in Amis order', () => {
    expect(gridColumnClass({ md: 'auto' })).toBe('mdAuto')
    expect(gridColumnClass({ xs: 12, sm: 6, md: 4, lg: 3 })).toBe('lg3 md4 sm6 xs12')
  })

  it('treats span as md when md is missing', () => {
    expect(gridColumnClass({ span: 4 })).toBe('md4')
  })
})

describe('gridGapToken', () => {
  it('keeps Amis gap tokens', () => {
    expect(gridGapToken({})).toBeUndefined()
    expect(gridGapToken({ gap: 'sm' })).toBe('sm')
    expect(gridGapToken({ gap: 'none' })).toBe('none')
  })
})

describe('gridHAlign / gridVAlign', () => {
  it('keeps row align and valign', () => {
    expect(gridHAlign({ align: 'center' })).toBe('center')
    expect(gridHAlign({ align: 'between' })).toBe('between')
    expect(gridVAlign({ valign: 'middle' })).toBe('middle')
    expect(gridColumnVAlign({ valign: 'bottom' })).toBe('bottom')
  })
})

describe('gridColumnBody', () => {
  it('uses body when present', () => {
    expect(gridColumnBody({ body: { type: 'tpl', tpl: 'a' } })).toEqual([{ type: 'tpl', tpl: 'a' }])
  })

  it('renders a typed column as itself when body is missing', () => {
    expect(gridColumnBody({ type: 'tpl', tpl: 'a' })).toEqual([{ type: 'tpl', tpl: 'a' }])
  })
})
