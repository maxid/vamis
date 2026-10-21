---
title: Control 表单项包裹
---

# Control 表单项包裹

::: warning 实现进度 40% · 进行中
已按 type 注册，只做标签 + 错误位包裹。非常规控件优先直接用表单项 type。
:::

Amis 的 `type: control` 用来把任意组件包进表单项外壳（标签 + 错误位）。Vamis 按同名 type 注册；非常规控件优先直接用表单项 type。

需要「左边标签、右边是自定义节点」时再写 `control`，并给 `name` 以便进表单数据。
