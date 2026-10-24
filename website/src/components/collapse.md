---
title: Collapse 折叠器
outline: deep
---

# Collapse 折叠器

::: info 实现进度 85% · 进行中
文档主路径已对齐：`activeKey` / 手风琴 / 禁用 / `showArrow` / 图标位置 / `change` 事件。Form 里 `enableFieldSetStyle` 只切 class。缺 `mountOnEnter` / `unmountOnExit`、`expand`·`collapse` 动作、FieldSet 像素级。
:::

一组可展开的面板。对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽。

多个面板用 `collapse-group` 包起来，用 `activeKey` 指定初始展开项。单独一个 `collapse` 也能用，默认折叠。

## 基本用法

```schema: scope="body"
{
  "type": "collapse-group",
  "activeKey": ["1"],
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    },
    {
      "type": "collapse",
      "key": "3",
      "header": "标题3",
      "body": "这里是内容3"
    }
  ]
}
```

同一段也可以写成 YAML：

```schema: scope="body"
type: collapse-group
activeKey:
  - "1"
body:
  - type: collapse
    key: "1"
    header: 标题1
    body: 这里是内容1
  - type: collapse
    key: "2"
    header: 标题2
    body: 这里是内容2
```

## 手风琴模式

`accordion: true` 时同时只展开一项。

```schema: scope="body"
{
  "type": "collapse-group",
  "activeKey": ["1"],
  "accordion": true,
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    },
    {
      "type": "collapse",
      "key": "3",
      "header": "标题3",
      "body": "这里是内容3"
    }
  ]
}
```

## 自定义图标

`expandIcon` 是任意 SchemaNode（常见是 `type: icon`）。

```schema: scope="body"
{
  "type": "collapse-group",
  "activeKey": ["1"],
  "expandIcon": {
    "type": "icon",
    "icon": "caret-right"
  },
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    }
  ]
}
```

## 设置图标位置

`expandIconPosition`：`left`（默认）或 `right`。

```schema: scope="body"
{
  "type": "collapse-group",
  "expandIconPosition": "right",
  "activeKey": ["1"],
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    }
  ]
}
```

## 面板嵌套

内容区可以再放一组 `collapse-group`。

```schema: scope="body"
{
  "type": "collapse-group",
  "activeKey": ["1"],
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": {
        "type": "collapse-group",
        "activeKey": ["1"],
        "body": [
          {
            "type": "collapse",
            "key": "1",
            "header": "嵌套面板标题",
            "body": "嵌套面板内容"
          }
        ]
      }
    },
    {
      "type": "collapse",
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    }
  ]
}
```

## 折叠面板禁用

```schema: scope="body"
{
  "type": "collapse-group",
  "activeKey": ["1"],
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "disabled": true,
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    }
  ]
}
```

## 折叠面板图标隐藏

```schema: scope="body"
{
  "type": "collapse-group",
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "showArrow": false,
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    }
  ]
}
```

## 类 FieldSet 样式

当 Collapse 在 Form 里时，`enableFieldSetStyle` 默认 `true`，走接近 [FieldSet](/components/form/fieldset) 的标题密度。可以绑表达式关掉。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "switch",
      "name": "enableFieldSetStyle",
      "label": "切换展示方式",
      "mode": "horizontal",
      "value": true
    },
    {
      "type": "collapse-group",
      "activeKey": ["1"],
      "enableFieldSetStyle": "${enableFieldSetStyle}",
      "body": [
        {
          "type": "collapse",
          "key": "1",
          "header": "标题1",
          "body": "这里是内容1"
        },
        {
          "type": "collapse",
          "key": "2",
          "header": "标题2",
          "body": "这里是内容2"
        }
      ]
    }
  ]
}
```

## CollapseGroup 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"collapse-group"` | 指定为 collapse-group 渲染器 |
| `activeKey` | `string` / `number` / 数组 | | 初始化展开的 key |
| `accordion` | `boolean` | `false` | 手风琴，同时只展开一个 |
| `expandIcon` | SchemaNode | | 自定义切换图标 |
| `expandIconPosition` | `string` | `"left"` | `left` / `right` |
| `enableFieldSetStyle` | `boolean` / 表达式 | `true` | 在 Form 里时是否走 FieldSet 风格 |
| `body` | SchemaNode | | 子折叠器列表 |
| `className` | `string` | | 打在 `SchemaRenderer` 宿主上 |
| `onEvent` | `object` | | 见事件表 |

## CollapseGroup 事件表

当前组件会对外派发以下事件，可以用 `onEvent` 监听。公式可读 `${event.data.字段}`。动作写法见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `activeKeys` 当前展开的 key 列表；`collapseId` 本次操作的面板；`collapsed` 该面板是否折叠 | 折叠状态改变时触发 |

### change

```schema: scope="body"
{
  "type": "collapse-group",
  "activeKey": ["1"],
  "body": [
    {
      "type": "collapse",
      "key": "1",
      "header": "标题1",
      "body": "这里是内容1"
    },
    {
      "type": "collapse",
      "key": "2",
      "header": "标题2",
      "body": "这里是内容2"
    }
  ],
  "onEvent": {
    "change": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "activeKeys: ${event.data.activeKeys|json}, collapseId: ${event.data.collapseId}, collapsed: ${event.data.collapsed}"
          }
        }
      ]
    }
  }
}
```

## Collapse 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"collapse"` | 指定为 collapse 渲染器 |
| `key` | `string` / `number` | | 面板标识，给 group 的 `activeKey` 用 |
| `header` | `string` / SchemaNode | | 标题 |
| `title` / `label` | `string` | | `header` 的后备 |
| `body` | SchemaNode | | 内容 |
| `collapsed` | `boolean` | `true` | 独立使用时是否默认折叠 |
| `active` | `boolean` | | 独立使用时是否展开 |
| `disabled` | `boolean` | `false` | 禁用 |
| `showArrow` | `boolean` | `true` | 是否显示展开图标 |
| `collapsable` | `boolean` | `true` | 是否可折叠 |
| `expandIcon` | SchemaNode | | 覆盖组上的图标 |
| `headingClassName` | `string` | | 标题栏 class |
| `bodyClassName` | `string` | | 内容区 class |
| `onEvent` | `object` | | 见事件表 |

## Collapse 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `collapsed` 折叠器状态 | 折叠状态改变时触发 |

### change

```schema: scope="body"
{
  "type": "collapse",
  "header": "标题",
  "body": "内容",
  "onEvent": {
    "change": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "collapsed: ${event.data.collapsed}"
          }
        }
      ]
    }
  }
}
```

## 动作表

Amis 源码里 Collapse 还收 `expand` / `collapse` 组件动作。Vamis 尚未注册（D7）。本页用点击标题切换，不挡主路径。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Collapse` 前缀；标题行高和箭头用 token / 工具类近似。
- `enableFieldSetStyle` 只加 `data-fieldset`，不是完整 FieldSet 皮肤。
- `mountOnEnter` / `unmountOnExit` / `size` / `headerPosition` 未接。
- `expand` / `collapse` 组件动作未注册。
