---
title: 调试
---

# 调试

::: danger 实现进度 20% · 进行中
kernel D8 未落地。现在靠 Playground IR Tab、Vue/Pinia devtools、未知 type 占位。没有 `env.debug` 动作日志。
:::

kernel **D8** 预留诊断通道，未落地。现在可以：

- Playground 的 **IR** Tab 看规范化后的信封
- 浏览器 Vue / Pinia devtools 看 hub store
- 未知 type 会渲染占位，而不是白屏

不要对 schema 做 `eval` 来「方便调试」。

Amis 文档站右侧的 Debug 面板对应下面契约，Vamis **尚未接**。

Amis 内置了调试工具，可以查看组件内部运行日志，方便分析问题，目前在文档右侧就有显示。

## 开启方法

默认不会开启这个功能，可以通过下面三种方式开启：

1. render 的 env 里设置 `enableVamisDebug`。
1. 配置全局变量 `enableVamisDebug` 的值为 `true`，比如 `window.enableVamisDebug = true`。
1. 在页面 URL 参数中加上 `vamisDebug=1`，比如 `http://xxx.com/?vamisDebug=1`。

开启之后，在页面右侧就会显示。

## 目前功能

目前 Debug 工具提供了两个功能:

1. 运行日志，主要是 api 及数据转换的日志
2. 查看组件数据链，Debug 工具展开后，点击任意组件就能看到这个组件的数据链
