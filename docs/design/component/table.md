# Table 表格 · `table` 设计

> 状态：**进行中 88%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/table) · Amis：`/zh-CN/components/table`
> 盘点日期：2026-11-18。本文是**研发设计文档**，不是属性表；完整属性 / 事件 / 动作表以在线文档为准，本文只列实现必须遵守的契约、架构与验收口径。
> 验收核对：功能 **13 / 15** · 工程 **4 / 8**（2026-11-18，详见 §7；未核项不等于未实现）。

## 0. 一页结论

`table` 是 Vamis 的数据展示枢纽，也是 `crud` / `table2` 的参照实现。它不是“把数组渲染成行”那么简单，核心难点在：

1. **行身份稳定**：排序、筛选、展开、拖拽、快速编辑前后，同一行必须能被稳定识别；
2. **行树与扁平视图分离**：`children` 嵌套、Footable、懒加载都建立在行树上；
3. **多套本地状态叠加**：本地行覆盖、搜索、过滤、排序、拖拽顺序、快速编辑 pristine、虚拟窗口；
4. **交互与 API 的一致性**：选择 / 排序 / 搜索 / 过滤 / 拖拽 / 快速编辑都可能被事件 `preventDefault` 拦截；
5. **样式细节多**：固定列、吸顶表头、合并单元格、总结行、深色、窄屏。

研发任何一项前，先确认它落在哪条状态链、是否会破坏行身份、是否会与事件拦截冲突。

## 1. 边界与优先级（先读）

> **边界优先组**：先确认不可破坏的边界，再谈属性、功能和样式。Table 的回归成本远高于普通展示组件，任何“顺手加一个属性”都要先过这一组。

### 1.1 P0 不可破坏边界

1. **行身份**：行对象用 `WeakMap` 获得稳定内部 id；排序/筛选/树/虚拟窗口不能重新创建行身份。将来接 `reUseRow` 时只允许在刷新时做业务主键配对，不得改变默认语义。
2. **事件时序**：`columnSort` / `columnSearch` / `columnFilter` / `orderChange` / `quickEditSubmit` / `rowClick` 必须在提交本地状态前 `dispatch`，`prevented` 时不得写入；写错顺序比样式错更难回滚。
3. **状态分层**：`propItems → localRows → search/filter → sort → dragOrder → tree → visibleRows → windowRows` 每层只做一件事；禁止在模板里再派生第二套行数组。
4. **行树一致**：选择、展开、合并、总结、动作目标、Footable 都从同一棵 `tree` 派生。子行是否参与合并、选择、拖拽必须显式定义，不能靠“看起来对”。
5. **测量契约**：`colPx`、sticky offset、`affixReady`、虚拟行高共用同一测量结果；改固定列/吸顶/虚拟窗口必须同时检查另外两者。
6. **包边界与样式**：渲染器无 `<style>`、无直接 `fetch`；默认皮肤在 `@vamis/ui` 的 token 里；作者 `className` 不能替代默认皮肤。
7. **未接项隔离**：`reUseRow`、`export-excel`、`quickSaveApi` 是独立刀；不要在样式/交互切片里顺手做。

### 1.2 边界用例（先写，再实现）

- 空 `source` / `items` / `null` 行；行数据不是对象
- 缺少主键、主键重复、主键为 `0` / 空串、子行同主键
- `children` 为空 / 多层 / `childrenColumnName` 自定义；`defer` 失败与重试
- 列无 `name` / 全部隐藏 / 只有 `groupName`；`text|plain` 与其它 `type` 混排
- `selectable` + `itemCheckableOn` + `checkOnItemClick` + 行内按钮同时存在
- 拖拽前已有选择；`orderChange` 被阻止；`saveOrder` 清排序/搜索/过滤
- `quickEdit.saveImmediately`、放弃、`quickEditSubmit` 被阻止、未知 quickEdit type
- `persistKey` 隐藏列 / 列顺序；`resizable` + 固定列 + Footable 同时开启
- 展开行 + 虚拟窗口 + 滚动/resize；吸顶表头 + `autoFillHeight`
- 深色 / 375px 窄屏 / 空态 / 长文本 / 修改态

