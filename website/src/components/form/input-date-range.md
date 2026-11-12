---
title: InputDateRange 日期范围
outline: deep
---

# InputDateRange 日期范围

::: info 实现进度 90% · 进行中
主路径已对齐：双输入框 + 左右双月历、区间高亮、快捷条、桌面取消/确认、`valueFormat` / `displayFormat` / `delimiter`、默认值与相对值、公式区间、`shortcuts`、`embed`、`extraName`、`minDuration` / `maxDuration`、`timeFormat` 对齐、`transform`（`env.trusted`）。缺 `animation` 游标动画、`popOverContainerSelector`、窄屏 CalendarMobile。
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

通过 `value` 设置默认值，除了实际值，比如

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: date
    label: 日期范围
    value: "1659283200,1661961599"
```

还可以是相对值，比如最近一周内

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: date
    label: 日期范围
    value: "today,+1weeks"
```

支持的相对值关键字有：

- `today`: 当前日期
- `day` 或 `days`: 天
- `week` 或 `weeks`: 周
- `month` 或 `months`: 月
- `year` 或 `years`: 年

或者用公式来配置复杂情况，比如本周一到周日

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: date
    label: 日期范围
    value: "${DATETOSTR(DATEMODIFY(STARTOF(NOW(), 'week'), 1, 'day'), 'X') + ',' + DATETOSTR(DATEMODIFY(ENDOF(NOW(), 'week'), '1', 'day'), 'X')}"
```

> 因为默认周日是第一天，所以需要往后加一天

再看个上月第一天到上月最后一天的例子

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: date
    label: 日期范围
    value: "${DATETOSTR(STARTOF(DATEMODIFY(NOW(), -1, 'month'), 'month'), 'X') + ',' + DATETOSTR(ENDOF(DATEMODIFY(NOW(), -1, 'month'), 'month'), 'X')}"
```

## 快捷键

`shortcuts` 属性支持自定义快捷选择日期范围快捷键

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

支持的快捷键有

- `today`: 今天
- `yesterday`: 昨天
- `tomorrow`: 明天
- `prevweek`: 上周
- `thisweek`: 这个周
- `thismonth`: 本月
- `prevmonth`: 上个月
- `prevquarter`: 上个季度
- `thisquarter`: 这个季度
- `thisyear`: 今年
- `lastYear`: 去年
- `{n}daysago`: 最近 n 天，例如：`7daysago`，下面用法相同
- `{n}dayslater`: n 天以内
- `{n}weeksago`: 最近 n 周
- `{n}weekslater`: n 周以内
- `{n}monthsago`: 最近 n 月
- `{n}monthslater`: n 月以内
- `{n}quartersago`: 最近 n 季度
- `{n}quarterslater`: n 季度以内
- `{n}yearsago`: 最近 n 年
- `{n}yearslater`: n 年以内

快捷键也支持使用表达式的写法，可以使用这种方式自定义快捷键

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: select
    label: 日期范围
    shortcuts:
      - label: 1天前
        startDate: "${DATEMODIFY(NOW(), -1, 'day')}"
        endDate: "${NOW()}"
      - label: 1个月前
        startDate: "${DATEMODIFY(NOW(), -1, 'months')}"
        endDate: "${NOW()}"
      - label: 本季度
        startDate: "${STARTOF(NOW(), 'quarter')}"
        endDate: "${ENDOF(NOW(), 'quarter')}"
```

## 内嵌模式

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: input-date-range
    name: date
    label: 日期范围
    embed: true
```

## 存成两个字段

默认日期范围存储一个字段，用 `delimiter` 分割，如果配置 `extraName` 则会存两个字段。

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

默认情况下，日期范围选择器组件的绑定值的开始时间为所选时间当天的 0 点，结束时间为所选时间当天的 23 时 59 分 59 秒 999 毫秒。如果设置了 `timeFormat`（时间格式），则会基于 `timeFormat` 配置决定**最小时间单位**，举例：

- 不设置 `timeFormat`，默认按照天(day)级处理：开始 `00:00:00.000`，结束 `23:59:59.999`
- `timeFormat` 为 `"HH:mm:ss"`，按秒(second)级处理
- `timeFormat` 为 `"HH:mm"`，按分钟(minute)级处理
- `timeFormat` 为 `"HH"`，按小时(hour)级处理

