---
title: Mapping 映射
outline: deep
---

# Mapping 映射

::: info 实现进度 85% · 进行中
主路径已对齐：`map` 的 k-v 对象 / 单 key 对象数组 / 多 key 对象数组（`valueField` / `labelField`）、`source`（纯变量 / 远程字典）、字符串 / HTML 模板、schema 组件值、`itemSchema`（字符串或 SchemaNode）、数组值映射多个、布尔 `1` / `0`、`placeholder`。HTML `.label-*` 与 `type: tag`（rounded / color）盒模型已对齐。余项 source 30s 缓存未单实现。
:::

`mapping` 把值按 `map` 字典映射成展示文本或组件。属于数据展示；也可作为 Table 列、Form 的 `static-mapping` 使用。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
body:
  type: mapping
  value: "1"
  map:
    "1": 第一
    "2": 第二
    "3": 第三
    "*": 其他
```

## 渲染 HTML

```schema
type: page
body:
  type: mapping
  value: "2"
  map:
    "1": "<span class='label label-info'>漂亮</span>"
    "2": "<span class='label label-success'>开心</span>"
    "3": "<span class='label label-danger'>惊吓</span>"
    "4": "<span class='label label-warning'>紧张</span>"
    "*": "<span class='label label-default'>其他：${type}</span>"
```

## 渲染其它组件

映射值也可以是 schema，用来渲染其它组件。

> 配置了 `itemSchema` 后，映射值不会再作为 schema 渲染

```schema
type: page
body:
  type: mapping
  value: "1"
  map:
    "1":
      type: tag
      label: "#4096ff"
      displayMode: rounded
      color: "#4096ff"
    "2":
      type: tpl
      tpl: "2"
    "*": 其他
```

## 渲染自定义模板

可配置 `itemSchema` 渲染自定义模板，支持 HTML 或 schema。映射值非 object 时用 `${item}` 取映射值。

### html 或字符串模板

使用 `${item}` 获取映射值。

```schema
type: page
body:
  type: mapping
  value: "1"
  map:
    "1": 第一
    "2": 第二
    "3": 第三
    "*": 其他
  itemSchema: "自定义模板：<span style='color: red'>${item}</span>"
```

### SchemaNode 模板

```schema
type: page
body:
  type: mapping
  value: "1"
  map:
    "1": 第一
    "2": 第二
    "3": 第三
    "*": 其他
  itemSchema:
    type: tag
    label: "${item}"
```

### 在模板中渲染数据

- 映射值是 object 时，模板可取 object 属性
- 映射值非 object 时，用 `${item}` 取映射值
- 也可以读数据域里的其它数据

```schema
type: page
data:
  myName: cat
body:
  type: mapping
  value: "1"
  map:
    "1":
      label: 开心
      color: red
    "2":
      label: 伤心
      color: blue
    "3":
      label: 冷漠
      color: gray
    "*": 其他
  itemSchema:
    type: tag
    label: "${myName} ${label}"
    color: "${color}"
```

## 映射展示多个

如果返回值是数组会显示为多个。

```schema
type: page
body:
  type: mapping
  value: ["1", "2", "3", "4", "5"]
  map:
    "1": "<span class='label label-info'>漂亮</span>"
    "2": "<span class='label label-success'>开心</span>"
    "3": "<span class='label label-danger'>惊吓</span>"
    "4": "<span class='label label-warning'>紧张</span>"
    "*": "<span class='label label-default'>其他</span>"
```

## map 映射源

### k-v 对象

```json
{
  "type": "mapping",
  "value": "1",
  "map": { "1": "第一", "2": "第二", "*": "其他" }
}
```

### 对象数组

单 key 对象数组：

```json
{
  "type": "mapping",
  "value": "1",
  "map": [{ "1": "第一" }, { "2": "第二" }, { "*": "其他" }]
}
```

多 key 对象数组用 `valueField` 指定匹配字段，`labelField` 指定展示字段：

```schema
type: page
body:
  type: mapping
  value: happy
  valueField: name
  labelField: label
  map:
    - name: happy
      label: 开心
      color: red
    - name: sad
      label: 悲伤
      color: blue
    - name: "*"
      label: 其他
      color: gray
