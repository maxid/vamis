# Switch 开关 · `switch` 设计

> 状态：**进行中 88%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/switch) · Amis：`/zh-CN/components/form/switch`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性/事件/动作表以在线文档为准。

## 0. 一页结论

Switch 当前是**布尔开关**（260 行）：trueValue/falseValue、onText/offText、size、loading、option 位置、static、change 可阻止、clear/reset/setValue、组件 API。主路径成熟；缺 themeCss/深色逐项。

## 1. 边界与优先级（先读）

1. **值映射**：checkboxIsChecked 共用；trueValue/falseValue 支持 0/1/布尔；写回原值。
2. **change 事件**：先事件后写值；prevented 不切换；loading 时不切换。
3. **文本**：onText/offText 字符串/Schema；option 位置左右。
4. **静态/禁用**：static 展示文字；disabled/loading 锁。
5. **包边界**：无 `<style>`、无 fetch；switch token。

### 边界用例

- 空/true/false/0/1/自定义值
- on/off 文本 Schema/位置/size/loading
- change 阻止/disabled/static
- themeCss/深色/窄屏

### 优先级

1. 值/事件；2. 文本/位置；3. 静态/禁用；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 207 行；Vamis 260 行）；依赖 checkbox/icon。
- 风险：值映射/事件阻止/loading。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| trueValue/falseValue | 值 | 已接 |
| onText/offText | 文本 | 已接 |
| size/loading/optionAtLeft | 外观 | 已接 |
| change | 事件 | 可阻止 |
| clear/reset/setValue | 动作 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`form/Switch.vue`](../../../packages/vamis/src/renderers/form/Switch.vue)：值/文本/加载/事件/API。
- [`checkbox.ts`](../../../packages/vamis-core/src/utils/checkbox.ts)：值映射/clear/reset。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- 开关轨道/圆点/文本 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss/深色逐项。

## 7. 验收

- 值/文本/loading/change 阻止/static/窄屏；未接不误标。

## 8. 后续

themeCss/深色随主题批次；保持值映射。

---

返回 [组件设计索引](README.md)
