import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('list', () => {
  it('supports selection/actions/itemClick and docs', () => {
    const vue = read('../../vamis/src/renderers/List.vue')
    for (const t of ['selectable', 'multiple', 'itemAction', "emitListEvent('itemClick'", "type === 'selectAll'", "type === 'clearAll'"]) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/list.md')
    for (const h of ['## 基本用法','## 选择模式','## 单行点击操作','## 设置组件的 CSS 类','## 字母索引条','## 属性表','## 事件表','## 动作表']) expect(doc).toContain(h)
  })
})
