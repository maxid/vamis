---
title: 联动
---

# 联动

::: info 实现进度 70% · 进行中
`visibleOn` / `hiddenOn` / `disabledOn` 能用；select `source` 已接 url / `trackExpression` 自动刷新。D5 P0：动态 `target`、逗号多目标、`name?a=${a}` 数据携带已接；SDK `getComponentByName` / `doAction` 可调用。表单路径值 `xxx.yyy` 仍等 D6。
:::

联动是「A 变了，B 跟着变」：`visibleOn`、选项 `source`、级联 `select`、CRUD 的 `filter`、动作 `target`。

当前能用的主路径：

- `visibleOn` / `hiddenOn` / `disabledOn` 表达式
- 表单项改值走 Scope；select `source` 支持 url / `trackExpression` 自动刷新
- 动作 `reload` / `setValue` 的 `target`：静态名、`${who}` 动态名、`form1,form2` 多目标、`list?a=${a}` 带数据

仍缺：

- 表单路径值 `xxx.yyy`（D6）

```schema
type: form
mode: horizontal
body:
  - type: switch
    name: more
    label: 显示备注
  - type: textarea
    name: remark
    label: 备注
    visibleOn: ${more}
```

刷新指定组件时，把目标写在动作的 `target`（或 `componentId`）上：

```schema
type: page
body:
  - type: service
    name: panel
    data:
      count: 0
    body:
      type: tpl
      tpl: count=${count}
  - type: button
    label: 加一
    onEvent:
      click:
        actions:
          - actionType: reload
            target: panel?count=1
```
