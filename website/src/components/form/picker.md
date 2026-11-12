---
title: Picker 列表选择器
outline: deep
---

# Picker 列表选择器

::: info 实现进度 75% · 进行中
静态 `options`、`multiple`、弹层搜索 / 确认 / 取消、`embed` 内嵌、`maxTagCount`、`clearable`、`joinValues` / `delimiter`、`labelField` / `valueField`。缺 `pickerSchema` 自定义弹层、远程 `source`、分页 / 分组 / 树选择。
:::

列表选择器：弹层里选选项，确认后写回表单。属于普通表单项，通用属性见 [FormItem](./formitem)。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
body:
  - type: picker
    name: picker
    label: 选择器
    options:
      - label: 选项 A
        value: a
      - label: 选项 B
        value: b
      - label: 选项 C
        value: c
```

## 多选

`multiple: true` 可多选；`joinValues` + `delimiter` 控制写回格式：

```yaml
type: picker
name: picker
label: 多选
multiple: true
joinValues: true
delimiter: ","
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 内嵌模式

`embed: true` 不弹层，直接把列表画在表单里：

```yaml
type: picker
name: picker
label: 内嵌
embed: true
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 限制标签最大展示数量

`maxTagCount: 2` 只展示前 2 个标签，其余折叠成 `+N`：

```yaml
type: picker
name: picker
label: 限制标签
multiple: true
maxTagCount: 2
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
  - label: 选项 C
    value: c
```

## 远程选项

`source` 支持数据域变量或 API；返回数组 / `{options}` / `{items}` / `{records}`：

```yaml
type: picker
name: picker
label: 远程选择
source: /api/mock2/form/options
labelField: label
valueField: value
```

```yaml
type: picker
name: picker
label: 本地变量
source: "${dict}"
```

## 分页

`perPage` 控制弹层每页选项数，搜索时自动回到第一页：

```yaml
type: picker
name: picker
label: 分页选择
perPage: 10
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `options` | `Option[]` | | 静态选项 |
| `name` / `value` | | | 表单字段与初始值 |
| `multiple` | `boolean` | `false` | 多选 |
| `joinValues` | `boolean` | `true` | 多选时用分隔符拼接 |
| `delimiter` | `string` | `,` | 拼接分隔符 |
| `labelField` / `valueField` | `string` | `label` / `value` | 选项字段名 |
| `embed` | `boolean` | `false` | 内嵌列表 |
| `maxTagCount` | `number` | | 最多展示标签数，其余 `+N` |
| `perPage` | `number` | `10` | 弹层每页选项数 |
| `clearable` | `boolean` | `true` | 可清除 |
| `placeholder` | `string` | `请选择` | 未选占位 |
| `modalTitle` | `string` | | 弹层标题 |
| `pickerSchema` | Schema | | **未接** 自定义弹层 |
| `source` | API / 变量 | | 远程或数据域选项 |

## 事件表

弹层确认 / 清空会写回表单字段；`picker` 暂无独立组件事件。

## 动作表

`picker` 没有专属动作。

## 和 Amis 文档的差异

- 与 Amis 一致：静态 options、multiple、joinValues/delimiter、弹层搜索/确定/取消、clearable。
- 已加：`embed` 内嵌、`maxTagCount` 折叠标签。
- 未接：`pickerSchema`、分组 / 树选择、完整事件动作表。
