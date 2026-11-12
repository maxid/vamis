import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('table', () => {
  it('supports title/placeholder/itemAction and docs', () => {
    const vue = read('../../vamis/src/renderers/Table.vue')
    for (const t of ['itemAction', 'placeholder', 'rowClassName', 'SchemaRenderer', 'selectable', "emitRowClick", "type === 'selectAll'", 'sortBy', 'columnSort', 'onDragStartRow', 'orderChange', 'combineNum', 'cellMeta', 'groupName', 'headerGroups', 'affixRow', 'prefixRow']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/table.md')
    for (const h of ['## 基本用法','## 数据需求','## 空状态展示','## 列配置','## 总结行','## 超级表头','## 合并单元格','## 拖拽排序','## 列排序','## 选择模式','## 行操作按钮','## 单行点击操作','## 属性表','## 事件表','## 动作表']) expect(doc).toContain(h)
  })
})
