---
title: CRUD 增删改查
outline: deep
---

# CRUD 增删改查

::: info 实现进度 50% · 进行中
api/分页/filter/排序/批量/弹窗编辑有；无 `loadDataOnce`/`syncLocation`/`quickEdit`/`matchFunc`（D10，设计标 P1，组件仍 P0）
:::

`crud` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。下面示例打 `/api/mock2/sample`，和介绍页同一套 mock。

## 基本用法

```schema: height=420
type: page
title: crud
body:
  - type: crud
    name: sample
    syncLocation: false
    api: /api/mock2/sample
    perPage: 8
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
            reload: sample
            body:
              - type: input-text
                name: engine
                label: 渲染引擎
              - type: input-text
                name: browser
                label: Browser
    columns:
      - name: id
        label: ID
      - name: engine
        label: 渲染引擎
      - name: browser
        label: Browser
      - name: grade
        label: 等级
      - type: operation
        label: 操作
        buttons:
          - type: button
            label: 删除
            actionType: ajax
            confirmText: 确认删除？
            api: "delete:/api/mock2/sample/${id}"
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
