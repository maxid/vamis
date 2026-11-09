---
title: TooltipWrapper 文字提示容器
outline: deep
---

# TooltipWrapper 文字提示容器

::: info 实现进度 92% · 进行中
文档主路径已对齐：`content` / `title` / `tooltip`、`trigger` hover/click/focus、`placement`、`tooltipTheme`、`offset`、`showArrow`、`inline`、`wrapperComponent`、延迟。浮层走 `VamisOverlay` Teleport（`--z-tooltip` 1600），盒模型转写 Amis Tooltip（240 / 8×12 / 圆角 8 / 8×4 箭头）。缺 `themeCss`。
:::

鼠标悬停或点击时出文字提示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。`inline: true` 才并排，不要写成 `w-full`。

`className` / `style` 打在宿主 `div.vamis-node`。浮层 Teleport 到 `env.getModalContainer()`（默认 `body`），不被文档预览 overflow 裁切。对照时浮层默认收起（打开会对不齐树结点）。

## 基本配置

当用户鼠标悬停或者点击元素时，显示文字提示浮层，`title` 可以为浮层添加标题。

```schema: scope="body"
[
  {
    "type": "flex",
    "justify": "space-around",
    "alignItems": "center",
    "direction": "row",
    "style": {
      "width": 350,
      "height": 30
    },
    "items": [
      {
        "type": "tooltip-wrapper",
        "content": "提示文字",
        "body": "hover 激活文字提示",
        "className": "mb-1"
      },
      {
        "type": "tooltip-wrapper",
        "title": "标题",
        "content": "提示文字",
        "trigger": "click",
        "body": "click 激活文字提示",
        "className": "mb-1"
      }
    ]
  }
]
```

`body` 支持传入多个子元素：

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "content": "删除提示",
    "inline": true,
    "body": [
      {
        "type": "tpl",
        "tpl": "删除"
      },
      {
        "className": "ml-1",
        "type": "icon",
        "icon": "trash"
      }
    ]
  }
]
```

## 提示位置

提供四种不同方向的展示方式：`'top' | 'left' | 'right' | 'bottom'`。主轴放不下时翻到对面，箭头 class 跟实际边走。

```schema: scope="body"
{
  "type": "flex",
  "justify": "space-around",
  "alignItems": "center",
  "direction": "column",
  "items": [
    {
      "type": "flex",
      "justify": "center",
      "alignItems": "center",
      "direction": "row",
      "style": {
        "width": 100,
        "height": 30
      },
      "items": [
        {
          "type": "tooltip-wrapper",
          "content": "提示文字",
          "body": [
            {
              "type": "icon",
              "icon": "arrow-circle-up",
              "className": "mr-1"
            },
            {
              "type": "tpl",
              "tpl": "上"
            }
          ]
        }
      ]
    },
    {
      "type": "flex",
      "justify": "space-around",
      "alignItems": "center",
      "direction": "row",
      "style": {
        "width": 200,
        "height": 30
      },
      "items": [
        {
          "type": "tooltip-wrapper",
          "content": "提示文字",
          "placement": "left",
          "body": [
            {
              "type": "icon",
              "icon": "arrow-circle-left",
              "className": "mr-1"
            },
            {
              "type": "tpl",
              "tpl": "左"
            }
          ]
        },
        {
          "type": "tooltip-wrapper",
          "content": "提示文字",
          "placement": "right",
          "body": [
            {
              "type": "icon",
              "icon": "arrow-circle-right",
              "className": "mr-1"
            },
            {
              "type": "tpl",
              "tpl": "右"
            }
          ]
        }
      ]
    },
    {
      "type": "flex",
      "justify": "center",
      "alignItems": "center",
      "direction": "row",
      "style": {
        "width": 100,
        "height": 30
      },
      "items": [
        {
          "type": "tooltip-wrapper",
          "content": "提示文字",
          "placement": "bottom",
          "body": [
            {
              "type": "icon",
              "icon": "arrow-circle-down",
              "className": "mr-1"
            },
            {
              "type": "tpl",
              "tpl": "下"
            }
          ]
        }
      ]
    }
  ]
}
```

## 位置偏移

组件提供了关于相对提示位置的垂直、水平位置上的偏移，默认 `[0, 0]`。

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "title": "标题",
    "content": "文案提示位置偏移 [10, -20]",
    "offset": [10, -20],
    "inline": true,
    "className": "mr-2",
    "body": [
      {
        "type": "tpl",
        "tpl": "向右偏移10px向上偏移20px"
      }
    ]
  }
]
```

## 展示箭头

