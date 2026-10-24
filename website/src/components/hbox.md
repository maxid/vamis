---
title: HBox 布局
outline: deep
---

# HBox 布局

::: info 实现进度 90% · 进行中
文档主路径已对齐：列均分、`width` / `auto`、默认 `gap: xs`、`align` / `valign`、`columnClassName`。缺 `themeCss`、列 `mode` / `horizontal`。
:::

水平分栏，对齐 Amis 同名 schema（CSS flex，默认不换行）。未写 `width` 时各列均分。默认间距 `gap: xs`。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽。

## 基本用法

未写宽度时水平均分。列可以是其它渲染器，也可以直接写字符串。

```schema: scope="body"
[
    {
        "type": "hbox",
        "columns": [
            {
                "type": "plain",
                "text": "Col A",
                "columnClassName": "bg-green-300"
            },
            "Col B"
        ]
    },
    {
        "type": "hbox",
        "className": "m-t",
        "columns": [
            {
                "type": "plain",
                "text": "固定宽",
                "width": 120,
                "columnClassName": "bg-blue-300"
            },
            "..."
        ]
    }
]
```

点「编辑 Schema」可切 JSON。

```schema: scope="body"
type: hbox
columns:
  - type: plain
    text: Col A
    columnClassName: bg-green-300
  - Col B
```

## 列宽

列上的 `width` 钉死这一列；`auto` 按内容收缩。其余列继续均分剩下的空间。

```schema: scope="body"
{
  "type": "hbox",
  "columns": [
    {
      "width": 160,
      "columnClassName": "bg-green-300",
      "body": [{ "type": "plain", "text": "width: 160" }]
    },
    {
      "width": "auto",
      "columnClassName": "bg-blue-300",
      "body": [{ "type": "plain", "text": "auto" }]
    },
    {
      "columnClassName": "bg-red-300",
      "body": [{ "type": "plain", "text": "均分" }]
    }
  ]
}
```

## 间距与对齐

`gap`：`xs`（默认）/ `sm` / `base` / `none` / `md` / `lg`（列左右 padding，不是 CSS `gap`）。`align`：`left` / `right` / `center` / `between`。`valign`：`top` / `middle` / `bottom` / `between`。列也可以单独写 `valign`。

```schema: scope="body"
{
  "type": "hbox",
  "gap": "md",
  "align": "center",
  "valign": "middle",
  "columns": [
    {
      "columnClassName": "bg-green-300",
      "body": [{ "type": "plain", "text": "左" }]
    },
    {
      "columnClassName": "bg-blue-300",
      "body": [{ "type": "plain", "text": "右" }]
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"hbox"` | 指定为 HBox 渲染器 |
| className | `string` | | 外层 Dom 的类名 |
| gap | `'xs' \| 'sm' \| 'base' \| 'none' \| 'md' \| 'lg'` | `xs` | 水平间距 |
| valign | `'top' \| 'middle' \| 'bottom' \| 'between'` | | 垂直对齐 |
| align | `'left' \| 'right' \| 'between' \| 'center'` | | 水平对齐 |
| columns | `Array` | | 列集合 |
| columns[x] | [SchemaNode](/types/schemanode) | | 成员可以是其它渲染器 |
| columns[x].columnClassName | `string` | | 列上类名 |
| columns[x].width | `number` / `string` / `auto` | | 列宽；省略则均分 |
| columns[x].height | `number` / `string` | | 列高 |
| columns[x].valign | `'top' \| 'middle' \| 'bottom' \| 'between'` | | 当前列内容的垂直对齐 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Hbox-col` 前缀；用 `data-hbox-col` + 计算样式转写均分 / auto / 自定义宽。
- `themeCss`、列上的表单 `mode` / `horizontal` 未接。
