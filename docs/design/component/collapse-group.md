# CollapseGroup 折叠组 · `collapse-group` 设计

> 状态：**进行中 70%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/collapse-group) · Amis：`/zh-CN/components/collapse-group`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

CollapseGroup 管理多面板 activeKeys/accordion/fieldSet 样式，向子 Collapse 提供 group 上下文。主路径可用；change 事件在 group 层派发，深色/无障碍未核。

## 1. 边界与优先级（先读）

1. **activeKeys**：normalizeActiveKeys；accordion 时最多一个；activeKey 变化重置。
2. **toggle**：toggleCollapse 计算 next；先 change 事件再写 activeKeys。
3. **子项**：body/accordions；缺 type 自动补 collapse；key 缺省按索引。
4. **fieldSet**：form 内默认启用；enableFieldSetStyle 可 false/表达式。
5. **包边界**：无 `<style>`、无 fetch；collapse group token。

### 边界用例

- 空/单/多面板、accordion、activeKey 变化
- change 阻止、fieldSet/表达式、嵌套 group
- 窄屏/深色/键盘

### 优先级

1. activeKeys/accordion；2. 事件/子项；3. fieldSet/嵌套；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 537 行系列；Vamis 118 行）；依赖 collapse/icon。
- 风险：groups 上下文/accordion。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| body/accordions | 子面板 | 已接 |
| activeKey/accordion | 状态 | 已接 |
| expandIcon/position | 继承 | 已接 |
| enableFieldSetStyle | 样式 | 已接 |
| change | 事件 | 已接 |

## 4. 架构

- [`CollapseGroup.vue`](../../../packages/vamis/src/renderers/CollapseGroup.vue)：activeKeys/toggle/provide。
- [`collapseGroup.ts`](../../../packages/vamis/src/renderers/collapseGroup.ts)：上下文。
- [`Collapse`](collapse.md)：单面板。

## 5. 样式

- group 边框/divide/fieldset；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss、键盘/无障碍、深色逐项。

## 7. 验收

- activeKeys/accordion/change 阻止/fieldSet/嵌套/窄屏。

## 8. 后续

补无障碍/themeCss；保持 group 只管理状态，不复制单面板逻辑。

---

返回 [组件设计索引](README.md)
