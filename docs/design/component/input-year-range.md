# InputYearRange 年份范围 · `input-year-range` 设计

> 状态：**进行中 45%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-year-range) · Amis：`/zh-CN/components/form/input-year-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputYearRange **没有独立渲染器**：month/quarter/year range 共用 `DatePartRange.vue`。当前是两个 number 输入 + “至”，`readRangeValue/writeRangeValue` 支持对象/delimiter；没有年历、顺序校验、格式、事件/动作。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **共享组件**：year/quarter/month range 共用；改 year-range 回归另两类。
2. **值形态**：`readRangeValue` / `writeRangeValue` 决定对象或 delimiter 字符串；不要手写 join。
3. **年范围**：原生 1900–2100；start/end 顺序当前不校验。
4. **写回**：无 name 不写；空串保持空。
5. **包边界**：无 `<style>`、无 fetch；输入/token。

### 1.2 边界用例

- 空/单端/start>end/相同年/跨世纪
- object/delimiter 值、空 delimiter
- month/quarter range 类型切换
- disabled/static、FormItem 错误
- 年月历/格式/事件动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 共享组件/值形态
2. 顺序/范围
3. 日历/格式/事件动作
4. 样式

## 2. 复杂度

- 等级：**M 中**（Amis 91 行；Vamis DatePartRange 116 行共享）
- 依赖：`FormItem`、range 工具

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 年份范围 | 已接 |
| `delimiter` | 字符串分隔 | 已接 |
| `min` / `max` | 范围 | 原生 1900–2100 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/form.ts`](../../../packages/vamis/src/extras/form.ts) → [`form/DatePartRange.vue`](../../../packages/vamis/src/renderers/form/DatePartRange.vue)。
- [`range.ts`](../../../packages/vamis-core/src/utils/range.ts)：read/writeRangeValue。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- 两 number + 至；无专属类、无 `<style>`。
- 窄屏/深色单独核。

## 6. 缺口

年历/顺序校验/格式/事件动作/深色。

## 7. 验收

- 值形态/顺序/空值/disabled/窄屏深色；未接能力不误标。

## 8. 后续

三类共享测试 + 顺序策略；格式/事件动作先改共享设计。

---

返回 [组件设计索引](README.md)
