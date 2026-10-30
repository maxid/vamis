---
title: Html
outline: deep
---

# Html

::: info 实现进度 90% · 进行中
`tpl` 别名。始终 HTML 插入，插值默认转义。`maxLine` / `showNativeTitle` 与事件同 Tpl。其余运行时过滤器仍 P1。
:::

渲染一段 HTML。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema
type: page
body:
  type: html
  html: 支持 <code>Html</code>
```

> 当需要获取数据域中变量时，使用 [Tpl](./tpl)。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON。
- `html` 与 `tpl` 同一渲染器，可写 `tpl` / `html` / `maxLine` / `showNativeTitle`。
