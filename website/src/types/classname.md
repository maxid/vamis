---
title: ClassName
---

# ClassName

::: info 实现进度 70% · 进行中
`resolveClassName` 已接字符串 / 对象 / 模板 / `m-t-xs` / `w-*` / `m:` `pc:`。`xxxClassName` 打到子节点、`registerTheme` 仍是 D12 P1。
:::

`className` 支持字符串、对象和模板。内核 `resolveClassName` 在 `SchemaRenderer` 上统一落地。布局容器和表单控件**默认已经铺满**，不必为了宽度先写 `w-full`；`className` 只在要覆盖（半宽、间距、状态色）时写。

```yaml
type: tpl
className: m-t-md text-sm
tpl: 间距走 cxd gap 阶
```

对象 + 表达式（数据变了 class 跟着变）：

```schema
type: page
data:
  status: 1
body:
  - type: radios
    name: status
    label: 状态
    options:
      - label: 离线
        value: 1
      - label: 在线
        value: 2
  - type: tpl
    className:
      text-danger: ${status == 1}
      text-success: ${status == 2}
    tpl: 当前状态 ${status}
```

`text-danger` 会映到 `text-destructive`。`m:` / `pc:` 前缀作用在间距和宽度辅助类上（`m-t-xs`、`w-full` / `w-1/2`，手机 &lt;768px / 桌面 ≥768px）。主题色请改 token 或 `cssVars`。
