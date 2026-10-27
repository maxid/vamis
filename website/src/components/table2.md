---
title: Table2 表格
outline: deep
---

# Table2 表格

::: info 实现进度 70% · 进行中
文档主路径已对齐：`source` 默认 `${items}`、`title` / `footer`、列 `title`/`name`/`type`、`rowSelection` 多选/单选/`rowClick`/`selectedRowKeys`/`disableOn`/选择菜单/`maxKeepItemSelectionLength`、`bordered`、`placeholder`、`size`、`columnsTogglable` auto（叶列 > 5）。缺展开行、树、固定列、表头分组、拖拽、总结栏、列宽拖、quickEdit、行悬浮操作、粘性头、列搜索。
:::

表格展示。不配初始化接口，需要搭配 [Service](./service) 拉数据，或手动初始化数据域，再用 `source` 从数据链取行。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

可配置表头（`title`）、表尾（`footer`），同时支持文本或者 schema。文档接口走 `/api/mock2/sample`（Amis 文档是 `/api/sample`，字段相同）。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  title: 表格标题 - ${rows.length}
  source: $rows
  canAccessSuperData: true
  columns:
    - title: Engine
      name: engine
      width: 120
    - title: Version
      name: version
    - title: Browser
      name: browser
    - title: Operation
      name: operation
      type: button
      label: 删除
      size: sm
  footer:
    type: tpl
    tpl: 表格Footer
```

## 可选择

通过 `rowSelection` 支持单选或多选，也可以用 `selectable` / `multiple`（优先级更高）。

### 多选

`rowSelection` 设为 `true`，或不指定 `type`，默认多选。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  rowSelection:
    type: checkbox
    keyField: id
  columns:
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
    - title: Operation
      name: operation
      type: button
      label: 删除
      size: sm
```

### 点击整行选择

`rowSelection.rowClick` 为 true 时点行也能勾选。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  rowSelection:
    type: checkbox
    keyField: id
    rowClick: true
  columns:
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
    - title: Operation
      name: operation
      type: button
      label: 删除
      size: sm
```

### 已选择

`rowSelection.selectedRowKeys` 指定已选中的项。匹配字段优先级：`primaryField` > `rowSelection.keyField` > `keyField`，默认 `id`。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  rowSelection:
    type: checkbox
    keyField: id
    selectedRowKeys:
      - 1
      - 2
  columns:
    - title: ID
      name: id
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
```

### 单选

`rowSelection.type` 为 `radio`，或 `selectable: true` 且 `multiple: false`。`disableOn` 用 `{record, rowIndex}` 判断（如 `this.record.id === 1`）。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  rowSelection:
    type: radio
    keyField: id
    disableOn: this.record.id === 1
  columns:
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
```

### 自定义选择菜单

内置 `all` / `invert` / `none` / `odd` / `even`。被禁用的行不参与奇偶计算。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  rowSelection:
    type: checkbox
    keyField: id
    selections:
      - key: all
        text: 全选所有
      - key: invert
        text: 反选当页
      - key: none
        text: 清空所有
      - key: odd
        text: 选择奇数行
      - key: even
        text: 选择偶数行
  columns:
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
```

### 最大选择个数

`maxKeepItemSelectionLength` 限制最多选几条。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  maxKeepItemSelectionLength: 2
  rowSelection:
    type: checkbox
    keyField: id
  columns:
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
```

## 筛选和排序

列上 `sorter` / `sortable` 开启排序。`filters` 依赖 `crud2`，本页表格内排序可点列头切换升/降序。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  columns:
    - title: Engine
      name: engine
      sorter: true
    - title: Version
      name: version
      sorter: true
      width: 100
    - title: Browser
      name: browser
```

## 带边框

`bordered` 控制单元格边框。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  type: table2
  source: $rows
  bordered: true
  title: 标题
  footer: Footer
  columns:
    - title: Engine
      name: engine
    - title: Version
      name: version
    - title: Browser
      name: browser
    - title: Operation
      name: operation
      type: button
      label: 删除
      size: sm
```

## 数据为空

`placeholder` 自定义空数据文案，默认「暂无数据」。也支持 schema。

```schema
type: table2
data:
  items: []
columns:
  - title: Engine
    name: engine
    width: 200
  - title: Version
    name: version
    width: 200
  - title: Browser
    name: browser
    width: 200
placeholder: 暂无数据
```

## 表格尺寸

`size` 支持 `large` / `default` / `small`，默认 `default`。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=6
body:
  type: table2
  source: $rows
  size: large
  rowSelection:
    type: checkbox
    keyField: id
  columns:
    - title: Engine
      name: engine
      sorter: true
    - title: Version
      name: version
    - title: Browser
      name: browser
    - title: Badge
      name: grade
    - title: Platform
      name: platform
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | | `"table2"` |
| title | `string` \| `Schema` | | 标题，字符串走 `${}` |
| source | `string` | `${items}` | 数据源，绑定当前环境变量。也认 `$rows` |
| footer | `string` \| `Schema` | | 表尾 |
| loading | `boolean` | | 加载中 |
| columnsTogglable | `auto` \| `boolean` | `auto` | 叶列 > 5 时自动出列显示开关 |
| placeholder | `string` \| `Schema` | `暂无数据` | 没数据时的提示 |
| bordered | `boolean` | `false` | 单元格边框 |
| size | `large` \| `default` \| `small` | `default` | 行高 |
| showHeader | `boolean` | `true` | 是否展示表头 |
| rowSelection | `true` \| `rowSelection` | | 行选择 |
| selectable / multiple | `boolean` | | 优先级高于 `rowSelection` |
| keyField / primaryField | `string` | `id` | 行主键，优先级 `primaryField` > `rowSelection.keyField` > `keyField` |
| maxKeepItemSelectionLength | `number` | | 最多选几条 |
| columns | `Array<Column>` | | 列。表头用 `title`（也认 `label`） |
| canAccessSuperData | `boolean` | `false` | 单元格是否读父级数据域 |

### 行配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `checkbox` \| `radio` | `checkbox` | 多选 / 单选 |
| keyField | `string` | | 见上 |
| disableOn | `string` | | `this.record` / `rowIndex` |
| selectedRowKeys | `Array` | | 已选项 |
| selections | `Array<{key, text}>` | | `all` / `invert` / `none` / `odd` / `even` |
| rowClick | `boolean` | | 点行勾选 |

### 列配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title / label | `string` \| `Schema` | | 表头 |
| name | `string` | | 字段 |
| type | `string` | | 单元格渲染器，如 `button` / `tpl` |
| tpl | `string` | | 单元格模板 |
| sorter / sortable | `boolean` | `false` | 列排序 |
| width | `number` \| `string` | | 列宽 |
| children | `Array<Column>` | | 表头分组（当前展平为叶列） |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 活示例接口用 `/api/mock2/sample`，与 CRUD 文档同一份 mock（Amis 文档写 `/api/sample`）。
- 尚未做：展开行、树形、固定头/列、表头分组展示、拖拽排序、总结栏、列宽拖拽、quickEdit、行悬浮操作、粘性头、列搜索、单元格合并、`selectedRowKeysExpr`。
