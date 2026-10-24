---
title: Nav 导航
outline: deep
---

# Nav 导航

::: info 实现进度 80% · 进行中
文档主路径已对齐：`links` / `source`、默认 `stacked`、`stacked: false` 横排、多级 `children` / `unfolded`、`active`、URL `icon`。缺 overflow 收纳、缩起、搜索、拖拽排序、itemBadge。
:::

用来展示链接导航。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。`type: nav` 根标签是 `<nav>`。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

对照不跑外链。活示例用站内 hash：

```schema: scope="body"
type: nav
stacked: true
className: w-md
links:
  - label: Nav 1
    to: "?to=nav1"
    active: true
  - label: Nav 2
    to: "?to=nav2"
  - label: Nav 3
    to: "?to=nav3"
```

## 配置多层级

`unfolded: true` 默认展开子级。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "links": [
    { "label": "Nav 1", "to": "?to=n1", "active": true },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [{ "label": "Nav 2-1-1", "to": "?to=n211" }]
        },
        { "label": "Nav 2-2", "to": "?to=n22" }
      ]
    },
    { "label": "Nav 3", "to": "?to=n3" }
  ]
}
```

## 横向摆放

`stacked: false`（或 `mode: horizontal`）：

```schema: scope="body"
{
  "type": "nav",
  "stacked": false,
  "links": [
    { "label": "Nav 1", "to": "?to=h1" },
    { "label": "Nav 2", "to": "?to=h2" },
    { "label": "Nav 3", "to": "?to=h3" }
  ]
}
```

`overflow` 收纳对照不跑。

## 动态导航

`source` 取上下文数组：

```schema
{
  "type": "page",
  "data": {
    "nav": [
      { "label": "Nav 1", "to": "?to=d1" },
      { "label": "Nav 2", "to": "?to=d2" }
    ]
  },
  "body": {
    "type": "nav",
    "stacked": true,
    "source": "${nav}"
  }
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"nav"` | 指定为 Nav |
| stacked | `boolean` | `true` | `false` 横排 |
| mode | `string` | `inline` | `horizontal` 也横排。悬浮面板未接 |
| source | 表达式 / Api | | 动态 links。远程 api 未接 |
| links | `Array` | | 链接集合 |
| links[].label | `string` | | 名称 |
| links[].to | 模板 | | 地址 |
| links[].icon | `string` | | 含 `/` 当图片 |
| links[].children | `Array` | | 子链接 |
| links[].unfolded | `boolean` | | 初始展开 |
| links[].active | `boolean` | | 高亮 |
| collapsed | `boolean` | | 缩起，尚未接入 |
| overflow | `object` | | 横排收纳，尚未接入 |
| className | `string` | | 打在宿主 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 overflow、缩起、搜索、拖拽、`itemBadge`、悬浮面板、`deferApi`。
