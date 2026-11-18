# TableView 表格视图 · `table-view` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/table-view) · Amis：`/zh-CN/components/table-view`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

TableView 是**静态表格 schema 渲染**：cols/rows/cells、colspan/rowspan、caption、border/padding/width。没有编辑器拖格子/交互选择；65% 指主路径盒模型已对齐，剩余是编辑器能力。

## 1. 边界与优先级（先读）

1. **schema 结构**：`cols` 列定义、`rows[].tds` 单元格；cell.body 是 SchemaNode 数组，交给 SchemaRenderer。
2. **span**：colspan/rowspan 缺省不写 0；非法值兜底 1；跨行/跨列不能越界。
3. **caption**：文本/模板；captionSide 控制位置，居中显示。
4. **盒模型**：width/border/borderColor/padding 走 `--table-view-*` token；不要各写 hex/px。
5. **包边界**：无 `<style>`、无 fetch；表格标签由 UI/token 决定。
6. **编辑器拖格子**：当前未接，不要按可编辑表格验收。

### 边界用例

- 空 cols/rows、单格、跨行/跨列、caption 无/有
- 非法 span、负数、越界
- cell.body 为空/多节点/复杂 schema
- border/padding/width 组合
- 深色/窄屏横向滚动
- 编辑器拖拽（未接）

### 优先级

1. schema/span；2. 盒模型/caption；3. 复杂 cell/响应式；4. 编辑器。

## 2. 复杂度

- 等级：**M 中**（Amis 352 行；Vamis 59 行）；依赖 `tpl/mapping/tag`。
- 风险：span 越界与盒模型。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `cols` / `rows` | 表格结构 | 已接 |
| `caption` / `captionSide` | 标题 | 已接 |
| `border` / `borderColor` / `padding` / `width` | 盒模型 | 已接 |
| colspan/rowspan | 合并 | 已接 |
| 编辑器拖格子 | 目标 | 未接 |

## 4. 架构

- [`rest/TableView.vue`](../../../../packages/vamis/src/renderers/rest/TableView.vue)：table/caption/colgroup/rows。
- [`table-view.ts`](../../../../packages/vamis-core/src/utils/table-view.ts)：cols/rows/span/style 纯函数。
- [`SchemaRenderer`](../../../../packages/vamis-core/src/SchemaRenderer.vue)：cell body。

### 数据流

```text
schema.cols/rows ──tableViewCols/Rows──> colgroup/tbody
cell.body → SchemaRenderer（data 透传）
```

## 5. 样式

- 表格宽度/边框/内边距/caption；token 化；无 `<style>`。
- 窄屏横向滚动；深色边框/caption 单独核。

## 6. 缺口

编辑器拖格子/交互单元格；复杂 cell 的响应式；深色窄屏。

## 7. 验收

- 结构/span/caption/盒模型/空表/窄屏；编辑器能力不误标。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

先做编辑器拖格子（若需要），否则保持静态；盒模型补深色/窄屏。

---

返回 [组件设计索引](../README.md)
