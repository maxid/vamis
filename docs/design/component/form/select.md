# Select 下拉选择器 · `select` 设计

> 状态：**已完成 100%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/select) · Amis：`/zh-CN/components/form/select`
> 盘点日期：2026-11-21。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。
> 剩余语义实现规格：[Select 剩余语义完成设计](../../../superpowers/specs/component/form/2026-11-19-vamis-select-completion-design.md)
> 表格模式完成规格：[Select 表格模式完成设计](../../../superpowers/specs/component/form/2026-11-21-vamis-select-table-mode.md)
> 级联模式完成规格：[Select 级联模式完成设计](../../../superpowers/specs/component/form/2026-11-21-vamis-select-chained-mode.md)

## 0. 一页结论

Select 是 `Options` 控件族的参照实现：值、选项、搜索、远程 source、分组、标签溢出、移动端选择器和新增/编辑选项都叠在同一个控件上。它不直接实现表单值；值统一走 `useOptionsControl` + `useFieldValue`，因此**状态归属**和**值序列化**是第一边界。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值序列化**：`multiple` / `joinValues` / `extractValue` / `delimiter` 决定写回 string 还是 array；`labelField` / `valueField` 决定选项映射。改任一都同时影响表单值、`selectedItems`、事件参数和 remote 回填。
2. **值来源**：有 Form 走 `useFieldValue`（Form 或 ValueHost/Scope）；无 Form 也不能直接写 `props.data`。`name` 路径按 FormItem 契约。
3. **选项来源**：本地 `options` / 远程 `source` / `deferApi` / 搜索 API / `autoComplete` 的优先级由 `useOptionsControl` 决定，Select.vue 不另建选项缓存。
4. **事件时序**：值变化先完成写值/选项状态，再派发 `change`；`focus` / `blur` 对应打开/关闭；新增/编辑/删除的 `*Confirm` 先于本地选项写入和 CUD API，`preventDefault()` 必须同时阻断两者。
5. **移动端**：窄屏 `VamisPopUp` 底部弹层；滚轮/多选草稿在 `confirmMobile` 才写回，不能边滚边提交。
6. **标签折叠**：宽度测量决定可见标签 + `+N`；测量在 mount/resize/值变化后进行，不能在模板里硬编码数量。
7. **包边界**：渲染器无 `<style>`、无直接 fetch；`requestApi` 只在 `useOptionsControl`/工具层；样式走 token。

### 1.2 边界用例

- 单选/多选、`joinValues` / `extractValue` / `delimiter` 组合；空值 / `resetValue`
- `value` 是 number / string / array；option value 重复；禁用项
- 本地 options / 远程 source 慢返回 / 失败 / 空结果 / 变量 `${...}`
- `searchable` 本地过滤 / `filterOption` / `searchApi` / `autoComplete` 竞态
- 分组 `children`、`menuTpl`、`selectMode: group`
- 表格模式 `selectMode: table`：columns、单选 / 多选、禁用行、表头全选、移动草稿
- 级联模式 `selectMode: chained`：列路径、叶子写值、多选叶子全选、移动草稿
- 关联模式 `selectMode: associated`：左栏本地值、`ref` 关联、右侧 table/tree/chained/list
- 树模式 `selectMode: tree`：`multiple` / `onlyChildren` / `autoCheckChildren` / 全选 / 搜索保留父路径
- 节点 defer：父级 `deferApi`、option 级 `deferApi`、请求上下文、Spinner、`deferLoadFinished`、重复展开
- 多选全选、`checkAllBySearch`、搜索后全选
- 移动端滚轮 / 移动多选草稿 / 关闭不提交
- `addControls` 新增、编辑、删除选项（成功/失败/取消）
- 标签宽度切换、`maxTagCount`、`+N` tooltip
- 弹层 placement / 容器 selector / 窄屏
- disabled / static / readOnly / FormItem 错误态

### 1.3 优先级

