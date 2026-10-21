---
title: FormItem 表单项通用
---

# FormItem 表单项通用

FormItem 不是独立 `type`，而是所有表单项共享的一层：标签、必填星号、错误、描述。

Vamis 把这层收在表单渲染器里，字段仍然用各自的 `type`（`input-text`、`select`…）。

| 属性 | 说明 |
|------|------|
| `name` | 数据路径。嵌套路径 D6 未齐，先用扁平字段 |
| `label` | 标签，可 `false` 隐藏 |
| `required` | 必填 |
| `desc` / `description` | 说明 |
| `validateOnChange` | 未完全对齐 |
| `validations` | 部分规则能跑 |

横向 `mode: horizontal` 时标签右对齐，这是后台水标的一部分。