部分情况下，即使配置 `timeFormat` 也无法满足需求，此时可以使用 `transform` 函数对时间值做进一步处理。函数签名：`(value, config, props, data, moment) => moment`。`config.type` 为 `start` / `end`。文档预览与对照页开了 `trusted` 才会编译字符串函数体。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date-range
    name: range1
    label: 日期范围（默认）
    valueFormat: YYYY-MM-DDTHH:mm:ss[Z]
  - type: input-date-range
    name: range2
    label: 日期范围（使用transform函数）
    valueFormat: YYYY-MM-DDTHH:mm:ss[Z]
    transform: "const now = moment(); if (config.type === 'end') {value.set({hours: now.hours(), minutes: now.minutes(), seconds: now.seconds(), milliseconds: now.milliseconds()})}; return value;"
```

上面的示例使用 `transform` 函数，将结束时间的值设置为当前时间。

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `valueFormat` / `format` | `string` | `X` | 存储格式（`X` 为秒级时间戳） |
| `displayFormat` / `inputFormat` | `string` | `YYYY-MM-DD` | 输入框展示格式 |
| `delimiter` | `string` | `,` | 单字段存储时的分隔符 |
| `extraName` | `string` | | 结束时间另存的字段名 |
| `placeholder` | `string` | `请选择日期范围` | 占位文本（未写 `startPlaceholder` 时开始框回落此文案；结束框默认「结束时间」） |
| `startPlaceholder` | `string` | `开始时间` | 开始时间占位符 |
| `endPlaceholder` | `string` | `结束时间` | 结束时间占位符 |
| `shortcuts` | `string \| string[] \| object[]` | `yesterday,7daysago,prevweek,thismonth,prevmonth,prevquarter` | 日期范围快捷键 |
| `minDate` / `maxDate` | `string` | | 限制最小 / 最大日期 |
| `minDuration` / `maxDuration` | `string` | | 限制最小 / 最大跨度，如 `2days` / `1year` |
| `timeFormat` | `string` | | 决定起止对齐的最小时间单位 |
| `transform` | `string` | | 选择后的数据处理函数，返回 Moment 兼容对象；需 `env.trusted` |
| `utc` | `boolean` | `false` | 是否 UTC |
| `clearable` | `boolean` | `true` | 可清除 |
| `embed` | `boolean` | `false` | 内嵌日历 |
| `animation` | `boolean` | `true` | **未接** 游标动画 |
| `popOverContainerSelector` | `string` | | **未接** 弹层挂载选择器 |
| `static` | `boolean` | | 静态展示为 `开始 ~ 结束` |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: string` 组件的值 | 区间变化时触发 |
| `focus` | `[name]: string` 组件的值 | 输入框聚焦（非内嵌） |
| `blur` | `[name]: string` 组件的值 | 输入框失焦（非内嵌） |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | - | 清空 |
| `reset` | - | 重置为初始值（或 `resetValue`） |
| `setValue` | `value: string` 区间，用 `,` 分隔 | 更新区间 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: date
    id: clear_text
    label: 日期
    value: "1714060800,1714319999"
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_text
```

### reset

如果配置了 `resetValue`，则重置时使用 `resetValue` 的值，否则使用初始值。

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: date
    id: reset_text
    label: 日期
    value: "1714060800,1714319999"
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset_text
```

### setValue

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date-range
    name: date
    id: setvalue_text
    label: 日期
    value: "1714060800,1714319999"
  - type: button
    label: 赋值
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: setvalue_text
            args:
              value: "1714060800,1714492799"
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：双输入框 + 左右双月历、区间高亮、快捷条、桌面取消/确认、`valueFormat` / `displayFormat`、默认值 / 相对值 / 公式、`shortcuts`、`embed`、`extraName`、`minDuration` / `maxDuration`、`timeFormat` 对齐、`transform`（trusted）。
- 未接：`animation` 游标动画、`popOverContainerSelector`、窄屏 `CalendarMobile`（不要用滚动月历冒充默认）。
- `transform` 第五参是 Moment 兼容包装（底层 dayjs）；文档预览已开 trusted。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
