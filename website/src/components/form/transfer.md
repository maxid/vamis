---
title: Transfer 穿梭器
outline: deep
---

# Transfer 穿梭器

::: info 实现进度 82% · 进行中
主路径：`options` 静态选项、左右移动 / 全部 / 清空、`value` / `joinValues` / `delimiter`、`searchable` + `searchPlaceholder`、`leftTitle` / `rightTitle`。缺 table / tree / chained 模式、远程 `source`、分页、排序、拖拽。
:::

穿梭选择器。属于普通表单项，通用属性见 [FormItem](./formitem)。Vamis 用 YAML 或 JSON 书写。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: transfer
    name: transfer
    label: 默认
    value: zhugeliang,libai
    options:
      - label: 诸葛亮
        value: zhugeliang
      - label: 曹操
        value: caocao
      - label: 钟无艳
        value: zhongwuyan
      - label: 李白
        value: libai
      - label: 韩信
        value: hanxin
      - label: 云中君
        value: yunzhongjun
```

## 展示模式

`mode` 支持 `list`（默认）/ `table` / `tree`；`tree` 按 `children` 渲染可展开/折叠的层级（父节点仅展开、不参与选择），`chained` 未接。

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

`searchable: true` 时左侧出现搜索框；未配 `searchApi` 时按 label / value 本地匹配。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: transfer
    name: transfer
    label: 带搜索
    searchable: true
    options:
      - label: 诸葛亮
        value: zhugeliang
      - label: 曹操
        value: caocao
      - label: 钟无艳
        value: zhongwuyan
      - label: 李白
        value: libai
      - label: 韩信
        value: hanxin
      - label: 云中君
        value: yunzhongjun
```

## 树形模式

`mode: tree` 时按选项 `children` 渲染树，点击父节点展开/折叠，叶子节点才加入选择：

```yaml
type: transfer
name: transfer
label: 树形穿梭
mode: tree
options:
  - label: 前端
    children:
      - label: Vue
        value: vue
      - label: React
        value: react
  - label: 后端
    children:
      - label: Node
        value: node
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
| `mode` | `string` | `list` | `list` / `table` / `tree`（扁平缩进）；chained 未接 |
| `source` | API / 变量 | | 远程或数据域选项 |

## 和 Amis 文档的差异

- 与 Amis 一致：静态 options、左右移动、全部 / 清空、joinValues / delimiter。
- 已加：searchable / searchPlaceholder / leftTitle / rightTitle。
- 未接：chained 模式、分页、排序、拖拽、属性/事件/动作表完整项。
