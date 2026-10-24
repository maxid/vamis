---
title: TooltipWrapper 文字提示容器
outline: deep
---

# TooltipWrapper 文字提示容器

::: info 实现进度 80% · 进行中
文档主路径已对齐：`content` / `title` / `tooltip`、`trigger` hover/click/focus、`placement`、`tooltipTheme`、`offset`、`showArrow`、`inline`、`wrapperComponent`、延迟。缺浮层进出动画、`tooltipArrowClassName` 像素级。
:::

鼠标悬停或点击时出文字提示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。`inline: true` 才并排，不要写成 `w-full`。

`className` / `style` 打在宿主 `div.vamis-node`。对照时浮层默认收起（打开会对不齐树结点）。

## 基本配置

`title` 给浮层加标题。`trigger: click` 要点一下才出。

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面是文字提示。"
}
```

```schema: scope="body"
{
  "type": "flex",
  "justify": "space-around",
  "alignItems": "center",
  "items": [
    {
      "type": "tooltip-wrapper",
      "content": "提示文字",
      "body": "hover 激活提示"
    },
    {
      "type": "tooltip-wrapper",
      "title": "标题",
      "content": "提示文字",
      "trigger": "click",
      "body": "click 激活提示"
    }
  ]
}
```

```schema: scope="body"
type: flex
justify: space-around
alignItems: center
items:
  - type: tooltip-wrapper
    content: 提示文字 YAML
    body: hover 激活提示 YAML
  - type: tooltip-wrapper
    title: 标题 YAML
    content: 提示文字 YAML
    trigger: click
    body: click 激活提示 YAML
```

`body` 可以是多个子节点：

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "content": "删除提示",
  "inline": true,
  "body": [
    { "type": "tpl", "tpl": "删除" },
    { "type": "tpl", "className": "ml-1", "tpl": "×" }
  ]
}
```

## 提示位置

`placement`：`top` / `left` / `right` / `bottom`。

```schema: scope="body"
{
  "type": "flex",
  "justify": "space-around",
  "alignItems": "center",
  "items": [
    { "type": "tooltip-wrapper", "content": "上提示", "placement": "top", "body": "上" },
    { "type": "tooltip-wrapper", "content": "左提示", "placement": "left", "body": "左" },
    { "type": "tooltip-wrapper", "content": "右提示", "placement": "right", "body": "右" },
    { "type": "tooltip-wrapper", "content": "下提示", "placement": "bottom", "body": "下" }
  ]
}
```

## 位置偏移

`offset` 默认 `[0, 0]`，单位 px，`[水平, 垂直]`。

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "title": "偏移标题",
  "content": "向右 10px 向上 20px",
  "offset": [10, -20],
  "inline": true,
  "body": "带偏移的提示"
}
```

## 展示箭头

`showArrow: false` 不画指向箭头。

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "title": "无箭头标题",
  "content": "没有箭头",
  "showArrow": false,
  "inline": true,
  "body": "没有箭头的提示"
}
```

## 主题色

默认 `light`。`tooltipTheme: dark` 深色浮层。

```schema: scope="body"
{
  "type": "flex",
  "justify": "flex-start",
  "alignItems": "center",
  "items": [
    {
      "type": "tooltip-wrapper",
      "title": "浅色标题",
      "content": "浅色提示",
      "inline": true,
      "className": "mr-2",
      "body": "light 主题提示"
    },
    {
      "type": "tooltip-wrapper",
      "title": "深色标题",
      "content": "深色提示",
      "inline": true,
      "tooltipTheme": "dark",
      "body": "dark 主题提示"
    }
  ]
}
```

## 延迟打开与关闭

`mouseEnterDelay` / `mouseLeaveDelay` 单位 ms。对照不跑长延迟：

```yaml
type: tooltip-wrapper
title: 延迟标题
content: 延迟提示
mouseEnterDelay: 1000
mouseLeaveDelay: 2000
inline: true
body: 延迟 1s 展示
```

## 动态文案

`content` / `title` 走模板。

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "content": "${tip}",
  "data": { "tip": "从数据域来的提示" },
  "body": {
    "type": "tpl",
    "tpl": "${tip}"
  }
}
```

## 内联展示

`inline: true` 行内并排。

```schema: scope="body"
[
  {
    "type": "tooltip-wrapper",
    "content": "内联提示甲",
    "inline": true,
    "className": "p-1 mr-3 border-2 border-solid border-indigo-400",
    "body": "内联容器甲"
  },
  {
    "type": "tooltip-wrapper",
    "content": "内联提示乙",
    "inline": true,
    "className": "p-1 mr-3 border-2 border-solid border-indigo-400",
    "body": "内联容器乙"
  },
  {
    "type": "tooltip-wrapper",
    "content": "块级提示",
    "className": "p-1 mt-3 border-2 border-solid border-green-400",
    "body": "非内联容器"
  }
]
```

## 自定义样式

`style` 打在宿主节点，`tooltipStyle` 打在浮层。

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "content": "加粗浮层",
  "inline": true,
  "style": { "fontStyle": "italic" },
  "tooltipStyle": { "fontWeight": "bold" },
  "body": "一段斜体文案"
}
```

## 自定义包裹标签

`wrapperComponent` 白名单（`div` / `span` / `pre` 等），默认 `inline` 时 `span`，否则 `div`。

```schema: scope="body"
{
  "type": "tooltip-wrapper",
  "content": "代码提示",
  "wrapperComponent": "pre",
  "body": "function Hello() {\n  return 1\n}"
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
| mouseLeaveDelay | `number` | `200` | 延迟隐藏，ms |
| rootClose | `boolean` | `true` | 点外侧关闭 |
| inline | `boolean` | `false` | 行内 |
| wrapperComponent | `string` | `div` / `span` | 根标签 |
| body | SchemaNode | | 被包裹内容 |
| style | `object` / `string` | | 内容区样式（宿主节点） |
| tooltipStyle | `object` / `string` | | 浮层样式 |
| className | `string` | | 内容区类名（宿主节点） |
| tooltipClassName | `string` | | 浮层类名 |

## 事件表

| 事件名称 | 说明 |
|----------|------|
| mouseenter | 移入宿主 |
| mouseleave | 移出宿主 |
| click | 点击宿主 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接浮层进出动画、fontawesome 箭头图标。`wrapperComponent` 不在白名单时回退 `div` / `span`。
