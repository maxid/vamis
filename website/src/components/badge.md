---
title: Badge 角标
outline: deep
---

# Badge 角标

::: info 实现进度 80% · 进行中
不是独立 `type`。已挂 `avatar` / `action` / `tpl` / `link` / `icon`：数字或 `{mode,text,position,level,overflowCount,visibleOn}`；`mode` 默认 dot；`text: 0` 不显示；字符串表达式当显隐。缺封顶像素级、ribbon 斜条皮肤、animation 与 cxd 完全同帧。
:::

部分组件可以设置 `badge` 属性来显示角标。1.2.3 起支持按钮、链接、模板。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

数字简写当成 `mode: text`。对象默认 `mode: dot`、`position: top-right`、`level: danger`、`overflowCount: 99`。

## 基本用法

头像和按钮都可以挂。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "text": "角甲", "badge": { "mode": "text", "text": 10 } },
    { "type": "action", "label": "钮甲", "badge": { "mode": "text", "text": 15 } }
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
  - type: action
    label: 钮乙
    badge:
      mode: text
      text: 16
```

模板、链接同样吃 `badge`。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "tpl", "tpl": "模版甲", "badge": { "mode": "text", "text": 25 } },
    { "type": "link", "body": "链接甲", "href": "https://example.com", "badge": { "mode": "dot" } }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: tpl
    tpl: 模版乙
    badge:
      mode: text
      text: 26
  - type: link
    body: 链接乙
    href: https://example.com
    badge:
      mode: dot
```

图标同样吃 `badge`。

```schema: scope="body"
{
  "type": "icon",
  "icon": "star",
  "badge": { "mode": "text", "text": 5 }
}
```

```schema: scope="body"
type: icon
icon: heart
badge:
  mode: text
  text: 6
```

## 显示文字或数值

`mode: text`。数值为零时不显示。数字简写 `badge: 3` 也走 text。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "text": "数甲", "badge": { "mode": "text", "text": 10 } },
    { "type": "avatar", "text": "零甲", "className": "m-l", "badge": { "mode": "text", "text": 0 } },
    { "type": "avatar", "text": "新甲", "className": "m-l", "badge": { "mode": "text", "text": "new甲" } }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    text: 数乙
    badge:
      mode: text
      text: 10
  - type: avatar
    text: 零乙
    className: m-l
    badge:
      mode: text
      text: 0
  - type: avatar
    text: 新乙
    className: m-l
    badge:
      mode: text
      text: new乙
```

## 丝带

`mode: ribbon`。

```schema: scope="body"
{
  "type": "action",
  "label": "热甲",
  "badge": { "mode": "ribbon", "text": "HOT甲" }
}
```

```schema: scope="body"
type: action
label: 热乙
badge:
  mode: ribbon
  text: HOT乙
```

## 封顶值

超过 `overflowCount` 显示 `N+`，默认 99。

```schema
{
  "type": "page",
  "body": {
    "type": "avatar",
    "text": "帽甲",
    "badge": { "mode": "text", "text": 10, "overflowCount": 9 }
  }
}
```

```schema
type: page
body:
  type: avatar
  text: 帽乙
  badge:
    mode: text
    text: 10
    overflowCount: 9
```

## 动态显隐

字符串表达式当显隐；对象里也可以写 `visibleOn`。

```schema
{
  "type": "page",
  "data": { "myData": 10 },
  "body": [
    { "type": "avatar", "text": "显甲", "badge": "this.myData > 1" },
    { "type": "avatar", "text": "隐甲", "className": "m-l", "badge": { "visibleOn": "this.myData > 10", "mode": "text", "text": 1 } }
  ]
}
```

```schema
type: page
data:
  myData: 10
body:
  - type: avatar
    text: 显乙
    badge: this.myData > 1
  - type: avatar
    text: 隐乙
    className: m-l
    badge:
      visibleOn: this.myData > 10
      mode: text
      text: 1
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `string` | `dot` | `dot` / `text` / `ribbon` |
| `text` | `string \| number` | | 角标文案。`mode: text` 且为 0 时不显示 |
| `size` | `number` | dot 6 / text 16 / ribbon 12 | 角标大小 |
| `level` | `string` | `danger` | `info` / `success` / `warning` / `danger` |
| `overflowCount` | `number` | 99 | 数字封顶 |
| `position` | `string` | `top-right` | `top-right` / `top-left` / `bottom-right` / `bottom-left` |
| `offset` | `number[]` | `[0, 0]` | 相对 position 的偏移 |
| `animation` | `boolean` | | 圆点脉冲 |
| `style` | `object` | | 角标自定义样式 |
| `visibleOn` | 表达式 | | 控制显隐 |
| `className` | `string` | | 角标 class |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 数字简写 `badge: 3` 按 text 显示数字；Amis 把非对象 badge 解构成默认圆点。
- ribbon 是斜条示意，不是 cxd 切角像素。
- fa 图标名未接字体；icon 仍显示短名。
