# InputMonthRange 月份范围 · `input-month-range` 设计

> 状态：**进行中 60%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-month-range) · Amis：`/zh-CN/components/form/input-month-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputMonthRange **没有独立渲染器**：`extras/form.ts` 把 month/quarter/year range 都注册到 `DatePartRange.vue`。当前是两个原生输入 + “至”分隔；`readRangeValue/writeRangeValue` 支持 delimiter/对象。没有日历、范围校验、格式转换、事件/动作。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **共享组件**：month-range/quarter-range/year-range 共用；改一个确认另外两个。
2. **值形态**：`readRangeValue` / `writeRangeValue` 决定对象 `{start,end}` 或 delimiter 字符串；不要手写 join。
3. **原生控件**：month `type=month`；year `type=number`；quarter 年+Q 两组。
4. **顺序**：start > end 当前不拦截；是否交换/校验未定义，不能声称已限制。
5. **写回**：无 name 不写；空串保持空。
6. **包边界**：无 `<style>`、无 fetch；输入/下拉 token。

### 1.2 边界用例

- 空值/只填一端/start>end/同年同月/跨年
- delimiter 字符串/对象/空 delimiter
- month/quarter/year 类型
- disabled/static、FormItem 错误
- 外部 setValue/reset
- 窄屏/深色
- 日历/范围校验/事件动作（未接）

### 1.3 优先级

1. 值形态/两输入
2. start/end 顺序
3. 类型/禁用/校验
4. 事件/动作/样式

## 2. 复杂度

- 等级：**M 中**（Amis 系列；Vamis DatePartRange 116 行，共享）
- 依赖：`FormItem`、range 工具、quarter 工具
- 风险：三类共用 + 顺序未校验

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 范围 | 已接 |
| `delimiter` | 字符串分隔 | 已接 |
| `type` | month/quarter/year | 共享 DatePartRange |
| `min` / `max` | 范围 | year 原生 1900–2100 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/form.ts`](../../../../packages/vamis/src/extras/form.ts)：三种 range 注册。
- [`form/DatePartRange.vue`](../../../../packages/vamis/src/renderers/form/DatePartRange.vue)：kind/range/quarter。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → readRangeValue(delimiter) → {start,end}
输入 → range → writeRangeValue(delimiter) → setValue
```

## 5. 样式与边界

- 两输入 + 至；无专属皮肤类、无 `<style>`。
- 窄屏并排/换行；深色原生控件单独核。

## 6. 当前状态与缺口

- 已接：month/quarter/year 三种范围、delimiter、两输入写回、year 1900–2100。
- 未接：start/end 顺序校验、日历、格式转换、事件/动作、深色/窄屏。
- 对照：TODO 60%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] 共享 DatePartRange 注册已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（DatePartRange 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-month-range` 桌面
- [ ] `pnpm compare --page input-month-range --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 三类共享测试 + start/end 顺序策略。
2. 格式/校验/事件动作若需要，先改共享设计。
3. 深色/窄屏专项。

---

返回 [组件设计索引](../README.md)
