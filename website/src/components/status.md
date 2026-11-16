---
title: Status 状态
outline: deep
---

# Status 状态

::: warning 实现进度 75% · 进行中
默认状态列表（成功 / 失败 / 运行中 / 排队中 / 调度中 / 警告 / 信息）、`value` / `name`、`map`（图标）、`labelMap`（文本）、`source` 自定义（label / icon / color / className）、`placeholder`。文档按 Amis 章节重写。
:::

状态展示，一般放在 Table / List 列中表示状态。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: status
value: 1
```

## 默认状态列表

| value | 文本 | 图标 |
|-------|------|------|
| `1` | （无，只有图标） | 对勾 |
| `0` | （无，只有图标） | 叉号 |
| `success` | 成功 | 对勾 |
| `fail` | 失败 | 叉号 |
| `pending` | 运行中 | 转圈 |
| `queue` | 排队中 | 警告 |
| `schedule` | 调度中 | 时钟 |
| `warning` | 警告 | 警告 |
| `info` | 信息 | 信息 |

```schema: scope="body"
type: table
data:
  items:
    - value: "success"
    - value: "pending"
    - value: "queue"
    - value: "fail"
columns:
  - name: value
    label: 状态
    type: status
```

## 自定义状态图标、文本、颜色

`source` 用对象定义每个状态的展示，`label` 支持模板：

```schema: scope="body"
type: status
value: unusual
source:
  normal:
    label: 正常
    icon: fa fa-check-circle
    color: "#30bf13"
  unusual:
    label: 异常
    icon: fa fa-times-circle
    color: "#f00"
```

## 使用 map / labelMap

`map` 覆盖图标，`labelMap` 覆盖文本：

```schema: scope="body"
type: status
value: "2"
map:
  "2": fa fa-heart
labelMap:
  "2": 喜欢
```

## 动态数据

`name` 从数据域取值，配合 Table / List 使用：

```schema: scope="body"
type: status
name: state
data:
  state: pending
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `any` | | 状态值；不写时用 `name` 映射 |
| `name` | `string` | | 数据域字段名 |
| `map` | `object` | | 值 → 图标 |
| `labelMap` | `object` | | 值 → 文本 |
| `source` | `object` | | 自定义 `{label, icon, color, className}` |
| `placeholder` | `string` | `-` | 无匹配时的占位 |
| `className` | `string` | | 外层 class |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：默认状态、`map` / `labelMap`、`source` 自定义、`placeholder`。
- 图标名映射到 Font Awesome 常用图标；非默认 `fa-*` 依赖宿主字体。
