---
title: Grid 水平分栏
outline: deep
---

# Grid 水平分栏

::: info 实现进度 90% · 进行中
文档主路径已对齐：均分列、`md`/`xs`/`sm`/`lg` 1–12 与 `auto`、`gap`、`align` / `valign`、`columnClassName`。缺 `themeCss`、列 `mode` / `horizontal`。
:::

12 栏水平分栏，对齐 Amis 同名 schema（flex 栅格，不是 CSS `display:grid`）。未写 `md` 时各列均分。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽。

## 基本用法

默认会水平均分宽度。

```schema: scope="body"
[
    {
        "type": "grid",
        "columns": [
            {
                "columnClassName": "bg-green-300",
                "body": [
                    {
                        "type": "plain",
                        "text": "第一栏"
                    }
                ]
            },
            {
                "columnClassName": "bg-blue-300",
                "body": [
                    {
                        "type": "plain",
                        "text": "第二栏"
                    }
                ]
            }
        ]
    },
    {
        "type": "grid",
        "className": "m-t",
        "columns": [
            {
                "columnClassName": "bg-green-300",
                "body": [
                    {
                        "type": "plain",
                        "text": "第一栏"
                    }
                ]
            },
            {
                "columnClassName": "bg-blue-300",
                "body": [
                    {
                        "type": "plain",
                        "text": "第二栏"
                    }
                ]
            },
            {
                "columnClassName": "bg-red-300",
                "body": [
                    {
                        "type": "plain",
                        "text": "第三栏"
                    }
                ]
            }
        ]
    }
]
```

同一段也可以写成 YAML：

```schema: scope="body"
type: grid
columns:
  - columnClassName: bg-green-300
    body:
      - type: plain
        text: 第一栏
  - columnClassName: bg-blue-300
    body:
      - type: plain
        text: 第二栏
```

## 响应式

通过 `md` 设置中等宽度（≥768px）下的占比，1–12 或 `auto`。`xs` / `sm` / `lg` 同样。窄屏未写 `xs` 时列会叠起来。

```schema: scope="body"
{
    "type": "grid",
    "columns": [
        {
            "md": 3,
            "columnClassName": "bg-green-300",
            "body": [
                {
                    "type": "plain",
                    "text": "md: 3"
                }
            ]
        },
        {
            "md": 9,
            "columnClassName": "bg-blue-300",
            "body": [
                {
                    "type": "plain",
                    "text": "md: 9"
                }
            ]
        }
    ]
}
```

## 间距与对齐

`gap`：`xs` / `sm` / `base` / `none` / `md` / `lg`（列左右 padding，不是 CSS `gap`）。`align`：`left` / `right` / `center` / `between`。`valign`：`top` / `middle` / `bottom` / `between`。

```schema: scope="body"
{
  "type": "grid",
  "gap": "md",
  "align": "center",
  "valign": "middle",
  "columns": [
    {
      "md": 4,
      "columnClassName": "bg-green-300",
      "body": [{ "type": "plain", "text": "左" }]
    },
    {
      "md": 4,
      "columnClassName": "bg-blue-300",
      "body": [{ "type": "plain", "text": "右" }]
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"grid"` | 指定为 Grid 渲染器 |
| className | `string` | | 外层 Dom 的类名 |
| gap | `'xs' \| 'sm' \| 'base' \| 'none' \| 'md' \| 'lg'` | | 水平间距 |
| valign | `'top' \| 'middle' \| 'bottom' \| 'between'` | | 垂直对齐 |
| align | `'left' \| 'right' \| 'between' \| 'center'` | | 水平对齐 |
| columns | `Array` | | 列集合 |
| columns[x] | [SchemaNode](/types/schemanode) | | 成员可以是其它渲染器 |
| columns[x].xs | `int` 或 `"auto"` | | 宽度占比 1–12 |
| columns[x].sm | `int` 或 `"auto"` | | 宽度占比 1–12 |
| columns[x].md | `int` 或 `"auto"` | | 宽度占比 1–12 |
| columns[x].lg | `int` 或 `"auto"` | | 宽度占比 1–12 |
| columns[x].columnClassName | `string` | | 列类名 |
| columns[x].valign | `'top' \| 'middle' \| 'bottom' \| 'between'` | | 当前列垂直对齐 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Grid-col--md6` 前缀；用 `data-col` + 计算样式转写 12 栏 flex。
- `themeCss`、列上的表单 `mode` / `horizontal` 未接。
