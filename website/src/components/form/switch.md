---
title: Switch 开关
outline: deep
---

# Switch 开关

::: info 实现进度 88% · 进行中
主路径已对齐：`trueValue` / `falseValue`、`option`、`onText` / `offText`（字符串 / IconSchema / SchemaCollection）、`size`、`loading` / `loadingOn`、`change`、`clear` / `reset` / `setValue`、静态态。cxd 盒模型 44×20 / 滑块 16 + 2px 边 / 30 圆角（`--switch-*`）。缺 `themeCss`。
:::

开关组件，用于布尔值切换。属于普通表单项，通用属性见 [FormItem](./formitem)；Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。JSON 同等有效。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: switch
    name: switch
    label: 开关
    option: 开关说明
```

## 禁用状态

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: switch
    name: switch
    label: 开关
    option: 开关说明
    disabled: true
```

## 配置真假值

默认情况：

- 开关打开时，表单项值为：`true`
- 开关关闭时，表单项值为：`false`

```schema: scope="body"
type: form
debug: true
body:
  - type: switch
    name: switch
    label: 开关
```

如果想调整这个值，可以配置 `trueValue` 和 `falseValue`：

```schema: scope="body"
type: form
debug: true
body:
  - type: switch
    name: switch
    label: 开关
    trueValue: 1
    falseValue: 0
```

调整开关，观察数据域变化，会发现打开后值为 `1`，而关闭后为 `0`。

## 配置开启和关闭状态的文本

```schema: scope="body"
type: form
body:
  - type: switch
    name: switch
    label: 开关
    onText: 已开启飞行模式
    offText: 已关闭飞行模式
```

### 使用 Schema 配置文本

`onText` / `offText` 可以写成 `IconSchema`（只有 `icon` 没有 `type` 时按图标渲染）或 SchemaCollection：

```schema: scope="body"
type: form
body:
  - type: switch
    name: switch
    label: 开关
    onText:
      - type: icon
        icon: fa fa-plane
        vendor: ''
        className: mr-1
      - type: tpl
        tpl: 飞行模式
    offText:
      - type: icon
        icon: fa fa-plane
        vendor: ''
        className: mr-1
      - type: tpl
        tpl: 飞行模式
```

## 默认值

和其它表单项一样，要设置默认值可以使用 `value` 属性：

```schema: scope="body"
type: form
debug: true
body:
  - type: switch
    name: switch
    label: 开关
    value: false
```

## 不同尺寸

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: switch
    name: switch
    label: ''
  - type: switch
    name: switch-sm
    label: ''
    size: sm
```

## 加载状态

设置 `"loading": true`，标识开关操作的异步任务仍在执行中；加载期间开关不可操作，转圈画在滑块位置。`loadingOn` 支持表达式。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
data:
  shouldLoading: true
body:
  - type: switch
    name: switch1
    label: ''
    loading: true
    value: true
  - type: switch
    name: switch2
    label: ''
    size: sm
    disabled: true
    loading: true
```

配合 `ajax` 动作，实现开关操作后台异步任务：

```schema: scope="body"
type: page
body:
  - type: form
    id: demo-form
    body:
      - type: hidden
        name: isFetching
        value: false
      - type: switch
        name: switch
        label: 操作状态开关
        mode: horizontal
        loadingOn: "${isFetching}"
        onEvent:
          change:
            actions:
              - actionType: toast
                args:
                  msgType: warning
                  msg: "任务${switch === true ? '派发' : '取消'}成功，等待后台操作..."
              - actionType: setValue
                componentId: demo-form
                args:
                  value:
                    isFetching: true
              - actionType: ajax
                api:
                  url: /api/mock2/form/saveForm?waitSeconds=3
                  method: get
                  messages:
                    success: 操作成功
                    failed: 操作失败
              - actionType: setValue
                componentId: demo-form
                args:
                  value:
                    isFetching: false
```

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持下面一些配置：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `option` | `string` | | 选项说明，画在开关右侧 |
| `onText` | `string \| IconSchema \| SchemaCollection` | | 开启时开关显示的内容 |
| `offText` | `string \| IconSchema \| SchemaCollection` | | 关闭时开关显示的内容 |
| `trueValue` | `boolean \| string \| number` | `true` | 标识真值 |
| `falseValue` | `boolean \| string \| number` | `false` | 标识假值 |
| `size` | `"sm" \| "md"` | `"md"` | 开关大小 |
| `loading` | `boolean` | `false` | 是否处于加载状态 |
| `loadingOn` | `boolean` | `false` | 是否处于加载状态的表达式 |

IconSchema 配置：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | | `icon` |
| `icon` | `string` | | icon 的类型 |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听这些事件，并通过 `actions` 配置执行的动作，在 `actions` 中可以通过 `${事件参数名}` 或 `${event.data.[事件参数名]}` 获取事件产生的数据，详见[事件动作](../../concepts/event-action)。

> `[name]` 表示当前组件绑定的名称，即 `name` 属性；没有配置 `name` 时通过 `value` 取值。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: string \| boolean` 组件的值 | 开关值变化时触发 |

### change

开关值更新时写入表单数据：

```schema: scope="body"
type: form
id: change-form
data:
  switch: false
body:
  - type: switch
    name: switch
    label: 开关
    onEvent:
      change:
        actions:
          - actionType: setValue
            componentId: change-form
            args:
              value:
                lastChanged: true
  - type: tpl
    tpl: 开关当前值：${switch}
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过 `actionType: 动作名称`、`componentId`（该组件 id）或 `componentName`（该组件 name）触发这些动作。`componentId` 与 Amis 一样按 id 跨数据域查找，所以 form 外面的按钮也能点到 form 里的开关；`componentName` 只沿父级数据域查找。动作配置通过 `args: {动作配置项名称: xxx}` 传入，详见[事件动作](../../concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | - | 清空为空串 |
| `reset` | - | 将值重置为初始值；没有初始值时用 `resetValue` |
| `setValue` | `value: string \| boolean` 更新的数据 | 更新数据 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: switch
    name: switch
    label: 开关
    id: clear_text
    value: true
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
  - type: switch
    name: switch
    label: 开关
    id: reset_text
    value: true
    resetValue: false
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset_text
```

### setValue

按钮在 form **外面**，通过 `componentId` 按 id 跨数据域改表单里的开关：

```schema: scope="body"
- type: button
  label: 修改开关的值
  className: mb-2
  onEvent:
    click:
      actions:
        - actionType: setValue
          componentId: u:6613bfa3a18e
          args:
            value: true
- type: form
  title: 表单
  debug: true
  body:
    - type: switch
      name: switch
      label: 开关
      id: u:6613bfa3a18e
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `loadingOn` 在 Vamis 按表达式求值（Amis 6.13.0 的开关源码只读 `loading`，文档里的 `loadingOn` 不生效）；这是 Vamis 的增强，不改变 `loading` 语义。
- `static` 静态态显示 `onText` / `offText`，都没配时显示「开 / 关」。
- 动作表 `clear` / `reset` / `setValue` 与 Amis 一致走 `componentId`（按 id 跨数据域），也支持 `componentName`。Amis `change` 示例用 CRUD + `confirmDialog`；Vamis 尚未接 `confirmDialog`，本页该示例改成 form + `toast` 展示同一事件。
- 未接 `themeCss`；`size` 文档值只支持 `sm` / `md`（Amis UI 的 `lg` 不在 schema 类型里）。
