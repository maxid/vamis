---
title: 模板
---

# 模板

::: info 实现进度 50% · 进行中
`${}` 插值能跑；`|raw` / `|html` 可用。D2 未齐：模板默认转义还没收口，现在默认 `raw`。
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

模板默认转义 HTML。`|raw` 和字符串函数只应出现在受信任配置里。这是 kernel **D2** 的一部分，过滤器管道还没和 Amis 完全对齐。

## 和表达式的关系

`${name}` 是模板插值；`visibleOn: ${status === "online"}` 是布尔表达式。两者都应进同一 `expr` 层，目前实现深度不同，见 [表达式](/concepts/expression)。
