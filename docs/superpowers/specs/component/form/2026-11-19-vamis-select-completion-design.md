# Select 剩余语义完成设计

- 日期：2026-11-19
- 状态：进行中（Options CUD 事件 2026-11-19、`selectMode: tree` + `deferApi`、`table`、`chained`、`associated` 主路径、`searchResultMode` 2026-11-21/22 已落地）
- 范围：`select` 的 Options CUD 事件、`deferApi`、`selectMode: table / tree / chained / associated`、`searchResultMode`
- Amis 基线：6.13.0
- 关联文档：
  - [Select 组件设计](../../../../design/component/form/select.md)
  - [Options 组件设计](../../../../design/component/form/options.md)
  - [Amis Select 关联组件与共享能力测绘](2026-11-19-amis-select-shared-surface-analysis.md)
  - [Select 表格模式完成设计](2026-11-21-vamis-select-table-mode.md)
  - [Select 级联模式完成设计](2026-11-21-vamis-select-chained-mode.md)
  - [运行时语义](../../2026-10-20-vamis-runtime-semantics-design.md)
  - [组件 P0 TODO](../../2026-10-20-vamis-component-todo.md)

## 0. 文档边界

本文件是 Select 剩余工作的**执行设计**，只描述待实现增量、实施顺序和验收方式。

- [Select 组件设计](../../../../design/component/form/select.md) 是组件的长期设计和当前状态真源：负责边界、现有架构、当前缺口、进度与验收清单。
- 本文件不维护组件百分比，不重复完整属性表，不替代 Amis 契约调查。
- Amis 6.13.0 源码始终是行为水标；本文件负责把水标映射到 Vamis 的实施切片。
- 每个切片落地后必须回写组件设计、组件 P0 TODO、`CONTEXT.md` 和在线组件页；本文件只更新交付状态与残余项。
- 出现表述冲突时，以 Amis 源码和组件设计文档中的 Vamis 长期边界为准，并修正本执行设计。

## 1. Amis 水标

Amis 是 Select 语义的唯一水标。

Amis 6.13.0 的实际链路：

1. `SelectControlRenderer.renderOtherMode()` 把 `table` / `tree` / `chained` / `associated` 交给 `TransferDropdownRenderer`。
2. `TransferDropdownRenderer` 使用 `TransferDropDown`，它 extends `Transfer`。
3. `Transfer.renderOptions()` 按模式分派：
   - `table` → `TableSelection`
   - `tree` → `Tree`
   - `chained` → `ChainedSelection`
   - `associated` → `AssociatedSelection`
   - 其他 → `GroupedSelection`
4. `Transfer.renderSearchResult()` 用 `searchResultMode || selectMode` 分派同一组选择面板。
5. `AssociatedSelection` 左栏 `leftMode: tree` 使用 Amis `Tree`；右栏按 `rightMode` 使用 `TableSelection` / `Tree` / `ChainedSelection` / `GroupedSelection`。
6. 树懒加载由 `Transfer.onDeferLoad` / `Tree.onDeferLoad` 触发，仍属于 TransferDropDown 外壳。
7. Options CUD 事件由 `amis-core/renderers/Options.tsx` 的 `dispatchOptionEvent` 触发，先于本地写入和 `addApi` / `editApi` / `deleteApi`。

因此，`selectMode: tree` 不是把独立 `type: tree-select` 渲染器直接塞进 Select；关联选择也不能把完整 `InputTree` 的 FormItem 和 CUD 外壳原样搬进左栏。Vamis 可以复用底层树状态、TreeBranch 和懒加载逻辑，但模式外壳必须保持 TransferDropDown 契约。

## 2. 意图

Select 当前已经对齐普通下拉、分组、搜索、远程选项、标签折叠、移动端 PopUp 和桌面虚拟列表。剩余缺口集中在两类：

1. Options 选项增删改的事件与 API 触发顺序。
2. Amis 的非普通选择模式：表格、树、级联、关联选择。

这两类能力不能继续堆进 `Select.vue`。实现必须先把 Amis 的 TransferDropDown / Selection 契约映射到 Vue，再决定哪些 Vamis 内部能力可以复用。