### 1.3 优先级

1. **边界与行身份**（本节）
2. Amis 契约与事件/动作顺序（§3）
3. 数据管线与子件职责（§4）
4. 功能实现（§5）
5. 事件、浏览器、深色与窄屏验收（§7）

## 2. 复杂度

- 等级：**XL 特重**（Amis 入口源码 3223 行；Vamis 当前 2074 行 + 555 行 helper + 3 个单元格子件）
- 复杂度来源：数据域 / 行树 / 多套本地状态 / API / 事件动作 / 浮层 / 虚拟渲染 / 固定列 / 样式
- 施工粒度：**1 个切片**，不要和 `crud` / `table2` 混批；先写设计再动代码

## 3. Amis 契约

### 3.1 入口与源码

- 入口：`type: 'table'`
- Amis 渲染器：`packages/amis/src/renderers/Table/index.tsx`
- Amis 行树 / 合并 / 总结实现：`packages/amis/src/renderers/Table/*`
- 依赖：`tpl`、`mapping`、`action`、`popOver`、`badge`；`crud` / `table2` 复用本组件能力时另算
- 在线文档：[Vamis `/components/table`](/components/table) / Amis `/zh-CN/components/table`

### 3.2 核心 schema（实现必须覆盖）

| 属性 | 类型 | 默认 | 实现要求 |
|---|---|---|---|
| `source` | 字符串 / 变量 | `${items}` | 从当前数据域解析行数组；`items` prop 优先于 schema 本地数据 |
| `columns` | `Column[]` | — | 列配置、可见性、宽度、固定、合并、快速编辑都从这里派生 |
| `title` | 模板 | — | 标题栏；有标题或未提交修改时显示 heading |
| `header` / `footer` | SchemaNode | — | 顶部 / 底部内容，独立于工具栏 |
| `showIndex` | boolean | false | 序号列；嵌套路径显示 `1.2` |
| `bordered` / `tableLayout` | boolean / auto\|fixed | false / auto | 表格外框与表格布局；`bordered` 是 Vamis 优化，不是 Table2 网格 |
| `actions` / `itemActions` / `itemAction` | Action / Action[] | — | 顶部/底部工具栏、悬浮行操作、整行点击动作；`actions` 会同时进两套 toolbar |
| `selectable` / `multiple` / `hideCheckToggler` | boolean | false / true / false | 选择列；`rowCheckable` 还要受行条件控制 |
| `checkOnItemClick` | boolean | false | 点行勾选；与 `itemAction` 的点击判定要区分控件 |
| `draggable` | boolean | false | 行拖拽排序；需 `orderChange` 事件 + 未保存提示 |
| `footable` | boolean / 对象 | — | 按 `breakpoint` 把列收进展开行 |
| `expandConfig` / `childrenColumnName` | 对象 / string | — / children | 嵌套展开方式与子行字段 |
| `deferApi` | API | — | 行 `defer: true` 时展开加载详情与子行 |
| `combineNum` / `combineFromIndex` | number / 变量 | — / 0 | 自动合并相邻相同值；跳过前 N 列 |
| `prefixRow` / `affixRow` | Cell[][] | — | 顶部 / 底部总结行，支持 `colSpan`、`isHead`、模板 |
| `fixed`（列级） | left / right / none | none | 固定列；勾选/拖拽/展开列自动靠左 |
| `resizable` | boolean | true | 列宽拖拽；写 `tableLayout` 时仍要保留 |
| `columnsTogglable` | auto / boolean | auto | >5 列自动出现“自定义列” |
| `persistKey` | string | — | 隐藏列写入 localStorage；未写不缓存 |
| `affixHeader` / `affixFooter` | boolean | true / false | 吸顶表头 / 贴底底栏；`autoFillHeight` 时表头吸顶让位 |
| `autoFillHeight` | boolean / {height,maxHeight} | — | 内容区按视口/父级高度自适应 |
| `lazyRenderAfter` | number | 100 | 超过阈值启用虚拟窗口；与行树/展开联动 |
| `placeholder` | string | 暂无数据 | 空态 |
| `rowClassName` / `rowClassNameExpr` | string / 模板 | — | 静态 / 动态行 class |
| `itemBadge` | Badge schema | — | 行首角标 |
| `quickEdit`（列级） | boolean / object | false | 单元格编辑；`saveImmediately` 决定是否进修改态 |
| `hideQuickSaveBtn` | boolean | false | 隐藏“未提交”提示栏 |

