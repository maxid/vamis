---
title: Color 颜色
outline: deep
---

# Color 颜色

::: warning 实现进度 50% · 进行中
StaticValue 展示
:::

`color` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

用于展示颜色

## 基本用法

```schema
{
  "type": "page",
  "body": {
    "type": "color",
    "value": "#108cee"
  }
}
```

## 用作 Field 时

当用在 Table 的列配置 Column、List 的内容、Card 卡片的内容和表单的 Static-XXX 中时，可以设置`name`属性，映射同名变量

### Table 中的列类型

```schema: scope="body"
{
  "type": "table",
  "data": {
    "items": [
      {
        "id": "1",
        "color": "#108cee"
      },
      {
        "id": "2",
        "color": "#f38900"
      },
      {
        "id": "3",
        "color": "#04c1ba"
      }
    ]
  },
  "columns": [
    {
      "name": "id",
      "label": "Id"
    },
    {
      "name": "color",
      "label": "颜色",
      "type": "color"
    }
  ]
}
```

List 的内容、Card 卡片的内容配置同上

### Form 中静态展示

```schema: scope="body"
{
  "type": "form",
  "data": {
    "color": "#108cee"
  },
  "body": [
    {
      "type": "static-color",
      "name": "color",
      "label": "颜色"
    }
  ]
}
```

## 属性表

| 属性名                   | 类型      | 默认值 | 说明                                                                                   | |
| ------------------------ | --------- | ------ | -------------------------------------------------------------------------------------- | ------- |
| type                     | `string`  |        | 如果在 Table、Card 和 List 中，为`"color"`；在 Form 中用作静态展示，为`"static-color"` |
| className                | `string`  |        | 外层 CSS 类名                                                                          |
| value                    | `string`  |        | 显示的颜色值                                                                           |
| name                     | `string`  |        | 在其他组件中，时，用作变量映射                                                         |
| defaultColor             | `string`  |        | 默认颜色值                                                                             |
| showValue                | `boolean` | `true` | 是否显示右边的颜色值                                                                   |
| popOverContainerSelector | `string`  |        | 弹层挂载位置选择器，会通过`querySelector`获取                                          | `6.4.2` |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：StaticValue 展示。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
