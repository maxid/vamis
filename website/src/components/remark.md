---
title: Remark 标记
outline: deep
---

# Remark 标记

::: info 实现进度 92% · 进行中
文档主路径已对齐：`content` 文本 / `{ title, body }`、`shape`、变量、`placement`、自定义 `icon`。浮层走 `VamisOverlay` Teleport（`--z-tooltip` 1600），徽标转写 Amis `_remark.scss`（`--remark-*`）。`mobileUI` 点击走 Dialog。缺 `themeCss`。
:::

用于展示提示文本，和表单项中的 `labelRemark` 属性类型。

作者态 YAML 与 JSON 同等有效。字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

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

| 属性名    | 类型                    | 默认值                  | 说明          |
| --------- | ----------------------- | ----------------------- | ------------- |
| type      | `string`                |                         | `remark`      |
| className | [ClassName](/types/classname) |                    | 外层 CSS 类名 |
| content   | `string` \| `object`    |                         | 提示文本；对象可带 `title` / `body` |
| placement | `string`                | `top`                   | 弹出位置      |
| trigger   | `string` \| `string[]`  | `['hover', 'focus']`    | 触发条件      |
| icon      | `string`                | 内置问号 SVG            | 图标          |
| shape     | `'circle' \| 'square'`  |                         | 图标形状；`circle` 才圆 |
| label     | `string`                |                         | 问号旁文案    |
| tooltip   | `string` \| `object`    |                         | 同 `content`，对象可覆盖 `icon` / `placement` |
| mobileUI  | `boolean`               |                         | `true` 时点击走 Dialog |
