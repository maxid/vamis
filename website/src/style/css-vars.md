---
title: CSS 变量
---

# CSS 变量

主题切暗色 = 换 `:root` / `.dark` 变量，不是换 class 前缀。

常用 token：

| 变量 | 用途 |
|------|------|
| `--background` / `--foreground` | 画布与正文 |
| `--card` | 面板 |
| `--primary` | 主色、主按钮 |
| `--destructive` | 危险（Amis `danger`） |
| `--success` / `--warning` / `--info` | 状态色 |
| `--border` / `--input` / `--ring` | 线、输入、聚焦 |
| `--control-h` | 控件高度 |
| `--radius` | 默认 0.25rem |

`page.cssVars` 写到页面根 style。别名会映射到 shadcn 名（例如 Amis `--primary`）。实现见 `@vamis/ui` 的 `resolveCssVars`。
