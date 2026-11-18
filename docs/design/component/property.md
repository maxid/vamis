# Property 属性表 · `property` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/property) · Amis：`/zh-CN/components/property`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Property 当前是**简易 label/content 网格**（31 行）：items、column、title、Card 壳。没有 schema 内容/分组/边框模式/子属性；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **items**：label/content（或 value）；filterTpl 模板；空 content 显示 `-`。
2. **columns**：column 数字；grid-template 均分；非法值兜底 2。
3. **title**：仅字符串；Schema 标题未接。
4. **样式**：Card 壳 + label/value；无边框模式/分组。
5. **包边界**：无 `<style>`、无 fetch；property token。

### 边界用例

- 空 items/单/多/column 1/2/3/非法
- content 模板/空/数字/HTML
- title 字符串/对象（未接）
- 窄屏/深色

### 优先级

1. items/columns；2. 模板/空值；3. title/Schema/分组；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 253 行；Vamis 31 行）；依赖 tpl/mapping。
- 风险：当前仅基础网格。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| items | label/content | 已接 |
| column | 列数 | 已接 |
| title | 标题 | 仅字符串 |
| schema/分组/边框 | 目标 | 未接 |
| 事件/动作 | 无 | — |

## 4. 架构

- [`rest/Property.vue`](../../../packages/vamis/src/renderers/rest/Property.vue)：items/columns/Card。
- [`tpl`](tpl.md)：filterTpl 模板。

## 5. 样式

- Card/label/value token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

Schema 标题/内容、分组、边框模式、深色/窄屏。

## 7. 验收

- items/columns/模板/空值/窄屏；未接不误标。

## 8. 后续

先补 Schema title/分组，再做边框模式；保持 label/content 简单。

---

返回 [组件设计索引](README.md)
