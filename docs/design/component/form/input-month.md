# InputMonth 月份选择 · `input-month` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-month) · Amis：`/zh-CN/components/form/input-month`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputMonth **没有独立渲染器**：`extras/form.ts` 把 `input-month` / `input-year` / `input-quarter` 都注册到 `DatePart.vue`，用 schema.type 区分。InputMonth 当前是原生 `<input type="month">`，值字符串；年份/季度共用同一组件。它没有日期日历、范围限制、格式转换、事件/动作。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **共享组件**：month/year/quarter 都走 DatePart；改一个先确认另外两个不回归。
2. **值格式**：month 字符串 `YYYY-MM`；year 字符串年；quarter `YYYY-Qn`（formatQuarter/parseQuarter）。不要擅自转 timestamp。
3. **原生控件**：month 用 `type=month`；year 用 number 1900–2100；quarter 年 + Q 下拉。
4. **写回**：无 name 不写；空串保持空；FormItem/校验负责 required。
5. **包边界**：无 `<style>`、无 fetch；输入/下拉走 token。

### 1.2 边界用例

- 空值/合法月份/非法月份/年份越界/季度空
- month/year/quarter 类型切换（共享组件）
- disabled/static/readOnly
- 外部 setValue/reset
- 窄屏/深色
- 目标日历/范围/格式限制（未接）

### 1.3 优先级

1. 共享组件/值格式
2. 原生控件/空值
3. 越界/校验
4. 事件/动作/样式

## 2. 复杂度

- 等级：**M 中**（Amis 824 行系列；Vamis DatePart 77 行，共享）
- 依赖：`FormItem`、原生 input、quarter 工具
- 风险：三类共用组件，改 month 可能影响 year/quarter

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 月份字符串 | 已接 |
| `type` | month/year/quarter | 共享 DatePart |
| `placeholder` | year 占位 | 仅 year |
| `min` / `max` | 范围 | 仅 year 原生 1900–2100 |
| `format` / `valueFormat` | 格式 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/form.ts`](../../../../packages/vamis/src/extras/form.ts)：month/year/quarter 注册。
- [`form/DatePart.vue`](../../../../packages/vamis/src/renderers/form/DatePart.vue)：kind + text/quarter + 原生输入。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → text（month）/ quarter
input → text/quarter → setValue
```

## 5. 样式与边界

- 原生 month/number/select；无专属皮肤类、无 `<style>`。
- 窄屏年份/季度并排；深色原生控件单独核。

## 6. 当前状态与缺口

- 已接：month/year/quarter 三种输入、值写回、year 1900–2100。
- 未接：日期日历/范围/格式转换、事件/动作、深色/窄屏。
- 对照：TODO 65%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] 共享 DatePart 注册已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（DatePart 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-month` 桌面
- [ ] `pnpm compare --page input-month --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 三类共享测试（month/year/quarter）。
2. 格式/范围/事件动作若需要，先改 DatePart 设计。
3. 深色/窄屏专项。

---

返回 [组件设计索引](../README.md)
