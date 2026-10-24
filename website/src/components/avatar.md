---
title: Avatar 头像
outline: deep
---

# Avatar 头像

::: info 实现进度 80% · 进行中
文档主路径已对齐：`src` / `text` / `icon` 优先级、`shape` circle/square/rounded（默认 circle）、`size` 空与 default/normal=40、small 32、large 48、数字 px、`fit` 默认 cover、`gap`、`defaultAvatar`、`badge` 数字或 `{mode,text}`。缺 fa 图标名、onError 脚本、gap 像素级缩放、ribbon 角标。
:::

用来显示用户头像。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`className` / `style` 打在宿主 `div.vamis-node`。头像本身是 `inline-block`，和按钮一样并排。同时有 `src`、`text`、`icon` 时：先图、再字、再图标。没写 icon 时用默认用户图标（不接 fa）。

## 基本使用

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面是头像。"
}
```

```schema: scope="body"
{
  "type": "avatar",
  "text": "甲A"
}
```

```schema: scope="body"
type: avatar
text: 乙A
```

## 文字

`text` 不截成两个字，长文案按 `gap` 留边。纯变量 `${name}` 也会从数据域取。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "text": "甲AM" },
    { "type": "avatar", "text": "甲长文字" }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    text: 乙AM
  - type: avatar
    text: 乙长文字
```

## 方形和圆角形

`shape` 默认 `circle`。还可 `square`、`rounded`。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "shape": "square", "text": "甲方" },
    { "type": "avatar", "shape": "rounded", "text": "甲圆" },
    { "type": "avatar", "shape": "circle", "text": "甲圆圈" }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    shape: square
    text: 乙方
  - type: avatar
    shape: rounded
    text: 乙圆
  - type: avatar
    shape: circle
    text: 乙圆圈
```

## 大小

源码默认 40px（`default` / `normal` / 空）。`small` 32px，`large` 48px，也可写数字。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "size": "large", "text": "甲大" },
    { "type": "avatar", "size": "default", "text": "甲默" },
    { "type": "avatar", "size": "small", "text": "甲小" },
    { "type": "avatar", "size": 60, "text": "甲60" },
    { "type": "avatar", "size": 20, "text": "甲20" }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    size: large
    text: 乙大
  - type: avatar
    size: small
    text: 乙小
  - type: avatar
    size: 60
    text: 乙60
```

## 图片

`src` 优先。`fit` 默认 `cover`。`defaultAvatar` 在没写 src 时当占位图。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "fit": "cover", "text": "甲cover" },
    { "type": "avatar", "fit": "contain", "text": "甲contain" }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    fit: cover
    text: 乙cover
  - type: avatar
    fit: contain
    text: 乙contain
```

## 角标

`badge` 可以是数字（当 `mode: text`），或 `{ mode, text, position }`。对象默认 `mode: dot`。活示例见 [Badge 角标](./badge)。

```schema: scope="body"
{
  "type": "container",
  "body": [
    { "type": "avatar", "text": "甲角", "badge": { "mode": "text", "text": 10 } },
    { "type": "avatar", "text": "甲点", "badge": { "mode": "dot" } },
    { "type": "avatar", "text": "甲数", "badge": 3 }
  ]
}
```

```schema: scope="body"
type: container
body:
  - type: avatar
    text: 乙角
    badge:
      mode: text
      text: 10
  - type: avatar
    text: 乙点
    badge:
      mode: dot
  - type: avatar
    text: 乙数
    badge: 3
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"avatar"` | 指定为头像 |
| `src` | `string` | | 图片地址，可模板 |
| `defaultAvatar` | `string` | | 没写 src 时的占位图 |
| `text` | `string` | | 文字 |
| `icon` | `string` | | 含 `/` 当图片；fa 名未接，走默认用户图标 |
| `shape` | `string` | `circle` | `circle` / `square` / `rounded` |
| `size` | `number \| string` | `40` | `small` 32 / `default` `normal` 40 / `large` 48 / 数字 px |
| `fit` | `string` | `cover` | 图片 object-fit |
| `gap` | `number` | `4` | 文字左右边距 |
| `alt` | `string` | | 图片替代文本 |
| `draggable` | `boolean` | | 图片是否允许拖动 |
| `badge` | `number \| object` | | 角标。见 [Badge](./badge) |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不接 fa 图标名；`onError` 脚本未接；`gap` 用内边距近似，不是测量缩放。
- 视觉走 token 圆与底，不是 cxd Avatar 皮肤。
