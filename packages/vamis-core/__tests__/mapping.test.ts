import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('mapping', () => {
  const vue = read('../../vamis/src/renderers/Mapping.vue')

  it('supports map shapes, source, itemSchema and placeholder', () => {
    expect(vue).toContain('normalizeMap')
    expect(vue).toContain('valueField')
    expect(vue).toContain('labelField')
    expect(vue).toContain('itemSchema')
    expect(vue).toContain('resolveVariableSource')
    expect(vue).toContain('isEffectiveApi')
    expect(vue).toContain("mapValue['1']")
    expect(vue).toContain("mapValue['0']")
    expect(vue).toContain("schema.placeholder || '-'")
    const register = read('../../vamis/src/register.ts')
    expect(register).toContain("type: 'mapping', alias: ['map']")
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-root .label-info')
    expect(css).toContain('.vamis-root .label-success')
    expect(css).toContain('.vamis-root .label-danger')
  })

  it('doc covers the Amis mapping chapters', () => {
    const doc = read('../../../website/src/components/mapping.md')
    for (const heading of [
      '## 基本用法',
      '## 渲染 HTML',
      '## 渲染其它组件',
      '## 渲染自定义模板',
      '### html 或字符串模板',
      '### SchemaNode 模板',
      '### 在模板中渲染数据',
      '## 映射展示多个',
      '## map 映射源',
      '### k-v 对象',
      '### 对象数组',
      '## 用作 Field 时',
      '### Table 中的列类型',
      '### Form 中静态展示',
      '### 布尔值映射',
      '### 远程拉取字典',
      '### 关联上下文变量',
      '## 占位文本',
      '## 属性表',
      '## 和 Amis 文档的差异',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('itemSchema')
    expect(doc).toContain('valueField')
    expect(doc).toContain('placeholder')
  })
})
