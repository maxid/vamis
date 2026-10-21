---
title: 调试
---

# 调试

kernel **D8** 预留诊断通道，未落地。现在可以：

- Playground 的 **IR** Tab 看规范化后的信封
- 浏览器 Vue / Pinia devtools 看 hub store
- 未知 type 会渲染占位，而不是白屏

不要对 schema 做 `eval` 来「方便调试」。
