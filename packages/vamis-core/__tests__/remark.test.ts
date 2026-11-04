import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  remarkDialogSchema,
  remarkFilterContents,
  remarkHasTip,
  remarkHostClassName,
  remarkIconRaw,
  remarkIsMobile,
  remarkLabel,
  remarkLayerSchema,
  remarkMouseEnterDelay,
  remarkMouseLeaveDelay,
  remarkPlacement,
  remarkShape,
  remarkTriggers,
} from '../src/utils/remark'
import { schemaNodeDisplayClass } from '../src/style'

describe('remark contents', () => {
  it('filters string content and object title/body', () => {
    expect(remarkFilterContents({ content: '这是一段提醒' })).toEqual({ content: '这是一段提醒' })
    expect(remarkFilterContents({ content: '${github}' }, { github: 'https://github.com/' })).toEqual({
      content: 'https://github.com/',
    })
    expect(
      remarkFilterContents({
        content: { title: '${github}', body: '这是一段提醒' },
      }, { github: 'https://github.com/' }),
    ).toEqual({
      title: 'https://github.com/',
      body: '这是一段提醒',
      content: '这是一段提醒',
    })
    expect(remarkHasTip({ type: 'remark' })).toBe(false)
    expect(remarkHasTip({ content: 'tip' })).toBe(true)
    expect(remarkFilterContents({ tooltip: '覆盖', content: '次' })).toEqual({ content: '覆盖' })
  })
})

describe('remark chrome', () => {
  it('defaults placement top, trigger hover+focus, square shape, empty icon', () => {
    expect(remarkPlacement({})).toBe('top')
    expect(remarkPlacement({ placement: 'left' })).toBe('left')
    expect(remarkPlacement({ tooltip: { placement: 'bottom' }, placement: 'left' })).toBe('bottom')
    expect(remarkTriggers({})).toEqual(['hover', 'focus'])
    expect(remarkTriggers({ trigger: 'click' })).toEqual(['click'])
    expect(remarkShape({})).toBe('')
    expect(remarkShape({ shape: 'circle' })).toBe('circle')
    expect(remarkIconRaw({})).toBeUndefined()
    expect(remarkIconRaw({ icon: 'fa fa-question-circle' })).toBe('fa fa-question-circle')
    expect(remarkIconRaw({ tooltip: { icon: 'star' }, icon: 'fa fa-plus' })).toBe('star')
    expect(remarkLabel({ label: '说明 ${who}' }, { who: '甲' })).toBe('说明 甲')
    expect(remarkHostClassName({ className: 'm-l' })).toBe('m-l')
    expect(remarkHostClassName({ tooltip: { className: 'from-tip' }, className: 'outer' })).toBe('from-tip')
  })

  it('maps delay number / show-hide onto enter/leave', () => {
    expect(remarkMouseEnterDelay({})).toBe(0)
    expect(remarkMouseLeaveDelay({})).toBe(200)
    expect(remarkMouseEnterDelay({ delay: 80 })).toBe(80)
    expect(remarkMouseLeaveDelay({ tooltip: { delay: { show: 10, hide: 30 } } })).toBe(30)
  })
})

describe('remark mobile dialog', () => {
  it('only treats explicit mobileUI as mobile, and opens an empty-actions dialog', () => {
    expect(remarkIsMobile({})).toBe(false)
    expect(remarkIsMobile({ mobileUI: true })).toBe(true)
    expect(remarkIsMobile({}, { mobileUI: true })).toBe(true)
    expect(remarkIsMobile({ mobileUI: false }, { mobileUI: true })).toBe(false)
    expect(remarkDialogSchema({ content: { title: '标题', body: '这是一段提醒' } })).toEqual({
      type: 'dialog',
      title: '标题',
      body: '这是一段提醒',
      actions: [],
    })
  })
})

describe('remark overlay skin', () => {
  it('uses VamisOverlay tokens, not shadcn Tooltip, and keeps node inline-block', () => {
    expect(schemaNodeDisplayClass({ type: 'remark' })).toBe('inline-block')
    const vue = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis/src/renderers/rest/Remark.vue'),
      'utf8',
    )
    expect(vue).toContain('VamisTooltipLayer')
    expect(vue).toContain('vamis-remark')
    expect(vue).not.toContain('TooltipProvider')
    expect(vue).not.toContain('rounded-full')
    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../vamis-ui/src/styles.css'),
      'utf8',
    )
    expect(css).toContain('--remark-width: 16px')
    expect(css).toContain('background: var(--remark-hover-bg)')
    expect(css).toContain('.vamis-remark__icon--circle')
    const layer = remarkLayerSchema({ content: { title: '标题', body: '提醒' }, placement: 'right' })
    expect(layer.title).toBe('标题')
    expect(layer.content).toBe('提醒')
    expect(layer.placement).toBe('right')
  })
})
