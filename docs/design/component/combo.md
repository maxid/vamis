# Combo 组合 · `combo` 设计

> 状态：**进行中 55%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/combo) · Amis：`/zh-CN/components/form/combo`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Combo 当前是**最小实现**：`multiple` 单条/多条、`mode: row` 横排、增删行、radio 互斥写回。Combo.vue 只有 124 行，而 Amis `Form/Combo.tsx` 有 2154 行；多行、拖拽、tabs、分页、唯一校验、子项 api、扁平模式、事件/动作都未接。

因此本设计文档的重点不是“如何补样式”，而是**先定义 Combo 的数据域/行作用域**，再按能力分批补齐；不要按在线属性表声称已支持。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值的顶层形态**：`multiple: false` 时 Combo 值是对象；`multiple: true` 时是对象数组。写回走 `fieldApi.setValue(name, value)`；无 name 不写。
2. **行作用域**：每行用 `NestedFormScope` 提供行数据；子项 `name` 是行内相对路径，不能被当成顶层表单名；radio 互斥通过 `comboApplyRadio` 写回整列。
3. **增删语义**：`add` 追加 `{}`；`remove` 至少保留一行（空对象），并同步整个对象数组；删除/新增必须走同一 persist。
4. **子 schema**：`items` / `columns` 经 `comboChildSchema` 继承 mode；不要直接拿父 schema 渲染。
5. **当前无事件/动作**：`add`/`delete`/`dragEnd`/`tabsChange` 事件、`addItem`/`clear`/`reset`/`setValue` 动作均未接；不要按在线文档宣称可用。
6. **与 Form 的关系**：Combo 是表单项，不是独立 Form；不要为多行自建第二套提交/校验；校验/错误仍由 FormItem/Form 承担。
7. **包边界**：无 `<style>`、无直接 fetch；行/项/删除按钮样式走 token。

### 1.2 边界用例

- `multiple: false` 单对象 / `multiple: true` 空数组、`[{}]`、多行
- `name` 为空、父级无 Form（ValueHost/Scope）、嵌套 Form
- 行内 `name` 路径、radio 互斥、行内 select/日期等
- 新增/删除到只剩一行、删除中间行
- `mode: row` / 非 row / `multiLine`
- 子项 `visibleOn` / `hiddenOn` / `disabled` / `static`
- 值从外部 setValue/reset 后行数/行数据同步
- 移动端横向溢出、深色
- 未接能力的明确降级：拖拽/tabs/分页/唯一校验/子项 api

### 1.3 优先级

1. 值形态与行作用域（当前基座）
2. 增删/radio/多行
3. 事件与动作（必须先定 payload）
4. 拖拽/tabs/分页/唯一校验
5. 子项 api/扁平模式/样式/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis 2154 行；Vamis 124 行）
- 依赖：`form`、`action`、`container`、`FormRow`、`NestedFormScope`、core `combo*`
- 风险：当前是基座实现；Amis 文档大量能力未接，进度 55% 是真实缺口而非样式差异

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'combo'`
- Amis 渲染器：`packages/amis/src/renderers/Form/Combo.tsx`
- 在线文档：[Vamis `/components/form/combo`](/components/form/combo)

### 3.2 核心属性（目标 / 现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `multiple` | 单对象 / 对象数组 | 已接 |
| `items` / `columns` | 子项 schema | 已接（comboChildSchema） |
| `mode` / `multiLine` | 横排/多行 | row 模式已接；multiLine 未接 |
| `addable` / `removable` / 按钮文案 | 增删 | 默认新增/删除按钮；自定义未接 |
| `draggable` | 行拖拽 | 未接 |
| `tabsMode` | tabs 行 | 未接 |
| `pagination` | 行分页 | 未接 |
| `unique` | 字段唯一校验 | 未接 |
| `syncFields` / 子项 api | 行间联动/子项请求 | 未接 |
| `flat` / 扁平模式 | 扁平字段 | 未接 |
| `scaffold` | 新增默认行 | 未接 |
| `minLength` / `maxLength` | 行数限制 | 未接 |
| `conditions` | 行条件分支 | 未接 |

### 3.3 事件/动作（目标）

- 事件：`add`、`delete`、`dragEnd`、`tabsChange`。
- 动作：`addItem`、`clear`、`reset`、`setValue`（multiple 可带 index）。
- **当前均未接**；实现前先定 payload（尤其 `[name]` 值形态、index/旧值）与 preventDefault 语义。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Combo.vue`](../../../packages/vamis/src/renderers/form/Combo.vue) | 行数组、增删、radio、row 模式、persist |
| [`NestedFormScope.vue`](../../../packages/vamis/src/NestedFormScope.vue) | 行作用域、persist、radio 回调 |
| [`FormRow.vue`](../../../packages/vamis/src/renderers/form/FormRow.vue) | row 模式子项布局 |
| [`combo.ts`](../../../packages/vamis-core/src/utils/combo.ts) | `comboChildSchema` / `comboItemMode` / `comboApplyRadio` |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | combo 行/删除/新增按钮 token |

