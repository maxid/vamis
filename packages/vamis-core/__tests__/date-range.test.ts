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
    ]) {
      expect(vue).toContain(token)
    }
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-date-range__input')
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
  })
})
