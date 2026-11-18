# InputArray 数组输入 · `input-array` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-array) · Amis：`/zh-CN/components/form/input-array`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputArray 是 Combo 的简化版：值是一维数组，`items` 定义一个重复表单项，行内用 NestedFormScope。当前只有增删 + flat 值转换 + 第一项 schema；`scaffold`、addable/removable、min/max、拖拽、inline、事件/动作均未接。50% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：字段值是数组；`flat`（默认 true）决定提交扁平标量数组还是对象数组；`flattenArrayRows` / `inflateArrayRows` 必须成对使用。
2. **单 item**：当前只取 `items` 第一项，`name` 默认 `item`；多字段 items 需求未支持，不能按 Combo 假设。
3. **行作用域**：每行 NestedFormScope；子项 `name` 是行内字段；`fieldName` 决定 flat 时取哪个字段。
4. **增删**：新增空行；删到 0 条仍保留 `[{}]`；无 name 不写值。
5. **空数组/初始值**：inflate 空值为 `[{}]` 展示；提交时 flat 后是 `[]` 还是 `[{}]` 要确认，避免空对象数组污染。
6. **校验**：子项 required/validations 归表单；InputArray 不能只写值绕过校验。
7. **包边界**：无 `<style>`、无 fetch；按钮/行间距走 token。

### 1.2 边界用例

- 空值 / `[]` / 标量数组 / 对象数组
- flat true/false；items name/默认 item
- 增删到 0 行、删除中间行
- 子项 input-text/input-number/input-color 等
- 子项校验/disabled/static
- 外部 setValue/reset 后行同步
- scaffold/addable/removable/min/max（当前未接）
- 拖拽排序（未接）
- 窄屏、深色

### 1.3 优先级

1. 值 flat/inflate 与 empty 语义
2. 单 item/行作用域/增删
3. 校验/disabled
4. scaffold/addable/min/max/drag/inline
5. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/InputArray.tsx` 70 行 + 依赖 Combo/InputArray 语义；Vamis 57 行）
- 依赖：`form`、`FormItem`、`NestedFormScope`、`input-color`/`input-number` 等 items
- 风险：Amis 行数不多但语义接近 Combo；当前实现极简，属性缺口大

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'input-array'`
- Amis 渲染器：`packages/amis/src/renderers/Form/InputArray.tsx`
- 在线文档：[Vamis `/components/form/input-array`](/components/form/input-array)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `items` | 重复项 schema | 只取第一项 |
| `flat` | 扁平标量数组 | 已接（默认 true） |
| `name` | 字段 | 已接 |
| `addable` / `removable` | 增删开关 | 未接（始终显示） |
| `addButtonText` | 新增文案 | 未接 |
| `scaffold` | 新增默认值 | 未接 |
| `minLength` / `maxLength` | 行数限制 | 未接 |
| `draggable` / `draggableTip` | 拖拽排序 | 未接 |
| `inline` | 行内布局 | 未接 |
| `items` 多字段 | 对象数组 | 未接（Combo 领域） |
| 事件/动作 | 文档目标 | 未接 |

### 3.3 事件/动作

文档无独立事件/动作表；实现当前也未注册 scoped API。不要按 Combo 的动作套用。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputArray.vue`](../../../packages/vamis/src/renderers/form/InputArray.vue) | 行数组、增删、flat 转换、item 行作用域 |
| [`NestedFormScope.vue`](../../../packages/vamis/src/NestedFormScope.vue) | 行作用域/persist |
| [`array.ts`](../../../packages/vamis-core/src/utils/array.ts) | `flattenArrayRows` / `inflateArrayRows` 纯函数 |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |

### 4.2 状态

```text
field value ──inflateArrayRows(name, fieldName)──> rows
rows ──add/remove/persistCurrent──> flattenArrayRows(flat) ──setValue
```

- `item` 只保留第一项并强制 `label:false`、name 默认 item。
- `flat` true：提交标量数组；false：提交 `{[fieldName]: value}` 对象数组。
- 空值展示 `[{}]`，删除最后一行也补空行。

### 4.3 目标扩展

- `scaffold` 新增默认值（对象/标量）。
- `addable`/`removable`/min/max 按钮与限制。
- `draggable` 需要行身份/`$id`，先定值模型。
- `inline` 布局只影响 UI，不改值。
- 多字段 items 属于 Combo；不要在本组件硬塞。

## 5. 样式与边界

- 行布局 `space-y-2 flex`；按钮/输入由 UI 原语。
- 无专属皮肤类；无 `<style>`。
- 窄屏行内控件宽度、深色、空行占位需单独看。

## 6. 当前状态与缺口

- 已接：单 item 行、增删、flat/inflate、FormItem 壳、NestedFormScope。
- 未接：addable/removable、addButtonText、scaffold、min/max、draggable、inline、多字段 items、事件/动作。
- 对照：TODO 50%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputArray / array 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputArray 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-array` 桌面
- [ ] `pnpm compare --page input-array --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- flat 数组 / 对象数组
- 空值/最后一行
- 子项校验
- scaffold/min/max 缺口
- 多字段 items 边界

## 8. 后续

1. 先补 scaffold/addable/removable/min/max（不影响值模型）。
2. 再定 draggable 的行身份（是否需要 `$id`）。
3. inline 只做布局；多字段 items 转 Combo，不重复实现。

---

返回 [组件设计索引](README.md)
