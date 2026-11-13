---
title: Each 循环渲染器
outline: deep
---

# Each 循环渲染器

::: info 实现进度 80% · 进行中
`source` / `name` / `value` 取数组、对象转 `{key,value}`、`items` 循环渲染、`itemKeyName` / `indexKeyName`、`placeholder`、`maxLength`（支持表达式）。文档按 Amis 章节扩展。余项：动态数据源/远程 items 依赖宿主 API。
:::

`each` 按数组循环渲染 `items`。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

通过 `name` 指定要循环的数组，`items` 指定循环内容。

```schema: scope="page"
type: page
data:
  arr: [A, B, C]
body:
  type: each
  name: arr
  items:
    type: tpl
    tpl: "<span class='label label-default m-l-sm'>${item}</span> "
```

## 如果是对象数组

对象成员可直接取字段，也可用 `item.xxx`；`index` 是数组下标。

```schema: scope="page" height="160"
type: page
data:
  arr:
    - name: a
    - name: b
    - name: c
body:
  type: each
  name: arr
  items:
    type: tpl
    tpl: "<span class='label label-default m-l-sm'>${name}:${index}</span> "
```

## 循环嵌套

默认 `item` / `index` 只指向最内层。要拿外层信息，自定义 `itemKeyName` / `indexKeyName`。

```schema: scope="page" height="160"
type: page
data:
  arr:
    - name: a
      subList: [a1, a2]
    - name: b
      subList: [b1, b2]
    - name: c
      subList: [c1, c2]
body:
  type: each
  name: arr
  itemKeyName: itemOutter
  indexKeyName: indexOutter
  items:
    - type: tpl
      inline: false
      tpl: "<span class='label label-default m-l-sm'>${name}:${index}</span> "
    - type: each
      name: subList
      items:
        - type: tpl
          tpl: "<span class='label label-default m-l-sm'>${itemOutter.name}-${item}:${indexOutter}-${index}</span> "
```

## 用作 Field 时

Table 列、Form 静态展示都可用 `each`，按 `name` 映射同名变量。

### Table 中的列类型

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      tags: [前端, 低代码]
    - id: "2"
      tags: [Vue, Amis]
columns:
  - name: id
    label: Id
  - name: tags
    label: 标签
    type: each
    items:
      type: tag
      label: "${item}"
```

### Form 中静态展示

```schema: scope="body"
type: form
data:
  names: [张三, 李四]
body:
  - type: static-each
    name: names
    label: 成员
    items:
      type: tpl
      tpl: "${item}"
```

## 使用数据映射

`source` 支持数据映射表达式，`maxLength` 控制最多循环次数：

```schema: scope="body"
type: each
source: "${items}"
maxLength: 2
items:
  type: tpl
  tpl: "${item}"
data:
  items: [1, 2, 3, 4]
```

## 动态表单项

`items` 可以为 array，循环产出多个表单项（如动态字段）：

```yaml
type: form
data:
  fields: [name, email]
body:
  - type: each
    source: "${fields}"
    items:
      type: input-text
      name: "${item}"
      label: "${item}"
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | `array` | `[]` | 直接给定要循环的值 |
| `name` | `string` | | 取数据域同名变量 |
| `source` | `string` | | 数据映射表达式，优先于 `name` |
| `items` / `body` | SchemaNode | | 循环体 |
| `placeholder` | `string` | | 空数组时占位文本 |
| `itemKeyName` | `string` | `item` | 当前成员在循环体内的变量名 |
| `indexKeyName` | `string` | `index` | 当前序号变量名 |
| `maxLength` | `number` / 表达式 | | 最多循环次数 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：数组循环、对象转 `{key,value}`、`items`、`itemKeyName` / `indexKeyName`、`placeholder`、`maxLength`。
- Vamis 不额外套 `.Each` 竖排壳，`tpl` 成员默认 inline；`static-each` 走 Static 泛型。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
