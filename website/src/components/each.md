---
title: Each 循环渲染器
outline: deep
---

# Each 循环渲染器

::: info 实现进度 90% · 进行中
`value` / `source` / `name` 取数组、对象转 `{key,value}`、`items` 循环（含数组嵌套）、`itemKeyName` / `indexKeyName`、默认占位「暂无数据」、`maxLength`（含表达式）。文档主路径活示例已对标 Amis。余项：`themeCss`。
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

### 如果是对象数组

对象成员可直接取字段，也可用 `item.xxx`；`index` 是数组下标。

::: warning
如果成员对象本身也有名字为 `index` 的字段就会覆盖到，获取不到索引了，请查看「循环嵌套」的章节解决。
:::

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

### 循环嵌套

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

Table 列、List / Card 内容、表单静态展示都可用 `each`，按 `name` 映射同名变量，再用 `item` 取单项。

### Table 中的列类型

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      each: [A1, B1, C1]
    - id: "2"
      each: [A2, B2, C2]
    - id: "3"
      each: []
columns:
  - name: id
    label: Id
  - name: each
    label: 循环
    type: each
    placeholder: 暂无内容
    items:
      type: tpl
      tpl: "<span class='label label-info m-l-sm'>${item}</span>"
```

List、Card 的内容配置同上。

### Form 中静态展示

```schema: scope="body"
type: form
data:
  each: [A, B, C]
body:
  - type: each
    label: 静态展示each
    name: each
    items:
      type: tpl
      tpl: "<span class='label label-info m-l-sm'>${item}</span>"
```

## 使用数据映射

```schema: scope="page"
type: page
data:
  arr: [A, B, C]
body:
  type: each
  source: "${arr}"
  items:
    type: tpl
    tpl: "<span class='label label-default m-l-sm'>${item}</span> "
```

源码取值顺序是 `value` > `source` > `name`。用作 Field 时运行时会把 `name` 映射进 `value`，所以文档里「`name` 比 `source` 更高」指的是这种用法。

## 动态表单项

表单项可通过表达式配置动态字段，结合 `each` 使用。循环体里的 `name` / `label` 会按当前成员展开。

```schema: scope="page"
type: page
data:
  arr: [A, B, C]
body:
  - type: form
    debug: true
    body:
      - type: each
        source: "${arr}"
        items:
          type: input-text
          label: Input${item}
          name: text${index}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"each"` | 指定为 Each 组件 |
| `value` | `array` | | 直接给定要循环的值，优先于 `source` / `name` |
| `name` | `string` | | 取数据域同名变量 |
| `source` | `string` | | 数据映射表达式，见 [数据映射](/docs/concepts/data-mapping) |
| `items` | [SchemaNode](/types/schemanode) | | 使用当前成员循环输出渲染器 |
| `placeholder` | `string` | `"暂无数据"` | `value` 不存在或为空数组时的占位文本 |
| `itemKeyName` | `string` | `item` | 当前成员在循环体内的变量名 |
| `indexKeyName` | `string` | `index` | 当前序号变量名 |
| `maxLength` | `number` / 表达式 | | 最多循环次数（Amis 源码有，文档表未列） |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- `items` 未写时回落到 `{ type: tpl, tpl: '${item}' }`。
- 未接 `themeCss` / `wrapperCustomStyle`。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
