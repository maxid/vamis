---
title: PaginationWrapper 分页容器
outline: deep
---

# PaginationWrapper 分页容器

::: info 实现进度 90% · 进行中
文档主路径已对齐：`inputName` / `outputName` 客户端切片、`perPage`、`position`（top / bottom / none）、内嵌 `pagination`、`currentPage` / `lastPage` 下发。缺 `themeCss`；CRUD `loadDataOnce` 仍属 D10。
:::

分页容器，对已有列表做客户端切片。默认读作用域里的 `items`，切完写回 `outputName`（默认也是 `items`）。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽。

## 基本用法

输入 / 输出字段名都是 `rows`，每页 2 条。子表 `source: ${rows}` 拿到的是当前页。

```schema
{
  "type": "page",
  "data": {
    "rows": [
      { "engine": "Trident", "version": "7" },
      { "engine": "Gecko", "version": "1.8" },
      { "engine": "Webkit", "version": "522" },
      { "engine": "Presto", "version": "2.1" }
    ]
  },
  "body": {
    "type": "pagination-wrapper",
    "inputName": "rows",
    "outputName": "rows",
    "perPage": 2,
    "body": {
      "type": "table",
      "title": "分页表格",
      "source": "${rows}",
      "columns": [
        { "name": "engine", "label": "Engine" },
        { "name": "version", "label": "Version" }
      ]
    }
  }
}
```

同一段也可以写成 YAML：

```schema
type: page
data:
  rows:
    - engine: Trident
      version: "7"
    - engine: Gecko
      version: "1.8"
    - engine: Webkit
      version: "522"
    - engine: Presto
      version: "2.1"
body:
  type: pagination-wrapper
  inputName: rows
  outputName: rows
  perPage: 2
  body:
    type: table
    title: 分页表格
    source: ${rows}
    columns:
      - name: engine
        label: Engine
      - name: version
        label: Version
```

Amis 文档里常见写法是外层 `service` 拉 `/api/mock2/crud/table`，再把 `rows` 交给分页容器。字段语义相同；对照用例用上面这份静态数据，避免远程接口把树结点值冲掉。

## 分页位置

`position` 默认 `top`。`bottom` 把页码放到内容下面；`none` 不渲染内嵌分页，需要自己在 `body` 里放 `pagination`。

```schema
type: page
data:
  items:
    - label: 甲
    - label: 乙
    - label: 丙
    - label: 丁
body:
  type: pagination-wrapper
  perPage: 2
  position: bottom
  showPageInput: true
  body:
    type: each
    name: items
    items:
      type: tpl
      tpl: "<p>${label}</p>"
```

没有 `body` 时显示「请配置内容」。子内容还能读 `${currentPage}` / `${lastPage}`。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"pagination-wrapper"` | 指定为 Pagination-Wrapper 渲染器 |
| showPageInput | `boolean` | `false` | 内嵌 pagination 是否显示快速跳转 |
| maxButtons | `number` | `5` | 内嵌 pagination 最多几个页码按钮 |
| inputName | `string` | `"items"` | 输入字段名 |
| outputName | `string` | `"items"` | 切片后下发的字段名 |
| perPage | `number` | `10` | 每页条数 |
| position | `'top'` \| `'bottom'` \| `'none'` | `"top"` | 分页位置 |
| body | SchemaNode | | 内容区域 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-PaginationWrapper` 前缀；用 `data-vamis-pagination-wrapper` 转写右对齐页码与 `gap-sm` 间距。
- `themeCss` 未接。CRUD `loadDataOnce` / `syncLocation`（D10）不是本组件的客户端切片。
