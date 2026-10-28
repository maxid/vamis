---
title: Cards 卡片组
outline: deep
---

# Cards 卡片组

::: info 实现进度 70% · 进行中
文档主路径已对齐：`source` 默认 `$items`（文档写法 `${items}` 同样可读）、`card` 子 schema、空态「暂无数据」、`columnsCount`、`masonryLayout` CSS 分栏。未写列数时 ≥576 两列 / ≥768 三列 / ≥992 四列。底栏 `icon` 未写 `label` 时只画图标（不补「按钮」）。缺勾选/拖拽、CRUD 批量点选、`itemClassName` 像素级栅格。
:::

卡片列表。不配初始化接口，需要搭配 [Service](./service) 拉数，或手动初始化数据域，再用 `source` 从数据链取行。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。也可以用 CRUD 的 [card 模式](./crud)。

## 基本用法

手动写 `data`，`source: $items` 从数据链取行。卡片字段用 `{ label, name }`，默认 `useCardLabel: true`。

```schema
type: page
data:
  items:
    - engine: Trident
      browser: Internet Explorer 4.0
      version: "4"
    - engine: Trident
      browser: Internet Explorer 5.0
      version: "5"
    - engine: Trident
      browser: Internet Explorer 5.5
      version: "5.5"
    - engine: Trident
      browser: Internet Explorer 6
      version: "6"
    - engine: Trident
      browser: Internet Explorer 7
      version: "7"
body:
  type: cards
  source: $items
  card:
    body:
      - label: Engine
        name: engine
      - label: Browser
        name: browser
      - name: version
        label: Version
    actions:
      - type: button
        level: link
        icon: fa fa-eye
        actionType: dialog
        dialog:
          title: 查看详情
          body:
            type: form
            body:
              - label: Engine
                name: engine
                type: static
              - name: browser
                label: Browser
                type: static
              - name: version
                label: Version
                type: static
```

## 设置头像文本背景

`avatarTextBackground` 按文本 hash 分配颜色。

```schema
type: page
data:
  items:
    - engine: Trident
      browser: Internet Explorer 4.0
    - engine: Chrome
      browser: Chrome 44
    - engine: Gecko
      browser: Firefox 1.0
    - engine: Presto
      browser: Opera 10
    - engine: Webkie
      browser: Safari 12
body:
  type: cards
  source: $items
  card:
    header:
      avatarText: "${engine}"
      avatarTextBackground:
        - "#FFB900"
        - "#D83B01"
        - "#B50E0E"
        - "#E81123"
        - "#B4009E"
        - "#5C2D91"
        - "#0078D7"
        - "#00B4FF"
        - "#008272"
    body:
      - label: Browser
        name: browser
```

## 瀑布流布局

`masonryLayout: true` 用 CSS 分栏排不同高度的卡片。`columnsCount` 钉列数。

```schema
type: page
data:
  items:
    - title: 风景如画的山水
      description: 在这里，青山绿水相伴，让人心旷神怡。
    - title: 城市的日与夜
      description: 灯火阑珊处，人来人往，演绎着城市的故事。繁华的街道上，每个人都在追逐着自己的梦想。
    - title: 美食的诱惑
      description: 舌尖上的美味，让人流连忘返。
    - title: 旅行日记
      description: 背起行囊，走过山山水水。每一次旅行都是一次心灵的沉淀。
    - title: 咖啡时光
      description: 一杯咖啡，一本书，一个午后。
    - title: 艺术展览
      description: 在艺术的殿堂里，每一幅作品都在诉说着自己的故事。
body:
  type: cards
  source: $items
  masonryLayout: true
  columnsCount: 3
  card:
    header:
      title: "${title}"
    body: "${description}"
```

## 空列表

没数据时默认「暂无数据」。

```schema
type: page
data:
  items: []
body:
  type: cards
  source: $items
  card:
    body:
      - label: Engine
        name: engine
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `source` | 数据链取值。默认 `$items`；`${items}` / `$rows` 同样可读 |
| `card` | 单张卡片 schema，每行把记录铺进数据域 |
| `placeholder` | 空列表文案。默认「暂无数据」 |
| `title` | 列表标题 |
| `header` / `footer` | 列表头尾节点 |
| `columnsCount` | 固定列数。未写则 sm 2 / md 3 / lg 4 |
| `masonryLayout` | 瀑布流。默认 false |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 勾选、拖拽、CRUD 批量点选、`itemClassName` 栅格 class 未接。瀑布流是 CSS `column-count`，不是 Amis Grid 绝对定位。
