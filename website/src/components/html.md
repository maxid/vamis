---
title: Html
outline: deep
---

# Html

::: info 实现进度 90% · 进行中
`tpl` 别名。文档主路径已对齐：渲染 HTML。`maxLine` / `showNativeTitle` / 事件同 Tpl。其余过滤器仍 P1
:::

`html` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

渲染一段 HTML

```schema
{
  "body": {
    "type": "html",
    "html": "支持 <code>Html</code>"
  }
}
```

> 当需要获取数据域中变量时，使用 [Tpl](./tpl) 。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：`tpl` 别名。文档主路径已对齐：渲染 HTML。`maxLine` / `showNativeTitle` / 事件同 Tpl。其余过滤器仍 P1。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
