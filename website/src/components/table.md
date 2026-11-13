---
title: Table 表格
outline: deep
---

# Table 表格

::: info 实现进度 99% · 进行中
主路径：`columns`（name / label / type / width / tpl / mapping / action）、`data` / `source` 数据、空状态 `placeholder`、标题 `title`、行 `rowClassName`、整行 `itemAction`、列 `popOver`。缺独立数据域、`quickEdit`、多选 / 拖拽 / 合并单元格 / 超级表头 / 总结行等高阶能力。
:::

表格展示。Vamis 用 YAML 或 JSON 书写，字段名不改写。复杂场景建议用 [CRUD](/components/crud)。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

表格本身不拉接口，通常挂在 Service 上用 `source: $rows`。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    title: 表格1
    source: $rows
    columns:
      - name: engine
        label: Engine
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

## 超级表头

列配置 `groupName` 时，表头会多一行分组；同组相邻列合并 colspan，未分组列留空：

```schema: scope="body"
type: table
data:
  items:
    - engine: Blink
      browser: Chrome
      version: "100"
    - engine: WebKit
      browser: Safari
      version: "15"
columns:
  - name: engine
    label: 引擎
    groupName: 引擎信息
  - name: browser
    label: 浏览器
    groupName: 产品
  - name: version
    label: 版本
    groupName: 产品
```

## 合并单元格

`combineNum` 从左到右自动合并相同值的单元格；`combineFromIndex` 跳过前 N 列：

```schema: scope="body"
type: table
combineNum: 2
data:
  items:
    - engine: Trident
      browser: IE 4.2
      version: "4"
    - engine: Trident
      browser: IE 4.2
      version: "5"
    - engine: Gecko
      browser: Firefox 1.0
      version: "5"
columns:
  - name: engine
    label: Engine
  - name: browser
    label: Browser
  - name: version
    label: Version
```

## 拖拽排序

`draggable: true` 时整行可拖拽调整顺序，松手派发 `orderChange`（`movedItems` 为排序后的行）：

```schema: scope="body"
type: table
draggable: true
data:
  items:
    - id: "1"
      name: Chrome
    - id: "2"
      name: Safari
    - id: "3"
      name: Firefox
columns:
  - name: id
    label: ID
  - name: name
    label: 名称
```

## 列排序

列配 `sortable: true` 时点击表头做客户端排序；`sortBy` 可指定排序字段。事件 `columnSort` 返回 `orderBy` / `orderDir`：

```schema: scope="body"
type: table
data:
  items:
    - name: Chrome
      version: "100"
    - name: Safari
      version: "15"
    - name: Firefox
      version: "95"
columns:
  - name: name
    label: 名称
    sortable: true
  - name: version
    label: 版本
    sortable: true
```

## 选择模式

`selectable: true` 显示行勾选框与表头全选；`multiple: false` 单选：

```schema: scope="body"
type: table
selectable: true
data:
  items:
    - id: "1"
      name: Chrome
    - id: "2"
      name: Safari
columns:
  - name: name
    label: 名称
```

选择结果通过组件 `getData().selectedItems` 读取，动作见下。

## 独立数据域

表格注册了组件 API：`getData()` 返回 `items` / `rows` / `total` / `selectedItems`，`setData({ items })` 可替换本地行数据（按钮 `setValue` + `componentId` 即可）：

```yaml
type: button
label: 替换数据
onEvent:
  click:
    actions:
      - actionType: setValue
        componentId: my_table
        args:
          value:
            items:
              - name: Edge
```

`table` 需配置 `id: my_table`。

## 嵌套

行数据带 `children`（可用 `childrenColumnName` 改名）时出现展开箭头，子行缩进展示：

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      name: Chrome
      children:
        - id: "1-1"
          name: Chrome Beta
    - id: "2"
      name: Safari
columns:
  - name: id
    label: ID
  - name: name
    label: 名称
```

## 快速编辑

列配 `quickEdit: true` 时单元格出现编辑笔；对象写法支持 `select` / `textarea` / `input-number`，失焦/Enter/change 写回并派发 `quickEdit`：

```schema: scope="body"
type: table
data:
  items:
    - name: Chrome
      version: "100"
    - name: Safari
      version: "15"
