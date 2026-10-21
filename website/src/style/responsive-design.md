---
title: 响应式
---

# 响应式

Amis helper 的 `m:`（&lt;768px）和 `pc:`（≥768px）前缀，Vamis 只接到 **gap 辅助类**（`m-t-xs` / `p-l-md` 这一套）。

```yaml
type: tpl
className: m:m-t-xs pc:m-t-lg
tpl: 手机紧、桌面松
```

其它布局仍可直接写 Tailwind：`className: "max-md:block md:flex"`。Grid 的 `md` span 部分落地。
