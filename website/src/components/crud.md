---
title: CRUD 增删改查
outline: deep
---

# CRUD 增删改查

::: info 实现进度 58% · 进行中
文档介绍页用 `/api/mock2/sample` 真跑（筛选/批量/删除/重置）；`api` 按 `isApiOutdated` 刷新；`title` / `headerToolbar: []` 可用。无 `loadDataOnce`/`syncLocation`/`quickEdit`/`matchFunc`（D10）
:::

`crud` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

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

## 常用属性

| 属性 | 说明 |
|------|------|
| `type` | 组件种类，与 Amis 同名 |
| `className` | 附加 class；Vamis 走 Tailwind，暂不解析 `m:` / `pc:` |
| `visibleOn` / `hiddenOn` | 显隐表达式 |
| `onEvent` | 事件到动作（D4 精简，尚未事件对象） |
| `data` | 静态数据，当前多与父级浅合并 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）和事件对象（D4）尚未落地，高级示例可能与 Amis 官网行为不一致。
