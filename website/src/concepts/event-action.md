---
title: 事件动作
---

# 事件动作

::: info 实现进度 75% · 进行中
kernel D4 P0 已接：`VamisEvent`（`preventDefault` / `stopPropagation` / `setData` / `__rendererData`）、动作走注册表。SDK `doAction` 已接。控制流（switch / loop / parallel）仍缺。
:::

Amis 2.x 把交互写成 `onEvent`：组件事件 → 动作列表。Vamis 设计是 **D4**（事件对象 + 动作注册表），P0 已接。

现状：常用 `actionType`（`ajax` / `dialog` / `drawer` / `toast` / `link` / `reload` / `setValue`）走注册表并带完整事件对象；SDK `doAction` 可从外部触发。控制流动作还没齐。

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
