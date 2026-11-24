# Picker 列表选择器 · `picker` 设计

> 状态：**进行中 98%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/picker) · Amis：`/zh-CN/components/form/picker`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Picker 是“表单字段 + CRUD 弹层 + pickerSchema 自定义内容”的组合控件：Amis `buildSchema()` 会把默认 `pickerSchema` 强制构造成 `type: crud`，因此 Vamis 也不在 Picker 内自绘列表。设计重点是值序列化、draft/confirm 边界、CRUD 选中协议和 pickerSchema 桥接。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值写回**：`selected` 计算属性经 `fieldApi.getValue/setValue`；`joinValues` / `extractValue` / `multiple` / `delimiter` / `valueField` 决定写 string、array 或 object；`labelField` 只影响展示。
2. **draft 与确认**：弹层打开时 `draft = [...selected]`；列表勾选只改 draft；`confirm` 才写表单。取消/关闭不得写值。
3. **内嵌模式**：`embed` 直接渲染同一份 CRUD 列表，不经弹层；选择结果仍走同一 `commitPickerValues` 序列化，不能另写一套值。
4. **pickerSchema 桥接**：确认时按 `id/name` 找内层组件 API：`selectedItems`（table/crud）或 `valueField` 字段（form）；找不到就保持 draft，不报错、不清空。
5. **选项来源**：静态 `options` / 变量 `source` / API `source` 归一为 `rawOptions`；远程失败保留空选项，不覆盖已有选择。
6. **分页/选择**：默认 `perPage` 交给 CRUD 本地分页；`keepItemSelectionOnPageChange` 保留跨页选中；自定义 CRUD 搜索/分页沿用 CRUD 契约，不在 Picker 另造一套。
7. **包边界**：渲染器无 `<style>`、无直接 fetch（`requestApi` 除外）；默认皮肤走 `@vamis/ui` token。

### 1.2 边界用例

- 单选/多选、`joinValues` / `delimiter`、空值 / `clearable`
- `multiple` + `pickerSchema` 内层多选 table
- pickerSchema 内层 form 单选/数组字段
- pickerSchema 未写 id/name、组件未注册、组件已卸载
- `source` 变量 / API / 慢返回 / 失败 / 空结果
- 分组 options：默认 CRUD list 保留顶层组行，不自动展开 children
- `maxTagCount` + `+N`、标签删除（如支持）
- `perPage`、最后一页、跨页选中
- `embed` 与弹层两种模式
- `placeholder` / `modalTitle` / 窄屏 / 深色

### 1.3 优先级

1. 值序列化与 draft/confirm
2. pickerSchema 桥接
3. source / CRUD 分页 / 分组行
4. 内嵌 / 标签 / 样式
5. 对照/深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/Picker.tsx` 911 行；Vamis 434 行）
- 依赖：`FormItem`、`Options`、`crud`（默认弹层与 pickerMode）、`table` / `form`（自定义 pickerSchema 桥接）、`dialog`
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
| `modalMode` | `dialog` / `drawer` | drawer 默认右侧 500px，窄屏 100% |
| `modalSize` | 弹层尺寸 | dialog / drawer 共用尺寸枚举 |
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
| [`Picker.vue`](../../../../packages/vamis/src/renderers/form/Picker.vue) | 值/选项/弹层/内嵌/标签/pickerSchema 桥接；默认生成 CRUD list schema |
| [`CRUD.vue`](../../../../packages/vamis/src/renderers/CRUD.vue) | `pickerMode`、单选/多选、`mode: list`、选中值回填与 scoped `getData()` |
| [`optionsControl.ts`](../../../../packages/vamis/src/optionsControl.ts) / [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts) | 选项归一/选中/序列化 |
| [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | picker 标签/占位、500px 弹框与 CRUD ListItem token |

### 4.2 数据/状态

```text
source/options ──normalize──> rawOptions ──> effectivePickerSchema(source=$items)
                                      │
                                      ├─ type: crud / mode: list
                                      ├─ pickerMode / keepItemSelectionOnPageChange
                                      └─ value=draft / primaryField=valueField

