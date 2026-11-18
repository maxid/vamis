# Divider 分割线 · `divider` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/divider) · Amis：`/zh-CN/components/divider`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Divider 当前是**方向/标题/颜色/旋转分割线**（57 行）：lineStyle/direction/titlePosition/title、title SchemaNode/模板、color、rotate。没有 themeCss/线型/间距档；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **方向**：horizontal/vertical 由 dividerDirection；lineStyle 映射线型。
2. **标题**：hasTitle + titlePosition；字符串模板/SchemaNode；无标题不画文字。
3. **颜色/旋转**：color 映射；rotate 生成 transform；不要写死。
4. **包边界**：无 `<style>`、无 fetch；divider token。

### 边界用例

- 空标题/字符串/数字/SchemaNode
- 水平/垂直、标题位置、颜色、旋转
- 嵌套/窄屏/深色
- themeCss/线型/间距（未接）

### 优先级

1. 方向/标题；2. 颜色/旋转；3. 样式/响应式；4. themeCss。

## 2. 复杂度

- 等级：**M 中**（Amis 194 行；Vamis 57 行）；依赖 tpl/container。
- 风险：标题位置/线型映射。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| 方向 | horizontal/vertical | 已接 |
| title/titlePosition | 标题 | 已接 |
| color/rotate | 颜色/旋转 | 已接 |
| themeCss/线型/间距 | 目标 | 未接 |

## 4. 架构

- [`Divider.vue`](../../../packages/vamis/src/renderers/Divider.vue)：方向/标题/颜色/旋转。
- [`divider.ts`](../../../packages/vamis-core/src/utils/divider.ts)：direction/title/line style。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：标题 SchemaNode。

## 5. 样式

- data-line/dir/title token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss/线型/间距档/深色。

## 7. 验收

- 方向/标题/颜色/旋转/空标题/窄屏；未接不误标。

## 8. 后续

补线型/间距/themeCss；标题 Schema 保持。

---

返回 [组件设计索引](README.md)
