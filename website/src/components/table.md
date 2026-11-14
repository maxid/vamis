---
title: Table 表格
outline: deep
---

# Table 表格

::: info 实现进度 99% · 进行中
主路径：`columns`、`data` / `source`、空状态（desk-empty 图 + 200px 占位）、表头列宽拖拽（`resizable` 默认 true）、选择 / 拖拽 / 合并 / 超级表头 / 快速编辑。缺 Footable、行角标 `itemBadge`、`autoFillHeight`、`backgroundScale`、悬浮 `itemActions`。
:::

表格展示，不支持配置初始化接口初始化数据域，所以需要搭配类似 [Service](/components/service) 这样具有接口初始化数据域的组件，或者手动初始化数据域，再通过 `source` 从数据链取数。Vamis 用 YAML 或 JSON 书写，字段名不改写。复杂场景建议用 [CRUD](/components/crud)。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

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

数据是对象数组，比如前面例子中 `rows` 的值类似：

```
[
    {
        "engine": "webkie",
        "version": 1
    }
]
```

## 空状态展示

无数据时显示 `placeholder`，默认「暂无数据」，并画出空状态插图：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    title: 表格1
    source: []
    columns:
      - name: engine
        label: Engine
      - name: version
        label: Version
    placeholder: 您还没有创建任何实例
```

## 列配置

`columns` 内除了 `label` 和 `name` 展示数据以外，还支持额外配置，用来更好地展示数据。

### 列类型

除了简单展示数据源返回的字段，列还支持除表单项以外的组件类型，例如 `tpl`、`mapping`、`progress`、`status`、`image`：

```schema: scope="body"
type: table
data:
  items:
    - id: "1"
      status: "1"
      name: Chrome
      progress: 22
    - id: "2"
      status: "2"
      name: Safari
      progress: 80
columns:
  - name: id
    label: ID
    width: 60
  - name: name
    label: 名称
    type: tpl
    tpl: "${name}（${id}）"
  - name: progress
    label: 进度
    type: progress
  - name: status
    label: 状态
    type: mapping
    map:
      "1": "<span class='label label-success'>正常</span>"
      "2": "<span class='label label-default'>停用</span>"
```

### 列宽

可以给列配置 `width`，有两种方式。

#### 固定像素

配置数字，单位像素。希望精准控制列宽时，把表格的 `tableLayout` 设为 `fixed`；标题文字长短会影响列的最小宽度。

> - 如果希望精准的控制列宽，请设置表格的 `tableLayout` 为 `fixed` 模式，同时为了让表格标题不换行，标题文字的长短会影响列的最小宽度
> - 注意：`resizable` 开启后，固定宽度的列则无法拖动调整列宽

```schema: scope="body"
type: crud
api: /api/mock2/sample?waitSeconds=1
tableLayout: fixed
columns:
  - name: id
    label: ID
  - name: engine
    label: Rendering engine
    width: 150
  - name: browser
    label: Browser
```

#### 百分比

也可以用百分比指定列宽：

```schema: scope="body"
type: crud
api: /api/mock2/sample?waitSeconds=1
columns:
  - name: id
    label: ID
  - name: engine
    label: Rendering engine
    width: 50%
```

### 列对齐方式

通过 `align` 控制列文本对齐：

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
      - label: Version
        type: tpl
        tpl: "${version | number}"
        align: right
```

表头单独对齐用 `headerAlign`（`left` / `right` / `center` / `justify`），单元格垂直对齐用 `vAlign`（`top` / `middle` / `bottom`）。

### 列样式

除了宽度和对齐，还可以通过样式类：

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
        className: text-primary
```

单独设置标题样式用 `labelClassName`：

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
        className: text-primary
        labelClassName: font-bold
```

### 单元格样式

`classNameExpr` 可以根据数据动态添加 CSS 类，支持 [模板](/concepts/template) 语法。例如 `${ version > 5 ? 'text-danger' : '' }` 表示当行 `version` 大于 5 时文字变红：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    columns:
      - name: engine
        label: Engine
      - name: version
        label: Version
        classNameExpr: "${ version > 5 ? 'text-danger' : '' }"
      - name: grade
        label: Grade
```

### 固定列

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

### 可复制

列上配置 `copyable: true`，会在内容区渲染复制图标，点击复制该显示内容：

```schema: scope="body"
type: table
source: $rows
data:
  rows:
    - id: 1
      engine: Trident
    - id: 2
      engine: Gecko
columns:
  - name: id
    label: ID
  - name: engine
    label: Rendering engine
    copyable: true
```

也可以配对象，自定义复制内容：

```schema: scope="body"
type: table
source: $rows
data:
  rows:
    - id: 1
      engine: Trident
    - id: 2
      engine: Gecko
columns:
  - name: id
    label: ID
  - name: engine
    label: Rendering engine
    copyable:
      content: "复制的内容是：${engine}"
```

### 弹出框（popOver）

列上配置 `popOver`，会在内容区渲染图标，点击显示弹出框。其它配置见 [popover](/components/popover)。

```schema: scope="body"
type: table
source: "${table}"
data:
  table:
    - id: 1
      text: The longest word in any of the major English language dictionaries is pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.
    - id: 2
      text: The longest word in any of the major English language dictionaries is pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.
