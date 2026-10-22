---
title: 配置与 Schema
---

# 配置与 Schema

::: tip 实现进度 95% · 已完成
文档主路径已对齐 Amis「配置与组件」：`type` + 属性、组件树、`page` 唯一顶级、树形布局示例可跑。JSON 与 YAML 同等有效。渲染器 `test` / `weight` / `isolateScope` 已接；错误边界仍属 D8。
:::

一份 Vamis 页面是一棵 **widget 树**。节点靠 `type` 选渲染器，其余字段名与 Amis 相同。作者态 **JSON 与 YAML 并列**，解析后进同一运行时。

## 最简单的配置

一个最简单的配置看起来是这样的：

```json
{
  "type": "page",
  "body": "Hello World!"
}
```

请观察上面的代码：

1. `type` 是节点里最重要的字段，它告诉运行时当前要渲染 `page`。
2. `body` 会作为 `page` 的属性，页面按这个值画内容。字符串会当成 `tpl` 文本。

这段配置的效果如下（JSON / YAML 都能改）：

```schema
{
  "type": "page",
  "body": "Hello World!"
}
```

YAML 写同一份：

```schema
type: page
body: Hello World!
```

## 组件

`type` 决定渲染哪个组件。组件节点永远由 **`type`**（标识组件）和 **属性** 构成：

```
{
  "type": "xxx",
  ...其它属性
}
```

## 组件树

这次看一个稍微复杂一点的配置：`page` 的 `body` 不再是字符串，而是另一个带 `type` 的对象。

```schema
{
  "type": "page",
  "body": {
    "type": "tpl",
    "tpl": "Hello World!"
  }
}
```

最终效果和前面一样，但这次 `body` 里明确渲染 `tpl` 模板组件。

`body` 也可以是数组，一次放下多个节点：

```schema: scope="body"
- type: tpl
  tpl: Hello World!
- type: divider
- type: form
  title: ''
  mode: horizontal
  actions: []
  body:
    - type: input-text
      name: name
      label: 姓名
```

通过数组加上了 `divider` 和 `form`。

除了 `page`，很多**容器**都有 `body`。靠这种树形结构就能拼复杂页面。子节点还可以是字符串、对象或数组，见 [SchemaNode](/types/schemanode)。

> **注意：** `page` 是完整页面配置里**必须也是唯一的顶级节点**。局部预览可以用 `form` / `tpl` 等子树，文档会自动包一层 `page`。

## 通过树形来实现布局

下面这个页面就是通过树形组合出来的，大体结构是这样：

```
Page
  ├── Toolbar
  │  └─ Form 顶部表单项
  ├── Grid // 用于水平布局
  │  ├─ Panel
  │  │  └─ Tabs
  │  │    └─ Chart
  │  └─ Panel
  │     └─ Chart
  └── CRUD
```

```schema: height=560
{
  "type": "page",
  "toolbar": [{
    "type": "form",
    "panelClassName": "mb-0",
    "title": "",
    "body": [{
      "type": "select",
      "label": "区域",
      "name": "businessLineId",
      "mode": "inline",
      "options": ["北京", "上海"]
    }],
    "actions": [],
    "mode": "inline"
  }],
  "body": [{
    "type": "grid",
    "columns": [
      {
        "type": "panel",
        "className": "h-full",
        "body": {
          "type": "tabs",
          "tabs": [{
            "title": "消费趋势",
            "tab": [{
              "type": "chart",
              "config": {
                "title": { "text": "消费趋势" },
                "tooltip": {},
                "xAxis": {
                  "type": "category",
                  "boundaryGap": false,
                  "data": ["一月", "二月", "三月", "四月", "五月", "六月"]
                },
                "yAxis": {},
                "series": [{
                  "name": "销量",
                  "type": "line",
                  "areaStyle": {},
                  "data": [5, 20, 36, 10, 10, 20]
                }]
              }
            }]
          }, {
            "title": "账户余额",
            "tab": "0"
          }]
        }
      },
      {
        "type": "panel",
        "className": "h-full",
        "body": [{
          "type": "chart",
          "config": {
            "title": { "text": "使用资源占比" },
            "series": [{
              "type": "pie",
              "data": [
                { "name": "BOS", "value": 70 },
                { "name": "CDN", "value": 68 },
                { "name": "BCC", "value": 48 },
                { "name": "DCC", "value": 40 },
                { "name": "RDS", "value": 32 }
              ]
            }]
          }
        }]
      }
    ]
  }, {
    "type": "crud",
    "syncLocation": false,
    "api": "/api/mock2/sample",
    "columns": [
      { "name": "id", "label": "ID" },
      { "name": "engine", "label": "Rendering engine" },
      { "name": "browser", "label": "Browser" },
      { "name": "platform", "label": "Platform(s)" },
      { "name": "version", "label": "Engine version" },
      { "name": "grade", "label": "CSS grade" }
    ]
  }]
}
```

所有节点还共享显隐：`visible` / `hidden` / `visibleOn` / `hiddenOn`，由 `SchemaRenderer` 在进组件之前统一处理，不是每个 type 自己判断。
