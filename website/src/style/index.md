---
title: 样式系统
---

# 样式系统

::: info 实现进度 65% · 进行中
token 对照、helper 间距/宽度、默认自适应已接。`xxxClassName` / `registerTheme` 仍是 D12 P1。
:::

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

水标：14px 字、32px 控件、4px 圆角、状态色能分开。字体走 Amis `--fonts-base-family` 系统栈，不嵌入 webfont。

**默认自适应**：page / form / 表单控件不写 `size`、不写 `w-full` 就吃满布局槽。`size: sm` 这类才是可选收窄。

页面级覆盖可以写在 widget 的 `cssVars`，也可以写在 IR `metadata.style`（编译时合并进 page）。

```schema
type: page
cssVars:
  --primary: "#1d4ed8"
body:
  - type: tpl
    className: m-t-xs text-muted-foreground
    tpl: 下面第一行没写 size，默认铺满。辅助类 m-t-xs 用的是 --gap-xs（4px）。
  - type: form
    mode: horizontal
    body:
      - type: input-text
        name: fill
        label: 默认
        description: "不写 size：吃满值列，随容器伸缩"
      - type: input-text
        name: short
        label: 可选短框
        size: sm
        description: "size sm 才钉 --form-control-width-sm（160px，≥576px）"
      - type: input-text
        name: long
        label: 可选长框
        size: lg
  - type: button
    label: 被 cssVars 染色
    level: primary
```
