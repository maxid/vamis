---
title: Cards 卡片组
outline: deep
---

# Cards 卡片组

::: info 实现进度 70% · 进行中
文档主路径示例已对标 Amis：基本用法、CRUD `mode: cards` 批量操作、瀑布流（图 + container）。缺勾选框 / `checkOnItemClick`、拖拽、`itemClassName` 像素级栅格、动作表 `select` / `initDrag`。
:::

卡片展示，不支持配置初始化接口初始化数据域，所以需要搭配类似像 [Service](./service) 这样的、具有配置接口初始化数据域功能的组件，或者手动进行数据域初始化，然后通过 `source` 属性，获取数据链中的数据，完成数据展示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

这里我们使用手动初始数据域的方式，即配置 `data` 属性，进行数据域的初始化。

```schema
type: page
data:
  items:
    - engine: Trident
      browser: Internet Explorer 4.0
      platform: Win 95+
      version: "4"
      grade: X
    - engine: Trident
      browser: Internet Explorer 5.0
      platform: Win 95+
      version: "5"
      grade: C
    - engine: Trident
      browser: Internet Explorer 5.5
      platform: Win 95+
      version: "5.5"
      grade: A
    - engine: Trident
      browser: Internet Explorer 6
      platform: Win 98+
      version: "6"
      grade: A
    - engine: Trident
      browser: Internet Explorer 7
      platform: Win XP SP2+
      version: "7"
      grade: A
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

或者你也可以使用 CRUD 的 [card 模式](./crud)。

## 当 cards 在 crud 中且配置了批量操作按钮时可点选

如果配置了 `checkOnItemClick`，当用户点击卡片时就能选中这个卡片，而不是只能点击勾选框才能选中。当前还缺勾选框和点卡片选中，批量按钮已画出。

```schema
type: page
data:
  items:
    - engine: Trident
      browser: Internet Explorer 4.0
      platform: Win 95+
      version: "4"
      grade: X
    - engine: Trident
      browser: Internet Explorer 5.0
      platform: Win 95+
      version: "5"
      grade: C
    - engine: Trident
      browser: Internet Explorer 5.5
      platform: Win 95+
      version: "5.5"
      grade: A
    - engine: Trident
      browser: Internet Explorer 6
      platform: Win 98+
      version: "6"
      grade: A
body:
  type: crud
  mode: cards
  checkOnItemClick: true
  source: $items
  bulkActions:
    - type: button
      label: 查看选中
      actionType: dialog
      dialog:
        body: "${items|json}"
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

## 瀑布流布局

设置 `"masonryLayout": true` 开启瀑布流布局模式，适合展示不同高度的卡片内容，比如图片列表、社交媒体流等场景。

> 瀑布流布局支持两种方式设置列数:
>
> 1. 通过 `columnsCount` 设置固定列数
> 2. 通过 `itemClassName` 设置响应式列数，如 `Grid-col--xs6 Grid-col--sm4 Grid-col--md3` 可以在不同屏幕尺寸下展现不同的列数（`itemClassName` 栅格尚未像素级对齐）

```schema
type: page
data:
  items:
    - image: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_800,l_1,f_jpg,q_80
      title: 风景如画的山水
      description: 在这里，青山绿水相伴，让人心旷神怡。
      author: Alice
      likes: 1.2k
      imageHeight: 200px
    - image: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg@s_0,w_800,l_1,f_jpg,q_80
      title: 城市的日与夜
      description: 灯火阑珊处，人来人往，演绎着城市的故事。繁华的街道上，每个人都在追逐着自己的梦想。夜幕降临后，霓虹闪烁，为城市增添了一份独特的魅力。都市的喧嚣与宁静在这里交织，构成了一幅动人的画卷。
      author: Bob
      likes: 2.4k
      imageHeight: 300px
    - image: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg@s_0,w_800,l_1,f_jpg,q_80
      title: 美食的诱惑
      description: 舌尖上的美味，让人流连忘返。
      author: Charlie
      likes: 3.5k
      imageHeight: 180px
    - image: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_800,l_1,f_jpg,q_80
      title: 旅行日记
      description: 背起行囊，走过山山水水。每一次旅行都是一次心灵的沉淀，让我们在路途中发现生活的美好。旅行不仅仅是观光，更是一种生活方式。
      author: David
      likes: 4.2k
      imageHeight: 250px
    - image: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg@s_0,w_800,l_1,f_jpg,q_80
      title: 咖啡时光
      description: 一杯咖啡，一本书，一个午后。
      author: Eve
      likes: 1.8k
      imageHeight: 220px
    - image: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg@s_0,w_800,l_1,f_jpg,q_80
      title: 艺术展览
      description: 在艺术的殿堂里，每一幅作品都在诉说着自己的故事。色彩的交织，线条的流动，让人沉醉其中。艺术，是生活的另一种表达方式。
      author: Frank
      likes: 2.9k
      imageHeight: 280px
body:
  type: cards
  source: $items
  masonryLayout: true
  columnsCount: 3
  card:
    type: container
    style:
      background: "#fff"
      borderRadius: 8px
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      marginBottom: 16px
      overflow: hidden
    body:
      - type: image
        src: "${image}"
        thumbMode: cover
        height: "${imageHeight}"
      - type: container
        style:
          padding: 12px
        body:
          - type: tpl
            tpl: "${title}"
            style:
              fontSize: 16px
              fontWeight: bold
              marginBottom: 8px
          - type: tpl
            tpl: "${description}"
            style:
              color: "#666"
              marginBottom: 12px
              fontSize: 14px
              lineHeight: 1.5
          - type: container
            style:
              display: flex
              justifyContent: space-between
              alignItems: center
              marginTop: 8px
            body:
              - type: container
                style:
                  display: flex
                  alignItems: center
                body:
                  - type: avatar
                    src: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_64,l_1,f_jpg,q_80
                    size: sm
                  - type: tpl
                    tpl: "${author}"
                    style:
                      marginLeft: 8px
                      color: "#333"
              - type: container
                style:
                  display: flex
                  alignItems: center
                body:
                  - type: icon
                    icon: fa fa-heart
                    className: text-danger
                  - type: tpl
                    tpl: "${likes}"
                    style:
                      marginLeft: 4px
                      color: "#999"
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `string` | | `"cards"` 指定为卡片组 |
| title | 模板 | | 标题 |
| source | 数据映射 | `${items}` | 数据源，获取当前数据域中的变量。`$items` / `$rows` 同样可读 |
| placeholder | 模板 | 暂无数据 | 当没数据的时候的文字提示 |
| className | `string` | | 外层 CSS 类名 |
| headerClassName | `string` | | 顶部外层 CSS 类名 |
| footerClassName | `string` | | 底部外层 CSS 类名 |
| itemClassName | `string` | | 卡片 CSS 类名（栅格 class 尚未像素级对齐） |
| card | [Card](./card) | | 配置卡片信息。也可以是 `type: container` 等任意节点 |
| selectable | `boolean` | `false` | 卡片组是否可选（未接） |
| multiple | `boolean` | `true` | 卡片组是否为多选（未接） |
| checkOnItemClick | `boolean` | | 点选卡片内容是否选中卡片（未接） |
| columnsCount | `number` | | 固定列数。未写则 ≥576 两列 / ≥768 三列 / ≥992 四列 |
| masonryLayout | `boolean` | `false` | 瀑布流 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 勾选、`checkOnItemClick`、拖拽、动作表 `select` / `selectAll` / `clearAll` / `initDrag` / `setValue` 未接。瀑布流是 CSS `column-count`，不是 Amis Grid 绝对定位。
