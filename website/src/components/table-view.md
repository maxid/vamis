---
title: Table View 表格视图
outline: deep
---

# Table View 表格视图

::: info 实现进度 85% · 进行中
对照 7 例盒模型已齐：边框/内边距 token、`colspan`/`rowspan`、`caption` 居中。缺编辑器拖格子。
:::

通过表格展现固定数据或做布局。和 [table](./table) 不同：数据不必是多行记录，合并单元格是手动指定的。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema: scope="body"
type: service
data:
  beijing: "20"
  tianjing: "19"
body:
  type: table-view
  trs:
    - background: "#F7F7F7"
      tds:
        - body:
            type: tpl
            tpl: 地区
        - body:
            type: tpl
            tpl: 城市
        - body:
            type: tpl
            tpl: 销量
    - tds:
        - rowspan: 2
          body:
            type: tpl
            tpl: 华北
        - body:
            type: tpl
            tpl: 北京
        - body:
            type: tpl
            tpl: "${beijing}"
    - tds:
        - body:
            type: tpl
            tpl: 天津
        - body:
            type: tpl
            tpl: "${tianjing}"
```

table view 需要手动合并单元格。

## 单元格样式

把左右两列的边框去掉，只留中间一列。

```schema: scope="body"
type: table-view
trs:
  - background: "#F7F7F7"
    tds:
      - body:
          type: tpl
          tpl: 地区
      - body:
          type: tpl
          tpl: 城市
      - body:
          type: tpl
          tpl: 销量
  - tds:
      - body:
          type: tpl
          tpl: ""
        style:
          borderBottomWidth: 0
          borderLeftWidth: 0
      - body:
          type: tpl
          tpl: 北京
      - body:
          type: tpl
          tpl: ""
        style:
          borderBottomWidth: 0
          borderRightWidth: 0
```

## 列设置

`cols` 控制整列样式。

```schema: scope="body"
type: table-view
cols:
  - {}
  - style:
      background: "#F7F7F7"
trs:
  - tds:
      - rowspan: 2
        body:
          type: tpl
          tpl: 华北
      - body:
          type: tpl
          tpl: 北京
  - tds:
      - body:
          type: tpl
          tpl: 天津
```

## 标题

`caption` 加段标题，`captionSide` 控制上或下。

```schema: scope="body"
type: table-view
caption: 标题
captionSide: bottom
trs:
  - tds:
      - rowspan: 2
        body:
          type: tpl
          tpl: 华北
      - body:
          type: tpl
          tpl: 北京
      - body:
          type: tpl
          tpl: "${beijing}"
  - tds:
      - body:
          type: tpl
          tpl: 天津
      - body:
          type: tpl
          tpl: "${tianjing}"
```

## 支持变量及表达式

单元格属性可以走表达式。

```schema
type: page
title: 标题
data:
  score: 40
body:
  type: table-view
  trs:
    - tds:
        - background: "${score>50 ? '#fef1d2': '#d7f8ff'}"
          body:
            type: tpl
            tpl: 分数>50
        - background: "${score<100 ? '#fef1d2': '#d7f8ff'}"
          body:
            type: tpl
            tpl: 分数<100
```

## 行和单元格 visibleOn

```schema
type: page
data:
  firstRow: true
  displayBeijing: true
body:
  type: table-view
  trs:
    - background: "#F7F7F7"
      visibleOn: firstRow
      tds:
        - body:
            type: tpl
            tpl: 地区
        - body:
            type: tpl
            tpl: 城市
        - body:
            type: tpl
            tpl: 销量
    - tds:
        - visibleOn: displayBeijing
          body:
            type: tpl
            tpl: 北京
        - body:
            type: tpl
            tpl: 天津
```

## 作为布局方法

把 `border` 关掉就能当布局用，也可以嵌套。

```schema: scope="body"
type: table-view
border: false
trs:
  - background: "#feceea"
    tds:
      - colspan: 2
        align: center
        body:
          type: tpl
          tpl: 头部
  - tds:
      - rowspan: 2
        background: "#fef1d2"
        width: 200
        body:
          type: tpl
          tpl: 侧边
      - align: center
        background: "#a9fdd8"
        body:
          type: tpl
          tpl: 右上
  - height: 200
    tds:
      - align: center
        background: "#d7f8ff"
        body:
          type: table-view
          border: false
          trs:
            - tds:
                - align: center
                  body:
                    type: tpl
                    tpl: 栏目 1
                - align: center
                  body:
                    type: tpl
                    tpl: 栏目 2
                - align: center
                  body:
                    type: tpl
                    tpl: 栏目 3
  - tds:
      - colspan: 2
        align: center
        background: "#cec5fa"
        body:
          type: tpl
          tpl: 底部
```

## 属性表

表格：

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"table-view"` | 指定为 table-view 渲染器 |
| width | `number/string` | `'100%'` | 表格宽度 |
| padding | `number/string` | `var(--TableCell-paddingY) var(--TableCell-paddingX)` | 单元格默认内间距 |
| border | `boolean` | true | 是否显示边框 |
| borderColor | `string` | `var(--borderColor)` | 边框颜色 |
| caption | `string` | | 标题文本 |
| captionSide | `'top' \| 'bottom'` | `'top'` | 标题位置 |
| trs | `TrObject[]` | | 行 |
| cols | `ColObject[]` | | 列样式 |

行：`height` / `background` / `tds` / `visibleOn` / `hiddenOn`。

单元格：`background` / `color` / `bold` / `width` / `padding` / `align` / `valign` / `colspan` / `rowspan` / `body` / `style` / `visibleOn`。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `className` 打在宿主 `div.vamis-node`，不是 `<table>`。
- 文档里带表单开关的 `visibleOn` 示例改成了 page 数据，避免对照打 `/api/mock2/form/saveForm`。