columns:
  - name: id
    label: ID
  - name: text
    label: long text
    popOver:
      body:
        type: tpl
        tpl: "${text}"
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

`draggable: true` 时左侧出现拖拽手柄，松手派发 `orderChange`（`movedItems` 为排序后的行）：

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

`selectable: true` 显示行选择列；未写 `multiple` 时是单选圆点，`multiple: true` 才是多选勾选与表头全选。点行勾选需另开 `checkOnItemClick`（与 `itemAction` 互斥）：

```schema: scope="body"
type: table
selectable: true
multiple: true
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

选择结果通过组件 `getData().selectedItems` 读取，勾选派发 `selectedChange`。动作见下。

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

## 显示序号

配置 `showIndex: true` 开启序号列。嵌套行显示为 `1.1`、`1.2`：

```schema: scope="body"
type: table
showIndex: true
data:
  items:
    - engine: Trident
      browser: Internet Explorer 4.0
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
        - engine: Trident
          browser: Internet Explorer 5.0
    - engine: Gecko
      browser: Firefox 1.0
columns:
  - name: engine
    label: Engine
  - name: browser
    label: Browser
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

列配 `searchable: true` 出现文本搜索（事件 `columnSearch`）；`filterable.options` 出现下拉筛选（事件 `columnFilter`）：

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

## 高亮行

可以通过 `rowClassNameExpr` 给行添加 CSS 类，支持 [模板](/concepts/template) 语法。例如 `${id % 2 ? 'bg-success' : 'bg-blue-50'}`：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    rowClassNameExpr: "${id % 2 ? 'bg-success' : 'bg-blue-50'}"
    columns:
      - name: engine
        label: Engine
      - name: grade
        label: Grade
      - name: version
        label: Version
      - name: browser
        label: Browser
      - name: id
        label: ID
      - name: platform
        label: Platform
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

列 `type: button`，按钮里用当前行数据。对照示例只放一个按钮，避免探针按下标点错节点。

