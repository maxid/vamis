# Table2 表格 · `table2` 设计

> 状态：**进行中 70%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/table2) · Amis：`/zh-CN/components/table2`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Table2 是 **CRUD 的轻量列表实现**：手写表格、只有基础列/选择/排序/分页/列显示，与 Table 的完整能力不同。它可以通过 `useCrudHost` 复用 CRUD 的列显示与选择上下文，但没有 Table 的快速编辑/合并/固定列/拖拽/树/总结栏。

研发时先定：Table2 是继续做“轻量 data table”，还是最终并入 Table。当前按轻量实现维护，不要把它当 Table 的别名。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **数据来源**：`table2Source(schema, data, items)`；`source` 默认 `${items}`；无数据空态；不要自己读 props 数组。
2. **行身份**：`rowId(row,index)` 由 keyField / index 派生；选择/菜单/行点击用同一 key，不要用显示序号冒充。
3. **选择**：`rowSelection` 支持 checkbox/radio；`selectedRowKeys` 受控 + `disableOn` + `maxKeepItemSelectionLength`；无 host 时本地 selected，有 CRUD host 时写 host。
4. **列显示**：列 toggle 优先用 `useInjectedColumnToggle`（CRUD 顶栏），否则本地；`columnsTogglable` 决定是否画菜单。
5. **排序/分页**：`sortable` 列本地排序；`perPage` 本地分页；有 CRUD host 时不重复画分页。
6. **渲染边界**：`table2CellIsRenderer` 的列走 SchemaRenderer；text/plain 走纯文本；`title`/`footer` 可以是 SchemaNode。
7. **包边界**：无 `<style>`、无直接 fetch；`--table2-*` token；作者 className 只落 `div.vamis-node`。

### 1.2 边界用例

- 空 source / 空数组 / null 行 / 非对象行
- `rowSelection: checkbox|radio`、`selectedRowKeys` 受控、`disableOn`、maxKeep
- 行点击与内部按钮/复选框冒泡
- 列 `type` 渲染器 vs `tpl`/纯文本；`title` 对象
- `bordered`、`size`、`resizable`（若支持）、`columnsTogglable: auto`
- 排序 + 分页组合；perPage=0
- 在 CRUD 内（host）与独立使用两套上下文
- 窄屏、深色、空态

### 1.3 优先级

1. 数据/行身份/选择
2. 列显示/排序/分页
3. 单元格渲染与 title/footer
4. 与 CRUD host 的边界
5. 样式/窄屏/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Table2/index.tsx` 2352 行；Vamis 373 行）
- 依赖：`action`、`badge`、`checkbox`、`mapping`、`popOver`、`tpl`
- 风险：与 Table/CRUD 的职责重叠；能力分叉

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'table2'`
- Amis 渲染器：`packages/amis/src/renderers/Table2/index.tsx`
- 在线文档：[Vamis `/components/table2`](/components/table2)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 现状 |
|---|---|---|
| `source` / `items` | 数据 | 已接 |
| `columns` / `title` / `footer` | 列与头尾 | 已接基础 |
| `rowSelection` / `selectedRowKeys` / `disableOn` / `maxKeepItemSelectionLength` | 选择 | 已接主路径 |
| `rowClick` | 行点击 | 已接 |
| `bordered` / `size` / `placeholder` / `columnsTogglable` | 外观 | 已接 |
| `sortable` / `perPage` | 本地排序/分页 | 已接 |
| `expandable` / tree / fixed columns / group header / summary / drag / quickEdit | Table2 文档能力 | **未接** |
| `loading` / `selections` | 加载/菜单 | 部分接 |

### 3.3 事件/动作

- 当前 **无独立 CRUD/Table2 事件转发**；行点击/选择是内部行为。
- 文档中的列事件/动作表是 Amis 目标，不能当已实现。
- 与 CRUD host 共用选择时，事件归属需先定（CRUD 还是 Table2）。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`data/Table2.vue`](../../../packages/vamis/src/renderers/data/Table2.vue) | 数据/选择/排序/分页/列 toggle/单元格 |
| [`crudHost.ts`](../../../packages/vamis/src/renderers/data/crudHost.ts) | useCrudHost、column toggle 注入、选择上下文 |
| [`table2.ts`](../../../packages/vamis-core/src/utils/table2.ts) | source/keyField/selectionType/columns/placeholder/title/footer 等纯函数 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | `--table2-*` token |

### 4.2 数据管线

```text
source/items ──table2Source──> rawRows
      ├─ localSort/toggleSort ──> sortedRows
      ├─ perPage/page ─────────> pagedRows
      └─ column toggle ────────> visibleColumns

selection: localSelected 或 CrudHost.selectedItems
```

- `rawRows` 变化时重置 page/选择（按 `table2KeyField`）。
- `sortedRows` 只做本地排序；不做远程排序 API。
- `pagedRows` 只在无 CRUD host 时画分页。
- 单元格 `cellSchema` 去掉 title/footer 等非单元格字段，交给 SchemaRenderer。

## 5. 样式与边界

- 默认类：`.vamis-table2`、`.vamis-table2-head-cell`、`.vamis-table2-footer`、`.vamis-table2-pager`、`.vamis-table2-empty`、`.vamis-table2-loading`。
- 行高/padding 走 `--table2-*` / 密度 token；渲染器无 `<style>`。
- 窄屏/深色/空态/加载态需单独看。
- 作者 className 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已对齐：source/title/footer/placeholder、选择 checkbox/radio、rowClick、selectedRowKeys、disableOn、maxKeep、选择菜单、bordered、size、columnsTogglable auto、本地排序/分页。
- 未接：展开行、树、固定列、表头分组、拖拽、总结栏、quickEdit、完整事件/动作。
- 与 Table 的边界：Table2 是轻量实现，不共享 Table 的快速编辑/合并/固定列；不要用 Table 文档做 Table2 验收。
- 对照：TODO 记录 table2 主路径；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Table2 / crudHost / table2 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前未完整）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Table2 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page table2` 桌面
- [ ] `pnpm compare --page table2 --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 选择受控/非受控、maxKeep、disableOn
- 行点击与内部控件冒泡
- 排序+分页
- CRUD host 上下文与独立使用
- 与 Table 能力差异不要误标

## 8. 后续

1. **先做架构决策**：Table2 是否并入 Table；在决定前不要继续扩两套列能力。
2. 若保留轻量：补事件/动作；若并入：抽 Table 的轻量配置，删除重复 DOM。
3. 深色/窄屏/空态/加载专项。

---

返回 [组件设计索引](README.md)
