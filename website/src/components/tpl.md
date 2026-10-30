---
title: Tpl 模板
outline: deep
---

# Tpl 模板

::: info 实现进度 92% · 进行中
对齐 Amis：始终 HTML 插入，插值默认转义，`|raw` 才插入变量 HTML。`showNativeTitle`、`maxLine`、click / mouseenter / mouseleave 已接。标题/列表/链接在 html 岛内补回。P0 过滤器可用。其余运行时过滤器仍 P1。
:::

输出 [模板](/concepts/template) 的常用组件。`html` 是同一渲染器。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema
type: page
data:
  text: World!
body:
  type: tpl
  tpl: Hello ${text}
```

更多模板相关配置请看 [模板文档](/concepts/template)。

## 属性表

| 属性 | 说明 |
|------|------|
| `type` | `tpl`（`html` / `plain` 同渲染器） |
| `className` | 外层 class，打在 `div.vamis-node` |
| `tpl` / `html` | 模板。标签会渲染；插值默认转义 |
| `text` | 纯文本，整段转义 |
| `showNativeTitle` | `true` 时把纯文本写到外层 `title` |
| `maxLine` | 大于 0 时按行截断（源码有，Amis 属性表未列） |
| `inline` | 默认 true（span）；`false` 时块级 |
| `wrapperComponent` | `div` 或 `span` |

## 事件表

宿主 `div.vamis-node` 派发。动作里可用 `${event.context.nativeEvent.type}`。

| 事件 | 说明 |
|------|------|
| `click` | 点击 |
| `mouseenter` | 鼠标移入 |
| `mouseleave` | 鼠标移出 |

### click

```schema: scope="body"
type: tpl
tpl: Hello
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type}"
```

### mouseenter

```schema: scope="body"
type: tpl
tpl: Hello
onEvent:
  mouseenter:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type}"
```

### mouseleave

```schema: scope="body"
type: tpl
tpl: Hello
onEvent:
  mouseleave:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: "${event.context.nativeEvent.type}"
```

## 限制行数

`maxLine` 用 `-webkit-line-clamp` 截断。悬停可开 `showNativeTitle` 看全文。

```schema: scope="body"
type: tpl
maxLine: 2
showNativeTitle: true
tpl: 这是一段比较长的模板文本，超过两行时会被截断并显示省略号。把窗口收窄更容易看出效果。
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `maxLine` / `showNativeTitle` 已接。Amis 其余运行时过滤器（`map` / `bytes` 等）仍 P1。
