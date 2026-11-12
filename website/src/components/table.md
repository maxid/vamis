---
title: Table 表格
outline: deep
---

# Table 表格

::: info 实现进度 65% · 进行中
主路径：`columns`（name / label / type / width / tpl / mapping / action）、`data` / `source` 数据、空状态 `placeholder`、标题 `title`、行 `rowClassName`、整行 `itemAction`、列 `popOver`。缺独立数据域、`quickEdit`、多选 / 拖拽 / 合并单元格 / 超级表头 / 总结行等高阶能力。
:::

表格展示。Vamis 用 YAML 或 JSON 书写，字段名不改写。复杂场景建议用 [CRUD](/components/crud)。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: table
title: 浏览器
data:
  items:
    - id: "1"
      engine: Blink
      browser: Chrome
      version: "100"
    - id: "2"
      engine: WebKit
      browser: Safari
      version: "15"
columns:
  - name: id
    label: ID
  - name: engine
    label: Engine
  - name: browser
    label: Browser
  - name: version
    label: Version
```

## 数据需求

`data` 可以是数组或 `{ items: [] }`；也可 `source: "${rows}"` 从数据域取：

```schema: scope="body"
type: table
source: "${rows}"
columns:
  - name: name
    label: 名称
  - name: age
    label: 年龄
data:
  rows:
    - name: 张三
      age: 18
    - name: 李四
      age: 20
```

## 空状态展示

无数据时显示 `placeholder`，默认「暂无数据」：

```schema: scope="body"
type: table
placeholder: 暂时没有记录
data:
  items: []
columns:
  - name: name
    label: 名称
```

## 列配置

列支持 `name` / `label` / `width`，`type` 可切到 `tpl`、`mapping`、`tag`、`button` 等渲染器：

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      status: "1"
      name: Chrome
    - id: "2"
      status: "2"
      name: Safari
columns:
  - name: id
    label: ID
    width: 60
  - name: name
    label: 名称
    type: tpl
    tpl: "${name}（${id}）"
  - name: status
    label: 状态
    type: mapping
    map:
      "1": "<span class='label label-success'>正常</span>"
      "2": "<span class='label label-default'>停用</span>"
```

## 行操作按钮

列 `type: button`，按钮里用当前行数据：

```yaml
type: table
data:
  items:
    - id: "1"
      name: Chrome
columns:
  - name: name
    label: 名称
  - type: button
    label: 查看
    level: link
    actionType: dialog
    dialog:
      title: 详情
      body: "当前行：${name}"
```

## 单行点击操作

`itemAction` 让整行可点击：

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      name: Chrome
    - id: "2"
      name: Safari
itemAction:
  actionType: dialog
  dialog:
    title: 详情
    body: "当前行：${name}"
columns:
  - name: name
    label: 名称
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `columns` | `Column[]` | | 列配置：`name` / `label` / `type` / `width` / `tpl` / `map` / `popOver` |
| `data` | `array` / `{items}` | | 表格数据 |
| `source` | `string` | | 从数据域取数组 |
| `title` | `string` | | 表格标题 |
| `placeholder` | `string` | `暂无数据` | 空状态文案 |
| `itemAction` | Action | | 整行点击动作 |
| `rowClassName` | `string` | | 行 class，支持表达式 |
| `columns[].popOver` | `PopOver` | | 单元格详情弹层 |

## 事件表

表格单元格内的按钮 / 表单事件由对应渲染器派发；整行点击用 `itemAction`，当前行为 `rowClick` 尚未独立派发。

## 动作表

表格没有专属动作；刷新数据通常由外层 `service` / `crud` 的 `reload` 触发。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 已接：基础列渲染、`type` 列、`data` / `source`、空状态、标题、整行 `itemAction`、列 `popOver`。
- 未接：独立数据域、多选 / 拖拽 / 排序 / 合并单元格 / 超级表头 / 总结行 / 固定列 / `quickEdit`、`rowClick` 事件。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
