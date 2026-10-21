---
title: Container 容器
outline: deep
---

# Container 容器

::: info 实现进度 100% · 已完成
文档主路径已对齐：`body` / `style` / `wrapperComponent` / `wrapperBody` / `bodyClassName`，以及 `click` / `mouseenter` / `mouseleave`（完整事件对象：`event.data` / `__rendererData` / `preventDefault` / `stopPropagation`）。Container 不建独立数据域，沿用父 Scope。无对外组件动作。`draggable` 未做（编辑器能力，不是运行时主路径）。
:::

Container 用来渲染其它组件。对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。

注意：Container 因历史原因会多一层 div，更薄的容器请用 [Wrapper](/components/wrapper)。Vamis 同样：`SchemaRenderer` 先有一层宿主（`className` / `style` 打在这里），`wrapperBody` 默认再包一层内容区。

默认吃满布局槽，不必先写 `w-full`。

## 基本用法

`body` 是 [SchemaNode](/types/schemanode)：字符串、对象或数组都可以。字符串会当成 `tpl`。

```schema: scope="body"
{
  "type": "container",
  "body": "这里是容器内容区"
}
```

同一段也可以写成 YAML，运行时等价：

```schema: scope="body"
type: container
body: 这里是容器内容区
```

### style

用对象写内联样式，属性名是驼峰：`backgroundColor`，不是 `background-color`。`style` 由宿主 `SchemaRenderer` 落地，容器内部不再复制一份。

```schema: scope="body"
{
  "type": "container",
  "style": {
    "backgroundColor": "#C4C4C4"
  },
  "body": "这里是容器内容区"
}
```

### wrapperComponent

改外层标签名。只允许 `div`（默认）、`section`、`article`、`main`、`header`、`footer`、`aside`、`nav`、`pre`、`span`；其它值回退成 `div`。

```schema: scope="body"
{
  "type": "container",
  "wrapperComponent": "pre",
  "body": "var a = 1;"
}
```

### wrapperBody 与 bodyClassName

`wrapperBody` 默认 `true`：内容再包一层 div，这层吃 `bodyClassName`。设成 `false` 则子节点直接挂到容器标签下。Amis 源码有此字段，文档属性表未列。

```schema: scope="body"
{
  "type": "container",
  "bodyClassName": "p-3 rounded-md border",
  "body": [
    {
      "type": "tpl",
      "tpl": "内容区有边框"
    },
    {
      "type": "tpl",
      "tpl": "第二条"
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"container"` | 指定为 container 渲染器 |
| `className` | `string` / 对象 | | 打在 `SchemaRenderer` 宿主上 |
| `bodyClassName` | `string` / 对象 | | 容器内容区的类名；仅 `wrapperBody` 不为 `false` 时生效 |
| `wrapperComponent` | `string` | `"div"` | 容器标签名；不在白名单则回退 `div` |
| `wrapperBody` | `boolean` | `true` | 是否再包一层内容区 |
| `style` | `Object` | | 自定义样式，驼峰写法 |
| `body` | [SchemaNode](/types/schemanode) | | 容器内容 |
| `visibleOn` / `hiddenOn` | `string` | | 显隐表达式 |
| `onEvent` | `object` | | 见事件表 |
| `draggable` / `draggableConfig` | — | | Amis 编辑器拖拽，Vamis 未实现 |

## 事件表

当前组件会对外派发以下事件，可以用 `onEvent` 监听，再配 `actions`。公式可读 `${event.context.nativeEvent.type}` 和 `${event.data.字段}`。完整 `nativeEvent` 对象尚未落地。动作写法见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `click` | `event.context.nativeEvent.type` | 点击时触发 |
| `mouseenter` | 同上 | 鼠标移入时触发 |
| `mouseleave` | 同上 | 鼠标移出时触发 |

`action` / `button` / `submit` / `reset` 仍走自己的点击逻辑，宿主不会再派一次 `click`。

### click

```schema: scope="body"
{
  "type": "container",
  "body": "这里是容器内容区",
  "onEvent": {
    "click": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "${event.context.nativeEvent.type} / ${__rendererData|json}"
          }
        }
      ]
    }
  }
}
```

### mouseenter

```schema: scope="body"
{
  "type": "container",
  "body": "这里是容器内容区",
  "onEvent": {
    "mouseenter": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "${event.context.nativeEvent.type}"
          }
        }
      ]
    }
  }
}
```

### mouseleave

```schema: scope="body"
{
  "type": "container",
  "body": "这里是容器内容区",
  "onEvent": {
    "mouseleave": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "${event.context.nativeEvent.type}"
          }
        }
      ]
    }
  }
}
```

## 动作表

Container **不对外暴露** `reload` / `setValue` 这类组件动作（对齐 Amis）。要改数据或刷新，请对上层 Page / Form / CRUD 发动作。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 没有 cxd 的 `Container` / `Container-body` 默认内边距；需要留白请写 `className` / `bodyClassName` / `style`。
- `wrapperComponent` 做了标签白名单，未知值不会渲染成任意 HTML 标签。
- `draggable` / `draggableConfig` 未实现（编辑器拖拽，不是运行时主路径）。
- 事件动作的循环 / 并行 / 广播仍是 D4 P1，不影响本页 click 主路径。
