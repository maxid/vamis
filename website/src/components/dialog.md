---
title: Dialog 对话框
outline: deep
---

# Dialog 对话框

::: info 实现进度 85% · 进行中
文档主路径已对齐：`actionType: dialog` 打开 overlay、`title` / `body`、`size` xs–full（默认 500px）、`showCloseButton`（默认 true）、`closeOnEsc` / `closeOnOutside`（默认 false）、未写 `actions` 则取消+确认、嵌套弹层按栈弹出。body 是 form 时默认横排、无面板、无默认「提交」。关闭按钮 hover 出「关闭」提示。缺拖拽、`feedback`、弹层内表单提交回写、多级同时错位可见、像素级 cxd Modal。
:::

Dialog 主要由 [Action](./action) 的 `actionType: dialog` 触发。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

也可以把 `type: dialog` 写进树里当内嵌预览，真正的模态走 `OverlayHost`。`showCloseButton` 源码默认 **true**。`closeOnEsc` / `closeOnOutside` 源码默认 **false**。没写 `actions` 时底部是「取消」+「确认」；`actions: []` 隐藏底部按钮。

## 基本用法

```schema: scope="body"
label: 点击弹框
type: button
actionType: dialog
dialog:
  title: 弹框标题
  body: 这是一个弹框
```

## 配置尺寸

`size` 不是表单项宽度。空值 500px，`xs` 200px，`sm` 350px，`md` 800px，`lg` 1100px，`xl` 90%，`full` 尽量铺满。也可用 `width` / `height`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 较小的弹框
    actionType: dialog
    dialog:
      size: sm
      title: 提示
      body: 这是个简单的弹框
  - type: button
    label: 标准弹框
    actionType: dialog
    dialog:
      title: 提示
      body: 这是个简单的弹框
  - type: button
    label: 占满屏幕的弹框
    actionType: dialog
    dialog:
      size: full
      title: 全屏弹框
      body: 弹框尽可能占满，内容部分滚动。
```

## 多级弹框

再开一层会压栈，关当前层回到上一层。多层不会同时错位叠出。

```schema: scope="body"
type: button
label: 多级弹框
actionType: dialog
dialog:
  title: 提示
  body: 这是个简单的弹框
  actions:
    - type: button
      actionType: confirm
      label: 确认
      primary: true
    - type: button
      actionType: dialog
      label: 再弹一个
      dialog:
        title: 弹框中的弹框
        body: 如果你想，可以继续弹下去
        actions:
          - type: button
            actionType: confirm
            label: 关闭
            primary: true
```

## 配置弹窗的按钮

默认底部「取消」+「确认」。写了 `actions` 就用配置的；`[]` 不要底部按钮。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无底部按钮
    actionType: dialog
    dialog:
      title: 提示
      actions: []
      body: 没有底部按钮
  - type: button
    label: 只有确认
    actionType: dialog
    dialog:
      title: 提示
      actions:
        - type: button
          actionType: confirm
          label: 确认
          primary: true
      body: 只有一个确认按钮
```

## 关闭方式

`showCloseButton: false` 隐藏右上角关闭，底部按钮仍在。`closeOnEsc` / `closeOnOutside` 要显式 `true`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无右上关闭
    actionType: dialog
    dialog:
      title: 提示
      body: 没有右上角关闭
      showCloseButton: false
  - type: button
    label: Esc 与点遮罩
    actionType: dialog
    dialog:
      title: 提示
      body: Esc 或点遮罩可关闭
      closeOnEsc: true
      closeOnOutside: true
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | | 内嵌预览才写 `"dialog"`。弹层用 Action 的 `actionType: dialog` |
| `title` | `SchemaNode` | | 标题，可模板 |
| `body` | `SchemaNode` | | 内容 |
| `size` | `string` | | `xs` / `sm` / `md` / `lg` / `xl` / `full`。空值 500px |
| `width` | `number \| string` | | 自定义宽度 |
| `height` | `number \| string` | | 自定义高度 |
| `showCloseButton` | `boolean` | `true` | 右上角关闭 |
| `closeOnEsc` | `boolean` | `false` | Esc 关闭 |
| `closeOnOutside` | `boolean` | `false` | 点遮罩关闭 |
| `actions` | `Array<Action>` | 取消 + 确认 | `[]` 隐藏底部 |
| `data` | `object` | | 弹层数据域，会并进 overlay |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 嵌套弹层按栈替换顶层，不像素级错位叠出。
- 不接 `draggable`、`feedback`、弹层内表单提交、`close:name` 关指定层。
- 视觉走 shadcn Dialog token，不是 cxd Modal 皮肤。