**明确未接**：`reUseRow`（Vamis 按行对象/主键稳定识别，不按 `match` 复用）、工具栏 `export-excel` / `export-excel-template`（需要额外 Excel 依赖）。`quickSaveApi` 未实现自动保存；快速编辑只走事件 + 动作。

### 3.3 列契约（摘要）

| 属性 | 用途 | 注意 |
|---|---|---|
| `name` / `label` | 取值 / 表头 | `label` 支持模板；无 `name` 的列不能排序/快速编辑 |
| `type` | 列渲染器 | `text` / `plain` 走 `TableCellBody` 纯文本（tpl / placeholder / copyable / popOver）；其它 type 走 `SchemaRenderer`，表单项列额外保留 `name` 并写回行数据 |
| `tpl` / `placeholder` | 纯文本列 | `tpl` 在行数据域求值 |
| `width` / `align` / `headerAlign` / `vAlign` | 盒模型 | 固定列还要计算 sticky offset |
| `fixed` | 左/右固定 | 首列/选择列/拖拽列/展开列由 leadKinds 统一排 |
| `sortable` / `searchable` / `filterable` | 表头交互 | 本地排序 + 客户端搜索/筛选；filter 可带 source API |
| `quickEdit` | 单元格编辑 | 支持 input-text / input-number / select / textarea；`saveImmediately` 不记修改态 |
| `combineNum` / `groupName` | 合并 / 超级表头 | 合并基于可见列和行树；分组表头由 `tableColumnGroups` 算 |
| `breakpoint` | Footable | 命中宽度后列进展开区，不再渲染普通单元格 |
| `copyable` | 复制 | `TableCellBody` 处理；`content` 支持模板 |
| `popOver` / `remark` / `copyable` / `textOverflow` | 单元格附属 | 不能破坏纯文本列的 tpl 语义 |
| `backgroundScale` | 数值色阶 | 由 `tableBackgroundScale` 计算，行数据变化要重算 |
| `isHead` / `className` / `style` / `innerStyle` | 样式覆盖 | 只作用当前单元格，不改变行状态 |
| `onEvent` | click / mouseenter / mouseleave | 数据是行 + index；与表格级事件分开 |

### 3.4 事件与动作

事件（可被 `preventDefault` 的已标注）：

| 事件 | 参数要点 | 可阻止 |
|---|---|---|
| `selectedChange` | selectedItems / selectedIndexes / unSelectedItems | — |
| `rowClick` / `rowDbClick` | item / index / indexPath | `rowClick` 可阻止（阻止后不执行 `itemAction` / `checkOnItemClick`） |
| `rowMouseEnter` / `rowMouseLeave` | item / index / indexPath | — |
| `columnSort` | orderBy / orderDir | ✓ |
| `columnSearch` | searchName / searchValue | ✓ |
| `columnFilter` | filterName / filterValue | ✓ |
| `orderChange` | movedItems | ✓ |
| `columnToggled` | columns | — |
| `quickEdit` | item / name / value / index | — |
| `quickEditSubmit` | rows / rowsDiff / rowsOrigin / indexes | ✓ |

组件动作：

