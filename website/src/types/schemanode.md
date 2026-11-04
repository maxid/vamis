---
title: SchemaNode
outline: deep
---

# SchemaNode

::: info 实现进度 92% · 进行中
文档主路径已对齐 Amis：模板 / Schema / 显隐 / SchemaArray。字符串会当成 `tpl`，对象走 `type`，数组由容器展开。TS `SchemaObject` 仍宽松。
:::

SchemaNode 是每一个配置节点的类型，支持 **模板**、**Schema（配置）** 以及 **SchemaArray（配置数组）** 三种写法。作者态 YAML 与 JSON 同等有效。`false` 表示不渲染。

## 模板

```schema
type: page
data:
  text: World
body: "Hello ${text}!"
```

上例 `body` 的 `"Hello ${text}!"` 就是模板，输出 `Hello World!`。

更多见 [模板](/concepts/template)。

## Schema 配置

Schema 即组件的 JSON / YAML 配置，**至少要有 `type`**，用来标识当前节点是哪种组件。

```schema
type: page
data:
  text: World
body:
  type: tpl
  tpl: "Hello ${text}!"
```

`type` + `data` + `body` 组成一个 Schema；`type: page` 标明这是 [Page](/components/page)。Page 的 `body` 类型是 SchemaNode，所以可以再嵌一套配置。这里用 `type: tpl` 渲染了一段模板。

靠这种嵌套就能搭复杂页面。

### 配置显隐

所有 Schema 都可以通过 `visible` / `hidden`、`visibleOn` / `hiddenOn` 控制显隐。

#### 静态配置

`"hidden": true` 或 `"visible": false` 会隐藏组件。

```schema: scope="body"
- type: form
  body:
    - type: input-text
      label: 姓名
      name: name
- type: form
  hidden: true
  body:
    - type: input-text
      label: 姓名
      name: name
```

下面那个表单被隐藏了。

#### 通过条件配置显隐

也可以用 [表达式](/concepts/expression) 写 `hiddenOn`，在某个条件下隐藏。

```schema: scope="body"
type: form
body:
  - type: input-number
    label: 数量
    name: number
    value: 0
    description: 调整数量大小查看效果吧！
  - type: input-text
    label: 文本
    name: text
    hiddenOn: "${number > 1}"
    description: 当数量大于1的时候，该文本框会隐藏
```

为了方便说明，在 form 里演示条件显隐。只要当前数据域有变化，都可以驱动组件显隐。

`visible` 和 `hidden`、`visibleOn` 和 `hiddenOn` 除了判断逻辑相反以外，没有区别。

## SchemaArray 配置数组

明白了何为 Schema 之后，SchemaArray 就是在同一层级用数组配置多个 Schema。

```schema
type: page
data:
  name: amis
  age: 1
body:
  - type: tpl
    tpl: my name is ${name}
  - type: tpl
    tpl: I am ${age} years old
```

给 `body` 配数组，就会在这一层渲染两个 `tpl`。
