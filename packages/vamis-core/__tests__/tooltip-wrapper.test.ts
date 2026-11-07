import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  TOOLTIP_OVERLAY_GAP,
  tooltipBody,
  tooltipContent,
  tooltipEnterable,
  tooltipInline,
  tooltipLayerSchema,
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
    expect(TOOLTIP_OVERLAY_GAP).toBe(6)
  })

  it('strips host-only fields from the overlay schema', () => {
    const layer = tooltipLayerSchema({
      type: 'tooltip-wrapper',
      title: '标题',
      content: '提示',
      tooltipTheme: 'dark',
      tooltipStyle: { fontWeight: 'bold' },
      style: { fontStyle: 'italic' },
      className: 'mb-1',
      inline: true,
      wrapperComponent: 'span',
      body: '一段文案',
    })
    expect(layer).toMatchObject({
      title: '标题',
      content: '提示',
      tooltipTheme: 'dark',
      tooltipStyle: { fontWeight: 'bold' },
    })
    expect(layer).not.toHaveProperty('style')
    expect(layer).not.toHaveProperty('className')
    expect(layer).not.toHaveProperty('body')
    expect(layer).not.toHaveProperty('inline')
    expect(layer).not.toHaveProperty('wrapperComponent')
    expect(layer).not.toHaveProperty('type')
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

describe('tooltip-wrapper overlay', () => {
  it('uses VamisTooltipLayer Teleport, not in-flow z-50', () => {
    const vue = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis/src/renderers/layout/TooltipWrapper.vue'),
      'utf8',
    )
    expect(vue).toContain('VamisTooltipLayer')
    expect(vue).toContain('overlayContainerFrom')
    expect(vue).toContain('tooltipLayerSchema')
    expect(vue).toContain('vamis-tooltip-wrapper--inline')
    expect(vue).not.toContain('inline-flex')
    expect(vue).not.toContain('z-50')
    expect(vue).not.toContain('absolute z-')
    const layer = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis/src/overlay/VamisTooltipLayer.vue'),
      'utf8',
    )
    expect(layer).toContain('TOOLTIP_OVERLAY_GAP')
    expect(layer).toContain('v-html="content"')
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis-ui/src/styles.css'),
      'utf8',
    )
    expect(css).toContain('--tooltip-max-width: 240px')
    expect(css).toContain('--tooltip-bg: #17202d')
    expect(css).toContain('--tooltip-fg: #f7f8fa')
    expect(css).toContain('max-width: var(--tooltip-max-width)')
    expect(css).toContain('border-radius: var(--tooltip-radius)')
    expect(css).toContain('.vamis-tooltip__arrow::after')
    expect(css).toContain('.vamis-tooltip-wrapper--inline')
    expect(css).not.toContain('.vamis-action-tooltip')
  })
})
