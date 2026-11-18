# Slider 滑动展示 · `slider` 设计

> 状态：**进行中 45%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/slider) · Amis：`/zh-CN/components/slider`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Slider 当前是**左中右三栏卡片容器**（35 行）：left/body/right、bodyWidth、Card 壳。它不是数值滑条；没有 range 交互/刻度；45% 是真实缺口。

## 1. 边界与优先级（先读）

1. **三栏**：left/right 可选；bodyWidth 默认 60%（有侧栏时）；无侧栏 body 100%。
2. **子 schema**：schemaNodes；Card 壳；空不崩。
3. **无滑条**：不要按数值 range 验收。
4. **包边界**：无 `<style>`、无 fetch；slider/card token。

### 边界用例

- 空/仅 body/左+body/右+body/三栏
- bodyWidth/子节点/窄屏/深色
- range 交互（非目标）

### 优先级

1. 三栏/宽度；2. 子 schema/Card；3. 窄屏/深色。

## 2. 复杂度

- 等级：**S 轻**（Amis 106 行；Vamis 35 行）；依赖 container/card。
- 风险：被误认为 range。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| left/body/right | 三栏 | 已接 |
| bodyWidth | 中间宽度 | 已接 |
| 数值 range | 非目标 | 未接 |

## 4. 架构

- [`display/Slider.vue`](../../../packages/vamis/src/renderers/display/Slider.vue)：三栏/Card/schemaNodes。
- [`card`](card.md)：Card 壳。

## 5. 样式

- 三栏/Card token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

非数值 range；深色/窄屏。

## 7. 验收

- 三栏/宽度/空/窄屏；不按 range 验收。

## 8. 后续

保持布局；数值 range 用 InputRange。

---

返回 [组件设计索引](README.md)
