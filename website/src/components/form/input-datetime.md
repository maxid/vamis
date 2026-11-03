---
title: InputDatetime 日期时间选择器
outline: deep
---

# InputDatetime 日期时间选择器

::: info 实现进度 58% · 进行中
`input-date` 别名，已接日期+时分秒选择；时分秒约束与移动端 picker 未齐
:::

`input-datetime` 与 `input-date` 同一渲染器。默认展示 `YYYY-MM-DD HH:mm:ss`，提交值默认 unix 秒。完整快捷键 / 限制范围见 [InputDate](./input-date)。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-datetime
    name: datetime
    label: 日期时间
```
