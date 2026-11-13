import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('list', () => {
  it('supports selection/actions/itemClick and docs', () => {
    const vue = read('../../vamis/src/renderers/List.vue')
    for (const t of [
      'selectable',
      'multiple',
      'itemAction',
      'showIndexBar',
      'itemClick',
      "type === 'selectAll'",
      "type === 'clearAll'",
      "type === 'initDrag'",
      'useOverlay',
      'vamis-radio-dot',
      'vamis-list__drag',
      'click.capture',
      'scrollIntoView',
      'syncLetterFromScroll',
      'onRowPointerDown',
      'vamis-list__item-float',
    ])
      expect(vue).toContain(t)
    expect(read('../../vamis/src/renderers/rest/ListItem.vue')).toContain("level: 'link'")
    const doc = read('../../../website/src/components/list.md')
    expect(doc).toContain('engine: vamis')
    expect(doc).not.toMatch(/engine:\s*amis\b/)
    for (const h of [
      '## 基本用法',
      '## 选择模式',
      '## 单行点击操作',
      '## 设置组件的 CSS 类',
      '## 字母索引条',
      '## 属性表',
      '## 事件表',
      '### itemClick',
      '## 动作表',
      '### select',
      '### selectAll',
      '### clearAll',
      '### initDrag & cancelDrag',
      '### setValue',
    ])
      expect(doc).toContain(h)
  })
})
