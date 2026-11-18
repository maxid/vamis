# InputQuarterRange 季度范围 · `input-quarter-range` 设计

> 状态：**进行中 45%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-quarter-range) · Amis：`/zh-CN/components/form/input-quarter-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputQuarterRange 与 year/month range 共用 `DatePartRange.vue`：每组年 number + Q 下拉，值 `YYYY-Qn` 范围。没有季度历、start>end 校验、格式、事件/动作；45% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **共享组件**：quarter/year/month range 共用；改一个回归三个。
2. **值格式**：每组 `YYYY-Qn`；range 用 `readRangeValue/writeRangeValue`；不要写对象数组。
3. **年季**：1900–2100、Q1–Q4；年/季缺失不能拼半合法值。
4. **顺序**：start>end 当前不拦截，不能声称已限制。
5. **包边界**：无 `<style>`、无 fetch。

### 1.2 边界用例

- 空/单端/start>end/同年跨季/跨年
- object/delimiter、空串
- month/year range 类型切换
- disabled/static、FormItem 错误
- 季度历/格式/事件动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 共享/值格式
2. 顺序/年季
3. 日历/格式/事件动作
4. 样式

## 2. 复杂度

- 等级：**M 中**（Amis 93 行；Vamis DatePartRange 116 行共享）
- 依赖：`FormItem`、range/quarter 工具

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 季度范围 | 已接 |
| `delimiter` | 分隔 | 已接 |
| `min` / `max` | 年范围 | 原生 1900–2100 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/form.ts`](../../../packages/vamis/src/extras/form.ts) → [`form/DatePartRange.vue`](../../../packages/vamis/src/renderers/form/DatePartRange.vue)。
- [`quarter.ts`](../../../packages/vamis-core/src/utils/quarter.ts)：format/parse。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- 两组年+Q；无专属类、无 `<style>`。
- 窄屏换行/深色 select 单独核。

## 6. 缺口

季度历/顺序校验/格式/事件动作/深色。

## 7. 验收

- 值格式/顺序/空值/disabled/窄屏深色；未接能力不误标。

## 8. 后续

三类共享测试 + 顺序策略；格式/事件动作先改共享设计。

---

返回 [组件设计索引](README.md)