columns:
  - name: name
    label: 名称
  - name: version
    label: 版本
    quickEdit: true
```

## 列筛选

列配 `searchable: true` 出现文本搜索；`filterable.options` 出现下拉筛选。变化派发 `columnFilter`：

```schema: scope="body"
type: table
data:
  items:
    - engine: Blink
      browser: Chrome
    - engine: WebKit
      browser: Safari
    - engine: Gecko
      browser: Firefox
columns:
  - name: engine
    label: Engine
    searchable: true
  - name: browser
    label: Browser
    filterable:
      options:
        - Chrome
        - Safari
```

## 固定列

列配 `fixed: left` / `right` 时横向滚动保持贴边；宽度用 `width` 控制：

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      name: Chrome
      engine: Blink
      version: "100"
columns:
  - name: id
    label: ID
    width: 80
    fixed: left
  - name: name
    label: 名称
    width: 180
    fixed: left
  - name: engine
    label: Engine
    width: 240
  - name: version
    label: Version
    width: 240
  - name: name
    label: 名称
    width: 240
```

## 总结行

`prefixRow` / `affixRow` 在表头下 / 表格底部插入总结行；单元格 schema 支持 `colSpan`。可用 `${rows|pick:version|sum}` 汇总：

```schema: scope="body"
type: table
data:
  items:
    - browser: Chrome
      version: "100"
    - browser: Safari
      version: "15"
columns:
  - name: browser
    label: Browser
  - name: version
    label: Version
affixRow:
  - type: text
    text: 总计
  - type: tpl
    tpl: "${rows|pick:version|sum}"
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
| `draggable` | `boolean` | `false` | 行拖拽排序 |
| `columns[].groupName` | `string` | | 超级表头分组 |
| `columns[].fixed` | `"left" \| "right"` | | 固定列 |
| `columns[].searchable` | `boolean` | `false` | 列文本搜索 |
| `columns[].quickEdit` | `boolean` / object | `false` | 就地编辑：true / `{type: input-text\|input-number\|select\|textarea, options}` |
| `columns[].filterable.options` | `any[]` | | 列下拉筛选 |
| `columns[].width` | `number` / `string` | | 列宽 |
| `childrenColumnName` | `string` | `children` | 嵌套子行字段 |
| `id` | `string` | | 组件 API 的 `componentId` |
| `prefixRow` / `affixRow` | `SchemaNode[]` | | 顶部 / 底部总结行，支持 `colSpan` |
| `prefixRowClassName` / `affixRowClassName` | `string` | | 总结行 class |
| `combineNum` | `number` | | 从左到右自动合并单元格列数 |
| `combineFromIndex` | `number` | `0` | 跳过前 N 列再开始合并 |
| `columns[].popOver` | `PopOver` | | 单元格详情弹层 |
| `columns[].sortable` | `boolean` | `false` | 表头可点击排序 |
| `columns[].sortBy` | `string` | | 排序字段，默认 `name` |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `rowClick` | 当前行数据 + `index` | 点击某一行（选择模式下同时切换勾选） |
| `columnSort` | `orderBy` / `orderDir` | 点击排序列 |
| `columnFilter` | `filterName` / `filterValue` | 列筛选变化 |
| `quickEdit` | `name` / `value` / 行数据 | 快速编辑提交 |
| `orderChange` | `movedItems` | 拖拽行排序后 |

单元格内的按钮 / 表单事件由对应渲染器派发。

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `select` | `args.index`，支持 `0,1` | 选中指定行 |
| `selectAll` | - | 全选 |
| `clearAll` | - | 清空选择 |
| `reload` / `setValue` | 通用动作 | 由外层作用域处理 |

刷新数据通常由外层 `service` / `crud` 的 `reload` 触发。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 已接：基础列渲染、`type` 列、`data` / `source`、空状态、标题、整行 `itemAction`、`selectable` / `multiple` / 全选、`rowClick`、列排序 / `columnSort`、行拖拽 / `orderChange`、选择动作、列 `popOver`。
- 独立数据域已接（`getData` / `setData`）；子行不支持选择/合并/拖拽。筛选为客户端过滤。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