| 动作 | 参数 | 实现 |
|---|---|---|
| `select` / `selectAll` / `clearAll` | index / condition / selected | 写入 `selectedIds`，派发 selectedChange |
| `setValue` | value.items / rows；index / condition | core 通过 `setData` 触发，不是 `Table.doAction` 的分支；整表覆盖或按行 merge |
| `initDrag` / `cancelDrag` | — | 拖拽态切换 |
| `submitQuickEdit` | — | 派发 quickEditSubmit → 清空 pristine |
| `toggleExpanded` / `setExpanded` | index / condition / value | 行树展开 |

`Table` 注册的组件 API：

```ts
getData() → {
  items, rows, total,
  selectedItems, unSelectedItems, selectedIndexes
}
setData(values, replace?, index?, condition?)
```

行更新规则：指定 `index` / `condition` 时**始终 merge**；整表写入以 `items` / `rows` 覆盖，`setData` 的 `replace` 参数当前未生效（已知差异）；修改进入 `pristine` 供放弃还原。

## 4. Vamis 架构

### 4.1 文件与职责

| 文件 | 职责 |
|---|---|
| [`Table.vue`](../../../packages/vamis/src/renderers/Table.vue) | 数据管线、行树、选择、排序、筛选、拖拽、快速编辑、API、表头/表体/固定列/虚拟窗口 |
| [`table.ts`](../../../packages/vamis-core/src/utils/table.ts) | 纯函数：行树、路径、动作目标匹配、合并、列分组、总结行、色阶、Footable、排序、过滤、高度 |
| [`TableCellBody.vue`](../../../packages/vamis/src/renderers/table/TableCellBody.vue) | 单元格内容：text / tpl / mapping / popOver / copyable / 快速编辑壳 |
| [`TableHeadSearch.vue`](../../../packages/vamis/src/renderers/table/TableHeadSearch.vue) | 表头搜索弹层 |
| [`TableHeadFilter.vue`](../../../packages/vamis/src/renderers/table/TableHeadFilter.vue) | 表头筛选弹层 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | `--table-*` token、表头/行/固定列/吸顶/空态/修改态样式 |
| [`table.test.ts`](../../../packages/vamis-core/__tests__/table.test.ts) | 行树、路径、目标匹配、合并、分组、总结、色阶、Footable、排序等纯函数回归 |

**包边界**：渲染器不写 `<style>`、不直接 `fetch`；单元格子件读 `schema` / `data` / `env`；默认皮肤在 `@vamis/ui`。

### 4.2 数据管线（从源到可见行）

```text
schema.source / items / schema.data
        │  table2Source
        ▼
propItems ── localRows（setData 覆盖） ──> sourceItems
        │
        ├─ searchValues / filterValues ──> baseItems
        ├─ sortState ────────────────────> sorted
        ├─ dragOrder ────────────────────> orderedItems
        ├─ childrenColumnName / defer ───> tree (TableRowNode)
        ├─ expandConfig / expandedIds ───> visibleRows
        └─ lazyRenderAfter / scroll ─────> windowRows（虚拟窗口）
```

不变量：

1. **行 id 稳定**：`idOfData` 用 WeakMap 按行对象给 id；行对象被替换时要 `carryId`；路径 `index` / `indexPath` 只用于展示和动作定位。
2. **行树是唯一结构源**：选择、展开、合并、Footable、总结行、动作目标都从 `tree` 派生，不要各写一套平铺数组。
3. **本地覆盖优先**：`localRows` 非空时覆盖 `propItems`；新 props 到达时清空 `localRows` / `dragOrder` / `pristine` 并重算展开，避免旧数据/未提交态串台。选择集合按行 id 保留，但行 id 随新对象失效时要视为空选。
4. **事件可拦截**：上述可阻止事件必须在提交本地状态前 `await dispatch`，`event.prevented` 为真时回滚/不写入。
5. **修改先留原值**：`changeRow` 把旧行放 `pristine`，改回原值只比较顶层字段；`asPristine` 用于 `saveImmediately` 与初始化，不进未提交态。
6. **递归不要断**：`tableFlattenRows` 只展开已展开分支；虚拟窗口只能裁剪 `windowRows`，不能改变总行数/选择。

