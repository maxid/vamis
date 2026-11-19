# Select 下拉选择器 · `select` 设计

> 状态：**进行中 92%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/select) · Amis：`/zh-CN/components/form/select`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Select 是 `Options` 控件族的参照实现：值、选项、搜索、远程 source、分组、标签溢出、移动端选择器和新增/编辑选项都叠在同一个控件上。它不直接实现表单值；值统一走 `useOptionsControl` + `useFieldValue`，因此**状态归属**和**值序列化**是第一边界。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值序列化**：`multiple` / `joinValues` / `extractValue` / `delimiter` 决定写回 string 还是 array；`labelField` / `valueField` 决定选项映射。改任一都同时影响表单值、`selectedItems`、事件参数和 remote 回填。
2. **值来源**：有 Form 走 `useFieldValue`（Form 或 ValueHost/Scope）；无 Form 也不能直接写 `props.data`。`name` 路径按 FormItem 契约。
3. **选项来源**：本地 `options` / 远程 `source` / `deferApi` / 搜索 API / `autoComplete` 的优先级由 `useOptionsControl` 决定，Select.vue 不另建选项缓存。
4. **事件时序**：值变化先完成写值/选项状态，再派发 `change`；`focus` / `blur` 对应打开/关闭；新增/编辑/删除的 `*Confirm` 目前**未接**，不能声称已支持。
5. **移动端**：窄屏 `VamisPopUp` 底部弹层；滚轮/多选草稿在 `confirmMobile` 才写回，不能边滚边提交。
6. **标签折叠**：宽度测量决定可见标签 + `+N`；测量在 mount/resize/值变化后进行，不能在模板里硬编码数量。
7. **包边界**：渲染器无 `<style>`、无直接 fetch；`requestApi` 只在 `useOptionsControl`/工具层；样式走 token。

### 1.2 边界用例

- 单选/多选、`joinValues` / `extractValue` / `delimiter` 组合；空值 / `resetValue`
- `value` 是 number / string / array；option value 重复；禁用项
- 本地 options / 远程 source 慢返回 / 失败 / 空结果 / 变量 `${...}`
- `searchable` 本地过滤 / `filterOption` / `searchApi` / `autoComplete` 竞态
- 分组 `children`、`menuTpl`、`selectMode: group`
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

- 等级：**XL 特重**（Amis `Form/Select.tsx` 812 行；Vamis `Select.vue` 832 行 + `optionsControl.ts` 570 行 + core `options.ts` 805 行）
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
| `selectMode` | 普通/分组/表格/树/链式/人员 | 当前只覆盖主路径；table/tree/chained/associated 未接 |
| `menuTpl` | 自定义选项 | SchemaRenderer 渲染，数据含 option |
| `maxTagCount` / 标签折叠 | 多选标签 | 测量 + `+N` tooltip |
| `addControls` / `editControls` / `deleteControls` | 选项增删改 | 现有新增/编辑/删除路径；`*Confirm` 事件未接 |
| `checkAll` / `checkAllBySearch` | 全选 | 只对可选叶子；搜索时是否只全选当前结果 |
| `resetValue` | 清空值 | clear 动作写它 |
| `disabled` / `static` / `readOnly` | 状态 | 由 FormItem/控件统一，禁用项不能选 |
| `overlay` / `popOverContainerSelector` | 弹层 | 移动端 height/placement；不要另写定位 |

### 3.3 事件

已接：`change`、`focus`、`blur`。

未接：`addConfirm`、`editConfirm`、`deleteConfirm`（新增/编辑/删除选项的确认事件）。事件参数以 `[name]` / `selectedItems` / `items` 为主，不要自造第二套。

### 3.4 动作

已接：`clear`、`reset`、`reload`、`setValue`。

`clear` 写 `resetValue`（默认空串）；`setValue` 写值后要同步 selected/选项；`reload` 重新拉 source。不要绕过 `useOptionsControl` 直接改 options。

## 4. Vamis 架构

### 4.1 文件与职责

| 文件 | 职责 |
|---|---|
| [`Select.vue`](../../../../packages/vamis/src/renderers/form/Select.vue) | 下拉弹层、搜索、标签、移动端 wheel/多选、新增/编辑/删除、menuTpl |
| [`optionsControl.ts`](../../../../packages/vamis/src/optionsControl.ts) | 值/选项/远程 source/搜索/全选/提交的统一状态机 |
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
- **分组**：`children` 只作展示/组头，叶子才可选；`selectMode: group` 的组头样式与全选边界单独测。
- **移动端**：单选滚轮在 confirm 时 `commit([item])`；多选维护 `mobileDraft`，确认才写回；关闭不提交。
- **标签折叠**：`measureTags` 计算可见数量；`maxTagCount` / 宽度变化 / 值变化触发；`+N` tooltip 不能裁切。

## 5. 样式与边界

- 默认类：`.vamis-select`、`.vamis-select-overflow`、`.vamis-select__chip`、`.vamis-select__caret`、`.vamis-popup__picker` 等，位于 `@vamis/ui/styles.css`。
- 弹层/标签/tooltip 走 token；渲染器无 `<style>`；深色只替换 token。
- 窄屏：选择器底部弹层高度、滚轮行高、多选确认栏；不要用桌面 dropdown 直接缩窄。
- 作者 `className` 只落 `div.vamis-node`；不要用 Tailwind 默认类代替控件皮肤。

## 6. 当前状态与缺口

- 已对齐：分组 Transfer 检索框、小复选框、多选 tag hover tooltip、按宽度 `+ N`、溢出标签表格、`menuTpl`、`searchable` / `filterOption` / `searchApi`、移动端底部弹层（单选滚轮 / 多选草稿 / 搜索 / 确认写入）、`selectMode: group`、全选、`autoComplete`、桌面平铺选项虚拟列表（`virtualThreshold` / `itemHeight`，对齐 Amis 266 视口 / 32 行高）。
- 对照：TODO 记录桌面/移动 select 主路径；本轮未重跑。
- 缺：`selectMode` table/tree/chained/associated、`deferApi`、人员点选；`addConfirm` / `editConfirm` / `deleteConfirm` 事件；`allowCreate` 的完整边界。
- 已接新增/编辑/删除选项 UI，但不要与 `*Confirm` 事件混为一谈。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Select/optionsControl/options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（Select/Options 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page select` 桌面
- [ ] `pnpm compare --page select --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- `multiple` × `joinValues` × `extractValue` × `delimiter` 的值形态
- 远程/搜索/自动补全竞态与失败
- 移动端确认前不写值
- 全选只选可选叶子、搜索全选范围
- 标签折叠在 resize/值变化后正确

## 8. 后续

1. 先补 `addConfirm` / `editConfirm` / `deleteConfirm` 事件（需定 payload 与 preventDefault 语义）。
2. `selectMode: table/tree/chained/associated` 单独立项，优先复用 Table/Tree 能力，不复制三套。
3. `deferApi` 与人员点选按 Options 族统一收口。
4. 值序列化矩阵补组件级测试后再动样式。
5. 虚拟列表只覆盖桌面平铺选项；分组菜单保持整表渲染，后续若接需同时处理分组行高与选中回滚。

---

返回 [组件设计索引](../README.md)
