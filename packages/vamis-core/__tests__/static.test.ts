import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('static', () => {
  it('resolves static-xxx through the generic test and renders subtype', () => {
    const register = read('../../vamis/src/register.ts')
    expect(register).toMatch(/type: 'static'[\s\S]*test: \/\(\^\|\\\/\)static\(-\[\^\/\]\+\)\?\$\//)
    const vue = read('../../vamis/src/renderers/form/Static.vue')
    expect(vue).toContain('const subType = computed')
    expect(vue).toContain("return props.schema.tpl != null ? 'tpl' : 'plain'")
    expect(vue).toContain('vamis-static__copy')
    expect(vue).toContain('copyable')
    expect(vue).toContain('schema.placeholder || \'-\'')
    expect(vue).toContain('borderMode')
  })

  it('doc covers the Amis static chapters and the quickEdit gap', () => {
    const doc = read('../../../website/src/components/form/static.md')
    for (const heading of [
      '## 基本用法',
      '## 数据域变量映射',
      '## 展示其他组件',
      '## 快速编辑（未接）',
      '## 弹出框（popOver）',
      '## 属性表',
      '## 和 Amis 文档的差异',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('static-json')
    expect(doc).toContain('copyable')
    expect(doc).toContain('quickEdit')
    expect(doc).toContain('**未接**')
  })
})