```

> 配置 `labelField` 后映射值不再作为 schema 组件渲染。

## 用作 Field 时

在 Table 列、List 内容、Card 内容或 Form 的 `static-xxx` 里配置 `name` 即可映射同名变量。

### Table 中的列类型

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      type: "1"
    - id: "2"
      type: "2"
    - id: "3"
      type: "3"
columns:
  - name: id
    label: Id
  - name: type
    label: 映射
    type: mapping
    map:
      "1": "<span class='label label-info'>漂亮</span>"
      "2": "<span class='label label-success'>开心</span>"
      "*": "其他：${type}"
```

### Form 中静态展示

```schema: scope="body"
type: form
data:
  type: "2"
body:
  - type: static-mapping
    name: type
    label: 映射
    map:
      "1": "<span class='label label-info'>漂亮</span>"
      "2": "<span class='label label-success'>开心</span>"
      "*": "其他：${type}"
```

### 布尔值映射

`true` / `false` 会依次尝试 `map["1"]` / `map["0"]`，再退回 `"*"`：

```schema: scope="body"
type: form
data:
  type: true
body:
  - type: static-mapping
    name: type
    label: 映射
    map:
      "1": "<span class='label label-info'>开</span>"
      "0": "<span class='label label-default'>关</span>"
```

### 远程拉取字典

`source` 可以是一个 API，返回字典对象或对象数组（默认 30s 缓存由宿主 env 控制）：

```schema: scope="body"
type: form
data:
  type: "2"
body:
  - type: static-mapping
    name: type
    label: 映射
    source: /api/mapping
```

### 关联上下文变量

`source` 是纯变量时直接取数据域里的对象；`$${zidian}` 表示取原始变量值：

```schema: scope="body"
type: form
data:
  dict:
    "1": 第一
    "2": 第二
    "*": 其他
  type: "2"
body:
  - type: static-mapping
    name: type
    label: 映射
    source: "${dict}"
```

## 占位文本

数据不存在或没有命中时用 `placeholder` 控制展示，默认 `-`：

```schema
type: page
body:
  type: mapping
  placeholder: 数据不存在
  map:
    "1": 第一
    "2": 第二
    "*": 其他
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `any` | | 要映射的值；不写则取 `name` 对应数据域 |
| `name` | `string` | | 关联字段名，用作 Field / 静态展示时使用 |
| `map` / `mapping` | `object` / `Array<object>` | | 映射配置 |
| `source` | `string` / `API` | | 字典来源：纯变量或远程 API |
| `valueField` | `string` | `value` | 对象数组作 map 源时用于匹配的字段 |
| `labelField` | `string` | `label` | 对象数组作 map 源时用于展示的字段 |
| `itemSchema` | `string` / [SchemaNode](/types/schemanode) | | 自定义渲染模板；非 object 值用 `${item}` 取值 |
| `placeholder` | `string` | `-` | 未命中/无值时的占位文本 |
| `className` | `string` | | 外层 class |
| `style` | `object` | | 外层样式 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：k-v / 对象数组 / 多 key 数组、`source` 变量与 API、`itemSchema` 字符串与 SchemaNode、数组多值、布尔 `1`/`0`、`placeholder`。
- `labelField` 配置后映射值不再作为 schema 渲染。映射到 `type: tag` 时把 `label` 落到 Tag 的 `value`（对齐 Amis 渲染 tag 时 `value: null`，避免从表单域抢值）。
- HTML 映射里的 `.label` / `.label-*` 走 `--label-*` token（对齐 Amis `--label--*-bg`），不是 Overlay Badge。
- `source` 的 30s 缓存未单独实现，缓存策略交给宿主 env；远程字典失败时保留占位。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
