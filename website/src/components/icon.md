---
title: Icon 图标
outline: deep
---

# Icon 图标

::: info 实现进度 75% · 进行中
文档主路径已对齐：`icon` 名称默认 Font Awesome v4（`vendor: fa`）、URL 图片、内联 SVG 字符串、`vendor: ""` 原样 class。字形走 `sdk.css` 里的 FA + v4-shims。缺 Amis 自有 iconfont 字体文件、`registerIcon` 组件表、主题 `iconContent` CSS 变量。
:::

`icon` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

图标基于字体，颜色和大小走 [文字颜色](/style/typography/text-color) / [字号](/style/typography/font-size)。不要为每个 `fa-*` 写 CSS 掩膜。

## 基本使用

`icon` 写 FA v4 名称。未写 `vendor` 时默认 `fa`，class 是 `fa fa-${icon}`。

```schema
type: page
body:
  type: icon
  icon: cloud
```

## 使用图标链接

含 `.` 的地址当图片（对齐 Amis `indexOf('.')`）。可以从 iconfont 等站点下载 SVG 后用 URL。

```schema
type: page
body:
  type: icon
  icon: https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `icon` | 名称、URL、或 `<svg>…</svg>` 字符串 |
| `vendor` | 默认 `fa`。`iconfont` 需宿主自备字体；`""` 原样落下（FA5/6） |
| `className` | 附加 class，可改颜色 / 字号 |
| `visibleOn` / `hiddenOn` | 显隐表达式 |
| `onEvent` | 事件到动作 |
| `badge` | 角标 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- Font Awesome 打进 `@vamis/ui` / `sdk.css`，不必再单独引 `all.css`。Amis 文档站另引的 `iconfont.css` 未搬。
- 已写完整 `fa fa-*` 时不再叠 `vendor: fa` 前缀。
