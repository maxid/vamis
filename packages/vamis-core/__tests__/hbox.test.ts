import { describe, expect, it } from 'vitest'
import {
  hboxColumnBody,
  hboxColumnStyle,
  hboxColumnVAlign,
  hboxColumnWidthMode,
  hboxGapToken,
  hboxHAlign,
  hboxVAlign,
} from '../src/utils/hbox'

describe('hboxGapToken', () => {
  it('defaults to xs like Amis defaultProps', () => {
    expect(hboxGapToken({})).toBe('xs')
  })

  it('keeps Amis gap tokens', () => {
    expect(hboxGapToken({ gap: 'none' })).toBe('none')
    expect(hboxGapToken({ gap: 'sm' })).toBe('sm')
    expect(hboxGapToken({ gap: 'base' })).toBe('base')
    expect(hboxGapToken({ gap: 'md' })).toBe('md')
    expect(hboxGapToken({ gap: 'lg' })).toBe('lg')
  })
})

describe('hboxHAlign / hboxVAlign', () => {
  it('keeps row align and valign', () => {
    expect(hboxHAlign({ align: 'center' })).toBe('center')
    expect(hboxHAlign({ align: 'between' })).toBe('between')
    expect(hboxHAlign({})).toBeUndefined()
    expect(hboxVAlign({ valign: 'middle' })).toBe('middle')
    expect(hboxColumnVAlign({ valign: 'bottom' })).toBe('bottom')
  })
})

describe('hboxColumnWidthMode', () => {
  it('uses equal-share when width is omitted', () => {
    expect(hboxColumnWidthMode({})).toBeUndefined()
  })

  it('marks auto and custom widths like Hbox-col--auto / --customWidth', () => {
    expect(hboxColumnWidthMode({ width: 'auto' })).toBe('auto')
    expect(hboxColumnWidthMode({ width: 120 })).toBe('custom')
    expect(hboxColumnWidthMode({ width: '30%' })).toBe('custom')
  })
})

describe('hboxColumnStyle', () => {
  it('puts width/height on the cell and lets style override', () => {
    expect(hboxColumnStyle({ width: 120, height: 40 })).toEqual({ width: 120, height: 40 })
    expect(hboxColumnStyle({ width: 120, style: { width: '30%' } })).toEqual({ width: '30%' })
  })
})

describe('hboxColumnBody', () => {
  it('uses body when present', () => {
    expect(hboxColumnBody({ body: { type: 'tpl', tpl: 'a' } })).toEqual([{ type: 'tpl', tpl: 'a' }])
  })

  it('renders a typed column as itself when body is missing', () => {
    expect(hboxColumnBody({ type: 'plain', text: 'Col A' })).toEqual([{ type: 'plain', text: 'Col A' }])
  })

  it('keeps string columns for SchemaRenderer', () => {
    expect(hboxColumnBody('Col B')).toEqual(['Col B'])
  })
})
