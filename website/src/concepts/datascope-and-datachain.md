---
title: 数据域与数据链
---

# 数据域与数据链

::: tip 实现进度 90% · 已完成
kernel D1 P0 已落地：容器（page / form / service / crud / dialog）建独立 Scope，子节点走 `__super`；page 用 URL query 做种子。CRUD filter 独立域（D10）、路径赋值（D6）仍缺。
:::

Amis 里每个能取数的容器（`page` / `service` / `form` / `crud` / `dialog`）有自己的数据域，子节点通过 `__super` 链回父域。Vamis 这是 **kernel D1**，P0 已接。

当前实现：

- 声明过的容器才新建子域，其它节点读父域
- 子节点通过 `__super` 链回父域
- `page` 把 URL 查询参数写进根域

仍缺：CRUD filter 独立作用域（D10）、表单路径值 `a.b[0].c`（D6）。

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