1. 值序列化与 Form/FieldValue 边界
2. 选项来源与搜索/远程 API
3. 多选/全选/标签/移动端
4. 新增/编辑/删除与 `*Confirm` 事件
5. 样式/深色/窄屏/对照

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/Select.tsx` 812 行；Vamis `Select.vue` 900+ 行 + `SelectTreePane.vue` + `useTreeState.ts` + `optionsControl.ts` 650+ 行 + core `options.ts` 805 行）
- 依赖：`Options`、`FormItem`、`checkbox`、`list`、`popOver` 等
- 风险：值序列化 × 选项来源 × 移动端 × 搜索/远程 四套状态叠加，回归面大

## 3. Amis 契约

### 3.1 入口与源码

- 入口：`type: 'select'`；相关类型 `multi-select` / `checkboxes` / `radios` 等复用 Options 族
- Amis 渲染器：`packages/amis/src/renderers/Form/Select.tsx`
- 在线文档：[Vamis `/components/form/select`](/components/form/select) / Amis `/zh-CN/components/form/select`

### 3.2 核心属性（摘要）

| 属性 | 语义 | 实现要求 |
|---|---|---|
| `options` | 本地选项 | 支持 `label/value/disabled/children`；`labelField/valueField` 映射 |
| `source` | 远程选项 | `requestApi` 拉取；变量 source 按数据域解析 |
| `multiple` / `joinValues` / `extractValue` / `delimiter` | 多选/值形态 | 决定表单值 string vs array；不要只改 UI |
| `searchable` / `filterOption` / `searchApi` / `autoComplete` | 搜索 | 本地/远程/自动补全的优先级和竞态 |
| `selectMode` | 普通/分组/表格/树/链式/关联 | 普通 / group / table / tree / chained / associated 已接；人员点选复用 associated |
| `searchResultMode` / `searchResultColumns` | 搜索结果面板覆盖 | 支持 list / group / table / tree / chained，未写时继承 `selectMode` |
| `menuTpl` | 自定义选项 | SchemaRenderer 渲染，数据含 option |
| `maxTagCount` / 标签折叠 | 多选标签 | 测量 + `+N` tooltip |
| `addControls` / `editControls` / `deleteControls` | 选项增删改 | 现有新增/编辑/删除路径；`*Confirm` 事件先于本地写入和 CUD API |
| `checkAll` / `checkAllBySearch` | 全选 | 只对可选叶子；搜索时是否只全选当前结果 |
| `resetValue` | 清空值 | clear 动作写它 |
| `disabled` / `static` / `readOnly` | 状态 | 由 FormItem/控件统一，禁用项不能选 |
| `overlay` / `popOverContainerSelector` | 弹层 | 移动端 height/placement；不要另写定位 |

### 3.3 事件

已接：`change`、`focus`、`blur`、`addConfirm`、`editConfirm`、`deleteConfirm`、树模式 `deferLoadFinished`。

`addConfirm` / `editConfirm` / `deleteConfirm` 的 payload 对齐 Amis：当前公开数据、`value`、`options`、`items`、`item` 和 `[name]`。三个确认事件都在本地选项写入以及 `addApi` / `editApi` / `deleteApi` 之前触发；`preventDefault()` 后不写本地、不发请求。Select 新增与编辑都打开 Dialog，新增 Dialog 提交后才触发 `addConfirm`；新增 / 编辑事件 `item` 只带本次 label/value，原选项的其他字段在事件通过后才合并；`deleteConfirmText` 先于 `deleteConfirm`，未配置时不自造默认确认文案。

### 3.4 动作

已接：`clear`、`reset`、`reload`、`setValue`。

`clear` 写 `resetValue`（默认空串）；`setValue` 写值后要同步 selected/选项；`reload` 重新拉 source。不要绕过 `useOptionsControl` 直接改 options。

## 4. Vamis 架构

### 4.1 文件与职责

| 文件 | 职责 |
|---|---|
| [`Select.vue`](../../../../packages/vamis/src/renderers/form/Select.vue) | 下拉弹层、搜索、标签、移动端 wheel/多选、新增/编辑/删除、menuTpl |
| [`SelectTreePane.vue`](../../../../packages/vamis/src/renderers/form/select/SelectTreePane.vue) | 树模式候选面板：选择、全选、懒加载与 TreeBranch 适配 |
| [`useTreeState.ts`](../../../../packages/vamis/src/renderers/form/useTreeState.ts) | InputTree / TreeSelect / Select 树模式共享的展开与节点懒加载状态 |
| [`optionsControl.ts`](../../../../packages/vamis/src/optionsControl.ts) | 值/选项/远程 source/搜索/全选/提交的统一状态机 |
| [`options-event.ts`](../../../../packages/vamis-core/src/actions/options-event.ts) | 选项确认事件 payload 与 `runOptionConfirm` |
| [`option-mutation.ts`](../../../../packages/vamis-core/src/utils/option-mutation.ts) | 确认事件后的 CUD API 持久化 |
| [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts) | normalizeOptions、selected、toggle、加入/移除、label/value 映射 |
| [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误展示 |
| [`TableHeadFilter.vue`](../../../../packages/vamis/src/renderers/table/TableHeadFilter.vue) 等 | 复用 Options 的筛选/搜索样式与逻辑 |

### 4.2 状态

```text
schema.options / source / deferApi
        │ useOptionsControl
        ▼
