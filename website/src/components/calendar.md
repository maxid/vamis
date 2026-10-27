---
title: Calendar 日历日程
outline: deep
---

# Calendar 日历日程

::: info 实现进度 85% · 进行中
文档主路径已对齐：`value`、`schedules`、默认色循环、`largeMode` 跨日连条与格子样式、年/月滚轮、点击日程点弹出内容、`todayActiveStyle`。缺 change/click 事件与 setValue。
:::

日历里展示日程。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

设置 `schedules`。`value` 是 unix 秒，对应 2021 年 12 月。

```schema: scope="body"
type: calendar
value: "1638288000"
schedules:
  - startTime: "2021-12-11 05:14:00"
    endTime: "2021-12-11 06:14:00"
    content: 这是一个日程1
  - startTime: "2021-12-21 05:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程2
```

## 自定义颜色

`className` 参考背景色 helper。没写则按 `scheduleClassNames` 循环。

```schema: scope="body"
type: calendar
value: "1638288000"
schedules:
  - startTime: "2021-12-11 05:14:00"
    endTime: "2021-12-11 06:14:00"
    content: 这是一个日程1
    className: bg-success
  - startTime: "2021-12-21 05:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程2
    className: bg-info
```

## 自定义日程展示

点击日程点默认弹出「日程」表。也可以用 `scheduleAction` 换成抽屉等。

```schema: scope="body"
type: calendar
value: "1638288000"
schedules:
  - startTime: "2021-12-11 05:14:00"
    endTime: "2021-12-11 06:14:00"
    content: 这是一个日程1
  - startTime: "2021-12-21 05:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程2
scheduleAction:
  actionType: drawer
  drawer:
    title: 日程
    body:
      type: table
      columns:
        - name: time
          label: 时间
        - name: content
          label: 内容
      data: "${scheduleData}"
```

## 支持从数据源中获取日程

```schema
type: page
data:
  schedules:
    - startTime: "2021-12-11 05:14:00"
      endTime: "2021-12-11 06:14:00"
      content: 这是一个日程1
    - startTime: "2021-12-21 05:14:00"
      endTime: "2021-12-22 05:14:00"
      content: 这是一个日程2
body:
  type: calendar
  value: "1638288000"
  schedules: "${schedules}"
```

## 放大模式

```schema: scope="body"
type: calendar
value: "1638288000"
largeMode: true
schedules:
  - startTime: "2021-12-10 23:59:59"
    endTime: "2021-12-11 00:00:00"
    content: 这是一个日程1
  - startTime: "2021-12-12 00:00:00"
    endTime: "2021-12-13 00:00:01"
    content: 这是一个日程2
  - startTime: "2021-12-20 05:14:00"
    endTime: "2021-12-21 05:14:00"
    content: 这是一个日程3
  - startTime: "2021-12-21 05:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程4
  - startTime: "2021-12-22 02:14:00"
    endTime: "2021-12-23 05:14:00"
    content: 这是一个日程5
  - startTime: "2021-12-22 02:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程6
  - startTime: "2021-12-22 02:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程7
  - startTime: "2021-12-25 12:00:00"
    endTime: "2021-12-25 15:00:00"
    content: 这是一个日程8
```

## 今日高亮样式自定义

```schema: scope="body"
type: calendar
value: NOW()
todayActiveStyle:
  backgroundColor: "#ef4444 !important"
  color: "#f8f9fa"
  border: none
  borderRadius: 15px
schedules:
  - startTime: "2021-12-11 05:14:00"
    endTime: "2021-12-11 06:14:00"
    content: 这是一个日程1
  - startTime: "2021-12-21 05:14:00"
    endTime: "2021-12-22 05:14:00"
    content: 这是一个日程2
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"calendar"` | 指定为 calendar 渲染器 |
| value | `string` | | 当前月。unix 秒、日期字符串或 `NOW()` |
| schedules | `Array` 或 `string` | | 日程，静态或从上下文取 |
| scheduleClassNames | `string[]` | `['bg-warning', 'bg-danger', 'bg-success', 'bg-info', 'bg-secondary']` | 未写 className 时循环 |
| scheduleAction | SchemaNode | | 自定义日程展示。未写则弹出默认「日程」对话框 |
| largeMode | `boolean` | `false` | 放大模式，格子里直接出内容 |
| todayActiveStyle | `object` | | 今日格子的自定义样式 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不是表单项日期选择器，只做展示月历。click/change 事件、`setValue` 未接。
- Amis 同 type 挂在 InputDate embed 上。Vamis 用同一套周一 7 列紧凑月历（不用 helper `grid-cols-7`，那个 class 实际是 6 列）。顶栏用 SVG 箭头；点「2021年 / 12月」切年、月。窄屏是 取消/确认 滚轮：选月是「选择年月」两年列、当前项居中、无滚动条、上下渐浅。`largeMode` 跨日连条；点击日程点或放大格弹出内容。Calendar 默认没有时/分列（那是 `input-datetime`）。
