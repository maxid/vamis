---
title: Grid 2D 布局
outline: deep
---

# Grid 2D 布局

::: info 实现进度 90% · 进行中
文档主路径已对齐：`grids` 的 `x/y/w/h`、`cols`、列宽/行高、`height: auto`、`gap` / `gapRow`、`align` / `valign`。缺格子 `themeCss`。
:::

二维格子布局，用坐标摆组件。对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽。

## 基本用法

水平默认 12 列。`x/y` 是起点（从 1 起），`w/h` 是跨几格。

点「编辑 Schema」可切 JSON。

```schema: scope="body"
type: grid-2d
grids:
  - x: 1
    y: 1
    h: 1
    w: 6
    gridClassName: bg-green-300
    type: tpl
    tpl: "[grid-1] x:1 y:1 h:1 w:6"
  - x: 7
    y: 1
    h: 1
    w: 6
    gridClassName: bg-blue-300
    type: tpl
    tpl: "[grid-2] x:7 y:1 h:1 w:6"
```

`grids` 里可以是任意组件。默认行高 `rowHeight` 是 `3.125rem`（50px）。

## 独立设置高宽

`cols` 改列数。格子上的 `width` 影响**整列**，`height` 影响**整行**。

```schema: scope="body"
{
  "type": "grid-2d",
  "cols": 3,
  "grids": [
    {
      "x": 1,
      "y": 1,
      "h": 1,
      "w": 1,
      "width": 100,
      "gridClassName": "bg-green-300",
      "type": "tpl",
      "tpl": "[grid-1] x:1 y:1 h:1 w:1"
    },
    {
      "x": 2,
      "y": 1,
      "h": 1,
      "w": 1,
      "height": 100,
      "gridClassName": "bg-blue-300",
      "type": "tpl",
      "tpl": "[grid-2] x:2 y:1 h:1 w:1"
    },
    {
      "x": 3,
      "y": 1,
      "h": 1,
      "w": 1,
      "width": 100,
      "gridClassName": "bg-red-300",
      "type": "tpl",
      "tpl": "[grid-3] x:3 y:1 h:1 w:1"
    },
    {
      "x": 2,
      "y": 2,
      "h": 1,
      "w": 1,
      "gridClassName": "bg-purple-300",
      "type": "tpl",
      "tpl": "[grid-4] x:2 y:2 h:1 w:1"
    }
  ]
}
```

## 自适应内容高度

内容高度不确定时，格子 `height` 设为 `auto`。

```schema: scope="body"
{
  "type": "grid-2d",
  "cols": 3,
  "grids": [
    {
      "x": 2,
      "y": 1,
      "h": 1,
      "w": 1,
      "height": "auto",
      "gridClassName": "bg-blue-300",
      "type": "tpl",
      "tpl": "1<br>2<br>3<br>4<br>5<br>6<br>"
    }
  ]
}
```

## 格子间距 gap / gapRow

`gap` 同时管水平和垂直。`gapRow`（文档也写 `rowGap`）只改行距。

```schema: scope="body"
{
  "type": "grid-2d",
  "gap": 10,
  "gapRow": 5,
  "grids": [
    {
      "x": 1,
      "y": 1,
      "h": 1,
      "w": 6,
      "gridClassName": "bg-green-300",
      "type": "tpl",
      "tpl": "[grid-1] x:1 y:1 h:1 w:6"
    },
    {
      "x": 7,
      "y": 1,
      "h": 1,
      "w": 6,
      "gridClassName": "bg-blue-300",
      "type": "tpl",
      "tpl": "[grid-2] x:7 y:1 h:1 w:6"
    },
    {
      "x": 1,
      "y": 2,
      "h": 2,
      "w": 4,
      "gridClassName": "bg-red-300",
      "type": "tpl",
      "tpl": "[grid-3] x:1 y:2 h:2 w:4"
    },
    {
      "x": 5,
      "y": 2,
      "h": 1,
      "w": 8,
      "gridClassName": "bg-purple-300",
      "type": "tpl",
      "tpl": "[grid-4] x:5 y:2 h:1 w:8"
    }
  ]
}
```

## 内容区域小于格子的摆放

默认撑满格子。内容更小时用 `align` / `valign` 摆放。

```schema: scope="body"
{
  "type": "grid-2d",
  "cols": 3,
  "grids": [
    {
      "x": 1,
      "y": 1,
      "h": 1,
      "w": 1,
      "gridClassName": "bg-green-300",
      "type": "tpl",
      "tpl": "[grid-1] x:1 y:1 h:1 w:1"
    },
    {
      "x": 2,
      "y": 1,
      "h": 1,
      "w": 1,
      "align": "center",
      "valign": "middle",
      "gridClassName": "bg-blue-300",
      "type": "tpl",
      "tpl": "hello"
    },
    {
      "x": 3,
      "y": 1,
      "h": 1,
      "w": 1,
      "gridClassName": "bg-red-300",
      "type": "tpl",
      "tpl": "[grid-3] x:3 y:1 h:1 w:1"
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `grid-2d` | 指定为 Grid 2D 渲染器 |
| gap | `int` / `string` | 0 | 格子间距，含水平和垂直 |
| cols | `int` | 12 | 水平划分几列 |
| rowHeight | `int` / `string` | `3.125rem` | 默认行高（50px） |
| gapRow / rowGap | `int` / `string` | 同 `gap` | 垂直间距 |
| grids | `Array` | | 格子集合 |
| grids[x] | [SchemaNode](/types/schemanode) | | 格子可以是其它渲染器 |
| grids[x].x | `int` | | 起点横坐标 |
| grids[x].y | `int` | | 起点纵坐标 |
| grids[x].w | `int` | | 横跨几列 |
| grids[x].h | `int` | | 横跨几行 |
| grids[x].width | `int` / `string` / `auto` | | 所在列宽 |
| grids[x].height | `int` / `string` / `auto` | | 所在行高，可 `auto` |
| grids[x].align | `left` / `center` / `right` / `auto` | `auto` | 内容水平摆放 |
| grids[x].valign | `top` / `bottom` / `middle` / `auto` | `auto` | 内容垂直摆放 |
| grids[x].gridClassName | `string` | | 格子容器 class |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-` 前缀；格子不再套一层 muted 边框，颜色走 `gridClassName`。
- 源码字段是 `gapRow`，文档表写成 `rowGap`，两边都认。
