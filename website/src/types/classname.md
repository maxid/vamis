---
title: ClassName
---

# ClassName

`className` 支持字符串、对象和模板。内核 `resolveClassName` 在 `SchemaRenderer` 上统一落地。

```yaml
type: tpl
className: m-t-md text-sm
tpl: 间距走 cxd gap 阶
```

对象 + 表达式（数据变了 class 跟着变）：

```schema
type: page
data:
  status: 1
body:
  - type: radios
    name: status
    label: 状态
    options:
      - label: 离线
        value: 1
      - label: 在线
        value: 2
  - type: tpl
    className:
      text-danger: ${status == 1}
      text-success: ${status == 2}
    tpl: 当前状态 ${status}
```

`text-danger` 会映到 `text-destructive`。`m:` / `pc:` 前缀作用在 gap 辅助类上（手机 / 桌面）。主题色请改 token 或 `cssVars`。
