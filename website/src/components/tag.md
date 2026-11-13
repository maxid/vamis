---
title: Tag 标签
outline: deep
---

# Tag 标签

::: info 实现进度 90% · 进行中
文档主路径已对齐：三种 `displayMode`、预设 / 自定义 `color`、`icon` / `closeIcon`、`closable`、click / mouseenter / mouseleave / close。余项：Amis 源码有 `checkable` 但文档与 UI 未接（Vamis 保留为增强）。
:::

用于标记和选择的标签。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: page
body:
  - type: tag
    label: 普通的标签
    displayMode: rounded
    color: inactive
  - type: tag
    label: 普通标签
    color: processing
  - type: tag
    label: 这是一个很长长长长长长长长长长长长长的标签
    color: success
  - type: tag
    label: 这是一个很长长长长长长长长长长长长长的标签
    closable: true
  - type: tag
    label: 关闭了！
    closable: true
    onEvent:
      close:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.label}"
```

## 不同的模式

`normal` 面性、`rounded` 线性、`status` 带前置状态点（默认圆点，可用 `icon` 覆盖）：

```schema: scope="body"
type: page
body:
  - type: tag
    label: 面性标签
    displayMode: normal
    color: active
  - type: tag
    label: 线性标签
    displayMode: rounded
    color: inactive
  - type: tag
    label: 状态标签
    displayMode: status
    color: active
    closable: true
  - type: tag
    label: "#4096ff"
    displayMode: rounded
    color: "#4096ff"
  - type: tag
    label: "#f70e47"
    displayMode: rounded
    color: "#f70e47"
```

## 标签颜色

预设色彩：`active` / `inactive` / `error` / `success` / `processing` / `warning`。预设不够时可以直接写色值。

```schema: scope="body"
type: page
body:
  - type: tag
    label: active
    displayMode: normal
    color: active
  - type: tag
    label: inactive
    displayMode: normal
    color: inactive
  - type: tag
    label: error
    displayMode: normal
    color: error
  - type: tag
    label: success
    displayMode: normal
    color: success
  - type: tag
    label: processing
    displayMode: normal
    color: processing
  - type: tag
    label: warning
    displayMode: normal
    color: warning
```

## 自定义样式

可以用 `style` 控制背景、边框和文字颜色：

```schema: scope="body"
type: page
body:
  - type: tag
    label: 面性标签
    displayMode: normal
    color: active
  - type: tag
    label: 线性标签
    displayMode: rounded
    color: inactive
  - type: tag
    label: 自定义样式1
    displayMode: normal
    style:
      backgroundColor: "#fff"
      border: "1px solid #ccc"
      color: "#666"
  - type: tag
    label: 自定义样式2
    displayMode: rounded
    style:
      backgroundColor: "#2468f2"
      borderColor: "#2468f2"
      color: "#fff"
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `displayMode` | `'normal' \| 'rounded' \| 'status'` | `normal` | 展现模式 |
| `color` | `'active' \| 'inactive' \| 'error' \| 'success' \| 'processing' \| 'warning' \| 具体色值` | | 颜色主题，提供默认主题，并支持自定义颜色值 |
| `label` | `string` | `-` | 标签内容，支持模板 |
| `icon` | [SchemaNode](/types/schemanode) | 圆点 | `status` 模式下的前置图标 |
| `closeIcon` | [SchemaNode](/types/schemanode) | 关闭叉 | 关闭按钮图标 |
| `className` | [ClassName](/types/classname) | | 自定义 CSS 样式类名 |
| `style` | `object` | `{}` | 自定义样式（行内样式），优先级最高 |
| `closable` | `boolean` | `false` | 是否展示关闭按钮 |
| `checkable` | `boolean` | `false` | **增强**：点击切换选中。Amis schema 有此字段，文档与 UI 未接 |
| `checked` | `boolean` | `false` | **增强**：初始选中（配合 `checkable`） |
| `disabled` | `boolean` | `false` | 禁用 |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听这些事件，并通过 `actions` 来配置执行的动作。在 `actions` 中可以通过 `${事件参数名}` 或 `${event.data.[事件参数名]}` 来获取事件产生的数据，详细查看[事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `click` | `label: string` 鼠标事件对象 | 点击时触发 |
| `mouseenter` | `label: string` 鼠标事件对象 | 鼠标移入时触发 |
| `mouseleave` | `label: string` 鼠标事件对象 | 鼠标移出时触发 |
| `close` | `label: string` 鼠标事件对象 | 关闭时触发 |

### click

鼠标点击。可以通过 `${event.context.nativeEvent}` 获取鼠标事件对象。

```schema: scope="body"
type: tag
label: success
displayMode: normal
color: success
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type} ${event.data.label}"
```

### mouseenter

鼠标移入。可以通过 `${event.context.nativeEvent}` 获取鼠标事件对象。

```schema: scope="body"
type: tag
label: success
displayMode: normal
color: success
onEvent:
  mouseenter:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type} ${event.data.label}"
```

### mouseleave

鼠标移出。可以通过 `${event.context.nativeEvent}` 获取鼠标事件对象。

```schema: scope="body"
type: tag
label: success
displayMode: normal
color: success
onEvent:
  mouseleave:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type} ${event.data.label}"
```

### close

鼠标点击关闭标签。可以通过 `${event.context.nativeEvent}` 获取鼠标事件对象。关闭不会从页面上摘掉标签（对齐 Amis）。

```schema: scope="body"
type: tag
label: success
displayMode: normal
color: success
closable: true
onEvent:
  close:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "close ${event.data.label}"
```

## 动作表

`tag` 没有专属动作。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- `checkable` / `checked` 是增强：Amis schema 有字段，渲染器没有接到 UI。
- 关闭只派发 `close`，不隐藏标签。
- 未接 `themeCss`。`type: tags` 是 Words（`inTag`），不是 `tag` 别名。
