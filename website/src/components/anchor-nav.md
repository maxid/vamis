---
title: AnchorNav 锚点导航
outline: deep
---

# AnchorNav 锚点导航

::: info 实现进度 80% · 进行中
文档主路径已对齐：`links[].title` / `body`、垂直方向 `children` 展平、`direction: horizontal`、`active` 用 href 或索引。缺滚动监听自动高亮、区域默认 `className` 皮肤。
:::

锚点导航容器：左侧（或顶部）点一项，内容区滚到对应块。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。组装壳是 `div`。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

活示例用短文本，避免整页大表单。垂直方向 `children` 会展平进导航。

```schema: scope="body"
type: anchor-nav
links:
  - title: 基本信息
    body:
      type: tpl
      tpl: 基本信息内容
  - title: 工作信息
    body:
      type: tpl
      tpl: 工作信息内容
  - title: 兴趣爱好
    body:
      type: tpl
      tpl: 兴趣爱好内容
```

## 水平导航

```schema: scope="body"
{
  "type": "anchor-nav",
  "direction": "horizontal",
  "links": [
    { "title": "基本信息", "body": { "type": "tpl", "tpl": "水平内容" } },
    { "title": "工作信息", "body": { "type": "tpl", "tpl": "水平内容" } },
    { "title": "兴趣爱好", "body": { "type": "tpl", "tpl": "水平内容" } }
  ]
}
```

## 默认定位到某个区域

`active` 可以是 `href`，或从 0 起的索引（该项不要配 href）。

```schema: scope="body"
{
  "type": "anchor-nav",
  "active": "work",
  "links": [
    { "title": "基本信息", "href": "base", "body": { "type": "tpl", "tpl": "定位基本" } },
    { "title": "工作信息", "href": "work", "body": { "type": "tpl", "tpl": "定位工作" } },
    { "title": "兴趣爱好", "href": "interest", "body": { "type": "tpl", "tpl": "定位兴趣" } }
  ]
}
```

```schema: scope="body"
{
  "type": "anchor-nav",
  "active": 1,
  "links": [
    { "title": "索引零", "body": { "type": "tpl", "tpl": "索引零内容" } },
    { "title": "索引一", "body": { "type": "tpl", "tpl": "索引一内容" } },
    { "title": "索引二", "body": { "type": "tpl", "tpl": "索引二内容" } }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"anchor-nav"` | 指定为 AnchorNav |
| className | `string` | | 打在宿主 |
| linkClassName | `string` | | 导航区 class |
| sectionClassName | `string` | | 内容区 class |
| links | `Array` | | 锚点列表 |
| direction | `string` | `"vertical"` | vertical / horizontal |
| active | `string` / `number` | | href 或索引 |
| links[].title | `string` | | 标题 |
| links[].href | `string` | | 区域标识 |
| links[].body | Schema | | 内容 |
| links[].children | `Array` | | 垂直方向子锚点 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 组装壳是 `div`。未做滚动过程中自动改 `active`。
