# CRUD 增删改查 · `crud` 设计

> 状态：**进行中 73%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/crud) · Amis：`/zh-CN/components/crud`
> 盘点日期：2026-11-18。本文是**研发设计文档**；属性 / 事件 / 动作全表以在线文档为准。

## 0. 一页结论

CRUD 是“查询 + 列表 + 分页 + 行操作 + 批量操作 + 弹层表单”的胶水组件，Amis 的 CRUD 底层就是 Table / Cards + Query 表单。当前 Vamis 的 CRUD **自己画 Table 的 DOM**，只覆盖主路径，和 Table / Table2 的列能力没有共享。

因此研发 CRUD 时先分清三种工作：

1. **壳与数据管线**：api / query / pagination / loadDataOnce / syncLocation / 批量上下文；
2. **列表能力**：排序、筛选、快速编辑、列显隐、拖拽、嵌套——理想上复用 Table，现实中目前是轻量实现；
3. **行/弹层/动作**：详情、编辑、删除、bulkActions、卡片模式。

> **架构债**：CRUD 不应继续扩自己的手写 `<table>` 单元格；下一刀应先评估“CRUD 套 Table renderer”，否则列能力会继续分叉。本文按现状写边界，不按 Amis 的理想架构假装已完成。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **分页/查询语义**：`store.query` 是唯一查询源；翻页/改 perPage/筛选都走 `reload`；远程模式 query 里必须有 `page/perPage/orderBy/orderDir`，`sanitizeQuery` 不得把 page/perPage 再塞进额外参数。
2. **loadDataOnce**：首次拉全量（page=1, perPage=999999），之后翻页/筛选/排序**本地**处理；`allItems` 只存原始全量，不能把筛选后的列表覆盖回去。
3. **选择跨页**：默认 `keepItemSelectionOnPageChange !== true` 时翻页/刷新清空 `selectedItems`；批量动作只对当前 `selectedItems` 生效，`primaryField` 缺失时不要瞎猜 id。
4. **同步地址栏**：`syncLocation: true` 才写 URL；写 URL 用 `replaceState`，读回时只恢复 page/perPage 与查询字段，避免历史栈爆炸。
5. **弹层 reload 边界**：行操作弹层提交后 `reload` 目标是列表；不要把弹层表单数据写回当前行之外的作用域。
6. **网络边界**：只走 `requestApi(env)`；错误提示走 `env.notify`；组件内不直接 fetch。
7. **包边界/样式**：渲染器无 `<style>`；CRUD/toolbar/统计/操作列走 `--crud-*` token；深色只换 token。
8. **Picker 复用**：`pickerMode` 自动选择；默认 Picker 用 `mode: list`，单选 radio、多选 Checkbox；`value` + `primaryField` 回填已有选中项，普通 Picker 无 `bulkActions` 时不画“已选 N”。
9. **已选栏**：多选且 `keepItemSelectionOnPageChange` 时，选中项通过独立 `Crud-selection` 区显示；标签可单项移除，末尾“清空”只清 CRUD 选择，确认后由 Picker 写回。
10. **行树**：`mode: table` 的 `children` 行树复用 core `tableBuildRows / tableFlattenRows`；默认折叠，只展开当前分支；多选父节点级联子节点，`expandConfig` 控制默认展开。

### 1.2 边界用例

- `api` 缺失、`source`/本地 items、返回空列表、返回错误结构
- 远程分页 / `loadDataOnce` / `perPage` 切换 / 排序后分页
- `syncLocation` 打开时首屏、前进后退、筛选与 page 的覆盖顺序
- `children` 行树：默认折叠、单分支展开、父/子级联选择、跨页保留、`expandConfig`
- 批量选择：跨页、`keepItemSelectionOnPageChange`、无 `primaryField`、空选择
- `bulkActions` 默认启用、`selectable: true` 但无 bulk、`checkOnItemClick`
- 行操作 dialog / drawer 的 `reload` 目标、关闭回写、嵌套 CRUD
- `mode: cards` 的 headerToolbar 注入与 `source: $items`
- quickEdit（文本/select/textarea/number）、放弃、未保存提示
- 移动端分页/工具栏、深色、空态

### 1.3 优先级

1. 查询/分页/选择/URL 同步的语义
2. 列表能力与 Table 复用评估（架构债）
3. 行操作/弹层/批量动作
4. 样式/移动/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis 3359 行；Vamis 692 行）
- 依赖：`action`、`cards`、`dialog`、`drawer`、`form`、`mapping`、`pagination`、`service`、`spinner`、`table`、`tpl`
- 当前实现是**轻量 CRUD**：列表、分页、查询、行操作、批量、cards、quickEdit 主路径；不是完整 Table 列能力
- 施工粒度：**1 个切片**；不要与 Table 深化混刀

## 3. Amis 契约

### 3.1 入口与文档

- 入口：`type: 'crud'`
- Amis 渲染器：`packages/amis/src/renderers/CRUD.tsx`
- 在线文档：[Vamis `/components/crud`](/components/crud) / Amis `/zh-CN/components/crud`

### 3.2 核心属性（摘要）

