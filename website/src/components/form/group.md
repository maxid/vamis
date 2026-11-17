---
title: Group 表单项组
outline: deep
---

# Group 表单项组

::: warning 实现进度 75% · 进行中
≥768 横排 `Form-groupColumn` 均分，`mode` / `subFormMode` 传给未写 mode 的子项；`columnRatio` 按 12 等分控制宽度。缺 gap 档 / 组标签
:::

`group` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

表单项，默认都是一行显示一个，Group 组件用于在一行展示多个表单项，会自动根据表单项数量均分宽度。

## 基本用法

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "group",
      "body": [
        {
          "type": "input-text",
          "name": "text1",
          "label": "文本1"
        },
        {
          "type": "input-text",
          "name": "text2",
          "label": "文本2"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "group",
      "body": [
        {
          "type": "input-text",
          "name": "text3",
          "label": "文本3"
        },
        {
          "type": "input-text",
          "name": "text4",
          "label": "文本4"
        },
        {
          "type": "input-text",
          "name": "text5",
          "label": "文本5"
        }
      ]
    }
  ]
}
```

## 展示

可以给`group`组件设置`mode`调整展示模式，用法同 [Form 展示](./index#%E8%A1%A8%E5%8D%95%E5%B1%95%E7%A4%BA)

下面`group`我们配置了`"mode": "horizontal"`，观察显示情况

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-text",
      "name": "text",
      "label": "文本"
    },
    {
      "type": "divider"
    },
    {
      "type": "group",
      "mode": "horizontal",
      "body": [
        {
          "type": "input-text",
          "name": "text1",
          "label": "文本1"
        },
        {
          "type": "input-text",
          "name": "text2",
          "label": "文本2"
        }
      ]
    }
  ]
}
```

当表单在水平模式下时，如果`group`内表单项设置`"label": false`，会导致布局错乱，如下

```schema: scope="body"
{
  "type": "form",
  "mode": "horizontal",
  "body": [
    {
      "type": "input-text",
      "name": "text",
      "label": "文本"
    },
    {
      "type": "divider"
    },
    {
      "type": "group",
      "body": [
        {
          "type": "input-text",
          "name": "text1",
          "label": false
        },
        {
          "type": "input-text",
          "name": "text2",
          "label": false
        }
      ]
    }
  ]
}
```

这时可以给`group`配置`label`属性，保持和其他表单项布局统一

```schema: scope="body"
{
  "type": "form",
  "mode": "horizontal",
  "body": [
    {
      "type": "input-text",
      "name": "text",
      "label": "文本"
    },
    {
      "type": "divider"
    },
    {
      "type": "group",
      "label": "文本组",
      "body": [
        {
          "type": "input-text",
          "name": "text1",
          "label": false
        },
        {
          "type": "input-text",
          "name": "text2",
          "label": false
        }
      ]
    }
  ]
}
```

## 宽度占比

在表单项内部可以通过 `columnRatio` 来控制宽度，整体是 12 等分

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "group",
      "body": [
        {
          "type": "input-text",
          "name": "text1",
          "label": "text1",
          "columnRatio": 8
        },
        {
          "type": "input-text",
          "name": "text2",
          "label": "text2",
          "columnRatio": 4
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "group",
      "body": [
        {
          "type": "input-text",
          "name": "text1",
          "label": "text1",
          "columnRatio": 6
        },
        {
          "type": "input-text",
          "name": "text2",
          "label": "text2",
          "columnRatio": 4
        },
        {
          "type": "input-text",
          "name": "text3",
          "label": "text3"
        }
      ]
    }
  ]
}
```

## 属性表

| 属性名    | 类型                        | 默认值         | 说明                                                                       |
| --------- | --------------------------- | -------------- | -------------------------------------------------------------------------- |
| className | `string`                    |                | CSS 类名                                                                   |
| label     | `string`                    |                | group 的标签                                                               |
| body      | Array<[表单项](./formitem)> |                | 表单项集合                                                                 |
| mode      | `string`                    |                | 展示默认，同 [Form](./index#%E8%A1%A8%E5%8D%95%E5%B1%95%E7%A4%BA) 中的模式 |
| gap       | `string`                    |                | 表单项之间的间距，可选：`xs`、`sm`、`normal`                               |
| direction | `string`                    | `"horizontal"` | 可以配置水平展示还是垂直展示。对应的配置项分别是：`vertical`、`horizontal` |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：≥768 横排 `Form-groupColumn` 均分，`mode` / `subFormMode` 传给未写 mode 的子项。已接 `columnRatio`；缺 gap 档 / 组标签。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
