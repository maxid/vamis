---
title: 数据域与数据链
---

# 数据域与数据链

Amis 里每个能取数的容器（`page` / `service` / `form` / `crud` / `dialog`）有自己的数据域，子节点通过 `__super` 链回父域。vamis 设计里这是 **kernel D1**，**尚未落地**。

当前实现：多数节点把父 `data` 浅拷贝进自己。表达式能读到顶层字段，但：

- 没有隔离的自域，表单改值可能污染页面
- CRUD filter 和列表行数据容易串
- 没有 `__super`、没有 `page` 的 URL 种子

```schema
type: page
data:
  name: 页面级
body:
  - type: form
    body:
      - type: static
        name: name
        label: 当前能读到
```

计划：显式 Scope + Pinia hub 上的节点 store，先打通 `page` / `service` / `form` / `crud`。组件页里写「被 D1 挡住」指的就是这件事。
