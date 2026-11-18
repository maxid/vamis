# InputFormula 公式编辑器 · `input-formula` 设计

> 状态：**进行中 45%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-formula) · Amis：`/zh-CN/components/form/input-formula`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputFormula **没有独立渲染器**：`extras/rest.ts` 把它注册到 `Formula.vue`，只是可编辑外观（type=input-formula 时 Input 非只读）。没有公式编辑器/函数提示/校验；45% 是真实缺口。

## 1. 边界与优先级（先读）

1. **别名**：input-formula → Formula；行为/值/API 继承。
2. **编辑外观**：type=input-formula 时 Input 可输入；普通 formula 只读。
3. **无编辑器**：没有语法高亮/函数补全/错误提示；不要按公式编辑器验收。
4. **计算**：仍走 formula/value + autoSet/condition。
5. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/模板/表达式/可编辑/只读
- autoSet/condition/卸载
- 公式编辑器能力（未接）
- 窄屏/深色

### 优先级

1. 别名/可编辑；2. 计算/autoSet；3. 编辑器/提示；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 257 行；Vamis 复用 Formula 79 行）；依赖 formula/form/action。
- 风险：被误认为完整编辑器。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| formula/value | 公式 | 继承 Formula |
| 可编辑 | Input | 已接 |
| 函数提示/校验 | 目标 | 未接 |

## 4. 架构

- [`extras/rest.ts`](../../../packages/vamis/src/extras/rest.ts) → [`Formula.vue`](../../../packages/vamis/src/renderers/form/Formula.vue)。
- [`formula`](formula.md)：全部行为。

## 5. 样式

- 同 Formula；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

编辑器/函数提示/校验/深色。

## 7. 验收

- 确认走 Formula；可编辑/只读/自动计算；编辑器不误标。

## 8. 后续

编辑器单独立项；先保持只读展示/简单输入。

---

返回 [组件设计索引](README.md)
