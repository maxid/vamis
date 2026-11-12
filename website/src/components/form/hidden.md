---
title: Hidden 隐藏字段
outline: deep
---

# Hidden 隐藏字段

::: tip 实现进度 100% · 已完成
对齐 Amis：`hidden` 渲染 null（`wrap: false`，不落 DOM），值由表单域初始化并随提交；`value` 支持固定值 / `${}` 表达式，`name` 支持路径。章节覆盖 Amis 同名页。
:::

隐藏字段。表单提交时默认只提交 `body` 里声明的字段；对于隐藏、同时又希望提交时带过去的值，用 `hidden` 组件。属于普通表单项，通用属性见 [FormItem](./formitem)；Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。JSON 同等有效。

## 基本用法

默认表单提交，在没有[自定义 API 请求数据](../../types/api)的情况下，只会发送 `body` 里面的这些成员，对于隐藏的字段同时又希望提交表单的时候带过去，可以使用 `hidden` 组件：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: hidden
    name: id
    value: 1
  - type: input-text
    name: name
    label: 姓名：
  - type: input-email
    name: email
    label: 邮箱：
```

`hidden` 不画任何节点；上例提交时 `id` 会随表单数据一起带出。

## 属性表

`hidden` 没有专属外观属性，除 `type` / `name` / `value` 外均继承 [普通表单项属性表](./formitem#属性表)。

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | | 固定为 `hidden` |
| `name` | `string` | | 写入表单数据的字段名；支持 `a.b[0]` 路径 |
| `value` | `any` | | 隐藏字段的初始值；支持固定值、`${}` 表达式 |

## 事件表

`hidden` 不渲染 DOM，不派发组件事件。需要响应它的值变化时，监听所在表单或其他表单项的事件。

## 动作表

`hidden` 没有专属动作。表单级 `clear` / `reset` 会随 form store 一并清空或还原它的值。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 与 Amis 一致：渲染 null、`wrap: false`、值随表单初始化与提交。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`，`spec` 仍是这棵 widget 树。