## 3. 目标

- `addConfirm` / `editConfirm` / `deleteConfirm` 在选项真正写入或调用新增、编辑、删除 API 前触发。
- 事件的 `preventDefault()` 必须阻止后续本地变更与请求。
- `selectMode: tree` 对齐 TransferDropDown + Tree 的候选树行为。
- `selectMode: associated` 对齐 AssociatedSelection 的左右栏、`ref` 匹配和右栏模式。
- `deferApi` / `deferField` / `deferLoadFinished` 只在树视图状态机中实现一次。
- `table`、`chained`、`associated` 使用独立模式面板，普通列表状态继续由 `Select.vue` 负责。
- `searchResultMode` 决定搜索结果面板，未写时继承 `selectMode`。
- 文档、单测、SDK 对照同步更新。

## 4. 非目标

- 不移植 Amis `TransferDropDown` 或 React 组件树。
- 不在 Select 内复制 `useTreeField`、TreeBranch 或 lazy-load 逻辑。
- 不把独立 `InputTree` / `TreeSelect` 的 FormItem、根选择器、CUD 外壳直接套进 Select；只有行为与水标一致的部分才可复用。
- 不新增 `allowCreate` 自定义字段；Amis 6.13 使用 `creatable`，未知字段不升级为兼容契约。
- 不在本阶段重做 Table2、InputTree、ChainedSelect 自身的完整语义；只抽共享能力或做嵌入式适配。

## 5. 方案比较

### 方案 A：先复刻 Amis 模式契约，再复用行为一致的底层能力（选用）

`Select.vue` 继续负责公共值、source、搜索和普通/分组下拉。新增 TransferDropDown 风格的 Vue 模式壳，根据 Amis `Transfer.renderOptions()` 分派：

- `tree` → `SelectTreePane.vue`
- `table` → `SelectTablePane.vue`
- `chained` → `SelectChainedPane.vue`
- `associated` → `SelectAssociatedPane.vue`

树相关面板优先复用 `useTreeField`、`TreeBranch`、`optionNeedsDefer`、`resolveDeferredOption` 等底层能力；是否复用 `InputTree.vue` / `TreeSelect.vue` 的局部视图，以“不引入额外 FormItem / CUD / 选择器语义”为前置条件。

优点：

- 行为直接对齐 Amis `TransferDropDown`。
- 不复制树与懒加载状态。
- 与现有包边界一致。
- 每个模式可独立测试和对照。

代价：

- 需要先抽出可嵌入的树视图边界，不能直接挂完整 `TreeSelect`。

### 方案 B：直接移植 Amis TransferDropDown / Selection React 实现

一次性移植 Amis 的完整组件层级。

不选原因：

- 工作量与风险最大。
- 会带入 React / MST / Amis UI 内部依赖。
- 行为水标应复制，组件结构水标不应复制。

### 方案 C：全部写进 Select.vue

在单文件内按 mode 增加四套模板和状态。

不选原因：

- 文件继续膨胀，模式状态互相污染。
- 树与关联选择无法可靠复用现有组件。

## 6. 设计

### 6.1 选项 CUD 事件与 API 顺序

新增共享 helper，供 `useOptionsControl` 与 InputTree CUD 共用。Select 普通/分组模式以 `Options.tsx` 为准；树模式本身不额外引入 Amis TransferDropDown 中不存在的 CUD：