selected ← rawValue/name + valueField
draft    ← openPicker 时复制 selected
CRUD     → getData().selectedItems
confirm  → 桥接 selectedItems → commitPickerValues → FormItem 写值
```

- 值序列化在 `selected` setter：`multiple` + `joinValues` 拼 delimiter，否则 array/单值。
- `selectedLabels` 只用于展示；值失效/选项缺失时仍显示 raw value。
- 默认和自定义 `pickerSchema` 都最终生成 `type: crud`；确认前按内层组件 `id/name` 取 API，读取失败保持原 draft。
- CRUD 通过 `value` / `primaryField` 回填已有选中值；普通 Picker 没有 bulkActions，不显示“已选 N”。
- `embed` 通过内部选择回调立即调用 `commitPickerValues`；弹框只更新 CRUD 选择，点击确认后才写表单。

### 4.3 pickerSchema 协议

| 内层 | 读取 | 说明 |
|---|---|---|
| table / crud | `getData().selectedItems` | 每项按 `valueField` 取 value |
| form | `getData()[valueField]` | 数组或单值 |
| 其它 | 无 | 保持 draft，不猜测 |

要求内层组件注册 `id` 或 `name`；`getData` 必须返回稳定数据。嵌套组件卸载后取不到就静默保持，不要写 undefined。

## 5. 样式与边界

- 默认类：`.vamis-picker__dialog`、`.vamis-crud-list`、`.vamis-crud-list-item` 等，位于 `@vamis/ui/styles.css`。
- 弹框实测：内容 `500×240`（3 项 `283.5`）、行高 `42.5`、列表右缩 `15px`、ListItem 底边距 `8px`、标题 500 / 14 / 21、关闭钮 `16×22`、圆角 6px。
- Trigger：Picker 不消费 FormItem 的 `size` 宽度档；`size: lg` 仍铺满 1230px 值列。不要再给 Picker 套 `--form-control-width-lg`。
- Drawer 实测：桌面右侧 `500×800`、header 54、body 上下 24、footer 57 / padding 12 / gap 20、关闭钮 `12×16`；375px 下抽屉 375 全宽、header 374（左 1px 边框）。
- 选中行使用 Amis `brand-10` 底 / `brand-4` 字色；普通 Picker 的 CRUD 不挂 bulkActions 时不得显示选中计数。
- 渲染器无 `<style>`；深色只替换 token；窄屏弹层与 `+N` tooltip 仍需逐项核。
- 作者 className 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已对齐：默认 trigger 单输入框 / tag 内嵌关闭 / picker icon；静态 options、multiple、`joinValues` / `extractValue`、默认 CRUD list 弹框、`modalMode: drawer` / `modalSize`、embed、`overflowConfig.maxTagCount` / `displayPosition` / `overflowTagPopover` / `overflowTagPopoverInCRUD`、`itemClearable`、`staticItemClick`、`strictMode`、远程/变量 source、children 顶层组行、CRUD 本地分页、pickerSchema（table selectedItems / form valueField）与 selected options 合并。
- 已接：`change` / `itemClick`、`resetValue` 清空、数据链 source、`+N` 隐藏标签 title。
- 已收口：默认弹框由 CRUD `mode: list` 承载；已选回填、选中行、无 bulkActions 时不显示计数、已有值打开与无变更确认均有回归。多选时 CRUD 顶部显示 `已选N条 / 标签 / 清空`；source 后到时使用 Picker 完整 rawOptions 把 `{id}` 描述符 hydration 为真实 label。Drawer 桌面 500px、header 54、body 上下 24、footer 57；375px 全宽。
- 文档：主 TOC 与 Amis 6.13 同序，属性表补 `autoFill` / `overflowConfig` / `itemClearable`，事件表补 `change` / `itemClick` / `staticItemClick`；补充示例不再占用主章节。
- 对照：桌面 / 移动 **8/9**（P0 0；余 1 为 Amis `${selectedValue}` 对比器读数差），trigger 926×32 与 Amis 一致；真实弹框 500px / 盒模型与 Amis 计算值一致。内嵌、visibleOn、maxTagCount 两节均是 live schema，source 后到会用完整 option pool 把 `{id}` 描述符 hydrate 成真实 label。
- 缺：树选择；pickerSchema 内其它组件类型桥接未定义；分组组行键盘/可访问性未专项核。

## 7. 验收计划与完成度

### 验收清单（文档核对：11 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Picker / options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [x] schema 属性 / 默认值逐项核对
- [x] change / itemClick；当前无独立动作
- [x] 默认弹框 / 已有值回填 / 选中行 / 取消确认边界
- [x] 组件页活示例运行、无控制台 error
- [x] `pnpm test`（Picker 相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page picker` 桌面
- [x] `pnpm compare --page picker --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 取消不写值、确认才写
- pickerSchema 内外层值映射
- source 失败/空结果不丢已选
- 分组行与 CRUD 分页
- embed 与弹层两套路径

## 8. 后续

1. 树选择单独立项；先核 Amis Picker 是否通过 pickerSchema 复用 tree，而不是自造选择协议。
2. pickerSchema 协议补“内层其它类型（list/cards）”或明确只支持 table/form。

---

返回 [组件设计索引](../README.md)