`showArrow` 为 `false` 不展示箭头。

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "title": "标题",
    "content": "提示内容",
    "showArrow": false,
    "inline": true,
    "className": "mr-2",
    "body": [
      {
        "type": "tpl",
        "tpl": "没有箭头"
      }
    ]
  }
]
```

## 主题色

组件提供了两个不同的主题：`dark` 和 `light`，默认使用 `light`。

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "title": "标题",
    "content": "文案提示",
    "inline": true,
    "className": "mr-2",
    "body": [
      {
        "type": "tpl",
        "tpl": "light主题提示"
      }
    ]
  },
  {
    "type": "tooltip-wrapper",
    "title": "标题",
    "content": "文案提示",
    "inline": true,
    "tooltipTheme": "dark",
    "body": [
      {
        "type": "tpl",
        "tpl": "dark主题提示"
      }
    ]
  }
]
```

## 延迟打开与关闭

`mouseEnterDelay` 为延迟展示，`mouseLeaveDelay` 为延迟隐藏。

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "title": "标题",
    "content": "提示内容",
    "mouseEnterDelay": 1000,
    "mouseLeaveDelay": 2000,
    "inline": true,
    "className": "mr-2",
    "body": [
      {
        "type": "tpl",
        "tpl": "延迟1s展示，延迟2s隐藏"
      }
    ]
  }
]
```

## 动态文案

`content` 和 `title` 支持变量映射，可以从上下文中动态获取提示文案。

```schema
{
  "type": "page",
  "data": {
    "text": "The longest word in any of the major English language dictionaries is pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis."
  },
  "body": {
    "type": "tooltip-wrapper",
    "content": "${text}",
    "body": {
      "type": "html",
      "style": {
        "overflow": "hidden",
        "textOverflow": "ellipsis",
        "whiteSpace": "nowrap",
        "maxWidth": "300px",
        "display": "inline-block"
      },
      "html": "${text}"
    }
  }
}
```

## 内联展示

设置 `"inline": true` 使容器内联展示。

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "content": "文字提示",
    "inline": true,
    "className": "p-1 mr-3 border-2 border-solid border-indigo-400",
    "body": "内联容器1"
  },
  {
    "type": "tooltip-wrapper",
    "content": "文字提示",
    "inline": true,
    "className": "p-1 mr-3 border-2 border-solid border-indigo-400",
    "body": "内联容器2"
  },
  {
    "type": "tooltip-wrapper",
    "content": "文字提示",
    "className": "p-1 mt-3 border-2 border-solid border-green-400",
    "body": "非内联容器"
  }
]
```

## 自定义样式

使用 `style` 控制内容区样式，`tooltipStyle` 控制浮层区样式。

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "content": "文字提示(加粗)",
  "inline": true,
  "style": {
    "fontStyle": "italic"
  },
  "tooltipStyle": {
    "fontWeight": "bold"
  },
  "body": [
    {
      "type": "tpl",
      "tpl": "一段文案"
    }
  ]
}
```

## 自定义包裹标签

使用 `wrapperComponent` 修改标签名，可以让容器使用其他标签渲染：

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "content": "文字提示",
  "wrapperComponent": "pre",
  "body": "function HelloWorld() {\n    console.log('Hello World');\n}"
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `tooltip-wrapper` | 类型 |
| title | `string` | | 浮层标题 |
| content | `string` | | 浮层内容；兼容 `tooltip` |
| placement | `top` / `left` / `right` / `bottom` | `top` | 出现位置 |
| tooltipTheme | `light` / `dark` | `light` | 主题 |
| offset | `[number, number]` | `[0, 0]` | 水平 / 垂直偏移，px |
| showArrow | `boolean` | `true` | 指向箭头 |
| enterable | `boolean` | `true` | 鼠标可移入浮层 |
| disabled | `boolean` | `false` | 禁用 |
| trigger | `hover` / `click` / `focus` / 数组 | `hover` | 触发 |
| mouseEnterDelay | `number` | `0` | 延迟展示，ms |
| mouseLeaveDelay | `number` | `200` | 延迟隐藏，ms（Amis 文档表写 300，渲染器默认 200） |
| rootClose | `boolean` | `true` | 点外侧关闭 |
| inline | `boolean` | `false` | 行内 |
| wrapperComponent | `string` | `div` / `span` | 根标签 |
| body | [SchemaNode](/types/schemanode) | | 内容容器 |
| style | `object` / `string` | | 内容区样式（宿主节点） |
| tooltipStyle | `object` / `string` | | 浮层样式 |
| className | `string` | | 内容区类名（宿主节点） |
| tooltipClassName | `string` | | 浮层类名 |
| tooltipArrowClassName | `string` | | 箭头类名 |
| tooltipBodyClassName | `string` | | 浮层正文类名 |

## 事件表

| 事件名称 | 说明 |
|----------|------|
| mouseenter | 移入宿主 |
| mouseleave | 移出宿主 |
| click | 点击宿主 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 浮层出现用 opacity 0.2s（对齐 Amis `tooltipIn` 的淡入）。`wrapperComponent` 不在白名单时回退 `div` / `span`。未接 `themeCss`。
