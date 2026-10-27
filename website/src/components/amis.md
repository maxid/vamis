---
title: amis 渲染器
outline: deep
---

# amis 渲染器

::: info 实现进度 80% · 进行中
文档主路径已对齐：`schema` / `value` / `name` 取内层配置（对象或 JSON 字符串）、`props` 向下覆盖。缺和 `editor` 同一 `name` 的实时编辑、非法 JSON 诊断。
:::

用来渲染数据里的另一份 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

设置 `schema` 或 `name`。值可以是对象，或字符串 JSON。

## 基本使用

```schema: scope="body"
type: amis
schema:
  type: tpl
  tpl: amis render
```

## 通过 name 绑定动态数据

`name` 从数据域取同一份配置。对照不跑 `editor` + 表单提交。

```schema
type: page
data:
  amis:
    type: tpl
    tpl: amis render
body:
  type: amis
  name: amis
```

## 向下传递 props

`props` 会盖到内层 schema 上，当作默认值。

```schema: scope="body"
type: amis
props:
  tpl: amis render
value:
  type: tpl
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"amis"` | 指定为 amis 渲染器 |
| name | `string` | | 绑定上下文变量名 |
| schema | `object` / `string` | | 要渲染的 schema |
| value | `object` / `string` | | 同 schema，走 getPropValue |
| props | `object` | | 向下传递，盖到内层 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不接文档里 `editor` + `form.api` 那份实时联调；用页面 `data` 绑定 `name`。
- JSON 解析失败时不渲染，不弹诊断（D8）。
