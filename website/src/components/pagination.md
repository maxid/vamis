---
title: Pagination 分页
outline: deep
---

# Pagination 分页

::: info 实现进度 90% · 进行中
文档主路径已对齐：`layout`、`mode`（normal / simple）、`size: sm`、`maxButtons`、`total` / `perPage` / `activePage`、`showPerPage` / `showPageInput`、`ellipsisPageGap`、`change` 事件。缺 `themeCss`、移动端 `mobileUI`。
:::

分页。对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

`layout` 控制部件顺序。有 `total` 时会按 `perPage` 重算总页数。

```schema: scope="body"
{
    "type": "pagination",
    "layout": "total,perPage,pager,go",
    "mode": "normal",
    "activePage": 2,
    "lastPage": 99999,
    "total": 999,
    "perPage": 10,
    "maxButtons": 7,
    "showPerPage": true,
    "perPageAvailable": [10, 20, 50, 100],
    "showPageInput": true,
    "disabled": false
}
```

点「编辑 Schema」可切 JSON。

```schema: scope="body"
type: pagination
layout: total,perPage,pager,go
activePage: 2
total: 999
perPage: 10
maxButtons: 7
showPerPage: true
showPageInput: true
```

## 微型模式

`size: sm` 把页码按钮收到 24px。

```schema: scope="body"
{
    "type": "pagination",
    "layout": "total,perPage,pager,go",
    "mode": "normal",
    "activePage": 1,
    "total": 999,
    "perPage": 10,
    "maxButtons": 7,
    "showPerPage": true,
    "perPageAvailable": [10, 20, 50, 100],
    "showPageInput": true,
    "size": "sm"
}
```

## 简洁模式

`mode: simple` 只显示左右箭头和当前页。配合 `hasNext` 使用。

```schema: scope="body"
{
    "type": "pagination",
    "mode": "simple",
    "activePage": 2,
    "hasNext": true
}
```

## 事件表

可通过 `onEvent` 监听以下事件，动作里用 `${event.data.page}` / `${event.data.perPage}`。

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| change | `page: number` 当前页<br/>`perPage: number` 每页条数 | 页码或每页条数改变时 |

点页码会派发 `change`。和表格联动时，用 `setValue` 把 `event.data.page` 写回 service 数据域（与 Amis 文档同构）：

```yaml
type: service
id: service_01
data:
  page: 1
body:
  - type: table
    source: $rows
    columns:
      - name: engine
        label: Engine
  - type: pagination
    activePage: ${page}
    lastPage: 8
    onEvent:
      change:
        actions:
          - actionType: setValue
            componentId: service_01
            args:
              value:
                page: ${event.data.page}
```

JSON 同等有效。`activePage: ${page}` 会跟着数据域走。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"pagination"` | 指定为 Pagination 渲染器 |
| mode | `normal` \| `simple` | `normal` | `simple` 只显示左右箭头，配合 `hasNext` |
| layout | `string` \| `string[]` | `["pager"]` | 部件顺序：`total` / `perPage` / `pager` / `go` |
| maxButtons | `number` \| `string` | `5` | 最多显示多少个分页按钮 |
| total | `number` \| `string` | | 总条数。有值时按 `perPage` 重算总页数 |
| activePage | `number` \| `string` | `1` | 当前页 |
| perPage | `number` \| `string` | `10` | 每页条数 |
| showPerPage | `boolean` | false | 是否展示 perPage 切换器；`layout` 也能控制 |
| size | `'sm'` \| `'md'` | `md` | 组件尺寸 |
| ellipsisPageGap | `number` \| `string` | `5` | 点 `...` 时前进/后退的页数 |
| perPageAvailable | `number[]` | `[10, 20, 50, 100]` | 每页可选条数 |
| showPageInput | `boolean` | false | 是否显示快速跳转；`layout` 也能控制 |
| disabled | `boolean` | false | 是否禁用 |
| hasNext | `boolean` | | 简洁模式是否还有下一页 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Pagination` 前缀；用 `data-vamis-pagination` 转写页码按钮与 layout 槽。
- `themeCss`、移动端 `mobileUI` 未接。别名 `pager` 已注册。
