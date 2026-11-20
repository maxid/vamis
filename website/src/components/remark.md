---
title: Remark 标记
outline: deep
---

# Remark 标记

::: info 实现进度 92% · 进行中
文档主路径已对齐：content 文本 / `{ title, body }`、shape、变量、placement。浮层走 `VamisOverlay`（`--z-tooltip` 1600），徽标转写 `_remark.scss`（`--remark-*`）。自定义 icon / `mobileUI` Dialog 已接；fragment 宿主声明 disabled + inheritAttrs:false，不再产生 fallthrough 警告。缺 `themeCss`
:::

`remark` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

用于展示提示文本，和表单项中的 remark 属性类型。

## 基本用法

```schema
{
  "type": "page",
  "body": {
    "type": "remark",
    "content": "这是一段提醒"
  }
}
```

## 图标形状

```schema
{
  "type": "page",
  "body": {
    "type": "remark",
    "content": "这是一段提醒",
    "shape": "circle"
  }
}
```
## 可配置标题

```schema
{
  "type": "page",
  "body": {
    "type": "remark",
    "content": {
      "title": "标题",
      "body": "这是一段提醒"
    }
  }
}
```

## 支持变量

```schema
{
  "type": "page",
  "data": {
    "github": "https://github.com/"
  },
  "body": [
    {
      "type": "remark",
      "content": "${github}"
    },
    {
      "type": "remark",
      "content": {
        "title": "${github|raw}",
        "body": "${github}"
      }
    }
  ]
}
```

## 弹出位置

```schema: scope="body"
[
  {
    "type": "remark",
    "content": "向上",
    "placement": "top"
  },
  {
    "type": "remark",
    "content": "向下",
    "placement": "bottom"
  },
  {
    "type": "remark",
    "content": "向左",
    "placement": "left"
  },
  {
    "type": "remark",
    "content": "向右",
    "placement": "right"
  }
]
```

## 属性表

| 属性名    | 类型     | 默认值                  | 说明          |
| --------- | -------- | ----------------------- | ------------- |
| type      | `string` |                         | `remark`      |
| className | `string` |                         | 外层 CSS 类名 |
| content   | `string` |                         | 提示文本      |
| placement | `string` |                         | 弹出位置      |
| trigger   | `string` | `['hover', 'focus']`    | 触发条件      |
| icon      | `string` | `fa fa-question-circle` | 图标          |
| shape     | `'circle' \| 'square'`             | 图标形状       |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：文档主路径已对齐：content 文本 / `{ title, body }`、shape、变量、placement。浮层走 `VamisOverlay`（`--z-tooltip` 1600），徽标转写 `_remark.scss`（`--remark-*`）。自定义 icon / `mobileUI` Dialog 已接；fragment 宿主声明 disabled + inheritAttrs:false，不再产生 fallthrough 警告。缺 `themeCss`。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