### 4.3 关键交互实现

- **选择**：`selectedIds` 以行 id 为键；`selectedChange` 从 `allRows` 取已选/未选；`multiple: false` 单选；`shift` 连选；`selectAll` 只作用于 `checkableRows`；`itemCheckableOn` 走行条件。
- **排序/搜索/过滤**：本地先由 `baseItems` 处理；`columnSort` / `columnSearch` / `columnFilter` 事件被阻止时不改 `sortState` / `searchValues` / `filterValues`；filter 的 `source` 通过 `requestApi` 拉选项并缓存。
- **拖拽**：`draggable` + 行级 `itemDraggableOn`；拖拽过程中 `dragOrder` 暂存顺序；`orderChange` 未阻止才提交并清空未保存态；嵌套表不显示拖拽入口。
- **快速编辑**：`changeRow` 统一处理快速编辑与单元格内表单项；`quickEdit` 事件在行 patch 后派发；`quickEditSubmit` 带 diff/origin/indexes，可阻止；`hideQuickSaveBtn` 关闭未提交条；`saveImmediately` 直接作为原值生效。
- **嵌套 / Footable / 懒加载**：`tree` 由 `tableBuildRows` 建；`expandConfig` 控制默认展开（first/all/none/accordion）；`footable` 按 `breakpoint` 把列收进展开行；`defer` 行在展开时用 `deferApi` 拉详情，行自己的 `deferApi` 优先。
- **固定列 / 吸顶 / 虚拟**：`leadKinds` 统一排选择/拖拽/展开列；sticky offset 由实测列宽计算；`affixHeader` 用克隆表头吸顶；`lazyRenderAfter` 超出后只渲染窗口行，滚动/展开/列宽变化都要更新测量。
- **组件 API**：`getData` 返回树顶层 `items` 与选中行；`setData` 支持整表替换和按 `index` / `condition` merge；`doAction` 覆盖选择、拖拽、快速编辑、展开动作。

### 4.4 测量与滚动

固定列、吸顶表头和虚拟窗口共享同一套测量状态，改动时不要各测各的：

- `measure()` 在挂载、列宽/列显隐变化、数据变化、窗口 resize 后更新 `colPx`、吸顶克隆宽度/表头高度；`affixReady` 需要列宽数量与克隆宽度都有效才为 true。
- 固定列 sticky offset 从左侧 lead 列 + 当前列实际宽度累计；右侧固定从总宽反推。
- 虚拟窗口只在 `lazyRenderAfter` 阈值以上启用；行高取已渲染行的平均值，展开/Footable 行高变化后要重新量。
- `autoFillHeight` 时内容区自己滚，`affixHeader` 让位；两者同时存在时不要重复监听 scroll。
- 修改 `measure()` 后至少手测：表头吸顶、左右固定、列宽拖拽、展开行、窗口 resize、深色。

### 4.5 刷新 / 状态矩阵

| 触发 | localRows | dragOrder | pristine | selectedIds | expandedIds | deferLoaded |
|---|---|---|---|---|---|---|
| `source` / `items` 变化 | 清空 | 清空 | 清空 | **不主动清空**；新行 id 失效时视为未选 | `initExpanded()` 重算 | **不清空**（已知差异：可能保留旧懒加载标记） |
| `setData({items})` | 覆盖 | 清空 | 清空 | 不主动清空 | 重算 | 不清空 |
| 排序 / 搜索 / 过滤 | — | 清空 | — | 保留 | 保留 | — |
| 开始拖拽 | — | — | — | **清空并派发 selectedChange** | 保留 | — |
| `orderChange` 提交 | 写入本地顺序 | — | — | 保留 | 保留 | —；同时清空排序/搜索/过滤 |
| 快速编辑 | — | — | 记录/还原 | 保留 | 保留 | — |

