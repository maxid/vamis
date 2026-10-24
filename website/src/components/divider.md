---
title: Divider 分割线
outline: deep
---

# Divider 分割线

::: info 实现进度 90% · 进行中
文档主路径已对齐：`lineStyle` / `direction` / `color` / `rotate` / `title` / `titlePosition`。缺 `themeCss`、窄屏 `scaleY(0.5)`。
:::

用来隔开内容。对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema: scope="body"
{
  "type": "divider"
}
```

同一段也可以写成 YAML：

```schema: scope="body"
type: divider
```

## 不同样式

`lineStyle` 默认 `solid`，也可以画 `dashed`。

```schema: scope="body"
[
  {
    "type": "divider",
    "lineStyle": "solid"
  },
  {
    "type": "divider",
    "lineStyle": "dashed"
  }
]
```

## 带标题的分割线

`title` 可以是字符串或 SchemaNode。`titlePosition`：`left` / `center`（默认）/ `right`。

```schema: scope="body"
[
  {
    "type": "divider",
    "title": "Text",
    "titlePosition": "left"
  },
  {
    "type": "divider",
    "title": "Text",
    "titlePosition": "center"
  },
  {
    "type": "divider",
    "title": "Text",
    "titlePosition": "right"
  }
]
```

## 垂直方向

`direction: vertical` 时画竖线，高度 30px。竖线不画标题。

```schema: scope="body"
{
  "type": "flex",
  "items": [
    {
      "type": "tpl",
      "tpl": "左侧"
    },
    {
      "type": "divider",
      "direction": "vertical"
    },
    {
      "type": "tpl",
      "tpl": "右侧"
    }
  ]
}
```

## 颜色与旋转

`color` 写到 `border-color`；值里带 `linear-gradient` 时走 `border-image`。`rotate` 是角度。

```schema: scope="body"
[
  {
    "type": "divider",
    "color": "#2468f2"
  },
  {
    "type": "divider",
    "rotate": 8,
    "title": "斜线"
  }
]
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | | `"divider"` 指定为分割线 |
| className | `string` | | 外层 Dom 的类名 |
| lineStyle | `string` | `solid` | 分割线样式，`dashed` / `solid` |
| direction | `string` | `horizontal` | `horizontal` / `vertical` |
| color | `string` | | 分割线颜色；渐变写 `linear-gradient` |
| rotate | `number` | | 旋转角度 |
| title | [SchemaNode](/types/schemanode) | | 标题 |
| titleClassName | `string` | | 标题类名 |
| titlePosition | `string` | `center` | `left` / `center` / `right` |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Divider` 前缀；边距 12px、线宽 1px、标题 14px/400 用 token / 工具类转写。
- `themeCss` 自定义皮肤未接。窄屏 Amis 会 `scaleY(0.5)`，Vamis 未做。