| 属性 | 语义 | 实现要求 |
|---|---|---|
| `api` / `source` | 列表数据 | `api` 走 requestApi；无 api 时用本地 items；解析 `items/rows/data` 结构 |
| `loadDataOnce` | 一次拉全量后本地分页/筛选/排序 | 不能每次筛选都重拉；`matchFunc` 只做表达式 |
| `syncLocation` | page/perPage/查询同步 URL | 只在 true 时写；避免循环 |
| `perPage` / `page` | 分页 | 远程/本地都按同一 store.page/perPage |
| `filter` / `autoGenerateFilter` | 查询表单 | 提交走 reload(query)，不要直接改 items |
| `headerToolbar` / `footerToolbar` | 工具栏 | 支持 bulkActions / 自定义 schema；cards 模式注入 Cards-toolbar |
| `bulkActions` | 批量操作 | 默认启用 selectable；数据 `ids/items/rows/selectedItems` |
| `itemActions` / `columns` | 行操作/列 | 当前 columns 只覆盖基础列；复杂列能力待复用 Table |
| `primaryField` | 选中/批量主键 | 默认 id；缺主键不要用索引冒充 |
| `keepItemSelectionOnPageChange` | 翻页保留选择 | 默认 false |
| `matchFunc` | 本地过滤表达式 | 只支持表达式字符串；Amis JS 函数不支持 |
| `mode` / `card` | table/list/cards | cards 走 Cards 子件；table 目前手写 |
| `alwaysShowPagination` | 分页常显 | 与 lastPage > 1 规则一致 |
| `quickEdit`（列） | 单元格编辑 | 文本/数字/select/textarea；提交/放弃；未接 quickSaveApi |

### 3.3 事件

Amis 文档列出的 CRUD 事件（`fetchInited`、`quickSaveSucc`、`quickSaveItemSucc`、`saveOrderSucc`、`selectedChange`、`columnSort`、`columnFilter`、`columnSearch`、`orderChange`、`columnToggled`、`rowClick` 等）**当前 Vamis 只覆盖一部分**：

- 选择/行点击/排序/筛选等主要依赖手写 Table 的 DOM，`selectedChange` 等事件没有完整转发；
- quickSave* / saveOrder* 事件未接（也没有 quickSaveApi）；
- docs 事件表是按 Amis 目标写的，不能据此声称实现完整。

> 实现刀应优先决定：继续手写并补事件，还是把列表切到 Table renderer 后复用 Table 的事件/动作。后者的长期成本更低。

### 3.4 动作

- 已暴露：`reload`（scoped API）；`select` / `selectAll` / `clearAll` / `initDrag` / `cancelDrag` / `submitQuickEdit` / `toggleExpanded` / `setExpanded` 目前**没有完整 CRUD 实现**（Amis 转 Table 动作）。
- `setValue` 更新列表：Amis 支持 `items/rows + count/total`；Vamis 当前未完整接。
- 行操作 dialog/drawer 的 `reload` 由弹层 schema 控制，不要和 CRUD 根 reload 混。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`CRUD.vue`](../../../../packages/vamis/src/renderers/CRUD.vue) | store、query、reload、pagination、filter、toolbar、bulk、dialog、cards/list/table、pickerMode、quickEdit |
| [`crudHost.ts`](../../../../packages/vamis/src/renderers/data/crudHost.ts) | CrudHostKey、bulk schema、列表响应解析、primary id |
| [`RowValueHost.vue`](../../../../packages/vamis/src/renderers/data/RowValueHost.vue) | 行内表单项值宿主 |
| [`Pagination.vue`](../../../../packages/vamis/src/renderers/Pagination.vue)、`Cards.vue`、`Spinner.vue` | 分页 / 卡片模式 / loading |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | `--crud-*`、toolbar、统计、操作按钮 |

### 4.2 数据管线

```text
schema.api ──requestApi──> parseListPayload
      │                         │
      ├─ store.items/total <────┘
      ├─ store.query (page/perPage/filters/order)
      ├─ loadDataOnce: allItems → paginateLocal → store.items
      └─ syncLocation: URL page/perPage/query

store.items ──> list / 手写 table / Cards
      ├─ selectedItems (bulk scope)
      └─ dialog schema / itemActions
```

- `onMounted`：`syncFromLocation` → 有 api `reload`，无 api `seedLocalItems`。
- `reload(extra)`：合并 query；query 变化时 page=1；requestApi → parseListPayload；翻页清选择（除非 keep）。
- `pickerMode`：`value + primaryField` 只在值签名变化时 seed 一次选中行；翻页请求完成不得用当前页重新覆盖已选项，否则跨页标签会从完整 option 退化为 id / value。
- `loadDataOnce`：首次全量，后续 `paginateLocal` 做字段 contains + matchFunc 表达式 + 本地排序。
- `syncToLocation` 只在 `syncLocation === true` 时写 URL。

### 4.3 行操作与弹层