- 事件 payload：`value`、`options`、`items`、`item`、`[name]` 和当前公开数据。
- `addConfirm`：构建新增 item 后、写本地选项与 `addApi` 前触发。
- `editConfirm`：构建 patch item 后、更新本地选项与 `editApi` 前触发。
- `deleteConfirm`：`deleteConfirmText` 用户确认后、`deleteApi` 前触发。
- 事件被 `preventDefault()` 后立即返回，不写值、不改选项、不发请求。
- `addApi` / `editApi` / `deleteApi` 由渲染层 helper 调用 `requestApi`，不再挂在弹层内 Form 的 `api` 上。
- Select 新增 / 编辑入口按 Amis 调用共享 `overlay.openDialog`；默认新增 Dialog 在提交后才触发 `addConfirm`，不在下拉内维护第二套内联新增表单。
- mutation helper 的本地基准是当前 `item` / `patch`，请求 payload 只负责请求，不能把整个表单域或 `__super` / `__prev` 合并进选项。
- 成功后可合并接口返回数据；source + `addApi` / `editApi` 重新加载 source，source 无 `addApi` 的临时新增留在本地；新增 / 编辑后按重载结果同步 selected item，删除后按 source 结果同步值。

### 6.2 TransferDropDown 外壳

- 所有非普通模式共用 `SelectTransferShell`：
  - 触发器结果区
  - 桌面 PopOver / 移动端 PopUp
  - 搜索输入与搜索取消
  - 顶端候选统计与全选入口
  - 移动端临时值，确认后才提交
- 普通 `list` / `group` 仍走现有 `Select.vue` 列表，不经过这层模式壳。
- 水标：`TransferDropDown.tsx` / `Transfer.renderSelect()` / `Transfer.renderOptions()`。

### 6.3 `selectMode: tree`

- 新建 `SelectTreePane.vue`，行为对齐 Transfer 中的 `Tree`：
  - `multiple` / `cascade` / `onlyChildren`
  - `autoCheckChildren`
  - `initiallyOpen`
  - `checkAll`
  - 搜索高亮与搜索后父子路径保留
  - `deferApi` 节点懒加载
- 可复用 `useTreeField` 的树状态与 `TreeBranch` 视图，但不能直接挂完整 `TreeSelect.vue`：
  - 不额外生成独立 `type: tree-select` 的 FormItem
  - 不引入 TreeSelect 自己的触发器
  - 不引入 Amis Select 树模式没有的 CUD 外壳
- source / autoComplete 的顶层加载由 `useOptionsControl` 提供；节点懒加载由共享 tree state 发起。

### 6.4 `selectMode: associated`

- 已完成 2026-11-21：新建 `SelectAssociatedPane.vue`，行为对齐 `AssociatedSelection` 主路径。
- 左栏：
  - `leftMode: tree` 使用共享树状态和 `TreeBranch`，对应 Amis `Tree`。
- 树分组显示 folder/file 图标；展开态按路径键存在 `useTreeState`，不能按节点对象引用存，避免兄弟节点收缩互相重置。
  - `leftMode: list` 使用列表选择面板，对应 Amis `GroupedSelection`。
  - 左栏使用局部 `ValueHost` 保存当前左节点，不写入外层 Select 字段。
- 右栏按 `rightMode` 分派：
  - `table` → `SelectTablePane.vue`
  - `tree` → `SelectTreePane.vue`
  - `chained` → `SelectChainedPane.vue`
  - `list` / `group` → 列表选择面板
- 左节点通过 `ref` 匹配 `options[].ref`；`options[].children` 是右栏候选。
- 桌面 Popover 高度上限对齐 Amis `Transfer-selection-maxHeight: 350px`；左右列等分，列内滚动，外层不叠滚动条。
- 左右树节点需要懒加载时，复用共享 tree state 的 `deferApi`；当前仅完成静态与 source-shaped 数据，动态左栏 defer、人员点选仍待后续。
- source 返回 `options[0].leftOptions` / `options[0].children` / `leftDefaultValue` 时，在进入面板前拆出左右数据。

### 6.5 `selectMode: table`

- **已落地 2026-11-21**：新增 `SelectTablePane.vue`，复用 Table / Checkbox 原语和父层值状态；主路径支持 columns、单选、多选、禁用、表头全选、移动草稿和单一滚动宿主。
- 新建 `SelectTablePane.vue`。
- 使用 `@vamis/ui` Table 原语，不复制 Table 渲染器的完整数据域。
- `columns` 只用于展示；选择状态仍由 Select 的值序列化决定。
- 支持单选、多选、禁用行、表头全选和搜索结果切换。

### 6.6 `selectMode: chained`

