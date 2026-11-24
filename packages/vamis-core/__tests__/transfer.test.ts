import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { catalogFor } from '../src/schema-type-catalog'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('transfer', () => {
  it('supports search/titles and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/form/Transfer.vue')
    for (const t of ['searchable', 'searchPlaceholder', 'leftTitle', 'rightTitle', 'leftShown', 'loadSource', 'remoteOptions', 'mode', 'treeDepth', 'treeRows', 'toggleTree']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/form/transfer.md')
    for (const h of [
      '## 基本用法',
      '## 展示模式',
      '### 分组',
      '### 表格模式',
      '### 树形模式',
      '### 级联选择',
      '### 关联选择模式',
      '### 延时加载',
      '### 支持搜索',
      '### 结果面板跟随模式',
      '### 自定义选项展示',
      '## 远程选项',
      '## 属性表',
      '## 和 Amis 文档的差异',
    ]) expect(doc).toContain(h)
    expect(doc).not.toContain(
      '"popOverContainerSelector": ".cxd-Panel--form"',
    )
    expect(doc).toContain('"popOverContainerSelector": "[data-vamis-panel]"')
  })

  it('exposes the Amis Transfer schema fields in editor completions', () => {
    const properties = catalogFor('transfer').properties
    for (const field of [
      'showArrow',
      'sortable',
      'selectMode',
      'resultListModeFollowSelect',
      'leftOptions',
      'leftMode',
      'rightMode',
      'searchResultMode',
      'columns',
      'searchResultColumns',
      'searchable',
      'resultSearchable',
      'searchApi',
      'selectTitle',
      'resultTitle',
      'menuTpl',
      'valueTpl',
      'searchPlaceholder',
      'resultSearchPlaceholder',
      'statistics',
      'itemHeight',
      'virtualThreshold',
      'showInvalidMatch',
      'onlyChildren',
      'initiallyOpen',
      'autoCheckChildren',
      'pagination',
    ]) {
      expect(properties, field).toHaveProperty(field)
    }
  })
})
