# InputDateRange 日期范围 · `input-date-range` 设计

> 状态：**进行中 90%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-date-range) · Amis：`/zh-CN/components/form/input-date-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputDateRange 是**双输入 + 双月历 + 区间草稿**的日期范围控件，与 InputDate 共用日期解析/日历/时区工具。主路径较完整；风险在**开始/结束草稿、左右月游标、valueFormat/displayFormat、delimiter/joinValues、duration 限制、confirm 边界**。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：默认 `start,end` 字符串（delimiter），`joinValues: false` 数组；`valueFormat` 决定存储、`displayFormat` 只显示；`extraName` 额外字段。
2. **双草稿**：点开始/结束分别进入 draft；只有 confirm（或 closeOnSelect 条件满足）才写值；取消不写。
3. **游标**：左右月独立；点年/月标题切面板；两月相同/颠倒要 clamp，不能出现 start > end 的提交。
4. **区间高亮**：只高亮当月格子；跨月范围不能把整月都点亮（对照项 #11/13）。
5. **duration**：`minDuration/maxDuration` 解析为 dayjs duration；不满足禁用 confirm。
6. **时间**：`timeFormat` 对齐；start/end 时间部分独立；`utc` 同一转换链。
7. **包边界**：无 `<style>`、无 fetch；双月历/快捷条/弹层走 token。

### 1.2 边界用例

- 空值/只填开始/只填结束/相同日期/颠倒
- delimiter 字符串/数组/joinValues false/extraName
- valueFormat/displayFormat/utc/时区
- shortcuts/相对值/公式（trusted）
- minDuration/maxDuration
- embed/closeOnSelect/clearable
- 左右不同月/同年/跨年/点标题
- disabled/static/readOnly
- 窄屏 CalendarMobile/深色

### 1.3 优先级

1. 值/双草稿/confirm
2. 游标/区间高亮/duration
3. 格式/时区/时间
4. shortcuts/embed/窄屏
5. 样式/深色

## 2. 复杂度

- 等级：**L 重**（Amis 408 行；Vamis 711 行）
- 依赖：`input-date` 工具、`calendar`、`FormItem`、`VamisOverlay`
- 风险：双输入/双游标/草稿 confirm 与格式矩阵

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 范围值 | 已接 |
| `extraName` | 额外字段 | 已接 |
| `delimiter` / `joinValues` | 值形态 | 已接 |
| `valueFormat` / `displayFormat` | 存储/显示 | 已接 |
| `minDuration` / `maxDuration` | 区间长度 | 已接 |
| `shortcuts` | 快捷范围 | 已接 |
| `embed` / `closeOnSelect` | 内嵌/自动确认 | 已接 |
| `timeFormat` / `utc` | 时间 | 已接基础 |
| `animation` / `popOverContainerSelector` | 动画/容器 | 未接/未核 |
| 窄屏 CalendarMobile | 移动 | 未齐 |

### 事件/动作

事件：`change`、`focus`、`blur`；动作：`clear`、`reset`、`setValue`（以在线文档为准）。

## 4. 架构

- [`form/DateRange.vue`](../../../packages/vamis/src/renderers/form/DateRange.vue)：双输入/双月历/草稿/confirm/格式/duration。
- [`input-date.ts`](../../../packages/vamis-core/src/utils/input-date.ts)：解析/格式/日历/duration。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → parse range → start/end
input focus → editState + draft
cal cell → draft start/end
confirm → validate duration/order → serialize(valueFormat/delimiter/extraName) → setValue
cancel → discard draft
```

## 5. 样式与边界

- 双月历/快捷条/选中区间/确认栏走 token；无 `<style>`。
- 窄屏底部 CalendarMobile；深色区间/禁用日期单独核。

## 6. 当前状态与缺口

- 已接：双输入/双月历、区间高亮、快捷条、取消/确认、年/月面板、不同月 clamp、value/display format、delimiter、默认/相对/公式值、shortcuts、embed、extraName、duration、timeFormat、change/focus/blur、clear/reset/setValue。
- 缺口：animation 游标、popOverContainerSelector、窄屏 CalendarMobile、深色逐章。
- 对照：桌面 11/13、移动 11/13（P0 0；公式值两例 Amis 仍是模板串）；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis DateRange / input-date 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（DateRange 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-date-range` 桌面
- [ ] `pnpm compare --page input-date-range --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 双草稿/取消/确认
- 跨月/同年/颠倒
- valueFormat/displayFormat/utc
- duration/extraName
- 公式值差异

## 8. 后续

1. 补 animation/popOverContainerSelector 与窄屏 CalendarMobile。
2. 深色/区间高亮逐章核。
3. 公式值两例差异单独立项（Amis 模板串 vs Vamis 求值）。

---

返回 [组件设计索引](README.md)
