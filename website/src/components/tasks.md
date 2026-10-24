---
title: Tasks 任务操作集合
outline: deep
---

# Tasks 任务操作集合

::: info 实现进度 80% · 进行中
文档主路径已对齐：`items` 的 `label` / `key` / `status` 0–5 / `remark`、列名、状态文案、就绪「上线」与可重试「重试」。缺 `checkApi` 轮询、`submitApi` / `reSubmitApi` 真提交、备注 HTML。
:::

任务操作集合。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`status`：0 未开始、1 就绪、2 进行中、3 出错不可重试、4 已完成、5 出错可重试。没写 `submitApi` 时按钮只展示，不发请求。

## 基本用法

```schema: scope="body"
type: tasks
name: tasks
items:
  - label: hive 任务
    key: hive
    status: 4
    remark: 日志
  - label: 小流量
    key: partial
    status: 4
  - label: 全量
    key: full
    status: 4
```

## 状态

六个状态都会画出对应文案。就绪有「上线」，可重试有「重试」。

```schema: scope="body"
type: tasks
name: tasksStatus
items:
  - label: 未开始
    key: s0
    status: 0
  - label: 就绪
    key: s1
    status: 1
  - label: 进行中
    key: s2
    status: 2
  - label: 出错
    key: s3
    status: 3
    remark: 不可重试
  - label: 已完成
    key: s4
    status: 4
  - label: 可重试
    key: s5
    status: 5
    remark: 可重试
```

## 列名

```schema: scope="body"
type: tasks
name: tasksCols
taskNameLabel: 任务名称
statusLabel: 状态
remarkLabel: 备注说明
operationLabel: 操作
btnText: 上线
retryBtnText: 重试
items:
  - label: hive 任务
    key: col
    status: 5
    remark: 日志
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"tasks"` | 指定为任务列表 |
| `name` | `string` | | 也可从数据域读同名数组 |
| `items` | `Array` | | `label` / `key` / `status` / `remark` |
| `items[x].status` | `number` | `0` | 0–5 |
| `taskNameLabel` | `string` | `任务名称` | 名称列 |
| `statusLabel` | `string` | `状态` | 状态列 |
| `remarkLabel` | `string` | `备注说明` | 备注列 |
| `operationLabel` | `string` | `操作` | 操作列 |
| `btnText` | `string` | `上线` | 就绪按钮 |
| `retryBtnText` | `string` | `重试` | 可重试按钮 |
| `statusTextMap` | `string[]` | 未开始…出错 | 状态文案 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不接 `checkApi` 轮询、`submitApi` / `reSubmitApi`；备注按文本，不插 HTML。
- 视觉走 shadcn Table / Badge，不是 cxd Tasks 皮肤。
