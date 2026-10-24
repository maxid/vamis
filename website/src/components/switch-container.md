---
title: switch-container 状态容器
outline: deep
---

# switch-container 状态容器

::: info 实现进度 90% · 进行中
文档主路径已对齐：`items[].body` / `visibleOn` 取首个命中状态、`style`、宿主 `click` / `mouseenter` / `mouseleave`。缺 `themeCss`、`switchTo` 动作。
:::

状态容器按动态数据只渲染**一种**状态：扫描 `items`，显示第一个 `visibleOn` 命中的项。不同状态是各自的展示配置，可任意嵌套。外观和指针事件与 [Container](/components/container) 同类。

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**（Amis 文档有独立页，侧栏未收录）。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

`className` / `style` 打在宿主 `div.vamis-node`，内部不再复制一份。

## 基本用法

用表单项改 `state`，容器只显示首个命中项。表单 `data.state` 给出初值（控件上的 `value` 在 Vamis 还不会写进表单域）。没有命中项时不渲染内容。

```schema: scope="body"
{
  "type": "form",
  "title": "",
  "wrapWithPanel": false,
  "data": {
    "state": "a"
  },
  "body": [
    {
      "type": "button-group-select",
      "name": "state",
      "label": "切换状态",
      "inline": false,
      "options": [
        {
          "label": "选项1",
          "value": "a"
        },
        {
          "label": "选项2",
          "value": "b"
        }
      ],
      "multiple": false,
      "value": "a"
    },
    {
      "type": "switch-container",
      "items": [
        {
          "title": "状态1",
          "body": [
            {
              "type": "tpl",
              "tpl": "状态内容1",
              "inline": false
            }
          ],
          "visibleOn": "${state == \"a\"}"
        },
        {
          "title": "状态2",
          "body": [
            {
              "type": "tpl",
              "tpl": "状态内容2",
              "inline": false
            }
          ],
          "visibleOn": "${state == \"b\"}"
        }
      ]
    }
  ],
  "actions": []
}
```

同一段也可以写成 YAML：

```schema: scope="body"
type: form
title: ""
wrapWithPanel: false
data:
  state: b
body:
  - type: button-group-select
    name: state
    label: 切换状态 YAML
    inline: false
    options:
      - label: 选项1
        value: a
      - label: 选项2
        value: b
    multiple: false
    value: b
  - type: switch-container
    items:
      - title: 状态1
        body:
          - type: tpl
            tpl: 状态内容 YAML 1
            inline: false
        visibleOn: '${state == "a"}'
      - title: 状态2
        body:
          - type: tpl
            tpl: 状态内容 YAML 2
            inline: false
        visibleOn: '${state == "b"}'
actions: []
```

### style

对象写内联样式，属性名是驼峰：`backgroundColor`，不是 `background-color`。没有 `visibleOn` 时第一项默认可见。

```schema: scope="body"
{
  "type": "switch-container",
  "style": {
    "backgroundColor": "#C4C4C4"
  },
  "items": [
    {
      "title": "状态1",
      "body": [
        {
          "type": "tpl",
          "tpl": "状态内容1",
          "inline": false
        }
      ]
    }
  ]
}
```

```schema: scope="body"
type: switch-container
style:
  backgroundColor: "#C4C4C4"
items:
  - title: 状态1
    body:
      - type: tpl
        tpl: 状态内容 YAML
        inline: false
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"switch-container"` | 指定为 switch-container 渲染器 |
| className | `string` | | 外层 Dom 的类名，打在 `div.vamis-node` |
| style | `Object` | | 自定义样式，驼峰写法 |
| items | SchemaNode[] | | 状态列表。每项 `title` / `body` / `visibleOn` |
| items[x].title | `string` | | 状态标题（编辑器用，运行时不画） |
| items[x].body | SchemaNode | | 该状态的内容 |
| items[x].visibleOn | `string` | | 显示条件；都不命中则不渲染 |
| onEvent | `object` | | 见事件表 |

## 事件表

当前组件会对外派发以下事件，可以用 `onEvent` 监听。公式可读 `${event.context.nativeEvent.type}`。完整 `nativeEvent` 对象尚未落地。动作写法见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| click | `event.context.nativeEvent.type` | 点击时触发 |
| mouseenter | 同上 | 鼠标移入时触发 |
| mouseleave | 同上 | 鼠标移出时触发 |

对照不跑带 toast 的指针事件活示例：

```yaml
type: switch-container
items:
  - title: 状态1
    body:
      - type: tpl
        tpl: 状态内容1
        inline: false
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: ${event.context.nativeEvent.type}
```

## 动作表

文档未列对外动作。Amis 源码有内部 `switchTo(index)`（按下标强制显示某一项，覆盖 `visibleOn`）；Vamis 未接。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `className` / `style` 落在 SchemaRenderer 宿主上。未接 `themeCss`。
- 未接 `switchTo` 组件动作。
- 事件动作的循环 / 并行 / 广播仍是 D4 P1，不影响本页 click 主路径。
