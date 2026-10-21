---
title: 联动
---

# 联动

联动是「A 变了，B 跟着变」：`visibleOn`、选项 `source`、级联 `select`、CRUD 的 `filter`。

当前能用的主路径：

- `visibleOn` / `hiddenOn` / `disabledOn` 表达式
- 表单项改值触发重渲染（依赖浅合并的 data，不是 Scope）

被挡住的：

- 动态 `target` 刷新指定组件（D5）
- 选项 `source` 随其它字段重拉（D3）
- 表单路径值 `xxx.yyy`（D6）

```schema
type: form
mode: horizontal
body:
  - type: switch
    name: more
    label: 显示备注
  - type: textarea
    name: remark
    label: 备注
    visibleOn: ${more}
```
