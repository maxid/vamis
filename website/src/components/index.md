---
title: 组件介绍
---

# 组件介绍

组件文档的侧栏分类与 Amis 中文文档相同：

| 分类 | 典型 type |
|------|-----------|
| 布局 | `page` `tabs` `grid` `flex` |
| 功能 | `action` `service` `nav` |
| 数据输入 | `form` 与表单项 |
| 数据展示 | `crud` `table` `tpl` `chart` |
| 反馈 | `dialog` `drawer` `toast` `alert` |
| 其他 | `wizard` `avatar` |

每页结构：

1. **实现进度**（标题正下方；来自组件 P0 TODO，已注册 ≠ 已完成）
2. **可运行的 YAML / JSON**（` ```schema ` 代码块会实时渲染）
3. **常用属性**
4. 与 Amis 的差异（YAML、IR、未落地的 kernel）

类型 / 概念 / 开始 / 样式 / 扩展页同样在标题下显示实现进度和完成状态。

从 [Page](/components/page)、[Form](/components/form/)、[CRUD](/components/crud) 看主路径。
