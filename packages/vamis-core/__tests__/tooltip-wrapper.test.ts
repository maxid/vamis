import { describe, expect, it } from 'vitest'
import {
  tooltipBody,
  tooltipContent,
  tooltipEnterable,
  tooltipInline,
  tooltipMouseEnterDelay,
  tooltipMouseLeaveDelay,
  tooltipOffset,
  tooltipPlacement,
  tooltipRootClose,
  tooltipShowArrow,
  tooltipTheme,
  tooltipTitle,
  tooltipTriggers,
  tooltipWrapperTag,
} from '../src/utils/tooltip-wrapper'

describe('tooltip-wrapper defaults', () => {
  it('defaults hover / top / light / arrow / enterable / rootClose / delays', () => {
    expect(tooltipTriggers({})).toEqual(['hover'])
    expect(tooltipTriggers({ trigger: 'click' })).toEqual(['click'])
    expect(tooltipTriggers({ trigger: ['hover', 'click'] })).toEqual(['hover', 'click'])
    expect(tooltipPlacement({})).toBe('top')
    expect(tooltipPlacement({ placement: 'left' })).toBe('left')
    expect(tooltipTheme({})).toBe('light')
    expect(tooltipTheme({ tooltipTheme: 'dark' })).toBe('dark')
    expect(tooltipShowArrow({})).toBe(true)
    expect(tooltipShowArrow({ showArrow: false })).toBe(false)
    expect(tooltipEnterable({})).toBe(true)
    expect(tooltipRootClose({})).toBe(true)
    expect(tooltipInline({})).toBe(false)
    expect(tooltipInline({ inline: true })).toBe(true)
    expect(tooltipMouseEnterDelay({})).toBe(0)
    expect(tooltipMouseLeaveDelay({})).toBe(200)
    expect(tooltipMouseEnterDelay({ mouseEnterDelay: 1000 })).toBe(1000)
    expect(tooltipOffset({})).toEqual([0, 0])
    expect(tooltipOffset({ offset: [10, -20] })).toEqual([10, -20])
  })
})

describe('tooltip-wrapper body / tag / text', () => {
  it('reads body, wrapper tag, title and content with tpl', () => {
    expect(tooltipBody({ body: '删除' })).toEqual(['删除'])
    expect(tooltipWrapperTag({})).toBe('div')
    expect(tooltipWrapperTag({ inline: true })).toBe('span')
    expect(tooltipWrapperTag({ wrapperComponent: 'pre' })).toBe('pre')
    expect(tooltipWrapperTag({ wrapperComponent: 'iframe' })).toBe('div')
    expect(tooltipTitle({ title: '标题 ${name}' }, { name: 'Ada' })).toBe('标题 Ada')
    expect(tooltipContent({ content: '${text}' }, { text: '提示' })).toBe('提示')
    expect(tooltipContent({ tooltip: '旧字段' }, {})).toBe('旧字段')
  })
})
