---
title: Drawer 抽屉
outline: deep
---

# Drawer 抽屉

::: info 实现进度 80% · 进行中
文档主路径已对齐：`actionType: drawer` 打开 overlay、`title` / `body`、`position` 默认 right、`size` xs–xl（空值 400px）、`width` / `height`、`showCloseButton` / `overlay` 默认 true、`closeOnEsc` / `closeOnOutside` 默认 false、未写 `actions` 则取消+确认、嵌套按栈弹出。缺拖拽改尺寸、多级错位递减、像素级 cxd Drawer。
:::

Drawer 主要由 [Action](./action) 的 `actionType: drawer` 触发。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

也可以把 `type: drawer` 写进树里当内嵌预览，真正的侧栏走 `OverlayHost`。`position` 默认 **right**。`showCloseButton` / `overlay` 源码默认 **true**。没写 `actions` 时底部是「取消」（`actionType: close`）+「确认」。

## 基本用法

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面用按钮打开抽屉。"
}
```

```schema: scope="body"
{
  "label": "点开抽屉甲",
  "type": "button",
  "actionType": "drawer",
  "drawer": {
    "title": "抽屉标题甲",
    "body": "这是一个抽屉甲"
  }
}
```

```schema: scope="body"
label: 点开抽屉乙
type: button
actionType: drawer
drawer:
  title: 抽屉标题乙
  body: 这是一个抽屉乙
```

## 指定弹出方向

`position` 可选 `left` / `right` / `top` / `bottom`，默认 `right`。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "左侧抽屉甲",
      "actionType": "drawer",
      "drawer": { "position": "left", "title": "左侧标题甲", "body": "从左侧弹出的抽屉甲" }
    },
    {
      "type": "button",
      "label": "右侧抽屉甲",
      "actionType": "drawer",
      "drawer": { "position": "right", "title": "右侧标题甲", "body": "从右侧弹出的抽屉甲" }
    },
    {
      "type": "button",
      "label": "顶部抽屉甲",
      "actionType": "drawer",
      "drawer": { "position": "top", "title": "顶部标题甲", "body": "从顶部弹出的抽屉甲" }
    },
    {
      "type": "button",
      "label": "底部抽屉甲",
      "actionType": "drawer",
      "drawer": { "position": "bottom", "title": "底部标题甲", "body": "从底部弹出的抽屉甲" }
    }
  ]
}
```

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 左侧抽屉乙
    actionType: drawer
    drawer:
      position: left
      title: 左侧标题乙
      body: 从左侧弹出的抽屉乙
  - type: button
    label: 右侧抽屉乙
    actionType: drawer
    drawer:
      position: right
      title: 右侧标题乙
      body: 从右侧弹出的抽屉乙
  - type: button
    label: 顶部抽屉乙
    actionType: drawer
    drawer:
      position: top
      title: 顶部标题乙
      body: 从顶部弹出的抽屉乙
  - type: button
    label: 底部抽屉乙
    actionType: drawer
    drawer:
      position: bottom
      title: 底部标题乙
      body: 从底部弹出的抽屉乙
```

## 抽屉尺寸

`size` 可选 `xs` / `sm` / `md` / `lg` / `xl`。空值 400px。左右弹是宽度，上下弹是高度。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "极小抽屉甲",
      "actionType": "drawer",
      "drawer": { "size": "xs", "title": "极小标题甲", "body": "极小抽屉正文甲" }
    },
    {
      "type": "button",
      "label": "小抽屉甲",
      "actionType": "drawer",
      "drawer": { "size": "sm", "title": "小标题甲", "body": "小抽屉正文甲" }
    },
    {
      "type": "button",
      "label": "中抽屉甲",
      "actionType": "drawer",
      "drawer": { "size": "md", "title": "中标题甲", "body": "中抽屉正文甲" }
    },
    {
      "type": "button",
      "label": "大抽屉甲",
      "actionType": "drawer",
      "drawer": { "size": "lg", "title": "大标题甲", "body": "大抽屉正文甲" }
    },
    {
      "type": "button",
      "label": "很大抽屉甲",
      "actionType": "drawer",
      "drawer": { "size": "xl", "title": "很大标题甲", "body": "很大抽屉正文甲" }
    }
  ]
}
```

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 极小抽屉乙
    actionType: drawer
    drawer:
      size: xs
      title: 极小标题乙
      body: 极小抽屉正文乙
  - type: button
    label: 大抽屉乙
    actionType: drawer
    drawer:
      size: lg
      title: 大标题乙
      body: 大抽屉正文乙
