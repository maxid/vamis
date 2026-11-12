---
title: CRUD 增删改查
outline: deep
---

# CRUD 增删改查

::: info 实现进度 78% · 进行中
文档介绍页用 `/api/mock2/sample` 真跑（筛选/批量/删除/重置）；`api` 按 `isApiOutdated` 刷新；`title` / `headerToolbar: []` 可用。补 `loadDataOnce` / `syncLocation` / 文本 quickEdit；缺 `matchFunc`（D10）
:::

`crud` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
title: crud
body:
  - type: crud
    syncLocation: false
    api: /api/mock2/sample
    headerToolbar:
      - type: button
        label: 新增
        level: primary
        actionType: dialog
        dialog:
          title: 新增
          body:
            type: form
            api: /api/mock2/sample
            body:
              - type: input-text
                name: name
                label: 名称
    columns:
      - name: id
        label: ID
      - name: name
        label: 名称
        searchable: true
      - name: status
        label: 状态
```

## 快速编辑

列配 `quickEdit: true` 出现编辑笔，就地改单元格，失焦/Enter 写回并派发 `quickEdit`：

```yaml
type: crud
api: /api/mock2/sample
columns:
  - name: id
    label: ID
  - name: name
    label: 名称
    quickEdit: true
```

## 同步地址栏

`syncLocation: true` 时从 URL 读取 `page` / `perPage`，切页 / 改每页条数后写回地址栏（`history.replaceState`，不新增历史）：

```yaml
type: crud
syncLocation: true
api: /api/mock2/sample
columns:
  - name: id
    label: ID
  - name: name
    label: 名称
```

## 只请求一次

`loadDataOnce: true` 时首次按 `page=1, perPage=999999` 拉全量，之后切页 / 改每页条数只在本地分页；筛选变化会重新拉取：

```yaml
type: crud
loadDataOnce: true
api: /api/mock2/sample
columns:
  - name: id
    label: ID
  - name: name
    label: 名称
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `type` | 组件种类，与 Amis 同名 |
| `loadDataOnce` | 一次拉全量后本地分页（默认 `false`） |
| `columns[].quickEdit` | 单元格就地编辑（当前文本） |
| `syncLocation` | 从 URL 同步 page / perPage（默认 `false`） |
| `className` | 附加 class；Vamis 走 Tailwind，暂不解析 `m:` / `pc:` |
| `visibleOn` / `hiddenOn` | 显隐表达式 |
| `onEvent` | 事件到动作（D4 精简，尚未事件对象） |
| `data` | 静态数据，当前多与父级浅合并 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 已接 `loadDataOnce` / `syncLocation` / 文本 quickEdit；`matchFunc`（D10）仍未接。
