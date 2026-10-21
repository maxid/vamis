---
title: 事件动作
---

# 事件动作

Amis 2.x 把交互写成 `onEvent`：组件事件 → 动作列表。Vamis 设计是 **D4**（事件对象 + 动作注册表）。

现状：部分 `actionType` 走精简 switch（`ajax` / `dialog` / `drawer` / `toast` / `link`），没有完整事件对象、没有 `__rendererData`、没有控制流动作。

```schema
type: page
body:
  - type: button
    label: 保存
    onEvent:
      click:
        actions:
          - actionType: toast
            toast:
              items:
                - body: 已触发 onEvent
                  level: success
```

新动作应注册到动作表，不要在某个 Vue 文件里再开一条 `if (actionType === ...)`。