> 选择集合按行 id 保留是当前事实；行对象刷新后 id 失效会静默表现为未选。实现 `reUseRow` 时必须明确是否迁移这些 id。

### 4.6 样式与视觉

- 组件 token：`--table-row-h` / `--table-cell-*` / `--table-thead-*` / `--table-checked-*` / `--table-heading-*` / `--table-modified-*`，定义在 `@vamis/ui/styles.css`。
- 密度：紧凑/舒适走 `[data-density]` 的 token 覆盖；行高/单元格 padding/表头/工具栏都走变量，不写死 px。
- 固定列：左侧 sticky 用 `left` 实测偏移，右侧用 `right`；表头/表体/吸顶克隆必须同步宽度与 sticky。
- 深色：只依赖 token；不要给 `.dark .vamis-table` 另写一套颜色，检查表头分隔、hover、修改态、空态、固定列阴影。
- 渲染器禁止 `<style>`；作者 `className` 只打在 `div.vamis-node`。

## 5. 研发切片（建议顺序）

### P0 基座（已具备，回归时先跑）

1. `source` → `tree` → `visibleRows` 主链；空态、序号、行 class。
2. 列类型、宽度、文本溢出、tpl / mapping / popOver / copyable / remark。
3. 选择（单选/多选/全选/条件）、行点击、行操作、行角标。
4. 表头排序/搜索/筛选、固定列、列宽拖拽、列显示切换。

### P1 交互（改这里必测事件拦截）

1. 快速编辑：文本/数字/select/textarea、`saveImmediately`、`quickEditSubmit`、放弃还原。
2. 行拖拽：`orderChange`、未保存提示、嵌套表禁用。
3. 嵌套 / Footable / `deferApi` 懒加载；展开状态与虚拟窗口联动。
4. 合并单元格、超级表头、总结行；合并只基于 `tree` 顶层行（子行不参与），新增/隐藏列后重算 span / sticky。

### P2 性能与收尾

1. `autoFillHeight` + 吸顶表头 + 虚拟窗口三者的高度/滚动同步。
2. `persistKey` 列缓存、`resizable` 与固定列、Footable 的边界组合。
3. 深色双站核对、窄屏 page 对照、长文本/空值/无 name 列等异常。
4. 未接项单独立项：`reUseRow`、`export-excel`（不要顺手塞进普通样式刀）。

## 6. 未接项设计（给下一刀）

### reUseRow: 'match'

主仓当前未接（默认按行对象 WeakMap 识别，不做业务主键匹配）。隔离 worktree 的实践结论，建议按以下语义落地：

- 匹配键：`schema.primaryField`，默认 `id`，支持点路径；主键字符串化比较（`1` 与 `'1'` 同一行）；空 / 对象 / 数组主键不匹配。
- 匹配范围：顶层行 + `childrenColumnName` 子行递归；重复主键按遍历顺序一一配对。
- 命中后：通过 `carryId(previous, next)` 沿用内部行 id；保留 selection / expanded 中仍有效的 id；清空 `localRows` / `dragOrder` / `pristine` / `deferLoaded`；`deferErrors` 清空。
- 默认不写 `reUseRow`：保持现有对象身份语义；`reUseRow: false` 仍未实现，不要把 `match` 当成 `false`。
- 验收：选择/展开跨刷新保留；未提交 quickEdit 仍清空；子行匹配；重复/空主键；`setData` 整表路径不受影响；补纯函数 + Table.vue 接线测试。

### export-excel

主仓未接；需要单独依赖（exceljs + file-saver / 按需 import）和工具栏动作，不要塞进普通 Table 刀。设计前先定：全量还是可见列/选中行、合并/总结/Footable 如何处理、服务端 `api` 导出还是前端生成、文件名与列顺序。

## 7. 验收完成度

> 口径：`[x]` = 代码/文档/既有测试已具备；`[ ]` = 未实现或本轮未核。**未勾选不等于未实现**，工程验证必须单独重跑。
> 核对时间：2026-11-18；核对依据：`Table.vue`、`table.ts`、`table.test.ts`（35 项）与在线文档。

