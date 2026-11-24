# Picker 列表选择器 · `picker` 设计

> 状态：**进行中 82% · 暂阻塞于 CRUD** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/picker) · Amis：`/zh-CN/components/form/picker`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Picker 是“表单字段 + 弹层列表 + pickerSchema 自定义内容”的组合控件：没有 `select` 的复杂键盘/搜索状态，但有**跨组件取值**难点——确认时要从内层 table / form 的组件 API 读回选中项。设计重点是值序列化、draft/confirm 边界和 pickerSchema 桥接。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值写回**：`selected` 计算属性经 `fieldApi.getValue/setValue`；`joinValues` / `extractValue` / `multiple` / `delimiter` / `valueField` 决定写 string、array 或 object；`labelField` 只影响展示。
2. **draft 与确认**：弹层打开时 `draft = [...selected]`；列表勾选只改 draft；`confirm` 才写表单。取消/关闭不得写值。
3. **内嵌模式**：`embed` 直接操作 `selected`（无弹层），但 `commitInline` 仍走同一序列化；不能另写一套值。
4. **pickerSchema 桥接**：确认时按 `id/name` 找内层组件 API：`selectedItems`（table/crud）或 `valueField` 字段（form）；找不到就保持 draft，不报错、不清空。
5. **选项来源**：静态 `options` / 变量 `source` / API `source` 归一为 `rawOptions`；远程失败保留空选项，不覆盖已有选择。
6. **分页/搜索**：`perPage` 按“行”（组头占行）分页；搜索重置 page=1；跨页 draft 保留。
7. **包边界**：渲染器无 `<style>`、无直接 fetch（`requestApi` 除外）；默认皮肤走 `@vamis/ui` token。

### 1.2 边界用例

- 单选/多选、`joinValues` / `delimiter`、空值 / `clearable`
- `multiple` + `pickerSchema` 内层多选 table
- pickerSchema 内层 form 单选/数组字段
- pickerSchema 未写 id/name、组件未注册、组件已卸载
- `source` 变量 / API / 慢返回 / 失败 / 空结果
- 分组 options、组头不选、搜索回补组头
- `maxTagCount` + `+N`、标签删除（如支持）
- `perPage`、最后一页、搜索重置页码
- `embed` 与弹层两种模式
- `placeholder` / `modalTitle` / 窄屏 / 深色

### 1.3 优先级

1. 值序列化与 draft/confirm
2. pickerSchema 桥接
3. source / 分组 / 分页/搜索
4. 内嵌 / 标签 / 样式
5. 对照/深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/Picker.tsx` 911 行；Vamis 280 行）
- 依赖：`FormItem`、`Options`、`table` / `form`（pickerSchema 桥接）、`dialog`/`badge`
- Vamis 行数少但桥接依赖外部组件 API，回归面在协议而非 UI

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'picker'`
- Amis 渲染器：`packages/amis/src/renderers/Form/Picker.tsx`
- 在线文档：[Vamis `/components/form/picker`](/components/form/picker)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `options` | 静态选项 | 支持 `children` 分组；组头不可选 |
| `source` | 远程/变量选项 | 变量 `${...}` 或 API；失败保留空 |
| `multiple` / `joinValues` / `delimiter` | 值形态 | 与 Options 族共用序列化 |
| `labelField` / `valueField` | 字段映射 | 桥接 table/form 时也按 valueField 取值 |
| `embed` | 内嵌 | 不弹层，直接改 selected |
| `maxTagCount` | 标签折叠 | `+N`，不改变值 |
| `perPage` | 弹层分页 | 组头占行；搜索回第一页 |
| `clearable` | 清除 | 写空，不触发独立事件 |
| `modalTitle` | 弹层标题 | 缺省用 label/请选择 |
| `pickerSchema` | 自定义弹层 | 内层 table 读 selectedItems；form 读 valueField 字段 |
| `placeholder` | 未选占位 | FormItem 也有一套，避免覆盖错 |

### 3.3 事件 / 动作