```schema: scope="body"
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

悬浮行操作 `itemActions` **未接**。

## 单行点击操作

还可以配置 `itemAction` 实现点击某一行后操作，支持 [action](/components/action) 里的配置，比如弹框、刷新其它组件。这个属性和 `checkOnItemClick` 冲突，开启 `itemAction` 后点行勾选会失效。

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
| `type` | `string` | | `"type"` 指定为 table 渲染器 |
| `title` | `string` | | 标题 |
| `source` | `string` | `${items}` | 数据源，绑定当前环境变量 |
| `data` | `array` / `{items}` | | 本地表格数据 |
| `placeholder` | `string` | `暂无数据` | 没数据时的文字提示 |
| `className` | [`ClassName`](/types/classname) | | 外层 CSS 类名 |
| `tableClassName` | [`ClassName`](/types/classname) | | 表格 CSS 类名 |
| `showIndex` | `boolean` | `false` | 是否展示序号 |
| `columns` | `Array<Column>` | | 列信息，见列配置属性表 |
| `combineNum` | `number` | | 自动合并单元格 |
| `combineFromIndex` | `number` | `0` | 跳过前 N 列再开始合并 |
| `itemAction` | [Action](/components/action) | | 整行点击动作 |
| `itemActions` | `Array<Action>` | | 悬浮行操作。**未接** |
| `itemCheckableOn` | [表达式](/concepts/expression) | | 当前行是否可勾选。**未接** |
| `checkOnItemClick` | `boolean` | `false` | 点击数据行是否勾选当前行 |
| `rowClassName` | `string` | | 给行添加 CSS 类名 |
| `rowClassNameExpr` | [模板](/concepts/template) | | 通过模板给行添加 CSS 类名 |
| `prefixRow` / `affixRow` | `SchemaNode[]` | | 顶部 / 底部总结行，支持 `colSpan` |
| `prefixRowClassName` / `affixRowClassName` | `string` | | 总结行 class |
| `itemBadge` | [`BadgeSchema`](/components/badge) | | 行角标。**未接** |
| `autoFillHeight` | `boolean` / `{height}` / `{maxHeight}` | | 内容区自适应高度。**未接** |
| `selectable` | `boolean` | `false` | 支持勾选 |
| `multiple` | `boolean` | `false` | `true` 为多选 checkbox，默认单选 radio |
| `tableLayout` | `auto` \| `fixed` | `auto` | `fixed` 时内容不会撑开表格 |
| `draggable` | `boolean` | `false` | 行拖拽排序 |
| `childrenColumnName` | `string` | `children` | 嵌套子行字段 |
| `id` | `string` | | 组件 API 的 `componentId` |
| `deferApi` | [API](/types/api) | | 行数据有 `defer` 时继续加载。**未接** |
| `affixHeader` | `boolean` | `true` | 固定表头。**未接** |
| `columnsTogglable` | `auto` / `boolean` | `auto` | 列显示开关。**未接** |
| `resizable` | `boolean` | `true` | 表头列之间拖拽调整列宽；`false` 关掉 |
| `footable` | `boolean` / `object` | | 底部展开列。**未接** |

### 列配置属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `label` | [模板](/concepts/template) | | 表头文本 |
| `name` | `string` | | 通过名称关联数据 |
| `type` | `string` | | 列渲染器，如 `tpl` / `mapping` / `progress` / `button` |
| `width` | `number` \| `string` | | 列宽，数字为像素，也可百分比 |
| `fixed` | `left` \| `right` \| `none` | | 是否固定当前列 |
| `popOver` | | | 弹出框 |
| `copyable` | `boolean` 或 `{content, tooltip}` | | 是否可复制 |
| `align` | `left` \| `right` \| `center` \| `justify` | | 单元格对齐 |
| `headerAlign` | `left` \| `right` \| `center` \| `justify` | | 表头对齐，未写则跟 `align` |
| `vAlign` | `top` \| `middle` \| `bottom` | | 单元格垂直对齐 |
| `className` | [`ClassName`](/types/classname) | | 列 CSS 类名 |
| `labelClassName` | [`ClassName`](/types/classname) | | 表头 CSS 类名 |
| `classNameExpr` | [模板](/concepts/template) | | 按行数据动态类名 |
| `groupName` | `string` | | 超级表头分组 |
| `sortable` | `boolean` | `false` | 表头可点击排序 |
| `sortBy` | `string` | | 排序字段，默认 `name` |
| `searchable` | `boolean` | `false` | 列文本搜索 |
| `filterable.options` | `any[]` | | 列下拉筛选 |
| `quickEdit` | `boolean` / object | `false` | 就地编辑：true / `{type: input-text\|input-number\|select\|textarea, options}` |
| `placeholder` | `string` | | 单元格空值占位 |
| `backgroundScale` | `object` | | 背景色阶。**未接** |
| `textOverflow` | `string` | `default` | 文本溢出：`ellipsis` / `noWrap`。走 [popOver](/components/popover) |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 监听，在 `actions` 里用 `${事件参数名}` 或 `${event.data.[事件参数名]}` 取数，详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `selectedChange` | `selectedItems` 已选择行<br/>`selectedIndexes` 已选择行索引<br/>`unSelectedItems` 未选择行 | 手动选择表格项时触发 |
| `columnSort` | `orderBy` / `orderDir` | 点击列排序时触发 |
| `columnFilter` | `filterName` / `filterValue` | 列下拉筛选变化 |
| `columnSearch` | `searchName` / `searchValue` | 列文本搜索变化 |
| `orderChange` | `movedItems` | 手动拖拽行排序后 |
| `rowClick` | `item` 行数据 / `index` / `indexPath` | 单击整行 |
| `rowDbClick` | `item` / `index` / `indexPath` | 双击整行 |
| `rowMouseEnter` | `item` / `index` / `indexPath` | 移入整行 |
| `rowMouseLeave` | `item` / `index` / `indexPath` | 移出行 |
| `quickEdit` | `name` / `value` / 行数据 | 快速编辑提交 |
| `columnToggled` | `columns` | 点击自定义列。**未接** |

单元格内的按钮 / 表单事件由对应渲染器派发。

## 动作表

其他组件可以通过 `actionType` + `componentId` 触发这些动作，参数写在 `args`，详见 [事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `select` | `args.index`，支持 `0,1` | 选中指定行 |
| `selectAll` | - | 全选 |
| `clearAll` | - | 清空选择 |
| `setValue` | `args.value` 为 `{items}` / `{rows}` | 更新列表记录 |
| `reload` | 通用动作 | 由外层 `service` / `crud` 处理 |
| `initDrag` / `cancelDrag` | - | 开关拖拽。**未接**（用 schema `draggable`） |
| `submitQuickEdit` | - | 快速编辑提交。**未接** |
| `toggleExpanded` / `setExpanded` | `args.index` | 展开收起。**未接**（点箭头即可） |

`setValue` 的 `value` 结构：`items` 或 `rows` 为 `item[]`。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 已接：列 `type` / `width` / `align` / `className` / `classNameExpr` / `copyable` / `popOver`、空状态、标题、`selectable` / `multiple` / `showIndex`、列排序 / 筛选 / 拖拽 / 合并 / 超级表头 / 总结行 / 嵌套 / 快速编辑、独立数据域。
- 未接：Footable、`itemBadge`、`itemActions` 悬浮按钮、`autoFillHeight`、`backgroundScale`、`columnsTogglable`、`affixHeader`、`deferApi`。
- 表头默认 `resizable: true`，列间拖拽线对齐 Amis `.Table-content-colDragLine`（7px / hover `--primary`）。写了数字 `width` 的列保持该宽，拖的是未钉死的列。
- 空状态对齐 Amis `Table-placeholder`：高度 200px、字号 12、色 `--colors-neutral-text-6`、`desk-empty` 图 74px。
- 子行不支持选择 / 合并 / 拖拽。筛选为客户端过滤。
- 列类型文档示例未搬 Amis 的 audio / carousel / list 大表，那些 type 各自有专页。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