### 7.1 功能

功能实现：**13 / 15**（2 项未完成/未核）。

- [x] 基本列 / 数据源 / 空态 / 序号 / 行 class / 标题
- [x] 选择：多选、单选、全选、shift、`itemCheckableOn`、`checkOnItemClick`
- [x] 行操作：`itemActions`、`itemAction`、行点击/双击/悬浮事件
- [x] 列排序、搜索、过滤、列宽拖拽、列显示切换
- [x] `persistKey` 隐藏列恢复
- [ ] `persistKey` 列顺序恢复：当前只写 `columnOrder`，读取只读 `unToggledColumns`（已知差异）
- [x] 列类型：tpl / mapping / tag / action / popOver / copyable / 色阶 / `isHead`
- [x] 合并、超级表头、总结行、行角标（合并只覆盖 `tree` 顶层）
- [x] 嵌套、Footable、`deferApi`、`expandConfig`
- [x] 快速编辑四种控件、`saveImmediately`、提交/放弃、`quickEditSubmit`
- [x] 拖拽排序与 `orderChange`
- [x] 固定列、吸顶表头、`affixFooter`、`autoFillHeight`
- [x] `lazyRenderAfter` 虚拟窗口
- [ ] 虚拟窗口 + 固定列 + Footable + 展开的组合边界（实现存在，未做专项核验）
- [x] 组件 API：`getData` / `setData`（整表 + 按行） / 动作表

### 7.2 工程

工程验收：**4 / 8**（本轮可验证项已过，浏览器/对照项待核）。

- [x] `packages/vamis-core/__tests__/table.test.ts`：**35 passed**
- [x] `pnpm test`：formula 185 + core 803 + sdk 88 = **1076 全过**
- [x] `pnpm typecheck`：**0**
- [x] 渲染器无 `<style>` / 无直接 `fetch`：静态检查通过（样式守卫另行覆盖）
- [ ] `pnpm compare --page table` 桌面：TODO 记录 2026-11-17 **65/65**，但本轮未重跑
- [ ] `pnpm compare --page table --mobile`：本轮未重跑
- [ ] 组件页活示例运行、控制台无 error：本轮未核
- [ ] 深色（表头/固定列/修改态/空态）逐项：TODO 记录未逐章完成

### 7.3 结论

- 功能主路径已覆盖，剩余功能缺口是 `persistKey` 列顺序与虚拟窗口组合边界；
- 工程侧最主要缺口是**对照/深色/活示例未在本次核对中重跑**，不能把 88% 当成“验收完成”；
- 下一次改 Table 先补 `compare --page table`（桌面+移动）与深色截图，再动功能。

## 8. 已知缺口与风险

| 项 | 状态 | 说明 |
|---|---|---|
| `reUseRow` | 未接 | 当前按行对象/主键识别；不要声称已支持 `match` |
| `export-excel` / 模板 | 未接 | 需要独立依赖与工具栏动作，不要顺手做 |
| `quickSaveApi` | 未接 | 快速编辑只走事件 + `submitQuickEdit`，不会自动请求 |
| 深色逐章节 | 未完成 | TODO 记录：深色双站核对没逐章完成 |
| 大表格 | 有虚拟窗口 | 但嵌套 + 固定列 + Footable 组合仍需实测 |
| 窄屏 | 有 Footable | 与 page/CRUD 的移动对照仍要单独核 |

## 9. 参考

- [在线 Table 文档](/components/table)（属性 / 事件 / 动作完整表）
- [组件 TODO `table` 行](../../superpowers/specs/2026-10-20-vamis-component-todo.md#L269)
- [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)
- [组件规则](../../../.cursor/rules/component.mdc)
- [Amis Table 源码](https://github.com/baidu/amis/tree/master/packages/amis/src/renderers/Table)（只读对照）

---

返回 [组件设计索引](README.md)
