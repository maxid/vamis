---
title: Container 容器
outline: deep
---

# Container 容器

::: info 实现进度 78% · 进行中
主路径：`body` / `style` / `wrapperComponent` / `wrapperBody` / `bodyClassName` 与 `click` / `mouseenter` / `mouseleave`。D4 事件对象只挂了 `nativeEvent.type`；编辑器拖拽未做。
:::

`container` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。

默认吃满布局槽，不必先写 `w-full`。Amis 注明 Container 因历史原因会多一层 div，更薄的容器请用 [Wrapper](/components/wrapper)。Vamis 同样：`SchemaRenderer` 先有一层宿主（`className` / `style` 打在这里），`wrapperBody` 默认再包一层内容区。

## 基本用法

`body` 是 [SchemaNode](/types/schemanode)：字符串、对象或数组都可以。字符串会当成 `tpl`。

```schema: scope="body"
type: container
body: 这里是容器内容区
```

同一段也可以写成 JSON，运行时等价：

```schema: scope="body"
{
  "type": "container",
  "body": "这里是容器内容区"
}
```

### style

用对象写内联样式，属性名是驼峰：`backgroundColor`，不是 `background-color`。`style` 由宿主 `SchemaRenderer` 落地，容器内部不再复制一份。

```schema: scope="body"
type: container
className: p-3
style:
  backgroundColor: "#C4C4C4"
body: 这里是容器内容区
```

### wrapperComponent

改外层标签名。只允许 `div`（默认）、`section`、`article`、`main`、`header`、`footer`、`aside`、`nav`、`pre`、`span`；其它值回退成 `div`。

```schema: scope="body"
type: container
wrapperComponent: pre
body: var a = 1;
```

### wrapperBody 与 bodyClassName

`wrapperBody` 默认 `true`：内容再包一层 div，这层吃 `bodyClassName`，并默认 `space-y-3` 把多个子节点拉开。设成 `false` 则子节点直接挂到容器标签下。

```schema: scope="body"
type: container
bodyClassName: p-3 rounded-md border
body:
  - type: tpl
    tpl: 内容区有边框
  - type: tpl
    tpl: 第二条会与第一条拉开间距
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"container"` | 指定为 container 渲染器 |
| `className` | `string` / 对象 | | 打在 `SchemaRenderer` 宿主上，不在容器标签上再套一次 |
| `bodyClassName` | `string` / 对象 | | 内容区 class；仅 `wrapperBody` 不为 `false` 时生效 |
| `wrapperComponent` | `string` | `"div"` | 容器标签名；不在白名单则回退 `div` |
| `wrapperBody` | `boolean` | `true` | 是否再包一层内容区 |
| `style` | `Object` | | 自定义样式，驼峰写法 |
| `body` | [SchemaNode](/types/schemanode) | | 容器内容：字符串 / 对象 / 数组 |
| `visibleOn` / `hiddenOn` | `string` | | 显隐表达式 |
| `onEvent` | `object` | | 见下方事件表 |
| `draggable` / `draggableConfig` | — | | Amis 编辑器拖拽，Vamis 未实现 |

## 事件表

当前组件会对外派发以下事件，可以用 `onEvent` 监听，再配 `actions`。公式里目前只能读到 `${event.context.nativeEvent.type}`（例如 `click`），完整 `nativeEvent` 对象和 Amis D4 事件上下文尚未落地。动作写法见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `click` | `event.context.nativeEvent.type` | 点击时触发 |
| `mouseenter` | 同上 | 鼠标移入时触发 |
| `mouseleave` | 同上 | 鼠标移出时触发 |

`action` / `button` / `submit` / `reset` 仍走自己的点击逻辑，宿主不会再派一次 `click`。

### click

```schema: scope="body"
type: container
className: cursor-pointer p-3
body: 点击这块区域
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: ${event.context.nativeEvent.type}
```

### mouseenter

```schema: scope="body"
type: container
className: p-3
body: 把鼠标移进来
onEvent:
  mouseenter:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: ${event.context.nativeEvent.type}
```

### mouseleave

```schema: scope="body"
type: container
className: p-3
body: 把鼠标移出去
onEvent:
  mouseleave:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: ${event.context.nativeEvent.type}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 没有 cxd 的 `Container` / `Container-body` 默认内边距；需要留白请写 `className` / `bodyClassName` / `style`。
- `wrapperComponent` 做了标签白名单，未知值不会渲染成任意 HTML 标签。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）尚未落地；事件对象（D4）只有 `nativeEvent.type`。
- `draggable` / `draggableConfig` 未实现。
