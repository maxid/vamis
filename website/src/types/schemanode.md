---
title: SchemaNode
---

# SchemaNode

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
