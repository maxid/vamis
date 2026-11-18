# InputDatetime 日期时间 · `input-datetime` 设计

> 状态：**进行中 62%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-datetime) · Amis：`/zh-CN/components/form/input-datetime`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputDatetime **不是独立渲染器**：`register.ts` 把 `input-datetime` 作为 `input-date` 的别名，行为在 `InputDate.vue`。当前已接日期+时分秒与窄屏滚轮；**时分秒约束与 `mobileCalendarMode: calendar` 未齐**，62% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **别名映射**：`input-datetime` → InputDate；改日期时间只改 InputDate/日期工具，不要新建重复组件。
2. **时间部分**：datetime 显示时间；`timeFormat` / `showSeconds` 决定精度；时间与日期同 dayjs 实例。
3. **时分秒约束**：min/max 同时限制日期与时间；当前约束未齐，不能声称完整。
4. **值格式**：`valueFormat`/`format`/timezone/utc 与 InputDate 共用；不要另写序列化。
5. **移动端**：窄屏滚轮已接；`mobileCalendarMode: calendar`（日历模式）未齐。
6. **包边界**：无 `<style>`、无 fetch；日历/时间列走 token。

### 1.2 边界用例

- 空值/日期无时间/只有时间部分/秒
- timeFormat/showSeconds 组合
- min/max 日期边界与时间边界
- mobile 滚轮/calendar 模式
- valueFormat/utc/时区
- disabled/static/readOnly
- 窄屏/深色

### 1.3 优先级

1. 别名/时间部分/值格式
2. min/max 时间约束
3. mobileCalendarMode / 窄屏
4. 深色/事件动作

## 2. 复杂度

- 等级：**XL 特重**（Amis 824 行；Vamis 复用 InputDate 552 行）
- 依赖：`InputDate`、`input-date` 工具、`calendar`
- 风险：别名复用导致“以为有独立逻辑”

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 日期时间 | 已接 |
| `timeFormat` / `showSeconds` | 时间精度 | 已接 |
| `min` / `max` | 约束 | 日期已接；时分秒约束未齐 |
| `mobileCalendarMode` | 移动模式 | 未齐 |
| `valueFormat` / `utc` / `timezone` | 格式/时区 | 已接共享 |
| 事件/动作 | 目标 | 与 InputDate 共享 |

### 事件/动作

与 input-date 相同：change/focus/blur；clear/reset/setValue/focus。

## 4. 架构

- [`register.ts`](../../../../packages/vamis/src/register.ts) 别名 → [`form/InputDate.vue`](../../../../packages/vamis/src/renderers/form/InputDate.vue)。
- [`input-date.ts`](../../../../packages/vamis-core/src/utils/input-date.ts)：时间格式/解析/移动列。
- [`calendar.ts`](../../../../packages/vamis-core/src/utils/calendar.ts)：日历格/禁用。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
value → parse datetime → date + time
日历/滚轮/输入 → commit(valueFormat/utc)
min/max 当前主要限制日期；时间约束待补
```

## 5. 样式与边界

- 时间列/滚轮/日历 token；无 `<style>`。
- 窄屏滚轮切换/深色时间列单独核。

## 6. 当前状态与缺口

- 已接：别名、日期+时分秒、窄屏滚轮、valueFormat/utc/timezone、change/focus/blur、clear/reset/setValue。
- 缺口：时分秒 min/max 约束、`mobileCalendarMode: calendar`、深色逐章。
- 对照：TODO 62%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] register 别名 / InputDate 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（datetime 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-datetime` 桌面
- [ ] `pnpm compare --page input-datetime --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 时间部分/精度
- min/max 时间约束
- mobileCalendarMode
- 别名确实复用 InputDate

## 8. 后续

1. 补时分秒约束（min/max 与时间列禁用）。
2. 补 mobileCalendarMode calendar。
3. 深色/窄屏专项。

---

返回 [组件设计索引](../README.md)
