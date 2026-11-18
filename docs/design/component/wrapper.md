# Wrapper 包裹容器 · `wrapper` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/wrapper) · Amis：`/zh-CN/components/wrapper`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Wrapper 当前是**可选包裹层**（35 行）：wrap/body、size、padding token、innerClassName/style。没有 themeCss/复杂布局；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **wrap**：false 时直接渲染 body，不产生包裹盒；true 才应用 size/padding。
2. **body**：数组；空 body 无内容。
3. **样式**：padding token + author style；innerClassName 只作用包裹层。
4. **包边界**：无 `<style>`、无 fetch；wrapper token。

### 边界用例

- wrap true/false/缺省；body 空/单/多
- size/padding/innerClassName/style
- 嵌套 wrapper/窄屏/深色
- themeCss 缺口

### 优先级

1. wrap/body；2. 样式；3. 嵌套/响应式；4. themeCss。

## 2. 复杂度

- 等级：**M 中**（Amis 84 行；Vamis 35 行）；依赖 container。
- 风险：wrap 扁平化语义。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `body` / `wrap` | 内容/包裹 | 已接 |
| size/padding | 盒模型 | 已接 |
| innerClassName/style | 样式 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`Wrapper.vue`](../../../packages/vamis/src/renderers/Wrapper.vue)：wrap/body/padding/classes。
- [`wrapper.ts`](../../../packages/vamis-core/src/utils/wrapper.ts)：body/wrap/size/padding。

## 5. 样式

- data-size/padding token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、复杂布局/深色

## 7. 验收

- wrap/body/size/padding/嵌套/窄屏；未接不误标。

## 8. 后续

保持薄；themeCss 随主题批次补。

---

返回 [组件设计索引](README.md)
