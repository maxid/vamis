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
{
  "type": "tpl",
  "tpl": "下面是任务列表。"
}
```

```schema: scope="body"
{
  "type": "tasks",
  "name": "tasksJia",
  "items": [
    { "label": "hive 任务甲", "key": "hive-a", "status": 4, "remark": "日志甲" },
    { "label": "小流量甲", "key": "partial-a", "status": 4 },
    { "label": "全量甲", "key": "full-a", "status": 4 }
  ]
}
```

```schema: scope="body"
type: tasks
name: tasksYi
items:
  - label: hive 任务乙
    key: hive-b
    status: 4
    remark: 日志乙
  - label: 小流量乙
    key: partial-b
    status: 4
  - label: 全量乙
    key: full-b
    status: 4
```

## 状态

六个状态都会画出对应文案。就绪有「上线」，可重试有「重试」。

```schema: scope="body"
{
  "type": "tasks",
  "name": "tasksStatusJia",
  "items": [
    { "label": "未开始甲", "key": "s0-a", "status": 0 },
    { "label": "就绪甲", "key": "s1-a", "status": 1 },
    { "label": "进行中甲", "key": "s2-a", "status": 2 },
    { "label": "出错甲", "key": "s3-a", "status": 3, "remark": "不可重试甲" },
    { "label": "已完成甲", "key": "s4-a", "status": 4 },
    { "label": "可重试甲", "key": "s5-a", "status": 5, "remark": "可重试备注甲" }
  ]
}
```

```schema: scope="body"
type: tasks
name: tasksStatusYi
items:
  - label: 未开始乙
    key: s0-b
    status: 0
  - label: 就绪乙
    key: s1-b
    status: 1
  - label: 进行中乙
    key: s2-b
    status: 2
  - label: 出错乙
    key: s3-b
    status: 3
    remark: 不可重试乙
  - label: 已完成乙
    key: s4-b
    status: 4
  - label: 可重试乙
    key: s5-b
    status: 5
    remark: 可重试备注乙
```

## 列名

```schema: scope="body"
{
  "type": "tasks",
  "name": "tasksColsJia",
  "taskNameLabel": "名称甲",
  "statusLabel": "进度甲",
  "remarkLabel": "说明甲",
  "operationLabel": "动作甲",
  "btnText": "发布甲",
  "retryBtnText": "再试甲",
  "items": [
    { "label": "列表示例甲", "key": "col-a", "status": 1, "remark": "列备注甲" }
  ]
}
```

```schema: scope="body"
type: tasks
name: tasksColsYi
taskNameLabel: 名称乙
statusLabel: 进度乙
remarkLabel: 说明乙
operationLabel: 动作乙
btnText: 发布乙
retryBtnText: 再试乙
items:
  - label: 列表示例乙
    key: col-b
    status: 5
    remark: 列备注乙
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
