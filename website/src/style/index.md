---
title: 样式系统
---

# 样式系统

Amis 用主题包（cxd / antd / dark）+ helper.css。vamis **不搬这些文件**。对照表：

| Amis | vamis |
|------|--------|
| `--body-bg` | `--background` |
| `--primary` | `--primary` |
| `--Form-input-height` 32px | `--control-h` / `h-8` |
| `level: primary` | `variant="default"` |
| `.cxd-Button` | 禁止 |
| `m:` / `pc:` | 未接，用 Tailwind 断点 |

水标：14px 字、32px 控件、4px 圆角、状态色能分开（成功 / 警告 / 信息 / 错误）。字体 IBM Plex。

```schema
type: page
body:
  - type: button
    label: primary
    level: primary
  - type: button
    label: 默认
  - type: button
    label: 危险
    level: danger
  - type: button
    label: 成功
    level: success
```
