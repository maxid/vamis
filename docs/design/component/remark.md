# Remark 标记 · `remark` 设计

> 状态：**进行中 92%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/remark) · Amis：`/zh-CN/components/remark`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 边界与优先级（先读）

1. **内容**：content 文本或 `{title,body}`；无内容不弹；模板变量。
2. **触发**：hover/click/focus；disabled 不弹；mobile 走 Dialog，不显示 tooltip。
3. **形态**：shape circle/默认、icon 自定义、placement；浮层 VamisOverlay `--z-tooltip`。
4. **关闭/卸载**：hover timer、外部关闭、卸载清理；移动端 Dialog 关闭。
5. **包边界**：无 `<style>`、无 fetch；`--remark-*` token。

### 边界用例

- 空/文本/对象 content/变量/自定义 icon
- shape/placement/triggers/mobile Dialog
- disabled/卸载/深色/窄屏

### 优先级

1. content/triggers；2. shape/icon/placement；3. mobile/关闭；4. themeCss。

## 2. 复杂度

- 等级：**M 中**（Amis 182 行；Vamis 179 行）；依赖 tooltip-wrapper/icon/tpl。
- 风险：移动端 Dialog/timer。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| content/title/body | 内容 | 已接 |
| shape/icon/placement | 外观 | 已接 |
| triggers/mobileUI | 交互 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`rest/Remark.vue`](../../../packages/vamis/src/renderers/rest/Remark.vue)：content/icon/triggers/mobile。
- [`VamisTooltipLayer.vue`](../../../packages/vamis/src/overlay/VamisTooltipLayer.vue)：浮层。
- [`remark.ts`](../../../packages/vamis-core/src/utils/remark.ts)：content/shape/placement/dialog。

## 5. 样式

- mark 徽标/浮层 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss、深色手核。

## 7. 验收

- content/triggers/shape/mobile/卸载/深色；未接不误标。

## 8. 后续

themeCss 随主题批次；深色手核。

---

返回 [组件设计索引](README.md)
