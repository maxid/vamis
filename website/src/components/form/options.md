---
title: Options 选择器表单项
outline: deep
---

# Options 选择器表单项

::: info 实现进度 75% · 进行中
已抽出统一 Options 契约：选项规范化、`source` 数据域/远程、`joinValues` / `extractValue` / `delimiter`、`multiple` / `checkAll` / `selectFirst`、`labelField` / `valueField`、`clearable` / `searchable` / `creatable`、选项 `autoFill`。缺选项编辑/删除接口、延时加载 `deferApi`、虚拟列表。
:::

**选择器表单项** 是指那些（例如下拉选择框）具有选择器特性的表单项。它派生自 [表单项](./formitem)，拥有表单项所有的特性。

Vamis 用 YAML 或 JSON 书写，字段名不改写；JSON 同等有效。UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀。字段由 `select`、`radios`、`checkboxes`、`list-select` 等共用，本页用 `select` 演示契约。

## 选项组格式

选择器表单项可以通过配置一组选项 `options`，供给用户选择：

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

`options` 配置的对象数组就是选择器的选项组。

### 标准格式

```json
{
  "options": [
    {
      "label": "xxx1",
      "value": "value1",
      "children": []
    }
  ]
}
```

标准选项是对象数组，每项需要：

- `label`：显示文本
- `value`：提交/映射用的值
- `children`：嵌套子选项，只在 Tree / Nested-Select 等支持嵌套的组件里有用

改选项会改数据域里该表单项的值，默认是选中项的 `value`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### 简单格式

也可以配置字符串或数字数组，此时默认 `label` 和 `value` 一致：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    options:
      - A
      - B
      - C
```

### 单一选项禁用

给某一项配置 `disabled: true`，用户不可选：

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    options:
      - label: A
        value: a
        disabled: true
      - label: B
        value: b
      - label: C
        value: c
```

## 静态选项组 options

可以使用静态方式配置一组选项：

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 动态选项组 source

### 通过数据域中变量配置

配置 `source`，利用 [数据映射](/concepts/data-mapping) 获取当前数据链中的变量：

```schema: scope="body"
type: form
data:
  items:
    - label: A
      value: a
    - label: B
      value: b
    - label: C
      value: c
body:
  - label: 选项
    type: select
    name: select
    source: ${items}
```

上例给 select 配 `"source": "${items}"`，用当前数据域里的 `items` 当选项组。

### 远程拉取

`source` 还支持配置接口，格式为 [API](/types/api)，动态返回选项组。

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    source: /api/mock2/form/getOptions?waitSeconds=1
```

远程接口除了满足 [接口返回格式](/types/api) 以外，用 `options` 作为选项组的 key：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "options": [
      { "label": "A", "value": "a" },
      { "label": "B", "value": "b" },
      { "label": "C", "value": "c" }
    ]
  }
}
```

或者 `data` 直接是数组。`items` 同样可当选项组。

## 默认值/自动选中 value

表单项可以通过 `value` 设默认值。选择器如果把 `value` 配成某一项的 `value`，会自动选中该项。

### 静态配置

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    value: b
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

上例默认值 `b`，会匹配到选项 B。

如果想默认选第一项，配 `selectFirst`：

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    selectFirst: true
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### 动态配置

`options` 是远程拉取、默认值不确定时，**需要在 `source` 接口里返回 `value`**：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "value": "b",
    "options": [
      { "label": "A", "value": "a" },
      { "label": "B", "value": "b" },
      { "label": "C", "value": "c" }
    ]
  }
}
```

### 数据格式一致性问题

`source` 或 `value` 配的默认值必须和当前表单项的值格式一致。否则可能选不中，提交时也会把原值原样交给后端。

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    multiple: true
    value:
      - a
      - c
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

上例 `multiple: true` 时期望值是 `"a,c"`，却写了 `value: ["a", "c"]`，格式对不上。请让默认值和 `joinValues` / `extractValue` / `delimiter` 的配置匹配。

## 多选 multiple

大部分选择器默认单选，配 `multiple: true` 支持多选。

```schema: scope="body"
type: form
debug: true
data:
  options:
    - label: A
      value: a
    - label: B
      value: b
    - label: C
      value: c
body:
  - label: 单选
    type: select
    name: select1
    source: ${options}
  - type: divider
  - label: 多选
    type: select
    name: select2
    multiple: true
    source: ${options}
```

还可以通过 `checkAll` 开启全选。

```schema: scope="body"
type: form
body:
  - label: 多选
    type: select
    name: select2
    checkAll: true
    multiple: true
    source: /api/mock2/form/getOptions
