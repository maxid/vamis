# InputTimeRange 时间范围 · `input-time-range` 设计

> 状态：**进行中 45%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-time-range) · Amis：`/zh-CN/components/form/input-time-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputTimeRange 当前是**两个原生 time 输入 + 至**（25 行），值通过 `readRangeValue/writeRangeValue` 写对象/分隔字符串。没有时间范围校验、时区/格式、快捷项、事件/动作；45% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：`readRangeValue/writeRangeValue` 决定 `{start,end}` 或 delimiter 字符串；不要手写 join。
2. **时间格式**：原生 `type=time` 输出 HH:mm(:ss)；不擅自转 timestamp/时区。
3. **顺序**：start > end 当前不拦截；不能声称已限制。
4. **写回**：无 name 不写；空串保持空。
5. **包边界**：无 `<style>`、无 fetch；输入/token。

### 1.2 边界用例

- 空/单端/start>end/跨午夜/秒
- 对象/分隔符/空 delimiter
- disabled/static、FormItem 校验
- 时区/格式（未接）
- 快捷项/事件动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 值形态/两个 time
2. 顺序/空值
3. 时区/格式/快捷
4. 事件动作/样式

## 2. 复杂度

- 等级：**L 重**（Amis 408 行；Vamis 25 行）
- 依赖：`FormItem`、range 工具
- 风险：值形态/顺序未校验

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 时间范围 | 已接 |
| `delimiter` | 分隔 | 已接 |
| `timeFormat` / 时区 | 格式 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/rest.ts`](../../../packages/vamis/src/extras/rest.ts) → [`form/InputTimeRange.vue`](../../../packages/vamis/src/renderers/form/InputTimeRange.vue)。
- [`range.ts`](../../../packages/vamis-core/src/utils/range.ts)：read/writeRangeValue。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
field value → readRangeValue(delimiter) → {start,end}
time input → writeRangeValue → setValue
```

## 5. 样式

- 两 time + 至；无专属类、无 `<style>`。
- 窄屏并排/深色 native time 单独核。

## 6. 缺口

时间格式/时区/顺序校验/快捷/事件动作/深色。

## 7. 验收

- 值形态/顺序/空值/disabled/窄屏深色；未接能力不误标。

## 8. 后续

先补顺序/格式，再做快捷/事件动作；不引入日期日历。

---

返回 [组件设计索引](README.md)
