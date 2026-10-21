---
title: 编辑器
---

# 编辑器

::: warning 实现进度 35% · 进行中
可视化骨架：树 / 画布点选拖拽 / 属性 / Schema。不是 amis-editor，没有插件市场。
:::

`@vamis/editor` 是可视化骨架：组件树、画布预览、属性面板、YAML 与 JSON。不是 amis-editor，没有插件市场。

本地：`pnpm dev` 后打开 `/editor`。

作者态仍然是 YAML；编辑器只是另一种写入方式。选中节点改属性，应回写 schema 字段名（与 Amis 相同），不要发明平行配置。
