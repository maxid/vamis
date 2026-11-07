---
title: Checkbox 勾选框
outline: deep
---

# Checkbox 勾选框

::: info 实现进度 90% · 进行中
主路径已对齐：`option` 与 `label` 分工、`trueValue`/`falseValue`、`optionType: button`（32×min 80、选中角标三角）、禁用/只读/静态、`change`、`clear`/`reset`/`setValue`、`badge`。盒模型转写 Amis `_checks.scss`（16×16 / 圆角 2 / 勾 14，`--checkbox-*`）。缺 themeCss 皮肤变量。
:::

用于实现勾选，功能和 [Switch](./switch) 类似，只是展现上不同。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

`label` 是表单项左边的标签；`option` 才是勾选框旁边的说明。

```schema: scope="body"
type: form
body:
  - name: checkbox
    type: checkbox
    label: 勾选框
    option: 选项说明
```

## 配置真假值

默认情况：

- 勾选框勾选时，表单项值为：true
- 勾选框取消勾选时，表单项值为：false

```schema: scope="body"
type: form
debug: true
body:
  - name: checkbox
    type: checkbox
    label: 勾选框
    option: 选项说明
```

如果你想调整这个值，可以配置 `trueValue` 和 `falseValue`。

```schema: scope="body"
type: form
debug: true
body:
  - name: checkbox
    type: checkbox
    label: 勾选框
    option: 选项说明
    trueValue: 1
    falseValue: 0
```

勾选上例中的勾选框，观察数据域变化，会发现勾选后值为 `1`，而取消勾选后为 `0`。

## 按钮模式

```schema: scope="body"
type: form
debug: true
body:
  - name: checkbox
    type: checkbox
    label: 勾选框
    trueValue: true
    falseValue: false
    optionType: button
    option: 选项说明
```

## 配置禁用 / 只读

`"disabled": true` 静态禁用，或用表达式 `disabledOn`。`readOnly` / `readOnlyOn` 不能改值，勾选框仍展示当前状态。

```schema: scope="body"
type: form
body:
  - type: checkbox
    name: normal
    label: 常规
    option: 选项说明
  - type: checkbox
    name: disabled
    label: 禁用
    option: 选项说明
    disabled: true
    value: true
  - type: checkbox
    name: readonly
    label: 只读
    option: 选项说明
    readOnly: true
    value: true
  - type: input-number
    name: number
    label: 数量
    value: 0
    description: 调整数量大小查看效果
  - type: checkbox
    name: locked
    label: 条件禁用
    option: 数量大于 1 时禁用
    disabledOn: this.number > 1
```

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持下面一些配置。

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| option | `string` / schema | | 选项说明。字符串走 tpl；对象走子渲染器 |
| trueValue | `string \| number \| boolean` | `true` | 标识真值 |
| falseValue | `string \| number \| boolean` | `false` | 标识假值 |
| optionType | `default \| button` | `default` | 设置 option 类型。`button` 是 32px 高、最小 80px 宽的描边钮，选中时左上角三角勾。选中 hover 变浅打在勾选图标本身（与 Select 菜单勾同一色号；深色主题变深） |
| checked | `boolean` | | 强制展示勾选，覆盖当前值比较 |
| partial | `boolean` | | 半选（indeterminate） |
| badge | `[BadgeObject](/components/badge)` | | 角标。Amis 文档主路径无示例，源码 `withBadge` 已接 |
| readOnly / `readOnlyOn` | `boolean` / 表达式 | | 只读，不能改值 |
| disabled / `disabledOn` | `boolean` / 表达式 | | 禁用 |

`label` 仍是 FormItem 标签，不要和 `option` 混用。`label: false` 去掉左边标签占位。

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听这些事件，并通过 `actions` 来配置执行的动作，在 `actions` 中可以通过 `${事件参数名}` 或 `${event.data.[事件参数名]}` 来获取事件产生的数据。

> `[name]` 表示当前组件绑定的名称，即 `name` 属性，如果没有配置 `name` 属性，则通过 `value` 取值。

| 事件名称 | 事件参数 | 说明 |
|------|------|------|
| change | `[name]: boolean` 组件的值 | 选中状态变化时触发 |

### change

```schema: scope="body"
type: form
debug: true
body:
  - name: checkbox
    type: checkbox
    label: 勾选框
    option: 选项说明
    onEvent:
      change:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.value|json}"
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定 `actionType: 动作名称`、`componentId: 该组件 id` 来触发这些动作。

| 动作名称 | 动作配置 | 说明 |
|------|------|------|
| clear | - | 清空 |
| reset | - | 将值重置为初始值。6.3.0 及以下版本为 `resetValue` |
| setValue | `value: string \| number \| boolean` 更新的值 | 更新数据 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: checkbox
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
  - type: checkbox
    label: 选项
    name: type
    id: reset_type
    option: 选项说明
    value: true
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
  - type: checkbox
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
- 盒模型按 Amis `_checks.scss` 落到 `--checkbox-*`（浅底 `#fff` / 深底 `#17202d`），不搬 `.cxd-Checkbox`。
- `badge` 已接（`BadgeHost`）；Amis 文档主路径没有角标示例，本页不另造一份。
- themeCss / `checkboxCheckedClassName` 等皮肤变量未接。
- `checkboxes` / `matrix-checkboxes` 是独立 type，本页不覆盖列数、全选、矩阵。
- 对照动作例（clear / reset / setValue）Amis 侧探针找不到勾选框（无 HTML `name`/`id`，`findByLabel` 只认按钮文案），Vamis 因 `id` 落在 `div.vamis-node` 被判 `rendered`。功能本身可点。
