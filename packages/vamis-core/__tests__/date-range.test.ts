import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('input-date-range', () => {
  const vue = read('../../vamis/src/renderers/form/DateRange.vue')

  it('supports value formats, shortcuts, embed, extraName and actions', () => {
    for (const token of [
      'valueFormat',
      'displayFormat',
      'delimiter',
      'extraName',
      'shortcuts',
      'presetRange',
      'embed',
      'clearValue',
      'resetValue',
      "type === 'setValue'",
      'commitFromRaw',
      'rangeStartIso',
      'minDuration',
      'applyDateRangePart',
      '开始时间',
      '结束时间',
    ]) {
      expect(vue).toContain(token)
    }
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-date-range__input')
    expect(css).toContain('.vamis-date-range__calendars')
    expect(css).toContain('--cal-between-bg')
    expect(css).toContain('.vamis-date-range__rangers')
    expect(css).toContain('justify-content: center')
    expect(css).toContain('text-align: center')
  })

  it('opens year/month views, hides inner arrows, and keeps the two months apart', () => {
    expect(vue).toContain("startView = 'years'")
    expect(vue).toContain("endView = 'years'")
    expect(vue).toContain("startView = 'months'")
    expect(vue).toContain('hide-next-nav')
    expect(vue).toContain('hide-prev-nav')
    expect(vue).toContain('clampApart')
    expect(vue).toContain('pickStartYear')
    expect(vue).toContain('pickEndMonth')
    const panel = read('../../vamis/src/renderers/calendar/DateCalendarPanel.vue')
    expect(panel).toContain('hidePrevNav')
    expect(panel).toContain('hideNextNav')
    expect(panel).toContain('const inMonth = cell.current')
  })

  it('reuses DateCalendarPanel twice instead of a second calendar stack', () => {
    const panels = vue.split('<DateCalendarPanel').length - 1
    expect(panels).toBeGreaterThanOrEqual(4)
    expect(vue).toContain('range-start-iso')
    expect(vue).toContain('vamis-date-range__actions')
    const panel = read('../../vamis/src/renderers/calendar/DateCalendarPanel.vue')
    expect(panel).toContain('rangeStartIso')
    expect(panel).toContain('is-range-start')
    expect(panel).toContain('is-range-end')
  })

  it('doc covers the Amis input-date-range chapters', () => {
    const doc = read('../../../website/src/components/form/input-date-range.md')
    for (const heading of [
      '## 基本用法',
      '## 默认值',
      '## 快捷键',
      '## 内嵌模式',
      '## 存成两个字段',
      '## 数据处理函数',
      '## 属性表',
      '## 事件表',
      '## 动作表',
      '### clear',
      '### reset',
      '### setValue',
      '## 和 Amis 文档的差异',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('extraName')
    expect(doc).toContain('shortcuts')
    expect(doc).toContain('embed')
    expect(doc).toContain('本周一到周日')
    expect(doc).toContain('{n}quartersago')
    expect(doc).toContain('1个月前')
    expect(doc).toContain('transform')
    expect(doc).toContain('clear_text')
  })
})