options ── searchable ──> filtered
   │                         │
   ├─ rawValue(name) ────────> selected
   ├─ open / keyword / searchResults / loading
   ├─ multiple / joinValues / extractValue / delimiter
   └─ mobileDraft / mobileWheelIndex (窄屏，确认才 commit)
```

- `useOptionsControl`：`options`、`filtered`、`selected`、`toggle`、`toggleAll`、`commit`、`loading`、`remote`。
- Select.vue：弹层开合、宽度测量/标签折叠、移动端草稿、新增/编辑/删除 UI。
- 值写回：`fieldApi.setValue(name, serialized)`；`selectedItems` 由 selected 派生，不从 DOM 反推。

### 4.3 关键交互

- **多选**：toggle 只改 draft/值；`joinValues` 时按 `delimiter` 拼字符串，`extractValue` 时只留 value；标签移除用同一序列化。
- **搜索**：本地 `filterOption` 优先；`searchApi` / `autoComplete` 需序号/Abort 防竞态；搜索无结果不改变当前值。
- **搜索焦点**：`searchable: true` 或配置了 `autoComplete` 的 Select 打开后，统一延迟 500ms 聚焦检索框；普通、分组、表格、树形、级联以及移动端走同一判据。下拉仍打开时，检索框 blur 后会恢复聚焦；点击外部先关闭下拉，不再抢焦点。只有 `searchApi` 时不触发自动聚焦。
- **分组**：`children` 只作展示/组头，叶子才可选；`selectMode: group` 的组头样式与全选边界单独测。
- **表格**：`SelectTablePane` 使用 Table / Checkbox 原语；`columns` 为空回落 label，列 schema 可进 SchemaRenderer。单选点整行；多选表头全选排除禁用项；移动端只改 draft，确认才提交。
- **级联**：`SelectChainedPane` 维护列内索引路径；打开时默认展开第一个有子项的分组，父节点只展开下一列，叶子才写值。父项 active 看路径，叶子 active 看选中值，父项没有 `value` 也能正确切列。最多三列、列内滚动，多选 checkAll 只选叶子，移动端只改 draft。
- **关联**：`SelectAssociatedPane` 本地保存左栏值，不写外层字段；左栏 `list/tree` 通过 `leftDefaultValue` 初始化，按 `options[].ref` 找到右栏候选，右栏复用 table/tree/chained/list。关闭后重开等同 Amis 重建 `AssociatedSelection`：左值恢复 `leftDefaultValue`，无默认则回到未选择状态；左/右树通过重开 token 重新 seed 默认展开，但不销毁已加载子项。人员点选仍走同一 source-shaped 数据：`leftOptions` / `children` 拆左右候选，右侧根节点 `defer` 在左侧选中时加载。右根树的懒加载结果必须回写父层 `useOptionsControl`，并保留 source-shaped 元数据，否则 multiple 标签只能回退到 value；左侧切换只清当前右树视图，不整体清空右根缓存。左树 source 是否变化按树签名判断，避免右根回写触发重新 normalize 时丢失已展开部门。默认关联列表 multiple 显示复选框；未选左侧时右栏显示「请选择左侧数据」，ref 对不上时显示配置错误。左树显示 folder/file 图标，桌面关联选择内容区对齐 Amis Transfer-selection 的 350px 上限，搜索框另计；左右列有 200px 最小高度、等分且各自滚动。移动端只写 draft，确认才提交。
- **树模式**：`SelectTreePane` 复用 `TreeBranch` 和共享 `useTreeState`；不挂完整 `TreeSelect`，不另建树状态。多选默认叶子值，`onlyChildren: false` 时由 `cascade: true` 写入父子值。InputTree / TreeSelect / Select 树模式统一用稳定路径键存展开态，避免对象身份变化导致收缩一个节点时其他节点被重置。
- **树懒加载**：`option.deferApi > schema.deferApi > source`；请求上下文包含当前数据域和节点字段，成功后只替换目标节点 children，保留兄弟并触发 `deferLoadFinished`。
- **移动端**：单选滚轮在 confirm 时 `commit([item])`；多选维护 `mobileDraft`，确认才写回；关闭不提交。
- **标签折叠**：`measureTags` 计算可见数量；`maxTagCount` / 宽度变化 / 值变化触发；`+N` tooltip 不能裁切。
- **选项 CUD**：确认事件先于本地写入与 API；弹层 Form 不再内挂 add / edit API，由 `useOptionsControl` / `useTreeField` 在事件后统一提交。Vamis 有意将 `creatable` 入口提升到 Popover 固定头部，与搜索框同层；候选列表单独滚动，入口不跟随内容滚走。这是相对 Amis 把 `Select-addBtn` 放在菜单滚动内容内的优化。

## 5. 样式与边界

- 默认类：`.vamis-select`、`.vamis-select-overflow`、`.vamis-select__chip`、`.vamis-select__caret`、`.vamis-popup__picker` 等，位于 `@vamis/ui/styles.css`。
- 弹层/标签/tooltip 走 token；渲染器无 `<style>`；深色只替换 token。
- 分组组头与组内子项共用 `.vamis-select__item-label`：基类显式落普通 option 的 14 / 32px、400、`neutral-text-2`；组头 modifier 覆写为 14 / 21px、400、`neutral-text-5` + padding 4×12，子项只额外缩进 24，选中态再用 primary。
- 表格面板对齐 Amis `TableSelection`：12 / 18px，表头 padding 8×12，数据行 top 6 / bottom 8 / left 12 / right 18，末列右 18；行 hover / active / disabled 复用 `select-option-*`。`.vamis-select__table-pane` 是唯一滚动宿主。
- 级联面板对齐 Amis `ChainedSelection`：最多三列，非末列右 1px 分隔；item 行高 32、14 / 400、`0 10px`；每列独立滚动，外层不叠第二条滚动。
- 关联面板对齐 Amis `AssociatedSelection`：左右两栏独立滚动，38% / 剩余宽度分栏，左右栏 `min-height: 200px`，左栏右缝 1px，item 行高 32、14 / 400、复用 `select-option-*`。
- multiple 勾选统一使用 `--select-check-*` → Popover `--checkbox-*` 映射：14×14 盒、12px 图标、2px 圆角、`--input` 边框。checkbox 到 label 的间距统一以级联多选为基准固定 8px；Amis 各结构原值不同，这里是 Vamis 的显式一致性优化。全选半选态显示横线；关联列表必须使用共享 Checkbox，树形 mark 必须在 Select tree pane 内覆写同一套盒子尺寸。Teleport 到根节点后变量从 `.vamis-select__popover` 继承。
- 树模式对齐 Amis `TransferDropDown-content > Transfer-selection`：`.vamis-select__popover.is-tree` 是固定 flex 外壳，`.vamis-select__tree-pane` 是唯一滚动宿主，内部 `.vamis-tree` 设 `max-height:none` / `overflow:visible`，避免延时加载展开后出现双滚动条。
- 窄屏：选择器底部弹层高度、滚轮行高、多选确认栏；不要用桌面 dropdown 直接缩窄。
- 作者 `className` 只落 `div.vamis-node`；不要用 Tailwind 默认类代替控件皮肤。

## 6. 当前状态与缺口

- 已对齐：分组 Transfer 检索框、小复选框、多选 tag hover tooltip、按宽度 `+ N`、溢出标签表格、`menuTpl`、`searchable` / `filterOption` / `searchApi`、`searchable` 与 `autoComplete` 统一延迟聚焦检索框（普通、分组、表格、树形、级联、关联和移动端）、移动端底部弹层（普通单选滚轮 / 普通多选草稿 / 表格、级联、关联与树模式草稿 / 搜索 / 确认写入）、`selectMode: group` / `table` / `tree` / `chained` / `associated`、`searchResultMode` / `searchResultColumns` 搜索结果面板覆盖、树节点 `deferApi`、关联左右树 deferred `update:nodes` 回写、表格列与行选择、级联叶子选择、关联左右栏、全选、`autoComplete`、桌面平铺选项虚拟列表（`virtualThreshold` / `itemHeight`，对齐 Amis 266 视口 / 32 行高）、TransferDropDown 选择内容区 350px 与 table / chained 窗口虚拟化、creatable 固定顶部入口，以及三个选项确认事件与 CUD API 顺序。在线文档表格与级联章节已切为活示例。
- 对照：Select 桌面 / 移动均 **26/31**（P0 0）；树单选 / 多选 / defer、table 与 chained 各两份活示例通过，余 5 条为既有多选值探针与 clear / reset / reload / setValue 的 Amis 空渲染差异。
- 已补：级联的 `children: []` 分支语义、`subTitle` / 单列 `placeholder`、`option.className` / `optionClassName`、默认 label + tip，以及 deferred 父列加载、单节点 Spinner 和 `update:nodes` 回写。`defaultSelectedIndex` 在 Amis 6.13 属于 `TabsTransfer` 的 option 契约，Select 的 TransferDropDown 没有向 `ChainedSelection` 透传，不能计作 Select 缺口。
- 属性 / 默认值、事件动作、值序列化矩阵与关联 source lifecycle 已逐项验收；`showInvalidMatch` / `mobileClassName` 两个剩余属性也已接入。Select 收口为 **100%**。对照中 5 条差异均为已核实的 Amis 空渲染 / 既有探针差异，P0 为 0。

## 7. 验收计划与完成度

### 验收清单（文档核对：12 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Select/optionsControl/options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [x] schema 属性 / 默认值逐项核对
- [x] 事件 / 动作逐项核对
- [x] 边界用例逐项核对
- [x] 组件页活示例运行、无控制台 error
- [x] `pnpm test`（Select/Options 相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page select` 桌面
- [x] `pnpm compare --page select --mobile`
- [x] 深色 / 375px 窄屏

### 验收重点

- `multiple` × `joinValues` × `extractValue` × `delimiter` 的值形态
- 远程/搜索/自动补全竞态与失败
- 移动端确认前不写值
- 全选只选可选叶子、搜索全选范围
- 标签折叠在 resize/值变化后正确

## 8. 后续

1. 关联空态与 source 元数据补 lifecycle 回归。
2. 值序列化矩阵补组件级测试后再动样式。
3. 虚拟列表只覆盖平铺、table、chained；tree / group 的虚拟窗口另列。

---

返回 [组件设计索引](../README.md)
