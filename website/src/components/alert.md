---
title: Alert 提示
outline: deep
---

# Alert 提示

::: warning 实现进度 70% · 进行中
主路径可交互：`level` info/success/warning/danger（默认 info）、`title` / `body`、`showIcon`（默认 false）、`showCloseButton`、`actions`、表达式 `level`；字号、四档底色、文字色、边距、flex 盒模型和图标解析已对齐 Amis。缺关闭事件。
:::

用来做文字特殊提示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`className` / `style` 打在宿主 `div.vamis-node`；Alert 的 `className` 同时落到提示条根，Amis 示例里的 `mb-1` / `mb-3` 才能直接控制它的边距。`showIcon` / `showCloseButton` 源码默认 **false**。

## 基本使用

`level` 支持 `info`、`success`、`warning`、`danger`。

```schema: scope="body"
[
  {
    "type": "alert",
    "body": "提示类文案",
    "level": "info",
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "提示类标题",
    "body": "提示类文案",
    "level": "info",
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "成功类文案",
    "level": "success",
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "成功类标题",
    "body": "成功类文案",
    "level": "success",
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "警告类文案",
    "level": "warning",
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "警告类标题",
    "body": "警告类文案",
    "level": "warning",
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "危险类文案",
    "level": "danger",
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "危险类标题",
    "body": "危险类文案",
    "level": "danger"
  }
]
```

## 图标

`showIcon: true` 才画左侧图标。没写 `icon` 时按 `level` 用默认图标。图标槽 `16×24`，16px 图形在槽内垂直居中并留 8px 右缝。`icon` 与 Amis 一样先查内置 SVG 名，再按图片 URL / Font Awesome class 渲染；`info-circle` 用内置字形，`fa fa-list` 走 `sdk.css` 已带的 Font Awesome 6 + v4-shims。

```schema: scope="body"
[
  {
    "type": "alert",
    "body": "提示类文案",
    "level": "info",
    "showIcon": true,
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "提示类标题",
    "body": "提示类文案",
    "level": "info",
    "showIcon": true,
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "成功类文案",
    "level": "success",
    "showIcon": true,
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "成功类标题",
    "body": "成功类文案",
    "level": "success",
    "showIcon": true,
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "警告类文案",
    "level": "warning",
    "showIcon": true,
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "警告类标题",
    "body": "警告类文案",
    "level": "warning",
    "showIcon": true,
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "危险类文案",
    "level": "danger",
    "showIcon": true,
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "危险类标题",
    "body": "危险类文案",
    "level": "danger",
    "showIcon": true,
    "className": "mb-3"
  },
  {
    "type": "alert",
    "body": "自定义ICON文案",
    "showIcon": true,
    "icon": "info-circle",
    "className": "mb-1"
  },
  {
    "type": "alert",
    "title": "自定义ICON标题",
    "body": "自定义ICON文案",
    "showIcon": true,
    "icon": "fa fa-list"
  }
]
```

## level 支持表达式

`level` / `showIcon` / `icon` 都可以写表达式。

```schema: scope="body"
{
  "type": "page",
  "data": {
    "status": 1
  },
  "body": [
    {
      "type": "alert",
      "level": "${IFS(status===1, 'danger', status===2, 'warning')}",
      "body": "这是内容区"
    }
  ]
}
```

## 显示关闭按钮

`showCloseButton: true` 在右上角出关闭。点了只藏这一条，不会卸掉整页。

```schema: scope="body"
[
  {
    "type": "alert",
    "body": "显示关闭按钮的提示",
    "level": "info",
    "showCloseButton": true,
    "showIcon": true,
    "className": "mb-2"
  },
  {
    "type": "alert",
    "title": "可关闭提示",
    "body": "显示关闭按钮的提示",
    "level": "success",
    "showCloseButton": true,
    "showIcon": true
  }
]
```

对照时不要去点关闭（树结点对的是提示条还在不在）。

## 操作区域

`actions` 可以是按钮数组，或单个 schema（比如 flex）。

```schema: scope="body"
[
  {
    "type": "alert",
    "level": "success",
    "className": "mb-3",
    "showIcon": true,
    "showCloseButton": true,
    "title": "标题",
    "body": "创建成功",
    "actions": [
      {
        "type": "button",
        "label": "查看详情",
        "size": "xs",
        "level": "link",
        "style": {
          "position": "relative",
          "top": "25px",
          "left": "30px"
        }
      }
    ]
  },
  {
    "type": "alert",
    "level": "info",
    "showIcon": true,
    "showCloseButton": true,
    "body": "创建成功",
    "actions": {
      "type": "flex",
      "justify": "flex-start",
      "alignItems": "flex-start",
      "direction": "column",
      "style": {
        "padding": "6px"
      },
      "items": [
        {
          "type": "button",
          "label": "详情",
          "size": "xs",
          "level": "primary",
          "style": {
            "marginBottom": "5px"
          }
        },
        {
          "type": "button",
          "label": "关闭",
          "size": "xs",
          "level": "danger"
        }
      ]
    }
  }
]
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"alert"` | 指定为 alert 渲染器 |
| `title` | `string` | | Alert 标题，可模板 |
| `className` | `string` | | 外层 Dom 的类名 |
| `level` | `string` | `info` | `info` / `success` / `warning` / `danger`。可表达式 |
| `body` | `SchemaNode[] \| SchemaNode` | | 显示内容。也认 `msg` / `tpl` |
| `showCloseButton` | `boolean` | `false` | 是否显示关闭按钮 |
| `closeButtonClassName` | `string` | | 关闭按钮的 CSS 类名 |
| `showIcon` | `boolean` | `false` | 是否显示图标。可表达式 |
| `icon` | `string` | | 自定义图标。内置名 / URL / Font Awesome class |
| `iconClassName` | `string` | | 图标的 CSS 类名 |
| `actions` | `SchemaNode[] \| SchemaNode` | | 操作区域 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 关闭只做本地隐藏，不派发独立 close 事件。
- 视觉已按 cxd Alert 的字号、四档 fill-10 背景、neutral-text-2 文字、padding / margin / flex 盒模型转写；示例保留 Amis 的 `mb-1` / `mb-3` 间距类。内置 SVG 与 Font Awesome class 均走共享图标链。
