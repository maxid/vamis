---
title: 辅助类-响应式设计
---

# 辅助类-响应式设计

::: info 实现进度 55% · 进行中
`m:`（&lt;768px）和 `pc:`（≥768px）已接到间距和宽高辅助类。颜色 / display / flex 的 `m:` 前缀未做，那些类请用 Tailwind 断点 `max-md:` / `md:`。
:::

Amis helper 只分两档。什么前缀都不加，就是所有宽度都生效；`m:` 只给手机；`pc:` 只给桌面。

Vamis **间距**（`m-t-xs`）和 **宽高**（`w-full` / `h-full`）走同一套前缀：

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

颜色、显示隐藏、flex 方向还没有 `m:` / `pc:`。那些可以写 Tailwind 断点：

```schema
type: page
body:
  - type: tpl
    className: "max-md:text-destructive md:text-primary"
    tpl: 窄屏危险色，桌面主色
```
