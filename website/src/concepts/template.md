---
title: 模板
---

# 模板

::: info 实现进度 85% · 进行中
kernel D2 P0 已接：Tpl 默认文本节点（插值由 Vue 转义）；`${name|raw}` 才 `v-html`。P0 过滤器 `raw` / `html` / `json` / `date` / `datetime` / `number` / `percent` / `default` / `truncate` 可用。Amis 其余运行时过滤器（`map` / `bytes` 等）仍 P1。
:::

模板字符串里的 `${...}` 会按当前数据求值。默认走 `tpl` 组件或字段上的模板属性（`label`、`title`、`confirmText` 等）。

```schema
type: page
data:
  name: 操作员
body:
  - type: tpl
    tpl: 你好，${name}
```

## 安全

`tpl` 默认当**文本**渲染，插值里的 `<` 不会变成标签。需要 HTML 时显式写 `|raw`，且只应出现在受信任配置里。`type: html` 仍按 HTML 输出，但插值默认走 `|html` 转义。

```schema
type: page
data:
  name: <b>Ada</b>
body:
  - type: tpl
    tpl: 默认当文本：${name}
  - type: tpl
    tpl: raw 才当 HTML：${name|raw}
```

URL、接口地址、`jumpTo` 仍按原文拼接，不会把 `&` 转成 `&amp;`。

## 过滤器

`${name|json}`、`${ts|date:'YYYY-MM-DD'}`、`${n|number}`、`${n|percent}`、`${s|truncate:8}`、`${age|default:'-'}` 与 `|html` / `|raw` 走同一套 parser。

## 和表达式的关系

`${name}` 是模板插值；`visibleOn: ${status === "online"}` 是布尔表达式。两者进同一 `@vamis/formula` 引擎，见 [表达式](/concepts/expression)。不实现 lodash `<% %>` 模板。
