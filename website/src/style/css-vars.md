---
title: CSS 变量
---

# CSS 变量

::: info 实现进度 65% · 进行中
`:root` / `.dark`、`page.cssVars` 与 IR `cssVars` 能改画布、主色、控件高、间距。Amis 盒子名会映射到 Vamis token。完整 Amis 变量表未一一对照；`registerTheme` 仍是 D12 P1。
:::

主题切暗色 = 换 `:root` / `.dark` 变量，不是换 class 前缀。`page.cssVars` 与 IR `metadata.style.cssVars` 都会写到根节点 style。实现见 `@vamis/core` 的 `resolveCssVars`。

## 颜色

| 变量 | 用途 |
|------|------|
| `--background` / `--foreground` | 画布与正文 |
| `--card` / `--card-foreground` | 面板 |
| `--primary` / `--primary-foreground` | 主色、主按钮 |
| `--secondary` / `--muted` | 次要底 |
| `--destructive` | 危险（Amis `danger`） |
| `--success` / `--warning` / `--info` | 状态色 |
| `--border` / `--input` / `--ring` | 线、输入、聚焦 |

Amis 名会映射过来：`--body-bg` → `--background`，`--text-color` → `--foreground`，`--borderColor` → `--border`。

## 尺寸

| 变量 | 用途 |
|------|------|
| `--control-h` | 控件高度（水标 32px）。Amis `--Form-input-height` 映射到这里 |
| `--form-item-h` | 表单项行高（24px） |
| `--form-label-w` | 横排 label 宽（98px） |
| `--radius` | 默认圆角 0.25rem |
| `--gap-xs` … `--gap-xl` | 4 / 8 / 12 / 16 / 20 / 24，给 `m-t-xs` 等 helper 用 |
| `--table-cell-px` | 表单元格左右内边距。Amis `--TableCell-paddingX` 映射到这里 |
| `--font-sans` / `--font-mono` | 正文 / 等宽。`--fonts-base-family` 会映到 `--font-sans` |

```schema
type: page
cssVars:
  --primary: "#1d4ed8"
  --control-h: "36px"
  --radius: "0.5rem"
body:
  - type: form
    body:
      - type: input-text
        name: a
        label: 文本
      - type: button
        label: 主按钮
        level: primary
```