- `change`：写值前派发，payload 含 `value` / `option` / `selectedItems` / `items`，支持 `preventDefault()`。
- `itemClick`：点击已选 tag label 时派发当前 option。
- 当前 **无专属动作**；不要按 select 的 clear/reset 猜。
- 值变化由 FormItem/字段监听；没有 `change` 事件就不要在文档里声称有。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Picker.vue`](../../../../packages/vamis/src/renderers/form/Picker.vue) | 值/选项/弹层/内嵌/分页/搜索/标签/pickerSchema 桥接 |
| [`optionsControl.ts`](../../../../packages/vamis/src/optionsControl.ts) / [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts) | 选项归一/选中/序列化 |
| [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | picker 标签/占位/弹层列表 token |

### 4.2 数据/状态

```text
source/options ──normalize──> rawOptions ──> options（叶子）
        │                         │
        ├─ allRows（组头+选项）  ├─ filteredRows（搜索）
        └─ pagedRows（perPage）  └─ modal / embed

selected ← rawValue/name + valueField
draft    ← openPicker 时复制 selected
confirm  → pickerSchema 桥接 → selected = draft → FormItem 写值
```

- 值序列化在 `selected` setter：`multiple` + `joinValues` 拼 delimiter，否则 array/单值。
- `selectedLabels` 只用于展示；值失效/选项缺失时仍显示 raw value。
- `pickerSchema` 确认前按内层组件 `id/name` 取 API；读取失败保持原 draft。

### 4.3 pickerSchema 协议

| 内层 | 读取 | 说明 |
|---|---|---|
| table / crud | `getData().selectedItems` | 每项按 `valueField` 取 value |
| form | `getData()[valueField]` | 数组或单值 |
| 其它 | 无 | 保持 draft，不猜测 |

要求内层组件注册 `id` 或 `name`；`getData` 必须返回稳定数据。嵌套组件卸载后取不到就静默保持，不要写 undefined。

## 5. 样式与边界

- 默认类：`.vamis-picker`、`.vamis-picker__placeholder`、`.vamis-picker__group` 等，位于 `@vamis/ui/styles.css`。
- 标签/占位/弹层/分页走 token；渲染器无 `<style>`；深色只替换 token。
- 窄屏弹层高度、标签换行、`+N` tooltip 需单独核。
- 作者 className 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已对齐：默认 trigger 单输入框 / tag 内嵌关闭 / picker icon；静态 options、multiple、`joinValues` / `extractValue`、弹层搜索/确认/取消、embed、maxTagCount、远程/变量 source、children 分组、perPage 弹层分页、pickerSchema（table selectedItems / form valueField）与 selected options 合并。
- 已接：`change` / `itemClick`、`resetValue` 清空、数据链 source、`+N` 隐藏标签 title。
- 对照：桌面 / 移动 2/2（P0 0），trigger 926×32 与 Amis 一致。
- 实现顺序：Amis `buildSchema()` 最终生成 `type: crud`，因此默认弹框必须复用 CRUD；当前自绘 list 只保留为过渡，不继续仿 CRUD 盒模型。先补 CRUD，再恢复 Picker 弹框专项。
- 缺：CRUD 依赖、`modalMode: drawer`、`strictMode`、树选择；pickerSchema 内其它组件类型桥接未定义；分组组头键盘/可访问性未专项核。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Picker / options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [x] change / itemClick；当前无独立动作
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [x] `pnpm test`（Picker 相关）
- [ ] `pnpm typecheck` 0
- [x] `pnpm compare --page picker` 桌面
- [x] `pnpm compare --page picker --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 取消不写值、确认才写
- pickerSchema 内外层值映射
- source 失败/空结果不丢已选
- 分组/分页/搜索的标签与 page
- embed 与弹层两套路径

## 8. 后续

1. pickerSchema 协议补“内层其它类型（list/cards）”或明确只支持 table/form。
2. 树选择/分组键盘操作单独立项。
3. 标签删除、`+N` tooltip、窄屏弹层做交互专项。

---

返回 [组件设计索引](../README.md)
