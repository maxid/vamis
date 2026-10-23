---
title: 辅助类-响应式设计
---

# 辅助类-响应式设计

::: warning 实现进度 45% · 进行中
`m:`（&lt;768px）和 `pc:`（≥768px）已接到间距、宽高、display / flex、语义色，以及 `text-red-500` / `text-blue-500`。Amis helper 会对整份色盘生成设备前缀；Vamis SDK 还没有全矩阵。Playground 里其它 Tailwind 类可加 `m:` / `pc:`（`@custom-variant`）。
:::

Amis helper 只分两档。什么前缀都不加，就是所有宽度都生效；`m:` 只给手机；`pc:` 只给桌面。

对齐 Amis 的写法：桌面蓝、手机红——把窗口缩到 &lt;768px 再看。

```schema: scope="body"
type: tpl
className: text-blue-500 m:text-red-500
tpl: 这段文字在 pc 端是蓝色的，在移动端则是红色的。
```

间距（`m-t-xs`）和宽高（`w-full` / `h-full`）同一套前缀：

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
