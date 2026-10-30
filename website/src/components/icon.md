---
title: Icon 图标
outline: deep
---

# Icon 图标

::: info 实现进度 90% · 进行中
文档主路径已对齐：名称默认 FA v4、URL、内联 SVG、`vendor` 空给 FA5/6、颜色/字号、click / mouseenter / mouseleave。缺 Amis 自有 iconfont 字体、`registerIcon` 组件表、主题 `iconContent` CSS 变量。
:::

`icon` 对齐 Amis 同名 schema。作者态 YAML 与 JSON 同等有效。字形走 `sdk.css` 里的 Font Awesome + v4-shims。

图标基于字体，颜色和大小走 [文字颜色](/style/typography/text-color) / [字号](/style/typography/font-size)。不要为每个 `fa-*` 写 CSS 掩膜。

## 基本使用

`icon` 写 FA v4 名称。未写 `vendor` 时默认 `fa`，class 是 `fa fa-${icon}`。

```schema
type: page
body:
  type: icon
  icon: cloud
```

## 颜色及大小调整

```schema
type: page
body:
  type: icon
  icon: cloud
  className: text-info text-xl
```

## 使用图标链接

含 `.` 的地址当图片（对齐 Amis `indexOf('.')`）。可以从 iconfont 等站点下载 SVG 后用 URL。

```schema
type: page
body:
  type: icon
  icon: https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg
```

## 使用 v5/v6 版本的 fontawesome

`icon` 默认支持 [fontawesome v4](https://fontawesome.com/v4/icons/)。要 v5 / v6 时把 `vendor` 设成空字符串。

### fontawesome v5 版本

v5 用 `far` / `fas` 等前缀。

```schema
type: page
body:
  - type: icon
    icon: far fa-address-book
    vendor: ""
  - type: icon
    icon: fas fa-address-book
    vendor: ""
  - type: icon
    icon: far fa-address-book
    vendor: ""
    className: text-info text-xl
  - type: icon
    icon: fas fa-address-book
    vendor: ""
    className: text-info text-xl
```

### fontawesome v6 版本

v6 用 `fa-regular` / `fa-solid` 等前缀。

```schema
type: page
body:
  - type: icon
    icon: fa-regular fa-address-book
    vendor: ""
  - type: icon
    icon: fa-solid fa-address-book
    vendor: ""
  - type: icon
    icon: fa-regular fa-address-book
    vendor: ""
    className: text-info text-xl
  - type: icon
    icon: fa-solid fa-address-book
    vendor: ""
    className: text-info text-xl
```

## 属性表

| 属性 | 说明 |
|------|------|
| `type` | `icon` |
| `icon` | 名称、URL、或 `<svg>…</svg>` 字符串 |
| `vendor` | 默认 `fa`。`iconfont` 需宿主自备字体；`""` 原样落下（FA5/6） |
| `className` | 附加 class，可改颜色 / 字号 |
| `badge` | 角标 |

## 事件表

宿主 `div.vamis-node` 派发。

| 事件 | 说明 |
|------|------|
| `click` | 点击 |
| `mouseenter` | 鼠标移入 |
| `mouseleave` | 鼠标移出 |

### click

```schema: scope="body"
type: icon
icon: cloud
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.target.className}"
```

### mouseenter

```schema: scope="body"
type: icon
icon: cloud
onEvent:
  mouseenter:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type}"
```

### mouseleave

```schema: scope="body"
type: icon
icon: cloud
onEvent:
  mouseleave:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type}"
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- Font Awesome 打进 `@vamis/ui` / `sdk.css`，不必再单独引 `all.css`。Amis 文档站另引的 `iconfont.css` 未搬。
- 已写完整 `fa fa-*` 时不再叠 `vendor: fa` 前缀。
- 未接 `registerIcon` 组件表、主题 `iconContent` CSS 变量。
