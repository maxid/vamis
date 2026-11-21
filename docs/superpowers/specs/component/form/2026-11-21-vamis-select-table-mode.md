# Select 表格模式完成设计

- 日期：2026-11-21
- 状态：主路径已落地；虚拟化和 `searchResultMode` 待后续切片
- 范围：`select` 的 `selectMode: table`
- Amis 水标：6.13.0 `TableSelection`
- 关联文档：
  - [Select 组件设计](../../../../design/component/form/select.md)
  - [Select 剩余语义完成设计](2026-11-19-vamis-select-completion-design.md)
  - [Amis Select 关联组件与共享能力测绘](2026-11-19-amis-select-shared-surface-analysis.md)

## 1. Amis 契约

Amis `SelectControl.renderOtherMode()` 把 table 交给 `TransferDropDown -> Transfer -> TableSelection`。TableSelection 是“表格网格 + 选择状态”，不是完整 Table 渲染器：

- `columns` 为空时回落 `label` 列
- 单选点击整行；多选增加 checkbox 列
- 多选表头全选始终显示，不依赖 `checkAll`
- 全选排除 `disabled` 和空值行
- 普通空态为「暂无选项」，搜索结果空态使用 `noResultsText`
- 表格不消费 `hideSelected`、`menuTpl`、`deferApi`
- 移动端使用同一个表格面板，只写临时值，确认后才提交

## 2. Vamis 架构

- `SelectTablePane.vue` 是纯展示 / 选择面板。
- `Select.vue` 继续负责值序列化、`joinValues` / `extractValue` / `delimiter`、搜索、source、change 事件与移动草稿。
- 选择行发 `pick`，表头全选发 `toggle-all`，复用现有 `onPick` / `onToggleAll`，不复制值状态机。
- Table UI 使用 `@vamis/ui` Table / Checkbox 原语；不挂完整 `type: table` 渲染器。
- 普通单元格按 `name` 取嵌套值；带 `type` / `tpl` / `body` / `schema` 的列交给 `SchemaRenderer`。
- `filteredCandidates` 与 `hideSelected` 后的 `filtered` 分开，table 使用前者，保持已选行可见。

## 3. 样式

- 表格字体 12px / 18px，正文色 `neutral-text-2`
- 表头 padding `8px 12px`，末列右侧 18px
- 数据行 padding top 6 / bottom 8 / left 12 / right 18
- 行 hover / active / disabled 复用 `select-option-*` token
- `.vamis-select__popover.is-table` 固定 flex 外壳
- `.vamis-select__table-pane` 是唯一滚动宿主，内部 Table container 不再套滚动

## 4. 验证

- 单选整行写值并关闭
- 多选行、表头全选、禁用项排除
- 列 `tpl` 经 SchemaRenderer
- 移动端草稿取消 / 确认
- `hideSelected: true` 时已选行仍显示
- 真实页单一滚动宿主

## 5. 剩余

- TableSelection 虚拟列表（Amis Select 默认阈值 100 / 行高 38）
- `searchResultColumns`
- table 作为 `searchResultMode` 的面板分派
- chained / associated 复用 table 右栏