- operation 列的每个 button 都重新进入 `SchemaRenderer`，并按 Amis `OperationField` 的规则补 `type: button` / `size: sm`；`visibleOn` / `hiddenOn` / `disabledOn` 在这一层统一生效。
- button 的 `actionType` 走共享 `runAction`，不再由 CRUD 手写 toast / dialog / ajax 分支；操作列 AJAX 默认 reload 到内部 `crudTarget`（schema name / id / store id），显式 `reload: none` 才关闭自动刷新。
- 行内 button 的 `onEvent` 先于 CRUD 操作；`itemAction` / `clickAction` / `doAction` 等旁路也由 `runAction` / `runOnEvent` 入口的可见性闸门兜底，避免隐藏动作被程序调用。
- 弹层表单关闭后不能把 row 数据写到错误数据域；当前 `RowValueHost` 负责行内值。

## 5. 样式与边界

- 默认类：`.vamis-crud`、`.vamis-crud-body/content/filter/op/statistics/toolbar/toolbar-item`。
- toolbar 高度走 `--crud-toolbar-h`（紧凑 30 / 舒适 36）；分页、统计、操作列不要写死 px。
- 深色只用 token；空态、loading、禁用按钮、批量条在深色下要单独看。
- 渲染器无 `<style>`；作者 className 不替代默认皮肤。

## 6. 当前状态与缺口

- 已对齐主路径：api + sample 列、查询、分页、行详情/删除、bulk、cards 模式、loadDataOnce、syncLocation、quickEdit（文本/数字/select/textarea）、表达式 matchFunc；operation 列与共享 Action 宿主对齐。
- Picker 依赖切片：`pickerMode` 自动选择；`mode: list` 对齐 Amis `List + ListItem`（右缩 15px、行高 42.5、选中 `brand-10/brand-4`）；`multiple:false` 使用 radio 单选并支持整行点击；scoped `getData()` 暴露 selectedItems / selectedIds / items / page / perPage；`value + primaryField` 回填已有值；无 API 本地 source 进入本地分页并支持 keep selection；选中计数只在存在 bulkActions 时显示。
- Picker 多选栏：`pickerMode + multiple + keepItemSelectionOnPageChange` 时渲染 `已选N条：`、可删除标签和“清空”；普通 list 顶部已选计数仍只属于 bulkActions。
- `strictMode`：主键身份比较统一走严格 `===`；默认非严格模式允许 `1` 与 `"1"` 等价。seed、单选替换、多选移除与全选共用该比较器。
- `footerToolbar`：支持 `statistics` 关键字、`pagination` schema 与其它 SchemaRenderer 节点；自定义 pagination 会补当前 page / perPage / total / lastPage，并保留作者 `layout` 与 `showPageInput`。右栏 `max-width:100%`，Pagination 根 `white-space:normal`，窄弹框内按 Amis 自动分成 perPage / pager / go 行。
- `children` 行树：手写 Table 壳不再把子行拍平；`mode: table` 按 core 行树算法渲染缩进、展开钮和 `expandConfig`，选择走同一 `selectedItems`，Picker 的 `pickerSchema.mode: table` 因而不需要另造树协议。
- `columns-toggler`：CRUD 提供注入式列显隐状态，`headerToolbar` 的 `columns-toggler` / `column-toggler` 可切换普通列；未写 `columnsTogglable` 时按 Amis Table 的 auto 规则在超过 5 列时注入，显式 `false` 关闭。列拖拽排序尚未接入。
- 对照记录：桌面 / 移动 **63/92**（2026-11-24，P0 0；其余既有失败见对照报告，本刀未扩大处理）。
- 缺：
  - **列表能力分叉**：排序/筛选/拖拽/嵌套/行事件没有 Table 完整；长期应 CRUD 套 Table。
  - **事件/动作**：quickSave\*、saveOrder\*、部分 Table 动作未接。
  - **quickSaveApi**：快速编辑不会自动保存。
  - **JS 函数式 matchFunc** 不支持（只支持表达式）。
  - headerToolbar 关键字、复杂列配置、移动端深色逐章。

## 7. 验收计划与完成度

### 验收清单（文档核对：4 / 13）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 文件 / CrudHost / 子件已定位
- [x] 复杂度、依赖、集成面已盘点
- [x] `columns-toggler` 显式节点 / `columnsTogglable` auto 与列显隐回写
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前明确不完整）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [x] `pnpm test`（CRUD 相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page crud` 桌面
- [x] `pnpm compare --page crud --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- `loadDataOnce` 的本地筛选/排序与远程分页不串
- 选择跨页、`primaryField`、bulk 数据
- Picker 打开回填、无变更确认、普通 list 无 bulk 计数
- `syncLocation` 不循环、不污染历史
- 弹层提交后的 reload 目标
- cards 模式与 table 模式不是两套数据源

## 8. 后续

1. **先做架构决策**：CRUD 列表复用 Table renderer（推荐），还是继续手写并补事件/动作；决策前不要再扩列能力。
2. 若复用 Table：先抽 `resolveTableSource` / 行操作 / bulk 适配层，保留现有 store.query/reload。
3. 补 quickSaveApi / quickSave* 事件或明确不做，从在线文档移除误导。
4. 最后做移动/深色/嵌套 CRUD 的专项对照。

---

返回 [组件设计索引](../README.md)
