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

横向 `mode: horizontal` 时：桌面（≥576px）标签右对齐、宽 `--form-label-width`（98px）；窄屏标签约 28%、控件吃剩下的。

**默认不写 `size`**：控件铺满值列。`size` 是可选收窄：`xs` / `sm` / `md` / `lg` 对应 80 / 160 / 240 / 320px，只在 ≥576px 钉死，并带 `max-width: 100%`。`full` 与默认铺满同效果，留给 inline / 多列剩余。

```schema: scope="form-item"
- type: input-text
  name: name
  label: 名称
  description: 没写 size，默认铺满
- type: input-text
  name: code
  label: 短码
  size: sm
```
