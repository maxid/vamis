---
title: InputTime 时间
outline: deep
---

# InputTime 时间

::: info 实现进度 55% · 进行中
`input-date` 别名，已接时间面板；滚轮 / 时间约束未齐
:::

`input-time` 与 `input-date` 同一渲染器。默认展示 `HH:mm`。完整快捷键 / 限制范围见 [InputDate](./input-date)。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-time
    name: time
    label: 时间
```