- **已落地 2026-11-21**：新增 `SelectChainedPane.vue`，最多三列、路径展开、叶子写值、叶子全选和移动草稿已接；deferred 列、`defaultSelectedIndex` 与虚拟化留后续。
- 新建 `SelectChainedPane.vue` 或从 `ChainedSelect.vue` 抽出共享组合函数。
- 层级路径由“当前左栏链”决定，叶子写入 Select 值。
- 不在 Select 内复制一套远程 source；候选树由 `useOptionsControl` 提供。

### 6.7 `searchResultMode`

- 未写时继承 `selectMode`。
- 已完成 2026-11-22：搜索返回结果存在时切换为对应 pane，清空检索后恢复主模式；`searchResultColumns` 覆盖 table 搜索结果列。
- 搜索返回结果后，使用对应模式面板渲染：
  - `list`
  - `table`
  - `tree`
  - `chained`
- 树搜索保留父子路径；表格搜索只替换候选行。

## 7. 交付切片

1. Options CUD 事件与 API 顺序。**已完成 2026-11-19**：扩展既有 `useOptionsControl` / `useTreeField`，新增 core `runOptionConfirm` / `persistOptionMutation`，未重建 CUD 状态机。
2. `selectMode: tree` + `deferApi` / `deferLoadFinished`。**已完成 2026-11-21**：抽出共享 `useTreeState`，新增 `SelectTreePane` 复用 `TreeBranch`；单选 / 多选 / 全选 / 搜索 / 移动草稿 / 节点懒加载已接。
3. `selectMode: table`。**已完成 2026-11-21**：新增 `SelectTablePane`，columns 可走 `SchemaRenderer`，单选 / 多选 / 表头全选 / 禁用行 / 移动草稿已接；虚拟化与 `searchResultMode` 另列后续。
4. `selectMode: chained`。**已完成 2026-11-21**：新增 `SelectChainedPane`，列路径 / 叶子值 / 多选叶子全选 / 移动草稿已接；deferred 列与虚拟化另列后续。
5. `selectMode: associated` 主路径。**已完成 2026-11-21**：新增 `SelectAssociatedPane`，左右栏、`leftMode` / `rightMode`、`ref` 匹配、`leftDefaultValue`、移动草稿与搜索焦点已接；人员点选、动态左栏 defer 另列后续。
6. `searchResultMode` 全模式收口。**已完成 2026-11-22**：searchApi 结果面板按 `searchResultMode` 切换，清空搜索恢复主模式，表格结果支持独立列。

每个切片单独跑测试和 Select 对照，不把五个模式压成一个不可审查的提交。

## 8. 验收

- `addConfirm` / `editConfirm` / `deleteConfirm` payload 与 Amis 一致。
- 被事件阻断后不出现本地更新或网络请求。
- tree / associated 不会创建第二套树状态；懒加载只由共享 tree state 发起。
- `table / tree / chained / associated` 的单选、多选、禁用、空态和搜索可交互。
- `searchResultMode` 可覆盖主模式。
- `pnpm test`、`pnpm typecheck` 为 0。
- `pnpm sdk:build` 后：
  - `pnpm compare --page select`
  - `pnpm compare --page select --mobile`
- 并排核对 Amis / Vamis Select 文档，打开树、表格、级联、关联与深色浮层。

## 9. 风险

- 现有 `InputTree.vue` / `TreeSelect.vue` 自带 FormItem 和独立选择器壳；直接复用会引入 Amis Select 树模式不存在的语义，必须先抽出 lower-level tree pane。
- `optionsAddDialogSchema` / `optionsEditDialogSchema` 当前把 add/edit API 挂在 Form 上，必须先改事件顺序，再接树模式，否则树 CUD 会继续“请求先行”。
- associated 的左值不是表单值，必须放在局部 ValueHost，不能写进外层 `name`。
- source 返回的 leftOptions 元数据要保留，不能在 `normalizeOptions` 后丢失。
- table / chained 的搜索结果与主候选可能结构不同，需要在面板边界统一为 `OptionItem[]`。
