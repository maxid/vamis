---
title: 样式系统
---

# 样式系统

Amis 用主题包（cxd / antd / dark）+ helper.css。Vamis **不搬这些文件**。对照表：

| Amis | Vamis |
|------|--------|
| `--body-bg` | `--background` |
| `--primary` | `--primary` |
| `--Form-input-height` 32px | `--control-h` |
| `--gap-xs…xl` 4/8/12/16/20/24 | 同名 token |
| `m-t-xs` / `p-l-md` | 同一套 gap 辅助类 |
| `level: primary` | `variant="default"` |
| `.cxd-Button` | 禁止 |

水标：14px 字、32px 控件、4px 圆角、状态色能分开。字体 IBM Plex。

页面级覆盖可以写在 widget 的 `cssVars`，也可以写在 IR `metadata.style`（编译时合并进 page）。

```schema
type: page
cssVars:
  --primary: "#1d4ed8"
body:
  - type: tpl
    className: m-t-xs text-muted-foreground
    tpl: 辅助类 m-t-xs 用的是 --gap-xs（4px），不是另一套间距。
  - type: form
    mode: horizontal
    body:
      - type: input-text
        name: short
        label: 短框
        size: sm
        description: "size sm maps to --form-control-width-sm (160px)"
      - type: input-text
        name: long
        label: 长框
        size: lg
  - type: button
    label: 被 cssVars 染色
    level: primary
```
