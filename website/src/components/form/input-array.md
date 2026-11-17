---
title: InputArray 数组输入框
outline: deep
---

# InputArray 数组输入框

::: warning 实现进度 50% · 进行中
能增删行；子域/校验未齐
:::

`input-array` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

InputArray 是一种简化的 [Combo](./combo)，用于输入多个某种类型的[表单项](./formitem)，提交的时将以数组的形式提交。

## 基本用法

```schema: scope="form2"
[
  {
    "name": "array",
    "label": "颜色集合",
    "type": "input-array",
    "value": [
      "red"
    ],
    "inline": true,
    "items": {
      "type": "input-color",
      "clearable": false
    }
  }
]
```

## 新增成员默认值

部分情况下，期望新增元素时使用默认值，这时可以通过设置`scaffold`属性配置新增成员的默认值。

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "debugConfig": {
    "levelExpand": 2
  },
  "body": [
    {
      "name": "array",
      "label": "整数集合",
      "mode": "horizontal",
      "type": "input-array",
      "value": [
        123,
        456
      ],
      "scaffold": 0,
      "inline": true,
      "items": {
        "type": "input-number",
        "clearable": false
      }
    }
  ]
}
```

## 属性表

除了支持 [普通表单项属性表](./formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8) 中的配置以外，还支持下面一些配置

| 属性名        | 类型                                        | 默认值    | 说明                                                                     |
| ------------- | ------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| type          | `string`                                    | `"input-array"` | 指明为`array`组件                                                        |
| items         | [`SchemaNode`](/types/schemanode) |           | 配置单项表单类型                                                         |
| addable       | `boolean`                                   |           | 是否可新增。                                                             |
| removable     | `boolean`                                   |           | 是否可删除                                                               |
| draggable     | `boolean`                                   | `false`   | 是否可以拖动排序, 需要注意的是当启用拖动排序的时候，会多一个\$id 字段    |
| draggableTip  | `string`                                    |           | 可拖拽的提示文字，默认为：`"可通过拖动每行中的【交换】按钮进行顺序调整"` |
| addButtonText | `string`                                    | `"新增"`  | 新增按钮文字                                                             |
| minLength     | `number`                                    |           | 限制最小长度                                                             |
| maxLength     | `number`                                    |           | 限制最大长度                                                             |
| scaffold      | `any`                                       |           | 新增成员时的默认值，一般根据`items`的数据类型指定需要的默认值            |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：能增删行；子域/校验未齐。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
