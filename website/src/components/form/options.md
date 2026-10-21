---
title: Options 选择器表单项
---

# Options 选择器表单项

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
| `source` | 远程选项（D3 未齐） |
| `multiple` | 多选 |
| `joinValues` / `extractValue` | 值形状，部分落地 |
| `labelField` / `valueField` | 字段映射 |

树形、级联、穿梭器都走这套字段名。远程联动等 `source` 随表单其它字段变化，要等 API 管线。
