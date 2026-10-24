---
title: Flex 布局
outline: deep
---

# Flex 布局

::: info 实现进度 90% · 进行中
文档主路径已对齐：`justify` / `alignItems` / `alignContent` / `direction` / `items` / `mobile`。缺 `themeCss`、树级 `envOverwrite`（只合本节点 `mobile`）。
:::

基于 CSS Flex 的布局。对齐 Amis 同名 schema。默认主轴 `center`、交叉轴 `stretch`（与 Amis `defaultProps` 一致）。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽。

## 基本用法

```schema: scope="body"
{
  "type": "flex",
  "items": [{
      "style": {
          "backgroundColor": "#1A5CFF",
          "width": 100,
          "height": 50,
          "margin": 5
      },
      "type": "tpl",
      "tpl": ""
  }, {
      "style": {
          "backgroundColor": "#46C93A",
          "width": 100,
          "height": 50,
          "margin": 5
      },
      "type": "tpl",
      "tpl": ""
  }, {
      "style": {
          "backgroundColor": "#FF4757",
          "width": 100,
          "height": 50,
          "margin": 5
      },
      "type": "tpl",
      "tpl": ""
  }]
}
```

`items` 里每一个都可以是其它 type。同一段也可以写成 YAML：

```schema: scope="body"
type: flex
items:
  - type: tpl
    tpl: 左
    style:
      backgroundColor: "#1A5CFF"
      width: 100
      height: 50
      margin: 5
  - type: tpl
    tpl: 中
    style:
      backgroundColor: "#46C93A"
      width: 100
      height: 50
      margin: 5
  - type: tpl
    tpl: 右
    style:
      backgroundColor: "#FF4757"
      width: 100
      height: 50
      margin: 5
```

## 子节点水平分布

`justify` 控制主轴分布，默认 `center`。

```schema: scope="body"
[
  "center",
  {
    "type": "flex",
    "justify": "center",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  "flex-start",
  {
    "type": "flex",
    "justify": "flex-start",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  "flex-end",
  {
    "type": "flex",
    "justify": "flex-end",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  "space-around",
  {
    "type": "flex",
    "justify": "space-around",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  "space-between",
  {
    "type": "flex",
    "justify": "space-between",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  "space-evenly",
  {
    "type": "flex",
    "justify": "space-evenly",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  }
]
```

## 垂直方向位置

`alignItems` 改变交叉轴位置。Amis 源码默认是 `stretch`；要居中请显式写 `center`。

```schema: scope="body"
[
  "center",
  {
    "type": "flex",
    "alignItems": "center",
    "style": { "height": 60, "backgroundColor": "#fff" },
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  { "type": "divider" },
  "flex-start",
  {
    "type": "flex",
    "alignItems": "flex-start",
    "style": { "height": 60, "backgroundColor": "#fff" },
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  { "type": "divider" },
  "flex-end",
  {
    "type": "flex",
    "alignItems": "flex-end",
    "style": { "height": 60, "backgroundColor": "#fff" },
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  }
]
```

## 布局方向

默认是行。`"direction": "column"` 改成列。

```schema: scope="body"
[
  "direction: row",
  {
    "type": "flex",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  },
  "direction: column",
  {
    "type": "flex",
    "direction": "column",
    "items": [
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#1A5CFF", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#46C93A", "width": 100, "height": 30, "margin": 5 } },
      { "type": "tpl", "tpl": "", "style": { "backgroundColor": "#FF4757", "width": 100, "height": 30, "margin": 5 } }
    ]
  }
]
```

## 移动端支持

窄屏（`<768`，对齐 Amis `sm`）时把本节点 `mobile` 字段合进来，例如把 `direction` 改成 `column`：

```schema: scope="body"
{
  "type": "flex",
  "mobile": {
    "direction": "column"
  },
  "items": [{
      "style": {
          "backgroundColor": "#1A5CFF",
          "width": 100,
          "height": 50,
          "margin": 5
      },
      "type": "tpl",
      "tpl": ""
  }, {
      "style": {
          "backgroundColor": "#46C93A",
          "width": 100,
          "height": 50,
          "margin": 5
      },
      "type": "tpl",
      "tpl": ""
  }, {
      "style": {
          "backgroundColor": "#FF4757",
          "width": 100,
          "height": 50,
          "margin": 5
      },
      "type": "tpl",
      "tpl": ""
  }]
}
```

对照页切「移动」或把窗口缩到 767 以下可看到竖排。其它移动端定制见扩展文档。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `flex` | 指定为 Flex 渲染器 |
| className | `string` | | css 类名 |
| justify | `string` | `center` | `start` / `flex-start` / `center` / `end` / `flex-end` / `space-around` / `space-between` / `space-evenly` |
| alignItems | `string` | `stretch` | `stretch` / `start` / `flex-start` / `flex-end` / `end` / `center` / `baseline` |
| alignContent | `string` | `center` | 多行时的交叉轴分布 |
| direction | `string` | `row` | `row` / `column` / `row-reverse` / `column-reverse` |
| style | `object` | | 自定义样式 |
| items | [SchemaNode](/types/schemanode) | | 子节点 |
| mobile | `object` | | 窄屏覆盖的字段 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Flex` 前缀；布局用计算样式（`display:flex` + 对齐字段），不靠 `gap-3` / `flex-wrap` 近似。
- 文档写「默认垂直居中」，Amis 源码 `alignItems` 默认是 `stretch`。Vamis 跟源码。
- `mobile` 只合在本 `flex` 节点，不是整棵 schema 的 `envOverwrite`。
- `themeCss` 自定义皮肤未接。
