import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('table', () => {
  it('supports title/placeholder/itemAction and docs', () => {
    const vue = read('../../vamis/src/renderers/Table.vue')
    for (const t of ['itemAction', 'placeholder', 'rowClassName', 'rowClassNameExpr', 'SchemaRenderer', 'selectable', 'showIndex', 'copyable', 'classNameExpr', 'headerAlign', 'checkOnItemClick', 'selectedChange', 'columnSearch', 'rowDbClick', "type === 'selectAll'", 'sortBy', 'columnSort', 'onDragStartRow', 'orderChange', 'combineNum', 'cellMeta', 'groupName', 'headerGroups', 'affixRow', 'prefixRow', 'fixedStyle', 'columnFilters', 'columnFilter', 'quickEdit', 'commitEdit', 'quickEditType', 'quickEditOptions', 'childrenOf', 'toggleExpand', 'nestedRowsFor', 'toggleKey', 'localRows', 'tableLayout', 'resizable', 'onColResizeDown', 'vamis-table__col-resizer', 'vamis-table__empty-icon', 'desk-empty', 'cellSchema', 'table2ColumnsTogglable']) expect(vue).toContain(t)
    const css = read('../../vamis-ui/src/styles.css')
    for (const t of ['--table-cell-py', '--table-cell-edge-px', '--table-thead-edge-px', '--table-font-size', 'white-space: normal']) expect(css).toContain(t)
    expect(css).not.toContain('[data-slot="table-cell"] > .vamis-node {\n  min-width: min-content;')
    const doc = read('../../../website/src/components/table.md')
    for (const h of ['## 基本用法','## 数据需求','## 空状态展示','## 列配置','### 列类型','### 列宽','### 列对齐方式','### 列样式','### 单元格样式','### 可复制','## 独立数据域','## 嵌套','## 显示序号','## 快速编辑','## 列筛选','## 高亮行','## 固定列','## 总结行','## 超级表头','## 合并单元格','## 拖拽排序','## 列排序','## 选择模式','## 行操作按钮','## 单行点击操作','## 属性表','### 列配置属性表','## 事件表','## 动作表']) expect(doc).toContain(h)
  })
})
