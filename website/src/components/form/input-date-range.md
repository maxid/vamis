---
title: InputDateRange 日期范围
outline: deep
---

# InputDateRange 日期范围

::: info 实现进度 80% · 进行中
主路径已对齐：双输入框 + 区间日历、`valueFormat` / `displayFormat` / `delimiter`、默认值与相对值、`shortcuts`（预设 + `{n}daysago` 等 + 表达式对象）、`embed` 内嵌、`extraName` 存两个字段、`clearable`、静态展示；`change` / `focus` / `blur`，`clear` / `reset` / `focus` / `setValue` 动作。缺 `transform` / `minDuration` / `maxDuration` / `timeFormat` 级处理。
:::

`input-date-range` 选择一个日期区间。属于普通表单项，通用属性见 [FormItem](./formitem)。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: select
    label: 日期范围
```

## 默认值

`value` 可以是 `,` 分隔的存储值（默认 `valueFormat: X`，即秒级时间戳）：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: date
    label: 日期范围
    value: "1659283200,1661961599"
```

也可以是相对值，例如最近一周：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: date
    label: 日期范围
    value: "today,+1weeks"
```

支持的相对值关键字：`today`、`day/days`、`week/weeks`、`month/months`、`year/years`。

复杂区间可以用公式或 `shortcuts` 表达；Vamis 公式插值同样可用（如 `${DATEMODIFY(NOW(), -1, 'month')}`）。

## 快捷键

`shortcuts` 支持预设字符串、`{n}daysago` / `{n}weekslater` 等，以及 `{label,startDate,endDate}` 表达式对象：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: select
    label: 日期范围
    shortcuts:
      - 7daysago
      - 15dayslater
      - 2weeksago
      - 1weekslater
      - thismonth
      - 2monthsago
      - 3monthslater
```

预设包括：`today` / `yesterday` / `tomorrow` / `prevweek` / `thisweek` / `thismonth` / `prevmonth` / `prevquarter` / `thisquarter` / `thisyear` / `lastYear`。

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: select
    label: 自定义快捷键
    shortcuts:
      - label: 1天前
        startDate: "${DATEMODIFY(NOW(), -1, 'day')}"
        endDate: "${NOW()}"
      - label: 本月
        startDate: "${STARTOF(NOW(), 'month')}"
        endDate: "${ENDOF(NOW(), 'month')}"
```

## 内嵌模式

`embed: true` 时不上输入框，直接把区间日历画在页面上：

```schema: scope="body"
type: form
body:
  - type: input-date-range
    name: date
    label: 内嵌日期范围
    embed: true
```

## 存成两个字段

默认存一个字段、用 `delimiter` 分隔；配置 `extraName` 后开始/结束分别存两个字段：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: begin
    extraName: end
    label: 日期范围
```

## 数据处理函数

> 3.5.0+ 的 `transform` / `timeFormat` 会把起止时间对齐到天 / 小时 / 分钟 / 秒。Vamis 默认按天处理（开始 00:00:00、结束 23:59:59），`transform` 自定义函数**未接**，复杂场景请用公式或提交前处理。

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `valueFormat` / `format` | `string` | `X` | 存储格式（`X` 为秒级时间戳） |
| `displayFormat` / `inputFormat` | `string` | `YYYY-MM-DD` | 输入框展示格式 |
| `delimiter` | `string` | `,` | 单字段存储时的分隔符 |
| `extraName` | `string` | | 结束时间另存的字段名 |
| `placeholder` | `string` | `请选择日期范围` | 占位文案 |
| `shortcuts` | `string \| string[] \| object[]` | | 快捷选项 |
| `minDate` / `maxDate` | `string` | | 可选范围（日期级） |
| `minDuration` / `maxDuration` | `string` | | **未接** |
| `timeFormat` | `string` | | **未接**（默认按天对齐） |
| `transform` | `string` | | **未接** |
| `utc` | `boolean` | `false` | 是否 UTC |
| `clearable` | `boolean` | `true` | 可清除 |
| `embed` | `boolean` | `false` | 内嵌日历 |
| `static` | `boolean` | | 静态展示为 `开始 ~ 结束` |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: string` 组件的值 | 区间变化时触发 |
| `focus` | `[name]: string` 组件的值 | 输入框聚焦 |
| `blur` | `[name]: string` 组件的值 | 输入框失焦 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | - | 清空 |
| `reset` | - | 重置为初始值（或 `resetValue`） |
| `setValue` | `value: string` 区间，用 `,` 分隔 | 更新区间 |
| `focus` | - | 聚焦 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: date
    id: clear_range
    label: 日期
    value: "1714060800,1714319999"
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_range
```

### reset

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: date
    id: reset_range
    label: 日期
    value: "1714060800,1714319999"
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset_range
```

### setValue

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: date
    id: setvalue_range
    label: 日期
    value: "1714060800,1714319999"
  - type: button
    label: 赋值
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: setvalue_range
            args:
              value: "1714060800,1714492799"
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：双输入框 + 区间日历、`valueFormat` / `displayFormat`、默认值 / 相对值、`shortcuts`、`embed`、`extraName`、`clearable`、`change` / `focus` / `blur`、`clear` / `reset` / `setValue`。
- 未接：`transform`、`timeFormat` 级对齐、`minDuration` / `maxDuration`；跨月范围高亮只标开始日。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