```

默认多选值是逗号拼接的 value，例如 `1,2,3`。要改格式请看下面的 delimiter / joinValues / extractValue。

值太多折行可以用 `valuesNoWrap` 避免折行。

```schema: scope="body"
type: form
debug: true
body:
  - label: 多选
    type: select
    name: select2
    checkAll: true
    valuesNoWrap: true
    multiple: true
    source: /api/mock2/form/getOptions
```

## 拼接符 delimiter

多选默认用 `,` 拼接选中项的 `value`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    multiple: true
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

如果某个 `value` 本身含逗号，请改 `delimiter`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    multiple: true
    delimiter: "|"
    options:
      - label: A
        value: a,1
      - label: B
        value: b,2
      - label: C
        value: c,3
```

## 拼接值 joinValues

选中后默认值格式：

- 单选：选中项的 `value`
- 多选：所有选中 `value` 用拼接符连起来，默认 `,`

```schema: scope="body"
type: form
debug: true
body:
  - label: 单选
    type: select
    name: select1
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
  - type: divider
  - label: 多选
    type: select
    name: select2
    multiple: true
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

配 `joinValues: false` 可以拿到完整选项对象。

### 单选模式

单选 + `joinValues: false`，值为选中项的完整对象：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    joinValues: false
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### 多选模式

多选 + `joinValues: false`，值为选中项的对象数组：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    multiple: true
    joinValues: false
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### 自动选中问题

改了值结构后，默认值格式也要一致。`joinValues: false` 时默认选中 B 应写成对象：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    joinValues: false
    value:
      label: B
      value: b
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 提取多选值 extractValue

`joinValues: false` 时默认提交对象数组。如果只想抽 `value` 组成新数组，配 `extractValue: true`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    multiple: true
    joinValues: false
    extractValue: true
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

选中全部会得到 `["a", "b", "c"]`。

### 自动选中问题

默认值也要是同样格式，例如 `["a", "b"]`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    multiple: true
    joinValues: false
    extractValue: true
    value:
      - a
      - b
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 检索 searchable

配 `searchable: true` 显示前端过滤，适合选项很多的列表。

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    searchable: true
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 自动补全 autoComplete

```schema: scope="body"
type: form
body:
  - name: select
    type: select
    label: 选项自动补全
    autoComplete: /api/mock2/options/autoComplete?term=$term
    placeholder: 请输入
```

可以在 `autoComplete` 里用数据映射取变量 `term`，即当前输入的关键字。

支持该配置的组件有：Text、Select、Chained-Select、TreeSelect、Condition-Builder。

## 选项标签字段 labelField

默认用每项的 `label` 做展示。选项里只有 `text` 没有 `label` 时，下拉会看不到文案：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    options:
      - text: A
        value: a
      - text: B
        value: b
      - text: C
        value: c
```

这时配 `labelField: text`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    labelField: text
    options:
      - text: A
        value: a
      - text: B
        value: b
      - text: C
        value: c
```

不推荐依赖该字段，建议把选项组格式化成 `label` / `value`。

## 选项值字段 valueField

默认用每项的 `value` 当表单值。只有 `label` 和 `val` 时无法选中：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    options:
      - label: A
        val: a
      - label: B
        val: b
      - label: C
        val: c
```

这时配 `valueField: val`：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    valueField: val
    options:
      - label: A
        val: a
      - label: B
        val: b
      - label: C
        val: c
