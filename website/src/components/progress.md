---
title: Progress 进度条
outline: deep
---

# Progress 进度条

::: info 实现进度 85% · 进行中
`mode` line / circle / dashboard、`value`、`map` 颜色（单色 / 数组 / 阈值对象）、`strokeWidth`、`gapDegree` / `gapPosition`、`showLabel` / `valueTpl`、`stripe` / `animate`、`placeholder`、`reset` / `setValue` 动作。阈值刻度（`threshold`）暂未接。
:::

进度条展示百分比进度。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
body:
  type: progress
  value: 60
```

## 颜色映射

`map` 支持单色、字符串数组（按分段取色）或 `{value,color}` 阈值数组：

```schema
type: page
body:
  - type: progress
    value: 40
    map: "#F96D3E"
  - type: divider
  - type: progress
    value: 60
    map: [bg-danger, bg-success]
  - type: divider
  - type: progress
    value: 20
    mode: circle
    map:
      - value: 30
        color: "#007bff"
      - value: 60
        color: "#fad733"
```

## 圆形进度条

```schema
type: page
body:
  type: progress
  value: 60
  mode: circle
```

## 仪表盘进度条

`gapDegree` 控制缺口角度，`gapPosition` 预留位置（默认底部）：

```schema
type: page
body:
  type: progress
  value: 60
  mode: dashboard
  gapDegree: 22
  gapPosition: bottom
```

## 设置线条宽度

```schema
type: page
body:
  - type: progress
    value: 60
    mode: line
    strokeWidth: 4
  - type: divider
  - type: progress
    value: 60
    mode: line
    strokeWidth: 12
  - type: divider
  - type: progress
    value: 60
    mode: dashboard
    strokeWidth: 12
```

## 自定义格式输出内容

`valueTpl` 支持 `${value}` 模板；`showLabel: false` 隐藏文本：

```schema
type: page
body:
  - type: progress
    mode: circle
    value: 60
    valueTpl: "${value}个"
  - type: divider
  - type: progress
    value: 60
    showLabel: false
```

## 阈值（刻度）

`threshold` 在进度条上画刻度线（line 模式），`showThresholdText` 同时展示刻度文本：

```schema
type: page
body:
  type: progress
  value: 60
  threshold:
    - value: "30%"
      color: red
    - value: "90%"
      color: blue
  showThresholdText: true
```

圆 / 仪表盘模式暂不画刻度线。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `number` / 模板 | `0` | 当前进度 0–100 |
| `mode` | `"line" \| "circle" \| "dashboard"` | `line` | 展示模式 |
| `map` | `string \| string[] \| {value,color}[]` | | 颜色映射 |
| `strokeWidth` | `number` | `8` | 线条宽度 |
| `gapDegree` | `number` | `75`（dashboard） | 缺口角度 |
| `gapPosition` | `string` | `bottom` | 缺口位置 |
| `showLabel` | `boolean` | `true` | 显示进度文本 |
| `valueTpl` | `string` | | 进度文本模板 |
| `stripe` | `boolean` | `false` | 条纹 |
| `animate` | `boolean` | `true` | 动画 |
| `threshold` | `{value,color}[]` | | 刻度线（line 模式） |
| `showThresholdText` | `boolean` | `false` | 展示刻度文本 |
| `placeholder` | `string` | | 无值占位 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `reset` | - | 重置为 0 |
| `setValue` | `args.value` | 更新进度 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 已接：三种模式、颜色映射、线宽、缺口、文本模板、条纹 / 动画、reset/setValue。
- `threshold` / `showThresholdText` 已接 line 模式；圆 / 仪表盘刻度线与 `gapPosition` 精确弧线偏移未接。
