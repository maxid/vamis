---
title: InputDate 日期
outline: deep
---

# InputDate 日期

::: info 实现进度 92% · 进行中
主路径已对齐 Amis：日历点选、`format` / `inputFormat`（及 `valueFormat` / `displayFormat`）、相对默认值、`minDate` / `maxDate`（固定 / 相对 / `$` 模板；日 / 月 / 年面板都禁范围外格子）、`shortcuts`（预设与表达式）、`utc`、`embed`、`clearable`、`change` / `focus` / `blur` 与 `clear` / `reset` / `setValue`。弹层 Teleport 到 body（`popOverContainerSelector` / `getModalContainer`），z-index 1000，贴底按 Amis `placement: auto` 向上翻。日历层 240×290，DatePicker-popover 242×292（padding 0）。与 `type: calendar` 共用月历面板。弹层走 `--cal-*`（底/边 alias Select 菜单，深色 `#17202d`）。窄屏默认滚轮 PopUp（320px 年/月/日 + 取消/确认；`input` 只读；无 shortcuts；进出对齐 Amis PopUp height 动画）。缺 `mobileCalendarMode: calendar` 滚动月历、日程 `schedules`。
:::

`input-date` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。同渲染器别名：`input-datetime` / `input-time`（薄别名，时间面板已接；窄屏默认滚轮已接；时分秒约束与 `mobileCalendarMode: calendar` 仍缺）。

## 基本用法

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
```

## 显示格式

选中任意日期，可以看到默认显示日期的格式是像 `2020-04-14` 这样。自定义显示格式配置 `inputFormat`（或 `displayFormat`）。

例如显示 `2020年04月14日`，查找 [dayjs 文档](https://day.js.org/docs/en/display/format)（格式令牌与 moment 相同）可知配置 `YYYY年MM月DD日`：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    inputFormat: YYYY年MM月DD日
```

选中任意日期，观察显示格式。

## 值格式

选中任意日期，默认表单项的值格式是像 `1591862818` 这样的时间戳（`format` 默认 `X`）。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
```

如果要存 `2020-04-14` 这样的值，配置 `format: YYYY-MM-DD`：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    format: YYYY-MM-DD
```

选中任意日期，观察数据域中表单项值的变化。

## 默认值

可以设置 `value`。

### 基本配置

配置符合当前值格式的默认值。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    value: '1591862818'
```

### 相对值

`value` 还支持 `+1days` 这样的相对值。下例默认选中明天。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    value: "+1days"
```

支持的相对值关键字：

- `today`：当前日期
- `day` 或 `days`：天
- `week` 或 `weeks`：周
- `month` 或 `months`：月
- `year` 或 `years`：年

### 通过公式配置默认值

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    value: "${DATEMODIFY(NOW(), 2, 'days')}"
```

## 限制范围

可以通过 `maxDate` 和 `minDate` 限制可选范围。点日历标题进入年、月视图时，范围外的年份和月份同样禁用。

### 固定时间值

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: start
    label: 开始时间
    minDate: '1591862818'
    description: 限制可选最小日期是 2020-06-11 16:06:58
  - type: input-date
    name: end
    label: 结束时间
    maxDate: '1591862818'
    description: 限制可选最大日期是 2020-06-11 16:06:58
```

### 支持相对值

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: start
    label: 开始时间
    minDate: "-1days"
    description: 限制可选最小日期是昨天
```

### 支持模板

开始时间不能大于结束时间，结束时间也不能小于开始时间。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: start
    label: 开始日期
    maxDate: $end
  - type: input-date
    name: end
    label: 结束日期
    minDate: $start
```

### 通过 js 来控制

`disabledDate` 是字符函数，签名 `(currentDate, props) => boolean`。字符串函数体只在 `env.trusted` 下编译（Playground / 对照页默认开）。

下例不允许选择周一、周六、周日：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: start
    label: 开始时间
    description: 限制不能选周一、周六、周日
    disabledDate: return currentDate.day() == 1 || currentDate.day() == 0 || currentDate.day() == 6
```

## 快捷键

配置 `shortcuts` 后，选择器顶部会显示快捷项。移动端滚轮 picker 不支持快捷键（对齐 Amis）。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    shortcuts:
      - yesterday
      - today
      - tomorrow
```

上例配置 `"shortcuts": ["yesterday", "today", "tomorrow"]`，选择器顶部会显示快捷键「昨天」「今天」和「明天」。

支持的快捷键：

