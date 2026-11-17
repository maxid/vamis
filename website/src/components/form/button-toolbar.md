---
title: ButtonToolbar 按钮工具栏
outline: deep
---

# ButtonToolbar 按钮工具栏

::: warning 实现进度 60% · 进行中
能排按钮
:::

`button-toolbar` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

默认按钮会独占一行，如果想让多个按钮并排方式，可以使用 `button-toolbar` 组件包裹起来，另外还有能用 [button-group](./button-group) 来在展现上更紧凑。

## 基本使用

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-text",
      "name": "test",
      "label": "Text"
    },
    {
      "type": "button-toolbar",
      "label": "按钮组",
      "buttons": [
        {
          "type": "button",
          "label": "按钮",
          "actionType": "dialog",
          "dialog": {
            "title": "提示",
            "body": "对，你刚点击了！"
          }
        },
        {
          "type": "submit",
          "label": "提交"
        },
        {
          "type": "reset",
          "label": "重置"
        }
      ]
    }
  ]
}
```

## 属性表

| 属性名  | 类型                        | 默认值             | 说明                      |
| ------- | --------------------------- | ------------------ | ------------------------- |
| type    | `string`                    | `"button-toolbar"` | 指定为 ButtonToolbar 组件 |
| buttons | Array<[行为按钮](./action)> |                    | 按钮组                    |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：能排按钮。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
