# Select 级联模式完成设计

- 日期：2026-11-21
- 状态：已完成（2026-11-22）
- 范围：`select` 的 `selectMode: chained`
- Amis 水标：6.13.0 `ChainedSelection`
- 关联文档：
  - [Select 组件设计](../../../../design/component/form/select.md)
  - [Select 剩余语义完成设计](2026-11-19-vamis-select-completion-design.md)

## 1. Amis 契约

- 最多显示 3 层列，列内滚动。
- 有 `children` 或 `defer` 的节点只改变当前路径，不写表单值。
- 叶子节点才进入 Select 的候选值。
- 多选叶子显示 checkbox；`checkAll` 只选择可用的叶子。
- 列之间使用 1px border 分隔。
- 父节点、叶子的 active / hover / disabled 都使用 Select option token。

## 2. Vamis 架构

- 新增 `SelectChainedPane.vue`。
- pane 内部维护列路径 `path`，元素是每列选中项的下标，不写表单值；不可用父项 `value` 做路径，Amis 文档中的父项通常没有 `value`。
- 打开面板时默认展开第一个有子项的分组；默认路径只负责列展示，不写表单值。
- `searchable: true` 或 `autoComplete` 时沿用 Select 统一焦点策略，500ms 后聚焦检索框，打开期间检索框 blur 后恢复聚焦；关闭下拉后不抢焦点。只有 `searchApi` 时不触发自动聚焦。
- 有 `children` 的节点 active 只匹配当前索引路径；叶子 active 只匹配表单中已选值，避免多选时把当前浏览路径误当选中态。
- `Array.isArray(children)` 即分支，`children: []` 也必须生成下一列并显示空列 placeholder，不能写表单值。
- 下一列 `subTitle` / `placeholder` 从当前路径上一层的已选 option 读取；根空态使用 `noResultsText`。
- `option.className` 与 Select `optionClassName` 落到级联 item；默认文案按 label + tip。
- `defer` / `deferApi` 父列复用 `useTreeState`：点击只加载当前节点，节点内显示 Spinner，结果通过 `update:nodes` 回写并生成下一列。
- 父层 `Select.vue` 继续负责 `onPick`、`joinValues` / `extractValue`、change 和移动草稿。
- 多选全选由 `onToggleAll` 的 chained 分支只取叶子，再复用现有值序列化。
- 普通列宽 150px 起，最多 3 列；空列保留列壳。
- 节点带 `type` / `tpl` / `schema` 时使用 `SchemaRenderer` 渲染。

## 3. 样式

- `.vamis-select__popover.is-chained` 固定 flex column，外层不滚动。
- `.vamis-select__chained-pane` 是模式壳；每个 `.vamis-select__chained-col` 独立 `overflow:auto`。
- item 行高 32、14px / 400、padding `0 10px`；active / hover / disabled 复用 `select-option-*`。
- 非末列 `border-right: 1px solid var(--border)`。

## 4. 验证

- 单选：点父节点不写值，点叶子写入并关闭。
- 单选：父项均无 `value` 时，点不同父项必须切换对应子列，当前列只能有一个父项 active。
- 多选：checkAll 只写入叶子，不写父值。
- 焦点：普通、级联和移动级联在 `searchable` 或 `autoComplete` 时聚焦检索框并在打开期间失焦后恢复；只有 searchApi 不抢焦点。
- 关联左树：显示 folder/file 图标；桌面 Popover 高度上限 350，左右列等分，列内滚动；InputTree / TreeSelect / Select 共用稳定路径展开态。
- 空 children 分支：不写值，生成下一列；父项 `subTitle` / `placeholder` 与 option 类名正确渲染。
- deferred 父列：只请求被点节点，加载中显示单节点 Spinner，完成后子项进入下一列；重复点击不重复请求。
- 真实页列展开、列边框、单滚动宿主。
- 桌面 / 移动 Select 对照。

## 5. 边界

- `defaultSelectedIndex` 是 `TabsTransfer` option 契约，Amis Select 未向 `ChainedSelection` 透传，不列为 Select 剩余项；当前“默认第一组”是 Vamis 固定行为。
- 本 spec 完成不等于 Select 组件 100%；Select 的属性 / 事件 / 值序列化全量验收仍由组件设计文档跟踪。
