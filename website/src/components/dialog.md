---
title: Dialog 对话框
outline: deep
---

# Dialog 对话框

::: info 实现进度 80% · 进行中
文档主路径已对齐：`actionType: dialog` 打开 overlay、`title` / `body`、`size` xs–full（默认 500px）、`showCloseButton`（默认 true）、`closeOnEsc` / `closeOnOutside`（默认 false）、未写 `actions` 则取消+确认、嵌套弹层按栈弹出。缺拖拽、`feedback`、弹层内表单提交、多级同时错位可见、像素级 cxd Modal。
:::

Dialog 主要由 [Action](./action) 的 `actionType: dialog` 触发。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

也可以把 `type: dialog` 写进树里当内嵌预览，真正的模态走 `OverlayHost`。`showCloseButton` 源码默认 **true**。`closeOnEsc` / `closeOnOutside` 源码默认 **false**。没写 `actions` 时底部是「取消」+「确认」；`actions: []` 隐藏底部按钮。

## 基本用法

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面用按钮打开对话框。"
}
```

```schema: scope="body"
{
  "label": "点开对话框甲",
  "type": "button",
  "actionType": "dialog",
  "dialog": {
    "title": "对话框标题甲",
    "body": "这是一个对话框甲"
  }
}
```

```schema: scope="body"
label: 点开对话框乙
type: button
actionType: dialog
dialog:
  title: 对话框标题乙
  body: 这是一个对话框乙
```

## 配置尺寸

`size` 不是表单项宽度。空值 500px，`xs` 200px，`sm` 350px，`md` 800px，`lg` 1100px，`xl` 90%，`full` 尽量铺满。也可用 `width` / `height`。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "较小对话框甲",
      "actionType": "dialog",
      "dialog": { "size": "sm", "title": "较小标题甲", "body": "较小对话框正文甲" }
    },
    {
      "type": "button",
      "label": "标准对话框甲",
      "actionType": "dialog",
      "dialog": { "title": "标准标题甲", "body": "标准对话框正文甲" }
    },
    {
      "type": "button",
      "label": "中等对话框甲",
      "actionType": "dialog",
      "dialog": { "size": "md", "title": "中等标题甲", "body": "中等对话框正文甲" }
    },
    {
      "type": "button",
      "label": "较大对话框甲",
      "actionType": "dialog",
      "dialog": { "size": "lg", "title": "较大标题甲", "body": "较大对话框正文甲" }
    },
    {
      "type": "button",
      "label": "很大对话框甲",
      "actionType": "dialog",
      "dialog": { "size": "xl", "title": "很大标题甲", "body": "很大对话框正文甲" }
    },
    {
      "type": "button",
      "label": "全屏对话框甲",
      "actionType": "dialog",
      "dialog": { "size": "full", "title": "全屏标题甲", "body": "全屏对话框正文甲" }
    }
  ]
}
```

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 较小对话框乙
    actionType: dialog
    dialog:
      size: sm
      title: 较小标题乙
      body: 较小对话框正文乙
  - type: button
    label: 标准对话框乙
    actionType: dialog
    dialog:
      title: 标准标题乙
      body: 标准对话框正文乙
  - type: button
    label: 全屏对话框乙
    actionType: dialog
    dialog:
      size: full
      title: 全屏标题乙
      body: 全屏对话框正文乙
```

## 多级弹框

再开一层会压栈，关当前层回到上一层。多层不会同时错位叠出。

```schema: scope="body"
{
  "type": "button",
  "label": "多级对话框甲",
  "actionType": "dialog",
  "dialog": {
    "title": "外层对话框甲",
    "body": "外层对话框正文甲",
    "actions": [
      { "type": "button", "actionType": "confirm", "label": "关上外层甲", "primary": true },
      {
        "type": "button",
        "actionType": "dialog",
        "label": "再弹一层甲",
        "dialog": {
          "title": "内层对话框甲",
          "body": "内层对话框正文甲",
          "actions": [
            { "type": "button", "actionType": "confirm", "label": "不弹了甲", "primary": true }
          ]
        }
      }
    ]
  }
}
```

```schema: scope="body"
type: button
label: 多级对话框乙
actionType: dialog
dialog:
  title: 外层对话框乙
  body: 外层对话框正文乙
  actions:
    - type: button
      actionType: confirm
      label: 关上外层乙
      primary: true
    - type: button
      actionType: dialog
      label: 再弹一层乙
      dialog:
        title: 内层对话框乙
        body: 内层对话框正文乙
        actions:
          - type: button
            actionType: confirm
            label: 不弹了乙
            primary: true
```

## 配置弹窗的按钮

默认底部「取消」+「确认」。写了 `actions` 就用配置的；`[]` 不要底部按钮。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "无底部按钮甲",
      "actionType": "dialog",
      "dialog": {
        "title": "无底栏标题甲",
        "actions": [],
        "body": "无底部按钮的对话框甲"
      }
    },
    {
      "type": "button",
      "label": "只有确认甲",
      "actionType": "dialog",
      "dialog": {
        "title": "单按钮标题甲",
        "actions": [{ "type": "button", "actionType": "confirm", "label": "好的甲", "primary": true }],
        "body": "只有一个确认的对话框甲"
      }
    }
  ]
}
```

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无底部按钮乙
    actionType: dialog
    dialog:
      title: 无底栏标题乙
      actions: []
      body: 无底部按钮的对话框乙
  - type: button
    label: 只有确认乙
    actionType: dialog
    dialog:
      title: 单按钮标题乙
      actions:
        - type: button
          actionType: confirm
          label: 好的乙
          primary: true
      body: 只有一个确认的对话框乙
```

## 关闭方式

`showCloseButton: false` 隐藏右上角关闭，底部按钮仍在。`closeOnEsc` / `closeOnOutside` 要显式 `true`。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "无右上关闭甲",
      "actionType": "dialog",
      "dialog": {
        "title": "无右上标题甲",
        "body": "没有右上角关闭的对话框甲",
        "showCloseButton": false
      }
    },
    {
      "type": "button",
      "label": "Esc与点遮罩甲",
      "actionType": "dialog",
      "dialog": {
        "title": "可点遮罩标题甲",
        "body": "Esc 或点遮罩可关甲",
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
    label: 无右上关闭乙
    actionType: dialog
    dialog:
      title: 无右上标题乙
      body: 没有右上角关闭的对话框乙
      showCloseButton: false
  - type: button
    label: Esc与点遮罩乙
    actionType: dialog
    dialog:
      title: 可点遮罩标题乙
      body: Esc 或点遮罩可关乙
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
