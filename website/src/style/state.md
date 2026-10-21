---
title: 状态
---

# 状态

::: info 实现进度 60% · 进行中
`--success` / `--warning` / `--info` / `--destructive` 与按钮 `level` 已对照。组件级状态皮肤（`status` type）仍走各自渲染器进度。
:::

后台要能一眼分开成功、警告、信息、错误。token 补齐了 `--success` / `--warning` / `--info`，不只靠 `--destructive`。

| 语义 | 按钮 level | token |
|------|------------|--------|
| 主操作 | `primary` | `--primary` |
| 危险 | `danger` | `--destructive` |
| 成功 | `success` | `--success` |
| 警告 | `warning` | `--warning` |
| 信息 | `info` | `--info` |

```schema
type: page
body:
  - type: alert
    level: success
    body: 保存成功
  - type: alert
    level: warning
    body: 即将超时
  - type: alert
    level: danger
    body: 接口失败
```
