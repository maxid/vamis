---
title: Action 动作
---

# Action 动作

::: info 实现进度 60% · 进行中
常用 `actionType`（ajax / dialog / drawer / toast / link / confirm）能跑；ajax 已走 `requestApi`。控制流、`toast.items` 文档主路径、其余动作仍缺。
:::

`type: action`（别名 `button`）是可点击节点。常用 `actionType`：

| actionType | 现状 |
|------------|------|
| `ajax` | 走 `requestApi`；qsOptions / 全局 adaptor 仍 P1 |
| `dialog` / `drawer` | OverlayHost 能弹出 |
| `toast` | 能弹出；`toast.items` 文档主路径未齐 |
| `link` / `url` | 走 `env.jumpTo` |
| `confirm` | 走 `env.confirm` |
| 其余 | 占位或忽略 |

```schema
type: page
body:
  - type: button
    label: 主要
    level: primary
    actionType: toast
    msg: 已点击
  - type: button
    label: 打开弹窗
    actionType: dialog
    dialog:
      title: 说明
      body:
        type: tpl
        tpl: 对话框内容
```

`level` 映射到 shadcn `variant`：`primary` → `default`，`danger` → `destructive`。
