# InputDatetimeRange 日期时间范围 · `input-datetime-range` 设计

> 状态：**进行中 45%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-datetime-range) · Amis：`/zh-CN/components/form/input-datetime-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputDatetimeRange **没有独立渲染器**：`register.ts` 把 `input-datetime-range` 作为 `input-date-range` 的别名，实际使用 `DateRange.vue`（双输入/双月历/时间）。当前是 InputDateRange 的复用路径；日期时间约束、移动模式、时区精度仍需按 DateRange 缺口处理。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **别名映射**：`input-datetime-range` → DateRange；改行为只改 DateRange/日期工具。
2. **日期+时间**：start/end 都带时间；timeFormat/showSeconds 决定精度；min/max 同时限制日期与时间。
3. **值形态**：valueFormat/delimiter/joinValues/extraName 与 InputDateRange 共用。
4. **草稿/确认**：双输入草稿、confirm 才写；取消不写。
5. **包边界**：无 `<style>`、无 fetch；双月历/时间列 token。

### 1.2 边界用例

- 空/单端/start>end/相同时间/跨天
- 日期与时间边界、秒
- valueFormat/utc/时区
- mobileCalendarMode/窄屏
- disabled/static、FormItem 错误
- 深色/区间高亮

### 1.3 优先级

1. 别名/日期时间值
2. 约束/草稿 confirm
3. 移动模式/格式
4. 深色/事件动作

## 2. 复杂度

- 等级：**L 重**（Amis 408 行；Vamis DateRange 711 行共享）
- 依赖：`DateRange`、`input-date` 工具
- 风险：别名复用，容易以为是独立组件

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 日期时间范围 | 已接（DateRange） |
| `valueFormat` / `displayFormat` | 格式 | 已接共享 |
| `timeFormat` / `utc` | 时间 | 已接基础 |
| 日期时间约束 | 目标 | 未齐 |
| mobileCalendarMode | 移动 | 未齐 |
| 事件/动作 | 目标 | 共享 DateRange |

## 4. 架构

- [`register.ts`](../../../packages/vamis/src/register.ts) 别名 → [`form/DateRange.vue`](../../../packages/vamis/src/renderers/form/DateRange.vue)。
- [`input-date.ts`](../../../packages/vamis-core/src/utils/input-date.ts)：解析/日历/时间。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
value → parse datetime range → start/end
calendar/time → draft → confirm → valueFormat/delimiter → setValue
```

## 5. 样式

- 双月历/时间列/区间高亮；无 `<style>`。
- 窄屏/深色单独核。

## 6. 缺口

日期时间约束、mobileCalendarMode、时区精度、深色；与 DateRange 同步。

## 7. 验收

- 日期+时间/草稿 confirm/格式/顺序；别名确实复用 DateRange；未接不误标。

## 8. 后续

随 DateRange 一起补约束/移动模式；不新建重复组件。

---

返回 [组件设计索引](README.md)
