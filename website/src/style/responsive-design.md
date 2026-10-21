---
title: 响应式
---

# 响应式

Amis helper 用 `m:`（移动）和 `pc:`（桌面）前缀改 className。Vamis 把这列为样式 **P1（D12）**，尚未解析。

现在可以：

- 直接写 Tailwind：`className: "max-md:block md:flex"`
- Grid 的 `md` span（部分落地）

不要在 YAML 里写 `m:p-none` 并期望生效。
