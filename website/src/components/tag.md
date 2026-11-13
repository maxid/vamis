---
title: Tag 标签
outline: deep
---

# Tag 标签

::: info 实现进度 80% · 进行中
`displayMode` normal / rounded / status、预设与自定义 `color`、`label` / `value` / `tags`、`closable`、`checkable` / `checked`、`click` / `mouseenter` / `mouseleave` / `close` 事件。余项：拖拽、远程 tags。
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

`normal` 面性、`rounded` 线性、`status` 带状态圆点：

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
    color: success
```

## 标签颜色

预设颜色：`inactive` / `active` / `success` / `processing` / `error` / `warning`；也可直接写自定义色值：

```schema: scope="body"
type: page
body:
  - type: tag
    label: success
    color: success
  - type: tag
    label: warning
    color: warning
  - type: tag
    label: error
    color: error
  - type: tag
    label: 自定义
    color: "#4096ff"
```

## 自定义样式

`className` / `style` 透传到标签根节点；`displayMode: rounded` + 自定义色为描边、`status` 设置状态点颜色：

```schema: scope="body"
type: tag
label: 自定义样式
displayMode: rounded
color: "#4096ff"
className: m-l-xs
style:
  fontWeight: 600
```

## 可关闭 / 可选

`closable: true` 显示关闭钮，点击派发 `close`；`checkable: true` 点击切换选中态并派发 `click`：

```schema: scope="body"
type: page
body:
  - type: tag
    label: 关闭了！
    closable: true
    onEvent:
      close:
        actions:
          - actionType: toast
            args:
              msg: "关闭 ${event.data.label}"
  - type: tag
    label: 可选标签
    checkable: true
    checked: true
    color: active
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `label` | `string` | | 标签文本，支持模板 |
| `value` / `tags` | `any` | | 用于取值 / 多标签 |
| `displayMode` | `"normal" \| "rounded" \| "status"` | `normal` | 展示模式 |
| `color` | `string` | | 预设色或自定义色值 |
| `closable` | `boolean` | `false` | 可关闭 |
| `checkable` | `boolean` | `false` | 可切换选中 |
| `checked` | `boolean` | `false` | 初始选中 |
| `disabled` | `boolean` | `false` | 禁用 |
| `className` / `style` | | | 根节点样式 |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `click` | `label` / 数据域 | 点击 |
| `close` | `label` / 数据域 | 关闭（`prevented` 可不关闭） |
| `mouseenter` / `mouseleave` | `label` / 数据域 | 悬停 |

## 动作表

`tag` 没有专属动作。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：三种模式、预设 / 自定义颜色、`closable` / `checkable`、四类事件。
- 未接拖拽排序与远程 `tags`；`static-tag` 走 Static 泛型。
