---
title: SchemaNode
---

# SchemaNode

::: info 实现进度 75% · 进行中
字符串 / 对象 / 数组节点都能渲染；完整 Schema 类型仍宽松，D7 注册信息（`scope` / `test` / `weight`）未齐。
:::

树节点的联合类型，和 Amis 一样宽松：

| 写法 | 含义 |
|------|------|
| 字符串 | 当成 `tpl` |
| 对象 | 必须能 resolve `type` |
| 数组 | 多个子节点 |

```schema
type: page
body:
  - 纯字符串也会变成文本
  - type: divider
  - type: button
    label: 对象节点
```
