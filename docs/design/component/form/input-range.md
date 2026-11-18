# InputRange 滑块 · `input-range` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-range) · Amis：`/zh-CN/components/form/input-range`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputRange 当前是**单/双滑块基础**（93 行）：min/max/step、单值或双值、clamp、unit。没有刻度/marks、tooltip、showInput 统一、双滑块同轨、事件/动作、step 严格校验；50% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：单值 number；`multiple` 时对象 `{min,max}` 或 delimiter 字符串；两种输出必须稳定。
2. **clamp**：所有输入（滑块/数字框/外部值）都 clamp 到 min/max；非法数回落 min。
3. **双值顺序**：start/end 自动排序；不能出现 start > end。
4. **步长**：step 只提示滑动粒度；手工输入/外部值是否严格对齐 step 未定义，当前不强制。
5. **边界值**：min > max、min/max 非数字、step<=0 要有兜底。
6. **包边界**：无 `<style>`、无 fetch；Slider/Input/token 由 UI。

### 1.2 边界用例

- 单值/双值/对象值/分隔符字符串/空值
- min/max/step 边界、非法数字、min>max
- 双值 start>end、只传一个
- 数字框输入超界、空串
- unit 展示
- disabled/static、FormItem 错误
- 事件/动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 值形态/clamp/顺序
2. min/max/step 兜底
3. 双滑块体验/数字框同步
4. 刻度/marks/tooltip
5. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis 803 行；Vamis 93 行）
- 依赖：`FormItem`、`Slider`、`Input`
- 风险：双值与单值两套路径容易分叉

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `min` / `max` / `step` | 范围 | 已接基础 |
| `multiple` | 双值 | 已接（两条滑块） |
| `delimiter` | 字符串输出 | 已接 |
| `unit` | 单位 | 已接 |
| `marks` / 刻度 | 刻度 | 未接 |
| `tooltip` / `showInput` | 提示/输入 | 部分（单值数字框） |
| `disabled` / `static` | 状态 | 已接 |
| 事件/动作 | 目标 | 未接 |

### 事件/动作

当前无独立 change 事件/动作；值由 Slider 直接写。

## 4. 架构

- [`form/InputRange.vue`](../../../../packages/vamis/src/renderers/form/InputRange.vue)：min/max/step、single/range、clamp、模板。
- ``range.ts``：`readRangeValue` 等。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → single 或 readRangeValue → clamp → Slider/Input
Slider/Input → set → clamp → object/string → setValue
```

- 双值当前是两条独立 Slider，不是同一轨道双把手。
- 单值有数字框；双值只有展示文本，没有数字框。

## 5. 样式与边界

- slider/行/标签/单位走 token；无 `<style>`。
- 窄屏双行、深色滑轨/把手单独核。
- 刻度/tooltip/marks 未接。

## 6. 当前状态与缺口

- 已接：min/max/step、单值、双值对象/分隔符、clamp、unit。
- 未接：同轨双把手、marks/刻度、tooltip、双值数字框、事件/动作、min>max 等边界。
- 对照：TODO 50%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputRange / range 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputRange 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-range` 桌面
- [ ] `pnpm compare --page input-range --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 单/双值形态
- clamp/顺序
- min>max/非法值
- 双滑块体验
- 缺口不要误标

## 8. 后续

1. 先补 min/max/step 兜底与双值数字框。
2. 再做同轨双把手/刻度/tooltip。
3. 最后事件动作/深色窄屏。

---

返回 [组件设计索引](../README.md)