```

## 自定义宽高

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "自定义宽度甲",
      "actionType": "drawer",
      "drawer": { "position": "right", "width": 300, "title": "宽 300 甲", "body": "自定义 300px 宽的抽屉甲" }
    },
    {
      "type": "button",
      "label": "自定义高度甲",
      "actionType": "drawer",
      "drawer": { "position": "bottom", "height": 240, "title": "高 240 甲", "body": "自定义 240px 高的抽屉甲" }
    }
  ]
}
```

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 自定义宽度乙
    actionType: drawer
    drawer:
      position: right
      width: 300
      title: 宽 300 乙
      body: 自定义 300px 宽的抽屉乙
  - type: button
    label: 自定义高度乙
    actionType: drawer
    drawer:
      position: bottom
      height: 240
      title: 高 240 乙
      body: 自定义 240px 高的抽屉乙
```

## 多级抽屉

再开一层会压栈，关当前层回到上一层。

```schema: scope="body"
{
  "type": "button",
  "label": "多级抽屉甲",
  "actionType": "drawer",
  "drawer": {
    "title": "外层抽屉甲",
    "body": "外层抽屉正文甲",
    "actions": [
      { "type": "button", "actionType": "confirm", "label": "关上外层抽屉甲", "primary": true },
      {
        "type": "button",
        "actionType": "drawer",
        "label": "再弹一层抽屉甲",
        "drawer": {
          "title": "内层抽屉甲",
          "body": "内层抽屉正文甲",
          "actions": [
            { "type": "button", "actionType": "confirm", "label": "不弹抽屉了甲", "primary": true }
          ]
        }
      }
    ]
  }
}
```

```schema: scope="body"
type: button
label: 多级抽屉乙
actionType: drawer
drawer:
  title: 外层抽屉乙
  body: 外层抽屉正文乙
  actions:
    - type: button
      actionType: confirm
      label: 关上外层抽屉乙
      primary: true
    - type: button
      actionType: drawer
      label: 再弹一层抽屉乙
      drawer:
        title: 内层抽屉乙
        body: 内层抽屉正文乙
        actions:
          - type: button
            actionType: confirm
            label: 不弹抽屉了乙
            primary: true
```

## 关闭与蒙层

`showCloseButton: false` 隐藏右上角。`overlay: false` 不画遮罩。`closeOnEsc` / `closeOnOutside` 要显式 `true`。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "无右上抽屉甲",
      "actionType": "drawer",
      "drawer": {
        "title": "无右上抽屉标题甲",
        "body": "没有右上角关闭的抽屉甲",
        "showCloseButton": false
      }
    },
    {
      "type": "button",
      "label": "无蒙层抽屉甲",
      "actionType": "drawer",
      "drawer": {
        "title": "无蒙层标题甲",
        "body": "没有蒙层的抽屉甲",
        "overlay": false
      }
    },
    {
      "type": "button",
      "label": "点遮罩关抽屉甲",
      "actionType": "drawer",
      "drawer": {
        "title": "点遮罩标题甲",
        "body": "点外面或 Esc 可关甲",
        "closeOnEsc": true,
        "closeOnOutside": true
      }
    }
  ]
}
```

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无右上抽屉乙
    actionType: drawer
    drawer:
      title: 无右上抽屉标题乙
      body: 没有右上角关闭的抽屉乙
      showCloseButton: false
  - type: button
    label: 无蒙层抽屉乙
    actionType: drawer
    drawer:
      title: 无蒙层标题乙
      body: 没有蒙层的抽屉乙
      overlay: false
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | | 内嵌预览才写 `"drawer"`。侧栏用 Action 的 `actionType: drawer` |
| `title` | `SchemaNode` | | 标题，可模板 |
| `body` | `SchemaNode` | | 内容 |
| `position` | `string` | `right` | `left` / `right` / `top` / `bottom` |
| `size` | `string` | | `xs` / `sm` / `md` / `lg` / `xl`。空值 400px |
| `width` | `number \| string` | | 自定义宽度 |
| `height` | `number \| string` | | 自定义高度 |
| `overlay` | `boolean` | `true` | 是否显示遮罩 |
| `showCloseButton` | `boolean` | `true` | 右上角关闭 |
| `closeOnEsc` | `boolean` | `false` | Esc 关闭 |
| `closeOnOutside` | `boolean` | `false` | 点外面关闭 |
| `actions` | `Array<Action>` | 取消 + 确认 | `[]` 隐藏底部 |
| `data` | `object` | | 抽屉数据域 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 嵌套抽屉按栈替换顶层，不按层递减宽度。
- 不接 `resizable`、弹层内表单提交。
- 视觉走 shadcn Sheet token，不是 cxd Drawer 皮肤。
