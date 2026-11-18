# Textarea 多行输入 · `textarea` 设计

> 状态：**进行中 85%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/textarea) · Amis：`/zh-CN/components/form/textarea`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性/事件/动作表以在线文档为准。

## 0. 一页结论

Textarea 当前是**多行文本**（320 行）：minRows/maxRows 自适应、trim、clear、counter、maxLength、focus/blur/change/clear、reset/undo。主路径较完整；themeCss/深色/无障碍缺口。

## 1. 边界与优先级（先读）

1. **值**：form/scope 字符串；trimContents 失焦裁剪；clearValueOnEmpty 未定义。
2. **自适应高度**：minRows/maxRows + resize；内容/宽度变化重算。
3. **清空/撤销**：clear 事件可阻止；undoStack 记录？实现按源码为准。
4. **计数器**：showCounter/maxLength；超限只提示，是否阻止由校验。
5. **包边界**：无 `<style>`、无 fetch；textarea token。

### 边界用例

- 空/多行/超长/trim/clear
- minRows/maxRows/resize/计数器
- focus/blur/change/clear/undo
- disabled/static/readOnly
- themeCss/深色/窄屏

### 优先级

1. 值/trim/清空；2. 自适应/计数；3. 事件/撤销；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 258 行；Vamis 320 行）；依赖 textarea/input-text。
- 风险：高度自适应/撤销/清空。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/name | 值 | 已接 |
| minRows/maxRows | 高度 | 已接 |
| trimContents/clearable/showCounter | 行为 | 已接 |
| change/focus/blur/clear | 事件 | 已接 |
| clear/reset/focus | 动作 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`form/Textarea.vue`](../../../packages/vamis/src/renderers/form/Textarea.vue)：值/高度/清空/事件/API。
- [`input-text.ts`](../../../packages/vamis-core/src/utils/input-text.ts)：trim/empty/transform。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- textarea/计数器 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss/深色/无障碍。

## 7. 验收

- 值/高度/trim/clear/事件/disabled/窄屏；未接不误标。

## 8. 后续

themeCss/无障碍随主题批次；保持自动高度。

---

返回 [组件设计索引](README.md)
