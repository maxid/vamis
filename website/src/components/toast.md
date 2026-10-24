---
title: Toast 轻提示
outline: deep
---

# Toast 轻提示

::: info 实现进度 80% · 进行中
文档主路径已对齐：`toast.items` / `body` / `title`、`level`、`position`、`timeout`、`closeButton` / `showIcon`、`allowHtml`。缺 `mobileUI` 切 center/3000、`center` 像素级（现映射 `top-center`）、schema 节点 body。
:::

点击按钮弹出轻提示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。Toast **不是**独立页面 `type`，用 `actionType: toast`。

对照时不要依赖浮层是否画出（树结点对的是按钮）。超时到了会自己关掉。

## 基本用法

```schema: scope="body"
type: button
label: 弹出提示
actionType: toast
toast:
  items:
    - body: 轻提示内容
```

事件动作也可以写 `args.msg` / `args.msgType`，不必包 `toast.items`。

## 设置位置

默认 `top-center`。可用 `top-right` / `top-center` / `top-left` / `bottom-center` / `bottom-left` / `bottom-right` / `center`（`center` 目前落到 `top-center`）。

```schema: scope="body"
type: button
label: 底部弹出
actionType: toast
toast:
  position: bottom-center
  items:
    - body: 底部提示
```

## 不展示关闭按钮

`closeButton` 默认 `false`。要关掉按钮显式写 `true`。

```schema: scope="body"
{
  "type": "button",
  "label": "无关闭按钮",
  "actionType": "toast",
  "toast": {
    "closeButton": false,
    "items": [{ "body": "没有关闭按钮" }]
  }
}
```

## 关闭图标展示

```schema: scope="body"
{
  "type": "button",
  "label": "无图标提示",
  "actionType": "toast",
  "toast": {
    "showIcon": false,
    "items": [{ "body": "没有图标" }]
  }
}
```

## 持续时间设置

默认 4000ms；`level: error` 是 6000ms。对齐 Amis 源码，不是文档里的 5000。

```schema: scope="body"
{
  "type": "button",
  "label": "一秒关掉",
  "actionType": "toast",
  "toast": {
    "timeout": 1000,
    "items": [{ "body": "一秒后关掉" }]
  }
}
```

## 带标题的提示

```schema: scope="body"
type: button
label: 带标题提示
actionType: toast
toast:
  items:
    - title: 标题
      body: 带标题的内容
```

## 提示单独设置不同的类型

```schema: scope="body"
{
  "type": "button",
  "label": "四种类型",
  "actionType": "toast",
  "toast": {
    "items": [
      { "body": "普通消息提示", "level": "info" },
      { "body": "成功消息提示", "level": "success" },
      { "body": "错误消息提示", "level": "error" },
      { "body": "警告消息提示", "level": "warning" }
    ]
  }
}
```

## 提示单独设置不同的位置

每条 `items[]` 可覆盖 `position`。

```schema: scope="body"
{
  "type": "button",
  "label": "多位置提示",
  "actionType": "toast",
  "toast": {
    "items": [
      { "body": "左上方提示", "position": "top-left" },
      { "body": "上方提示", "position": "top-center" },
      { "body": "右上方提示", "position": "top-right" },
      { "body": "左下方提示", "position": "bottom-left" },
      { "body": "下方提示", "position": "bottom-center" },
      { "body": "右下方提示", "position": "bottom-right" }
    ]
  }
}
```

## 提示单独设置是否展示关闭按钮

```schema: scope="body"
{
  "type": "button",
  "label": "关闭按钮对比",
  "actionType": "toast",
  "toast": {
    "items": [
      { "body": "展示关闭按钮", "closeButton": true },
      { "body": "不展示关闭按钮", "closeButton": false }
    ]
  }
}
```

## 提示单独设置不同的持续时间

```schema: scope="body"
{
  "type": "button",
  "label": "超时对比",
  "actionType": "toast",
  "toast": {
    "items": [
      { "body": "持续1秒", "timeout": 1000 },
      { "body": "持续3秒", "timeout": 3000 }
    ]
  }
}
```

## 渲染 html

`allowHtml` 默认 `true`。不信任的内容写 `allowHtml: false`。

```schema: scope="body"
{
  "type": "button",
  "label": "HTML 提示",
  "actionType": "toast",
  "toast": {
    "items": [{ "body": "<strong>Hello</strong> <span>world</span>" }]
  }
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `actionType` | `string` | `"toast"` | 指定为 toast 轻提示 |
| `items` | `Array<ToastItem>` | `[]` | 轻提示内容。没有 items 时用 `msg` / `args.msg` |
| `position` | `string` | `top-center` | 提示位置 |
| `closeButton` | `boolean` | `false` | 是否展示关闭按钮 |
| `showIcon` | `boolean` | `true` | 是否展示图标 |
| `timeout` | `number` | `4000`（error 为 6000） | 持续时间，单位 ms |

## ToastItem 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | | 标题，可模板 |
| `body` | `string` | | 内容，可模板 |
| `level` | `string` | `info` | `info` / `success` / `error` / `warning` |
| `position` | `string` | 继承外层 | 单条位置 |
| `closeButton` | `boolean` | 继承外层 | 单条关闭按钮 |
| `showIcon` | `boolean` | 继承外层 | 单条图标 |
| `timeout` | `number` | 继承外层 | 单条超时 |
| `allowHtml` | `boolean` | `true` | body 是否当 HTML |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 默认超时跟 Amis **源码** 4000 / error 6000，不是文档写的 5000。
- `center` 目前映射 `top-center`；`mobileUI` 未切默认位置和 3000ms。
- `title` / `body` 目前只吃字符串或带 `tpl` 的节点，不渲染任意 schema 子树。
