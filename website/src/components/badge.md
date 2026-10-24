---
title: Badge 角标
outline: deep
---

# Badge 角标

::: warning 实现进度 40% · 进行中
不是独立 `type`。`avatar` 已接数字 / `{mode:text\|dot,text,position}`。action / tpl / link / icon 的 `badge` 以及 ribbon 未齐。
:::

部分组件可以设置 `badge` 属性来显示角标。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

目前主路径挂在头像上。

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面是带头像角标。"
}
```

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "text": "角甲", "badge": { "mode": "text", "text": 10 } },
    { "type": "avatar", "text": "点甲", "badge": { "mode": "dot" } }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    text: 角乙
    badge:
      mode: text
      text: 10
  - type: avatar
    text: 点乙
    badge:
      mode: dot
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `string` | `text` | `text` / `dot`。`ribbon` 未接 |
| `text` | `string \| number` | | 角标文案 |
| `position` | `string` | `top-right` | `top-right` / `top-left` / `bottom-right` / `bottom-left` |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON。
- 尚未挂到 action / tpl / link / icon。
- 视觉走 destructive token 圆点，不是 cxd Badge 皮肤。
