import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('textarea', () => {
  it('defaults and chrome follow Amis TextAreaControl', () => {
    const vue = read('../../vamis/src/renderers/form/Textarea.vue')
    expect(vue).toContain('return Number.isFinite(n) && n > 0 ? n : 3')
    expect(vue).toContain('return Number.isFinite(n) && n > 0 ? n : 20')
    expect(vue).toContain('trimContents')
    expect(vue).toContain('showCounter')
    expect(vue).toContain('vamis-textarea-control__counter')
    expect(vue).toContain('vamis-textarea-control__clear')
    expect(vue).toContain('multiline-text')
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-textarea-control__native')
    expect(css).toContain('padding-bottom: 27px')
  })

  it('clear button fills resetValue; action clear writes empty string', () => {
    const vue = read('../../vamis/src/renderers/form/Textarea.vue')
    expect(vue).toContain('const next = props.schema.resetValue ?? \'\'')
    expect(vue).toContain("if (type === 'clear') {")
    expect(vue).toContain("if (type === 'reset')")
    expect(vue).toContain("if (type === 'focus')")
    expect(vue).toContain("if (type === 'setValue')")
  })

  it('doc covers the Amis textarea chapters', () => {
    const doc = read('../../../website/src/components/form/textarea.md')
    for (const heading of [
      '## 基本使用',
      '## 清空输入框',
      '## 显示计数器',
      '## 属性表',
      '## 事件表',
      '## 动作表',
      '### clear',
      '### reset',
      '### focus',
      '### setValue',
      '## 和 Amis 文档的差异',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('showCounter')
    expect(doc).toContain('maxRows')
    expect(doc).toContain('resetValue')
    expect(doc).toContain('Ctrl/⌘+Z')
  })
})
