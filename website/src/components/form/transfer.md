---
title: Transfer 穿梭器
outline: deep
---

# Transfer 穿梭器

::: info 实现进度 75% · 进行中
主路径：`options` 静态选项、左右移动 / 全部 / 清空、`value` / `joinValues` / `delimiter`、`searchable` + `searchPlaceholder`、`leftTitle` / `rightTitle`。缺 table / tree / chained 模式、远程 `source`、分页、排序、拖拽。
:::

穿梭选择器。属于普通表单项，通用属性见 [FormItem](./formitem)。Vamis 用 YAML 或 JSON 书写。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
body:
  - type: transfer
    name: transfer
    label: 穿梭器
    options:
      - label: 选项 A
        value: a
      - label: 选项 B
        value: b
      - label: 选项 C
        value: c
```

## 展示模式

`mode` 支持 `list`（默认）/ `table`；`tree` / `chained` 仍按 list 展示，未接。

```yaml
type: transfer
name: transfer
label: 表格模式
mode: table
leftTitle: 待选
rightTitle: 已选
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 搜索

`searchable: true` 时左右两栏出现搜索框，`searchPlaceholder` 改占位，`leftTitle` / `rightTitle` 加栏标题：

```yaml
type: transfer
name: transfer
label: 穿梭器
searchable: true
searchPlaceholder: 搜索选项
leftTitle: 待选
rightTitle: 已选
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 远程选项

`source` 支持数据域变量 / API，归一到 options / items / records：

```yaml
type: transfer
name: transfer
label: 远程穿梭
source: /api/mock2/form/options
labelField: label
valueField: value
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `options` | `Option[]` | | 静态选项 |
| `value` / `name` | | | 已选值 |
| `joinValues` | `boolean` | `true` | 是否用分隔符拼接 |
| `delimiter` | `string` | `,` | 拼接分隔符 |
| `searchable` | `boolean` | `false` | 左右搜索框 |
| `searchPlaceholder` | `string` | `搜索` | 搜索占位 |
| `leftTitle` / `rightTitle` | `string` | | 左右栏标题 |
| `mode` | `string` | `list` | `list` / `table`；tree/chained 未接 |
| `source` | API / 变量 | | 远程或数据域选项 |

## 和 Amis 文档的差异

- 与 Amis 一致：静态 options、左右移动、全部 / 清空、joinValues / delimiter。
- 已加：searchable / searchPlaceholder / leftTitle / rightTitle。
- 未接：tree / chained 模式、分页、排序、拖拽、属性/事件/动作表完整项。
