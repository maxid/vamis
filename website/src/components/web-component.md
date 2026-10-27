---
title: Web Component
outline: deep
---

# Web Component

::: info 实现进度 80% · 进行中
文档主路径已对齐：`tag`（默认 `div`）、`props` 字符串走 `${}`、`body` 子节点。缺宿主 `customElements.define` 生命周期、自定义事件回写。
:::

专门用来渲染 Web Component，用来扩展组件（比如接 Angular 自定义元素）。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`tag` 指定标签，属性放在 `props` 里。没注册的自定义元素仍会画出标签和子节点。

## 基本用法

```schema: scope="body"
type: web-component
tag: random-number
props:
  prefix: hello
  class: my-class
body:
  type: tpl
  tpl: hello
```

## 属性支持变量

`props` 里的字符串走模板。下面 `prefix` 和正文都是 `World`。

```schema
type: page
data:
  text: World
body:
  type: web-component
  tag: random-number
  props:
    prefix: "${text}"
  body:
    type: tpl
    tpl: "${text}"
```

宿主要先 `customElements.define` 才有自定义元素自己的行为。没注册时只看到标签和 `body`。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"web-component"` | 指定为 web-component 渲染器 |
| tag | `string` | `"div"` | 具体使用的 web-component 标签 |
| props | `object` | | 标签上的属性。字符串支持 `${}` |
| body | SchemaNode | | 子节点 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不代注册 `random-number` 这类自定义元素；要宿主自己 `define`。
- `className` 打在宿主 `div.vamis-node`；`props.class` 打在 `tag` 上。
