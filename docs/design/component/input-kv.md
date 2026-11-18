# InputKV 键值对 · `input-kv` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-kv) · Amis：`/zh-CN/components/form/input-kv`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputKV 当前是**最小键值对编辑器**（57 行）：`{ key, value }` 行、增删、写回对象。没有 key 唯一/非空校验、value 类型、拖拽、批量粘贴、首行固定、事件/动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值格式**：`kvRowsFromValue` / `valueFromKvRows` 决定对象 ↔ 行的转换；`key` 重复会覆盖，必须明确校验/提示。
2. **不可变更新**：update/add/remove 都返回新 rows；删除到 0 条仍保留一条空行。
3. **写回**：无 name 不写；value 类型保持用户输入（当前字符串），不要擅自转 number。
4. **校验**：key 必填/唯一、value 必填未接；不要声称 FormItem 自动处理。
5. **包边界**：无 `<style>`、无 fetch；输入/按钮走 token。

### 边界用例

- 空值 / 空对象 / 多行；重复 key / 空 key；删除最后一行；外部 setValue/reset；disabled；窄屏/深色；目标拖拽/批量/首行固定（未接）。

### 优先级

1. 值转换/不可变更新；2. 增删/写回；3. key 校验/唯一；4. 拖拽/批量/样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 2154 行；Vamis 57 行）；依赖 `FormItem`、`input-text`、`action`。
- 风险：当前只有基座，key 冲突/类型/校验未处理。

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 对象值 | 已接 |
| `keyPlaceholder` / `valuePlaceholder` | 占位 | 已接 |
| `keyField` / `valueField` | 字段名 | 未接 |
| `draggable` | 行拖拽 | 未接 |
| `addable` / `removable` | 增删 | 始终显示 |
| 批量粘贴/首行固定 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`InputKV.vue`](../../../packages/vamis/src/renderers/form/InputKV.vue)：rows 计算属性、update/add/remove。
- [`kv.ts`](../../../packages/vamis-core/src/utils/kv.ts)：`kvRowsFromValue` / `valueFromKvRows`。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/错误。

## 5. 缺口

key 唯一/必填、value 类型、拖拽、批量、事件/动作、深色窄屏。

## 6. 验收

- 值转换/空行/重复 key/删除最后一行/外部 setValue。
- 未接能力不要误标。
- 对照桌面/移动、深色。

## 7. 后续

先做 key 校验/唯一，再做拖拽/批量，最后事件动作。

---

返回 [组件设计索引](README.md)