- `today`：今天
- `yesterday`：昨天
- `thisweek`：本周一
- `thismonth`：本月初
- `prevmonth`：上个月初
- `prevquarter`：上个季节初
- `thisquarter`：本季度初
- `tomorrow`：明天
- `endofthisweek`：本周日
- `endofthismonth`：本月底
- `endoflastmonth`：上月底
- `{n}daysago`：n 天前，例如 `2daysago`
- `{n}dayslater`：n 天后
- `{n}weeksago`：n 周前
- `{n}weekslater`：n 周后
- `{n}monthsago`：n 月前
- `{n}monthslater`：n 月后
- `{n}quartersago`：n 季度前
- `{n}quarterslater`：n 季度后

快捷键也支持表达式对象：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 日期
    shortcuts:
      - label: 前天
        date: "${STARTOF(DATEMODIFY(NOW(), -2, 'day'))}"
      - yesterday
      - today
```

## UTC

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-date
    name: date
    label: 普通日期
    format: YYYY-MM-DD
  - type: input-date
    name: date-utc
    label: UTC日期
    utc: true
    format: YYYY-MM-DD
```

## 内嵌模式

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: static-date
    name: date
    label: 当前值
  - type: input-date
    name: date
    label: 日期
    embed: true
```

## 原生日期组件

原生日期走 `native-date`（`input-text` 别名），使用浏览器实现，只支持 `min` / `max` / `step`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: native-date
    name: date
    label: 日期
```

## 属性表

除了支持 [普通表单项属性表](./formitem) 中的配置以外，还支持下面一些配置。

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| value | `string` | | 默认值。相对值 / 公式见上文 |
| valueFormat | `string` | `X` | 提交值格式，覆盖 `format` |
| displayFormat | `string` | `YYYY-MM-DD` | 展示格式，覆盖 `inputFormat` |
| closeOnSelect | `boolean` | `true` | 点选日期后是否马上关闭 |
| placeholder | `string` | `"请选择日期"` | 占位文本 |
| shortcuts | `string \| string[] \| Array<{label, date}>` | | 快捷键；对象可写表达式 |
| minDate | `string` | | 最小日期 |
| maxDate | `string` | | 最大日期 |
| utc | `boolean` | `false` | 保存 utc 值 |
| clearable | `boolean` | `true` | 是否可清除 |
| embed | `boolean` | `false` | 是否内联模式 |
| disabledDate | `string` | | 哪些天不可点选（需 `env.trusted`） |
| popOverContainerSelector | `string` | | 弹层挂载位置选择器，会通过 `querySelector` 获取 |
| borderMode | `full \| half \| none` | `full` | 边框模式 |
| inputForbid | `boolean` | `false` | 禁止键盘输入 |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|------|------|------|
| change | `[name]: string` 组件的值 | 时间值变化时触发 |
| focus | `[name]: string` 组件的值 | 输入框获取焦点（非内嵌） |
| blur | `[name]: string` 组件的值 | 输入框失去焦点（非内嵌） |

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date
    name: date
    label: 日期
    onEvent:
      change:
        actions:
          - actionType: toast
            toast:
              items:
                - body: 选中 ${event.data.value}
```

## 动作表

| 动作名称 | 动作配置 | 说明 |
|------|------|------|
| clear | - | 清空 |
| reset | - | 将值重置为初始值；配置了 `resetValue` 则用它 |
| setValue | `value: string` | 更新数据，依赖 `format` |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date
    name: date
    label: 日期
    id: clear_text
    value: '1714060800'
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_text
```

### reset

```schema: scope="body"
type: form
debug: true
body:
  - type: input-date
    name: date
    label: 日期
    id: reset_text
    value: '1714060800'
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
  - type: input-date
    name: date
    label: 日期
    id: setvalue_text
    value: '1714060800'
  - type: button
    label: 赋值
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: setvalue_text
            args:
              value: '1714233600'
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 默认值、`minDate` / `maxDate`、快捷键与文档主路径一致；`disabledDate` 字符串函数仅 `env.trusted`。
- 日期弹层盒模型对齐 Amis：`.rdt.rdtStatic.rdtOpen` 240×290，`.DatePicker-popover` padding 0、边框 `--cal-border`（浅色 `#f2f3f5`）、select-outer 阴影。深色弹层走 `--cal-bg`（alias `--select-menu-bg` `#17202d`），不要写死 `#fff`。
- 窄屏默认滚轮 PopUp 已接（`max-width: 768px` 或显式 `mobileUI`；320px、年/月/日[+时分秒]、取消/确认；focus 从底部 height 滑入、blur 滑出）。未接：`mobileCalendarMode: calendar` 滚动月历、选择器内 `schedules` 日程。
- `input-datetime` / `input-time` 是同一渲染器的薄别名；桌面时间仍是时分秒下拉，窄屏走同一套滚轮。
- Amis 属性表把 `closeOnSelect` 写成默认 `false`，源码 `defaultProps` 是 `true`；Vamis 跟源码。
