---
title: Action 动作
---

# Action 动作

`type: action`（别名 `button`）是可点击节点。常用 `actionType`：

| actionType | 现状 |
|------------|------|
| `ajax` | 能发，缺完整 adaptor / 反馈映射 |
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
