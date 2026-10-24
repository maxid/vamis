---
title: Alert 提示
outline: deep
---

# Alert 提示

::: info 实现进度 80% · 进行中
文档主路径已对齐：`level` info/success/warning/danger（默认 info）、`title` / `body`、`showIcon`（默认 false）、`showCloseButton`、`actions`、表达式 `level`。缺 fa / 内置 icon 名、关闭事件、像素级 cxd Alert。
:::

用来做文字特殊提示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`className` / `style` 打在宿主 `div.vamis-node`。`showIcon` / `showCloseButton` 源码默认 **false**。

## 基本使用

`level` 支持 `info`、`success`、`warning`、`danger`。

```schema: scope="body"
type: container
body:
  - type: alert
    level: info
    body: 提示类文案
  - type: alert
    level: info
    title: 提示类标题
    body: 提示类文案
  - type: alert
    level: success
    body: 成功类文案
  - type: alert
    level: success
    title: 成功类标题
    body: 成功类文案
  - type: alert
    level: warning
    body: 警告类文案
  - type: alert
    level: warning
    title: 警告类标题
    body: 警告类文案
  - type: alert
    level: danger
    body: 危险类文案
  - type: alert
    level: danger
    title: 危险类标题
    body: 危险类文案
```

## 图标

`showIcon: true` 才画左侧图标。没写 `icon` 时按 `level` 用默认图标。含 `/` 的 `icon` 当图片 URL；内置名 / fa 未接。

```schema: scope="body"
type: container
body:
  - type: alert
    level: info
    showIcon: true
    body: 提示类文案
  - type: alert
    level: info
    showIcon: true
    title: 提示类标题
    body: 提示类文案
  - type: alert
    level: success
    showIcon: true
    body: 成功类文案
  - type: alert
    level: warning
    showIcon: true
    body: 警告类文案
  - type: alert
    level: danger
    showIcon: true
    body: 危险类文案
```

## level 支持表达式

`level` / `showIcon` / `icon` 都可以写表达式。

```schema: scope="body"
type: alert
data:
  status: 1
level: "${IFS(status===1, 'danger', status===2, 'warning')}"
body: 这是内容区
```

## 显示关闭按钮

`showCloseButton: true` 在右上角出关闭。点了只藏这一条，不会卸掉整页。

```schema: scope="body"
type: container
body:
  - type: alert
    level: info
    showCloseButton: true
    showIcon: true
    body: 显示关闭按钮的提示
  - type: alert
    level: success
    showCloseButton: true
    showIcon: true
    title: 可关闭提示
    body: 显示关闭按钮的提示
```

对照时不要去点关闭（树结点对的是提示条还在不在）。

## 操作区域

`actions` 可以是按钮数组，或单个 schema（比如 flex）。

```schema: scope="body"
{
  "type": "alert",
  "level": "success",
  "showIcon": true,
  "showCloseButton": true,
  "title": "操作标题",
  "body": "创建成功",
  "actions": [
    { "type": "button", "label": "查看详情", "size": "xs", "level": "link" }
  ]
}
```

也可以把 `actions` 写成单个 schema（比如 flex）：

```schema: scope="body"
type: alert
level: info
showIcon: true
showCloseButton: true
body: 创建成功
actions:
  type: flex
  justify: flex-start
  alignItems: flex-start
  direction: column
  items:
    - type: button
      label: 详情
      size: xs
      level: primary
    - type: button
      label: 关闭
      size: xs
      level: danger
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"alert"` | 指定为 alert 渲染器 |
| `title` | `string` | | 标题，可模板 |
| `body` | `SchemaNode` | | 内容。也认 `msg` / `tpl` |
| `level` | `string` | `info` | `info` / `success` / `warning` / `danger`。可表达式 |
| `showIcon` | `boolean` | `false` | 是否显示图标。可表达式 |
| `icon` | `string` | | 含 `/` 当图片 URL |
| `iconClassName` | `string` | | 打在图标上 |
| `showCloseButton` | `boolean` | `false` | 是否显示关闭按钮 |
| `closeButtonClassName` | `string` | | 打在关闭按钮上 |
| `actions` | `SchemaNode` | | 操作区 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不接 fa / 内置 icon 名；关闭只做本地隐藏，不派发独立 close 事件。
- 视觉走 shadcn Alert token，不是 cxd Alert 皮肤。
