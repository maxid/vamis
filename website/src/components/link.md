---
title: Link 链接
outline: deep
---

# Link 链接

::: info 实现进度 85% · 进行中
主路径已对齐：`href`（按数据域插值）、`body` / 默认文本、`blank` / `htmlTarget` 打开方式、`title`、`disabled`（无下划线、禁用灰 `#b8babf`）、`icon` / `rightIcon`、`badge`、`className` / `style`，也可在 Form 中用 `static-link` 静态展示。对照见下。
:::

`link` 渲染一个超链接。可作为 Table 列、List / Card 内容或独立展示组件。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
body:
  type: link
  href: https://www.baidu.com
  body: 百度一下，你就知道
```

## 新标签页打开

`blank` 默认 `true`（新标签页）；`blank: false` 当前页打开。`htmlTarget` 优先于 `blank`：

```schema
type: page
body:
  type: link
  href: https://www.baidu.com
  body: 百度一下，你就知道
  blank: true
```

## 禁用超链接

`disabled: true` 时不输出可点击的 `href`，字色走禁用灰 `#b8babf`，无下划线：

```schema
type: page
body:
  type: link
  href: https://www.baidu.com
  body: 百度一下，你就知道
  blank: true
  disabled: true
```

## 添加图标

`icon` 在左侧、`rightIcon` 在右侧：

```schema
type: page
body:
  type: link
  href: https://www.baidu.com
  body: 百度一下，你就知道
  blank: true
  icon: fa fa-search
```

```schema
type: page
body:
  type: link
  href: https://www.baidu.com
  body: 百度一下，你就知道
  icon: fa fa-search
  rightIcon: fa fa-external-link
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `body` | `string` / SchemaNode | | 链接内容；不写时用 `href` 或 `link` |
| `href` | `string` | | 链接地址，支持 `${字段}` 插值 |
| `blank` | `boolean` | `true` | 是否新标签页打开 |
| `htmlTarget` | `string` | | 原生 `target`，优先于 `blank` |
| `title` | `string` | | 原生 `title`，支持插值 |
| `disabled` | `boolean` | `false` | 禁用超链接 |
| `icon` | `string` | | 左侧图标（Font Awesome / URL / symbol） |
| `rightIcon` | `string` | | 右侧图标 |
| `badge` | `object` | | 角标，同 Badge |
| `className` | `string` | | 外层 class，支持数据域表达式 |
| `style` | `object` | | 外层样式 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：`href` / `body`、`blank`（默认 `true`）、`htmlTarget`、`title`、`disabled`、`icon` / `rightIcon`、`badge`。
- 未接 Amis 的 `env.tracker` 埋点；`static-link` 由 Static 泛型转到 `link` 渲染。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