### 4.2 当前行为

```text
field value ──> rows：multiple ? array : [object]
rows ──add/remove/radio──> persist：
  multiple ? next : next[0] || {}
persist ──> fieldApi.setValue(name)
```

- `rows` 为空时用 `[{}]`；删除最后一行仍保留空行。
- `rowNodes` 每次从 items/columns 派生；`NestedFormScope` 提供行数据与 persist。
- `handleRadioChange` 仅 multiple 时用 `comboApplyRadio` 写回整列并返回 false 阻止默认 radio 写值。

### 4.3 关键缺口设计

- **multiLine**：行内子项改为纵向排列；只改布局，不改值/作用域。
- **拖拽**：行数组重排 + `dragEnd` 事件（index/oldIndex/item/value/oldValue）；需定是否允许跨 Combo。
- **tabs**：每行一个 tab，新增/删除同步 tab；`tabsChange` 事件。
- **唯一校验**：在同一 Combo 行数组内对字段值去重；不能复用 Form 的全局 errors 机制乱挂。
- **子项 api**：行内子项按行数据请求，需独立 loading/竞态，不要污染父表单。
- **分页/扁平**：分页只影响展示；扁平模式改变值路径，必须先定 schema。

## 5. 样式与边界

- 默认类：`.vamis-combo`、`.vamis-combo-items`、`.vamis-combo-item`、`.vamis-combo-del`。
- 行横排/多行/删除按钮走 token；渲染器无 `<style>`。
- 窄屏横向溢出、删除按钮位置、深色需单独看。
- 作者 className 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已接：multiple 单/多值、items/columns、row 模式、增删、radio 互斥、FormItem 壳。
- 未接：multiLine、拖拽、tabs、分页、唯一校验、syncFields/子项 api、扁平模式、conditions、min/max、scaffold、事件/动作。
- 对照：TODO 记录 combo 主路径；本轮未重跑。
- 进度 55% 与 Amis 能力差距大；不要用样式修补代替能力实现。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Combo / NestedFormScope / combo 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前未接）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Combo 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page combo` 桌面
- [ ] `pnpm compare --page combo --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 单对象/对象数组值形态
- 行作用域/路径/radio 互斥
- 删除最后一行仍保留空行
- 事件/动作缺口不要误标
- 外部 setValue/reset 同步

## 8. 后续

1. 先补 multiLine（纯布局）与事件/动作（add/delete/setValue）。
2. 再评估拖拽/tabs/分页；每项独立设计行作用域与 payload。
3. 唯一校验/子项 api/扁平模式优先级低，先不要动值路径。
4. 深度修改前补 Combo 组件级测试，不要只靠手点。

---

返回 [组件设计索引](README.md)