```

## 新增选项

部分选择器支持前端新增。支持的组件：CheckBoxes、Select、Tree。

### 前端新增 creatable

配 `creatable: true`，下拉底部会出现新增按钮：

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    creatable: true
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

- `createBtnLabel` 自定义按钮文案
- `optionLabel` 替换「选项」二字，例如 `员工` → `新增员工`
- 默认表单项 `name` 是 `labelField`，默认 `label`

### 自定义新增表单项 addControls

默认只有一个文本框，新增后 `label` 和 `value` 相同。可以用 `addControls` 自定义：

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    creatable: true
    addControls:
      - type: input-text
        name: label
        label: 选项标题
      - type: input-text
        name: value
        label: 选项值
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

没配保存接口时，`addControls` 里需要有 `labelField` / `valueField` 对应的 `name`。

### 配置新增接口 addApi

默认只存在前端。配 `addApi` 会在新增时请求接口；若同时有 `source`，成功后会重拉选项。

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    creatable: true
    addApi: /api/mock2/form/saveForm
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 编辑 / 删除选项

Amis 还支持 `editable` / `editControls` / `editApi` / `editDialog`，以及 `removable` / `deleteApi`。Vamis 本轮契约尚未接入这两条，下一刀 `select` 再补。

## 自动填充 autoFill

支持该配置的有：ButtonGroup、List、NestedSelect、Picker、Radios、Select、InputFile、InputImage、InputExcel。

把当前选中项的某个字段填到其它表单项，支持 [数据映射](/concepts/data-mapping)：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: select
    label: autoFill触发器
    name: select
    autoFill:
      option.instantValidate: ${label}
      option.submitValidate: ${label}
    clearable: true
    options:
      - label: Option A
        value: a
      - label: Option B
        value: b
  - type: input-text
    name: option.instantValidate
    label: 目标1
    description: 填充后立即校验
    required: true
    validateOnChange: true
    validations:
      equals: Option B
    validationErrors:
      equals: 校验失败，数据必须为Option B
  - type: input-text
    name: option.submitValidate
    label: 目标2
    description: 填充后提交表单时才校验
    required: true
    validations:
      equals: Option B
    validationErrors:
      equals: 校验失败，数据必须为Option B
  - type: input-text
    name: option.c
    label: 表单项3
    description: 不受autoFill影响的表单项
    value: abc
```

上例 `"autoFill": {"option.instantValidate": "${label}"}` 会把选中项的 `label` 填到 `option.instantValidate`。

**多选模式** 不能再直接取选项字段，而是通过 `items` 取当前选中集合：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: select
    label: 选项
    name: select
    autoFill:
      options: "${items|pick:label}"
      firstOption: "${items|first|pick:label}"
    multiple: true
    clearable: true
    options:
      - label: Option A
        value: a
      - label: Option B
        value: b
```

**初始不填充**：`initAutoFill` 默认 `fillIfNotSet`（目标没值才填）。`true` 总是覆盖，`false` 初始不填。

## 可清除 clearable

```schema: scope="body"
type: form
debug: true
body:
  - label: 选项
    type: select
    name: select
    clearable: true
    value: b
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 属性表

除了 [普通表单项属性表](./formitem#属性表) 以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| options | `Array` | | 选项组 |
| source | API 或数据映射 | | 选项组源 |
| multiple | `boolean` | `false` | 是否多选 |
| labelField | `string` | `"label"` | 哪一列是文案 |
| valueField | `string` | `"value"` | 哪一列是值 |
| deferField | `string` | `"defer"` | 哪一列是延时加载标记（尚未接入） |
| joinValues | `boolean` | `true` | 是否拼接 value |
| extractValue | `boolean` | `false` | `joinValues` 为 false 时是否只抽 value |
| itemHeight | `number` | `32` | 虚拟渲染行高（尚未接入） |
| virtualThreshold | `number` | `100` | 超过多少条开虚拟渲染（尚未接入） |
| valuesNoWrap | `boolean` | `false` | 多选值不折行 |
| clearValueOnSourceChange | `boolean` | | 数据域 source 变化后是否清空 |
| selectFirst | `boolean` | `false` | 默认选第一项 |
| checkAll | `boolean` | `false` | 多选全选 |
| searchable | `boolean` | `false` | 前端检索 |
| autoComplete | API | | 按 `$term` 补全 |
| clearable | `boolean` | `false` | 可清除 |
| creatable | `boolean` | `false` | 可新增 |
| createBtnLabel | `string` | `新增选项` | 新增按钮文案 |
| addControls | `Array` | | 新增表单项 |
| addApi | API | | 新增保存接口 |
| autoFill | `object` | | 把选中项映射到其它字段 |

## 事件 / 动作

走选择器共用契约（由 `select` 等控件挂上）：

| 事件 | 说明 |
|------|------|
| change | 值变化。`event.data.value` 是当前值 |

| 动作 | 说明 |
|------|------|
| clear | 写成 `resetValue`，默认空串 |
| reset | 恢复初始值 |
| reload | 重拉 `source` |
| setValue | 写入 value |

## 与 Amis 的差异

- 作者态 YAML / JSON 并列。
- 新增选项当前是下拉内简易表单，不是独立 Dialog；`addDialog` 尺寸等未接。
- `editable` / `editApi` / `removable` / `deleteApi` / `deferApi` / 虚拟列表尚未接入。
- 树形 / 级联 / 穿梭器已能复用值形状与 `normalizeOptions`，完整 UI 仍在各自组件页。
