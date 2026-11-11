---
title: Radio 单选框
outline: deep
---

# Radio 单选框

::: info 实现进度 88% · 进行中
主路径已对齐：Combo 互斥、`trueValue` / `falseValue`、`option`、`change`、`clear` / `reset` / `setValue`。圆点 18 / 内点 10（`--radio-*`）。缺 `themeCss`；`input-table` 互斥未接。
:::

实现组合中的单选功能，此组件只有在 `combo` 和 `input-table` 中有意义。不是选项组（那是 [`radios`](./radios)）。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。JSON 同等有效。

## combo 中使用

`multiple` 组合里点某一行的 `radio`：当前行写成 `trueValue`，其余行写成 `falseValue`。Combo 接管写入时不再派发该控件自己的 `change`。

```schema: scope="body"
type: form
debug: true
data:
  answers:
    - isAnswer: false
      answer: 选项 1
    - isAnswer: false
      answer: 选项 2
body:
  - type: combo
    label: 可选答案
    name: answers
    multiple: true
    addable: true
    strictMode: false
    items:
      - type: radio
        name: isAnswer
        columnClassName: no-grow
      - type: input-text
        name: answer
        placeholder: 答案文案
```

## input-table 中使用

`input-table` 里的互斥 **未接**。下面示例仍可渲染单元格里的单个 radio，但不会像 Combo 那样整列互斥。

```schema: scope="body"
type: form
debug: true
data:
  answers:
    - isAnswer: false
      answer: 选项 1
    - isAnswer: false
      answer: 选项 2
      children:
        - isAnswer: false
          answer: 选项 1
        - isAnswer: false
          answer: 选项 2
body:
  - type: input-table
    label: 可选答案
    name: answers
    multiple: true
    addable: true
    strictMode: false
    columns:
      - label: ''
        type: radio
        name: isAnswer
      - label: 答案文案
        type: input-text
        name: answer
        placeholder: 答案文案
```

## 配置真假值

默认情况：

- 单选框勾选时，表单项值为：true
- 单选框取消勾选时，表单项值为：false

如果你想调整这个值，可以配置 `trueValue` 和 `falseValue`。

```schema: scope="body"
type: form
debug: true
data:
  answers:
    - isAnswer: false
      answer: 选项 1
    - isAnswer: false
      answer: 选项 2
body:
  - type: combo
    label: 可选答案
    name: answers
    multiple: true
    addable: true
    strictMode: false
    items:
      - type: radio
        name: isAnswer
        columnClassName: no-grow
        trueValue: 1
        falseValue: 0
      - type: input-text
        name: answer
        placeholder: 答案文案
```

## 属性表

除了支持 [普通表单项属性表](./formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8) 中的配置以外，还支持下面一些配置。

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| option | `string` | | 选项说明。未写时只画圆点，不补「选项」 |
| trueValue | `string` \| `number` \| `boolean` | `true` | 标识真值 |
| falseValue | `string` \| `number` \| `boolean` | `false` | 标识假值 |
| optionType | `default` \| `button` | `default` | 源码已接。`button` 选中是实心 `--primary` 底 + 反白字，不是勾选框那种透明 + 角标三角 |
| partial | `boolean` | `false` | 源码已接。部分选中态 |
| checked | `boolean` | | 源码已接。强制展示选中 |
| badge | [`BadgeObject`](/components/badge) | | 源码已接。`withBadge` 宿主；badge 文档主路径未列 radio |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听这些事件，并通过 `actions` 来配置执行的动作，在 `actions` 中可以通过 `${事件参数名}` 来获取事件产生的数据，详细请查看 [事件动作](/concepts/event-action)。

> `[name]` 表示当前组件绑定的名称，即 `name` 属性，如果没有配置 `name` 属性，则通过 `value` 取值。

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| change | `[name]: boolean` 组件的值 | 选中状态变化时触发。Combo 互斥写入时不派发 |

### change

```schema: scope="body"
type: form
debug: true
body:
  - type: radio
    name: radio
    onEvent:
      change:
        actions:
          - actionType: toast
            args:
              msg: ${event.data.value|json}
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定 `actionType: 动作名称`、`componentId: 该组件id` 来触发这些动作，动作配置可以通过 `args: {动作配置项名称: xxx}` 来配置具体的参数，详细请查看 [事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置 | 说明 |
| --- | --- | --- |
| clear | - | 清空（写成空串，不是 `falseValue`） |
| reset | - | 将值重置为初始值；配了 `resetValue` 才用它 |
| setValue | `value: string` \| `number` \| `boolean` 更新的值 | 更新数据 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: radio
    label: 选项
    name: type
    id: clear_type
    option: 选项说明
    value: true
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_type
```

### reset

如果配置了 `resetValue`，则重置时使用 `resetValue` 的值，否则使用初始值。

```schema: scope="body"
type: form
debug: true
body:
  - type: radio
    label: 选项
    name: type
    id: reset_type
    option: 选项说明
    value: false
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset_type
```

### setValue

```schema: scope="body"
type: form
debug: true
body:
  - type: radio
    label: 选项
    name: type
    id: setvalue_type
    option: 选项说明
    value: true
  - type: button
    label: 赋值
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: setvalue_type
            args:
              value: false
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `input-table` 单元格互斥 **未接**。
- `themeCss` **未接**。
- 不搬 shadcn `RadioGroup`；圆点走 `--radio-*`，不要用 checkbox 方盒或按钮角标冒充。
