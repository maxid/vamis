---
title: Options 选择器表单项
---

# Options 选择器表单项

::: warning 实现进度 35% · 进行中
无统一 OptionsControl；`source` / `autoComplete` / `joinValues` 各控件自实现。select `source` 已接 url / `trackExpression`。
:::

选择类控件共用 `options` / `source` / `labelField` / `valueField` / `multiple`。

```schema
type: form
mode: horizontal
body:
  - type: select
    name: status
    label: 状态
    options:
      - label: 在线
        value: online
      - label: 离线
        value: offline
```

| 属性 | 说明 |
|------|------|
| `options` | 静态选项 |
| `source` | 远程选项（select 已接 url / `trackExpression`） |
| `multiple` | 多选 |
| `joinValues` / `extractValue` | 值形状，部分落地 |
| `labelField` / `valueField` | 字段映射 |

树形、级联、穿梭器都走这套字段名。select 的 `source` 已能随 url / `trackExpression` 重拉；其它选择器尚未统一。
