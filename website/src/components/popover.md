---
title: PopOver 弹出提示
outline: deep
---

# PopOver 弹出提示

::: info 实现进度 90% · 进行中
文档主路径已对齐 Amis 同名页：不是独立 type，挂在 `static` / `table` 列 / `tpl` / list·cards 字段；基本配置 CRUD 截断 + 精简写法、在其它组件里 form / list / cards、`trigger` / `showIcon` / `title` / `position`、`popOverEnableOn`。浮层走 `VamisOverlay` + `--popover-layer-*`。表格列相对整格 `td` 居中；CRUD 底栏默认 `statistics` + 页码。缺 CRUD header 像素、list 其余皮肤。
:::

popover 不是一个独立组件，它是嵌入到其它组件中使用的，目前可以在以下组件中配置

- table 的 column
- list 的 column
- static
- cards 里的字段

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本配置

比如在 CRUD 的 tpl 中，可以默认截断显示，然后加上 popOver 来显示全部内容

```schema: scope="body"
type: crud
api: /api/mock2/sample?waitSeconds=1
columns:
  - type: tpl
    name: engine
    label: Rendering engine
    tpl: ${engine|truncate:6}
    popOver: ${engine}
```

字符串精简写法等于 `{ body: "…" }`。更早写法是 `"popOver": { "body": "$engine" }`。

## 在其它组件里的示例

```schema: scope="body"
- type: form
  body:
    - name: static
      type: static
      label: 静态展示
      value: static
      popOver: 弹出内容
- type: service
  api: /api/mock2/sample?perPage=5
  body:
    type: list
    source: $rows
    listItem:
      body:
        - type: hbox
          columns:
            - label: Engine
              name: engine
              popOver: 弹出内容
- type: service
  api: /api/mock2/sample?perPage=5
  body:
    type: cards
    source: $rows
    card:
      body:
        - label: Engine
          name: engine
          popOver: 弹出内容
```

## 更多配置

可以配置触发条件，是否显示 icon，title 等，具体请参考后面的配置列表

```schema: scope="body"
type: crud
api: /api/mock2/sample?waitSeconds=1
columns:
  - type: tpl
    name: engine
    label: Rendering engine
    tpl: ${engine|truncate:6}
    popOver:
      trigger: hover
      position: left-top
      showIcon: false
      title: 标题
      body:
        type: tpl
        tpl: ${engine}
```

## popOverEnableOn

可以给列上配置 `popOverEnableOn` 属性，该属性为[表达式](/concepts/expression)，通过表达式配置当前行是否启用 `popOver` 功能。

```schema: scope="body"
type: crud
api: /api/mock2/sample?waitSeconds=1
columns:
  - name: id
    label: ID
    popOver:
      body:
        type: tpl
        tpl: ${id}
    popOverEnableOn: this.id == 1
  - name: engine
    label: Rendering engine
    popOver:
      body:
        type: tpl
        tpl: ${engine}
```

## 属性列表

- `mode` 可配置成 `popOver`、`dialog` 或者 `drawer`。默认为 `popOver`。
- `size` 当配置成 `dialog` 或者 `drawer` 的时候有用。
- `position` 配置弹出位置，只有 `popOver` 模式有用，默认是 `center`（浮层盖在触发器上）。

  可选参数：

  - `center`
  - `left-top`
  - `right-top`
  - `left-bottom`
  - `right-bottom`

  atX-atY-myX-myY，即：对齐目标的位置-对齐自己的位置

  - `left-top-right-bottom` 在目标位置的左上角显示。
  - `left-center-right-center` 在目标的左侧显示，垂直对齐。
  - …

  固定位置

  - `fixed-center`
  - `fixed-left-top`
  - `fixed-right-top`
  - `fixed-left-bottom`
  - `fixed-right-bottom`

- `offset` 默认 `{top: 0, left: 0}`，如果要来一定的偏移请设置这个。
- `trigger` 触发弹出的条件。可配置为 `click` 或者 `hover`。默认为 `click`。只有 `textOverflow: ellipsis`、没写 `popOver` 时默认 hover。
- `showIcon` 是否显示图标。默认会有个放大形状的图标出现在列里面。如果配置成 false，则触发事件出现在列上就会触发弹出。
- `title` 弹出框的标题。
- `body` 弹出框的内容。
- `textOverflow`：`ellipsis` 单行省略，超出才弹出；`noWrap` 不换行且不弹。
- `popOverEnableOn` 表达式，当前行是否启用。
- `popOverEnable` / `popOverEnabled` 为 false 时关掉。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 活示例打同一份 `/api/mock2/sample`（本仓 mock 约 60 条 / 6 页，Amis 文档站约 110 条 / 11 页，页码数量会差一截）。CRUD 默认底栏已接 `statistics` + `Pagination`；导出 / 新增需写进 `headerToolbar`。
- 文档未单独演示 `textOverflow` 活示例（Amis 同名页也没有这一节），能力已接，写在属性表。
