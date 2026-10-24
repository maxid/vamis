---
title: Spinner 加载中
outline: deep
---

# Spinner 加载中

::: info 实现进度 80% · 进行中
文档主路径已对齐：`show` / `showOn`、`size` sm|lg|空、`overlay`（源码默认 false）、`tip` / `tipPlacement`、`delay`、`body` 容器。缺 Amis 默认 hex SVG 动画、fa / 内置 icon 名、父子 loading 互斥、`loadingConfig`。
:::

一般用来做 loading。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`className` / `style` 打在宿主 `div.vamis-node`。裸 spinner 是 `inline-block`，和 Amis `inline-flex` 一样并排。有 `body` 时当容器，指示器叠在内容中间。

源码里 `overlay` 默认 **false**（文档有的写成 true）。`size` 空值是 32px，`sm` 16px，`lg` 48px。

## 基本使用

`show` 控制是否画出指示器。默认 true。

```schema: scope="body"
type: flex
justify: flex-start
alignItems: center
items:
  - type: spinner
    show: true
    tip: 加载中
  - type: spinner
    show: false
    tip: 已隐藏
```

`showOn` 用表达式，优先于 `show`。

```schema: scope="body"
type: form
wrapWithPanel: false
body:
  - type: switch
    name: loading
    label: 显示加载
    value: true
  - type: spinner
    showOn: ${loading}
    tip: 加载中
```

## 尺寸

`size` 只有 `sm`、`lg` 和空值三档，不是表单项宽度。

```schema: scope="body"
type: flex
justify: flex-start
alignItems: center
items:
  - type: spinner
    show: true
    size: sm
    className: mr-4
  - type: spinner
    show: true
    size: ""
    className: mr-4
  - type: spinner
    show: true
    size: lg
```

## 文案位置

`tip` 配文案。`tipPlacement` 相对图标：`top` / `right` / `bottom`（默认）/ `left`。

```schema: scope="body"
type: flex
justify: flex-start
alignItems: center
items:
  - type: spinner
    show: true
    tip: 加载中
    tipPlacement: bottom
  - type: spinner
    show: true
    tip: 加载中
    tipPlacement: right
  - type: spinner
    show: true
    tip: 加载中
    tipPlacement: top
  - type: spinner
    show: true
    tip: 加载中
    tipPlacement: left
```

## 作为容器使用

有 `body` 时指示器居中叠在内容上。`overlay: true` 才加半透明遮罩（源码默认 false）。

```schema: scope="body"
type: spinner
show: true
overlay: true
tip: 加载中
body:
  type: tpl
  tpl: 姓名、邮箱
```

`delay` 是 `show` 变为 true 之后再等多少毫秒才画出。默认 0。对照不要用 `delay: 1000` 当活示例（收割时指示器可能还没出现）。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | 是否显示指示器。有 `showOn` 时以表达式为准 |
| `showOn` | `string` | | 表达式，优先于 `show` |
| `size` | `'sm' \| 'lg' \| ''` | `''` | 图标尺寸：16 / 48 / 32px |
| `overlay` | `boolean` | `false` | 作为容器时是否显示遮罩 |
| `tip` | `string` | | 文案，可模板 |
| `tipPlacement` | `string` | `bottom` | `top` / `right` / `bottom` / `left` |
| `delay` | `number` | `0` | 延迟显示毫秒 |
| `icon` | `string` | | 含 `/` 当图片 URL；内置名 / fa 未接 |
| `spinnerClassName` | `string` | | 打在图标上 |
| `spinnerWrapClassName` | `string` | | 作为容器时打在包裹层上 |
| `body` | `SchemaCollection` | | 有则当容器 |

`className` 打在宿主 `div.vamis-node`，不要指望它落到内层图标。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `overlay` 跟 Amis **源码** 默认 false，不是部分文档写的 true。
- 默认指示器是 CSS 圆环，不是 Amis hex SVG。
- 不接 fa / 内置 icon 名、父子 loading 互斥、`loadingConfig.root`。
