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
label: 弹出
type: button
actionType: drawer
drawer:
  title: 抽屉标题
  body: 这是一个抽屉
```

## 指定弹出方向

`position` 可选 `left` / `right` / `top` / `bottom`，默认 `right`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 左侧
    actionType: drawer
    drawer:
      position: left
      title: 提示
      body: 从左侧弹出
  - type: button
    label: 右侧
    actionType: drawer
    drawer:
      position: right
      title: 提示
      body: 从右侧弹出
  - type: button
    label: 顶部
    actionType: drawer
    drawer:
      position: top
      title: 提示
      body: 从顶部弹出
  - type: button
    label: 底部
    actionType: drawer
    drawer:
      position: bottom
      title: 提示
      body: 从底部弹出
```

## 抽屉尺寸

`size` 可选 `xs` / `sm` / `md` / `lg` / `xl`。空值 400px。左右弹是宽度，上下弹是高度。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 极小
    actionType: drawer
    drawer:
      size: xs
      title: 提示
      body: 这是个简单的抽屉
  - type: button
    label: 较大
    actionType: drawer
    drawer:
      size: lg
      title: 提示
      body: 这是个简单的抽屉
```

## 自定义宽高

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 自定义宽度
    actionType: drawer
    drawer:
      position: right
      width: 300
      title: 提示
      body: 自定义宽度
  - type: button
    label: 自定义高度
    actionType: drawer
    drawer:
      position: bottom
      height: 240
      title: 提示
      body: 自定义高度
```

## 多级抽屉

再开一层会压栈，关当前层回到上一层。

```schema: scope="body"
type: button
label: 多级抽屉
actionType: drawer
drawer:
  title: 提示
  body: 这是个简单的抽屉
  actions:
    - type: button
      actionType: confirm
      label: 关上提示
      primary: true
    - type: button
      actionType: drawer
      label: 再弹一个
      drawer:
        title: 抽屉中的抽屉
        body: 如果你想，可以继续弹下去
        actions:
          - type: button
            actionType: confirm
            label: 关闭
            primary: true
```

## 关闭与蒙层

`showCloseButton: false` 隐藏右上角。`overlay: false` 不画遮罩。`closeOnEsc` / `closeOnOutside` 要显式 `true`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无右上关闭
    actionType: drawer
    drawer:
      title: 无右上抽屉标题
      body: 没有右上角关闭
      showCloseButton: false
  - type: button
    label: 无蒙层
    actionType: drawer
    drawer:
      title: 提示
      body: 没有蒙层
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
