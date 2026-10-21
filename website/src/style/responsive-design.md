---
title: 响应式
---

# 响应式

::: info 实现进度 55% · 进行中
`m:` / `pc:` 已接到间距和宽度辅助类。其它 helper（显示/隐藏、列数）未齐。
:::

Amis helper 只分两档：`m:`（&lt;768px）和 `pc:`（≥768px）。Vamis 接到 **间距**（`m-t-xs`）和 **宽度**（`w-full` / `w-1/2`）。

```schema
type: page
body:
  - type: tpl
    className: w-full pc:w-1/2 m:w-full bg-muted p-sm rounded-md
    tpl: 手机拉满，桌面一半
  - type: divider
  - type: tpl
    className: m:m-t-xs pc:m-t-lg
    tpl: 手机紧、桌面松
```

表单项默认吃满值列，不用写 `size`。`size: xs|sm|md|lg` 才是可选收窄：只在 **≥576px** 钉死档位（80/160/240/320），窄屏不钉、`max-width: 100%` 会缩。`size: full` 与默认铺满同效果，留给 inline / 多列剩余。

其它布局仍可直接写 Tailwind：`className: "max-md:block md:flex"`。Grid 的 `md` span 部分落地。
