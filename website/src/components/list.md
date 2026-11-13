---
title: List 列表
outline: deep
---

# List 列表

::: info 实现进度 75% · 进行中
`source` / `name` / `items` 取数、`listItem` 循环、`selectable` / `multiple` 多选与单选、`itemAction` 整行点击动作、`className` / `style`、`placeholder`、`itemClick` 事件、`select` / `selectAll` / `clearAll` 动作。缺字母索引条 / 拖拽排序。
:::

列表展示；本身不拉接口，通常用静态数据、[Service](/components/service) 或 CRUD。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

列表本身不拉接口，通常挂在 Service 上用 `source: $rows`。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: list
    source: $rows
    listItem:
      body:
        - type: hbox
          columns:
            - label: Engine
              name: engine
            - name: version
              label: Version
      actions:
        - type: button
          level: link
          label: 查看详情
          actionType: dialog
          dialog:
            title: 查看详情
            body:
              type: form
              body:
                - label: Engine
                  name: engine
                  type: static
                - name: version
                  label: Version
                  type: static
```

## 选择模式

`selectable: true` 开启多选；`multiple: false` 为单选：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: list
    selectable: true
    source: $rows
    listItem:
      body:
        - type: hbox
          columns:
            - label: Engine
              name: engine
            - name: version
              label: Version
```

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: list
    selectable: true
    multiple: false
    source: $rows
    listItem:
      body:
        - type: hbox
          columns:
            - label: Engine
              name: engine
            - name: version
              label: Version
```

## 单行点击操作

`itemAction` 配 action，点击整行触发（可弹框、刷新其它组件等）：

```schema: scope="body"
type: list
source: "${rows}"
itemAction:
  type: button
  actionType: dialog
  dialog:
    title: 详情
    body: "当前行：${browser} ${version}"
listItem:
  body:
    type: tpl
    tpl: "${browser} - ${version}"
data:
  rows:
    - browser: Chrome
      version: "100"
    - browser: Safari
      version: "15"
```

## 设置组件的 CSS 类

`className` 加在外层，`innerClassName` 留在列表层级（样式需自备）：

```schema: scope="body"
type: list
className: p-2
source: "${rows}"
listItem:
  body:
    type: tpl
    tpl: "${browser}"
data:
  rows:
    - browser: Chrome
    - browser: Safari
```

## 字母索引条

Amis 的 `listItem` 配合 `index` 字段可显示字母索引条；Vamis 暂未接，按普通列表渲染。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `source` / `name` | `string` | | 取数据域数组；`items` 也可直接传 |
| `listItem` | SchemaNode | | 每行内容，默认 `list-item` |
| `selectable` | `boolean` | `false` | 开启选择 |
| `multiple` | `boolean` | `true` | `false` 单选 |
| `itemAction` | Action | | 整行点击动作 |
| `placeholder` | `string` | `暂无列表数据` | 空列表占位 |
| `className` / `style` | | | 外层样式 |
| `innerClassName` | `string` | | 列表层 class（未特殊处理） |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `itemClick` | 当前行数据 + `index` | 点击某一行 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `select` | `args.index` | 选中/取消某行 |
| `selectAll` | - | 全选 |
| `clearAll` | - | 清空选择 |
| `reload` / `setValue` | 同通用动作 | 由外层作用域处理 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：`source` / `listItem`、多选/单选、`itemAction`、`itemClick`、选择动作。
- 未接：字母索引条、拖拽排序、`ListItem` 勾选框与 CRUD list 模式的联动细节；选择态存于组件本地（`getData()` 可读 `selectedItems`）。
