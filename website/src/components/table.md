---
title: Table 表格
outline: deep
---

# Table 表格

::: info 实现进度 88% · 进行中
文档主路径的章节、属性表、事件与动作已按 Amis 补齐，含懒加载子行、固定表头与底栏、大数据量懒渲染、单元格里的表单项写回行数据。还缺 `reUseRow` 和 Excel 导出，各章节的深色对照没有逐个核完。
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

默认没有外边框。`bordered: true` 给表格内容区画一圈圆角描边（Vamis 优化，对齐早期卡片外框）：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    bordered: true
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

除了简单展示数据源所返回的数据以外，列支持除表单项以外所有组件类型，例如：

```schema: scope="body"
{
    "type": "table",
    "data": {
        "items": [
            {
                "id": "91264",
                "text": "衡 阎",
                "progress": 22,
                "type": 4,
                "boolean": true,
                "list": [
                    {
                        "title": "Forward Functionality Technician",
                        "description": "nisi ex eum"
                    },
                    {
                        "title": "District Applications Specialist",
                        "description": "ipsam ratione voluptas"
                    },
                    {
                        "title": "Future Operations Manager",
                        "description": "ducimus fugit debitis"
                    },
                    {
                        "title": "Dynamic Solutions Associate",
                        "description": "saepe consequatur aut"
                    }
                ],
                "audio": "https://news-bos.cdn.bcebos.com/mvideo/%E7%9A%87%E5%90%8E%E5%A4%A7%E9%81%93%E4%B8%9C.aac",
                "carousel": [
                    {
                        "image": "https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg"
                    },
                    {
                        "html": "<div style=\"width: 100%; height: 200px; background: #e3e3e3; text-align: center; line-height: 200px;\">carousel data in crud</div>"
                    },
                    {
                        "image": "https://video-react.js.org/assets/poster.png"
                    }
                ],
                "date": 1591270438,
                "image": "https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg",
                "json": {
                    "id": 1,
                    "text": "text"
                }
            },
            {
                "id": "34202",
                "text": "吉 卢汉市",
                "progress": 85,
                "type": 1,
                "boolean": true,
                "list": [
                    {
                        "title": "Dynamic Assurance Orchestrator",
                        "description": "ea ullam voluptates"
                    },
                    {
                        "title": "Internal Division Assistant",
                        "description": "illum deleniti qui"
                    },
                    {
                        "title": "International Usability Administrator",
                        "description": "sit voluptatem quia"
                    },
                    {
                        "title": "Lead Optimization Orchestrator",
                        "description": "autem et blanditiis"
                    },
                    {
                        "title": "Future Division Assistant",
                        "description": "dolor cupiditate sint"
                    },
                    {
                        "title": "Forward Program Orchestrator",
                        "description": "quia distinctio voluptas"
                    },
                    {
                        "title": "Human Implementation Technician",
                        "description": "consequatur quaerat ullam"
                    },
                    {
                        "title": "National Identity Administrator",
                        "description": "ipsa et reiciendis"
                    },
                    {
                        "title": "Regional Factors Planner",
                        "description": "sed deserunt natus"
                    },
                    {
                        "title": "Human Data Administrator",
                        "description": "rerum consequatur odit"
                    }
                ],
                "audio": "https://news-bos.cdn.bcebos.com/mvideo/%E7%9A%87%E5%90%8E%E5%A4%A7%E9%81%93%E4%B8%9C.aac",
                "carousel": [
                    {
                        "image": "https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg"
                    },
                    {
                        "html": "<div style=\"width: 100%; height: 200px; background: #e3e3e3; text-align: center; line-height: 200px;\">carousel data in crud</div>"
                    },
                    {
                        "image": "https://video-react.js.org/assets/poster.png"
                    }
                ],
                "date": 1591270438,
                "image": "https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg",
                "json": {
                    "id": 1,
                    "text": "text"
                }
            },
            {
                "id": "37701",
                "text": "立辉安市",
                "progress": 72,
                "type": 2,
                "boolean": false,
                "list": [
                    {
                        "title": "Corporate Metrics Liason",
                        "description": "aspernatur natus qui"
                    },
                    {
                        "title": "Central Paradigm Analyst",
                        "description": "sequi numquam ad"
                    },
                    {
                        "title": "International Data Administrator",
                        "description": "sed libero eum"
                    },
                    {
                        "title": "Forward Optimization Assistant",
                        "description": "officiis accusantium dolorem"
                    },
                    {
                        "title": "Senior Metrics Executive",
                        "description": "commodi sint quod"
                    },
                    {
                        "title": "Corporate Quality Facilitator",
                        "description": "aut aperiam est"
                    },
                    {
                        "title": "Forward Operations Producer",
                        "description": "sed corporis eaque"
                    },
                    {
                        "title": "National Integration Analyst",
                        "description": "quasi ab cumque"
                    }
                ],
                "audio": "https://news-bos.cdn.bcebos.com/mvideo/%E7%9A%87%E5%90%8E%E5%A4%A7%E9%81%93%E4%B8%9C.aac",
                "carousel": [
                    {
                        "image": "https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg"
                    },
                    {
                        "html": "<div style=\"width: 100%; height: 200px; background: #e3e3e3; text-align: center; line-height: 200px;\">carousel data in crud</div>"
                    },
                    {
                        "image": "https://video-react.js.org/assets/poster.png"
                    }
                ],
                "date": 1591270438,
                "image": "https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg",
                "json": {
                    "id": 1,
                    "text": "text"
                }
            }
        ]
    },
    "affixHeader": false,
    "syncLocation": false,
    "columns": [
        {
            "name": "id",
            "label": "ID",
            "type": "text"
        },
        {
            "name": "text",
            "label": "文本",
            "type": "text"
        },
        {
            "type": "image",
            "label": "图片",
            "name": "image"
        },
        {
            "name": "date",
            "type": "date",
            "label": "日期"
        },
        {
            "name": "progress",
            "label": "进度",
            "type": "progress"
        },
        {
            "name": "boolean",
            "label": "状态",
            "type": "status"
        },
        {
            "name": "boolean",
            "label": "开关",
            "type": "switch"
        },
        {
            "name": "type",
            "label": "映射",
            "type": "mapping",
            "map": {
                "1": "<span class='label label-info'>漂亮</span>",
                "2": "<span class='label label-success'>开心</span>",
                "3": "<span class='label label-danger'>惊吓</span>",
                "4": "<span class='label label-warning'>紧张</span>",
                "*": "其他：${type}"
            }
        },
        {
            "name": "list",
            "type": "list",
            "label": "List",
            "placeholder": "-",
            "listItem": {
                "title": "${title}",
                "subTitle": "${description}"
            }
        }
    ]
}
```

### 列宽

可以给列配置 `width`，有两种写法。

#### 固定像素

配置数字，单位是像素。

> - 想精准控制列宽，把表格的 `tableLayout` 设为 `fixed`。标题不换行，所以标题文字的长短仍会决定列的最小宽度。
> - 写了固定宽度的列，表头拖拽调整的是其它没钉死的列。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
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
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
        width: 50%
```

### 列对齐方式

通过 `align` 控制这一列的文本对齐：

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
        type: tpl
        tpl: ${version | number}
        align: right
```

表头想单独对齐用 `headerAlign`（`left` / `right` / `center` / `justify`），没写就跟 `align`。单元格垂直对齐用 `vAlign`（`top` / `middle` / `bottom`）。

### 列样式

除了宽度和对齐，还可以给列加样式类：

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

只想改标题的样式，用 `labelClassName`：

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

`classNameExpr` 按行数据动态加 CSS 类，支持 [模板](/concepts/template) 语法。下例中 `${ version > 5 ? 'text-danger' : '' }` 表示这一行的 `version` 大于 5 时文字变红：

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

### 背景色阶

`backgroundScale` 按数值大小给单元格自动分配背景色：

```schema: scope="body"
type: service
data:
  rows:
    - engine: Trident
      version: "1"
      grade: A
    - engine: Trident
      version: "7"
      grade: B
    - engine: Trident
      version: "4"
      grade: C
    - engine: Trident
      version: "3"
      grade: A
    - engine: Trident
      version: "4"
      grade: A
    - engine: Gecko
      version: "6"
      grade: A
    - engine: Gecko
      version: "2"
      grade: A
    - engine: Gecko
      version: "5"
      grade: B
    - engine: Gecko
      version: "10"
      grade: D
body:
  - type: table
    source: $rows
    columns:
      - name: engine
        label: Engine
      - name: version
        label: Version
        backgroundScale:
          min: 0
          max: 10
          colors:
            - "#FFEF9C"
            - "#FF7127"
      - name: grade
        label: Grade
```

`min` 和 `max` 都支持变量；没写时取这一列在当前数据里的最小值和最大值。

默认按列的 `name` 取值，也可以用 `backgroundScale.source` 写变量或公式换一个取值来源。`colors` 至少两个色值，支持多段渐变。

### 默认是否显示

`columnsTogglable` 默认是 `auto`：列数超过 5 列时，工具栏会多出一个「自定义列」开关。写成 `true` / `false` 可以强制开或关。列上配置 `toggled: false` 表示这一列默认不显示，比如下面例子里的 ID：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    className: m-b-none
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
        toggled: false
      - name: platform
        label: Platform
```

「自定义列」菜单第一项是全选，勾选变化时派发 [columnToggled](#columntoggled)。

配置了 `persistKey` 时，哪些列被收起会记到浏览器的本地存储里，下次打开同一张表仍按上次的选择显示；`persistKey` 支持 [模板](/concepts/template)，可以按用户或页面区分。

### 固定列

列太多时可以把重要的几列固定住。给列配置 `fixed` 为 `left` 或 `right`，横向滚动时它们贴在两侧；滚动起来以后固定列边上才出现阴影。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
className: flex justify-center
body:
  - type: wrapper
    className: w-xxl border-2 border-solid border-indigo-400
    body:
      - type: table
        source: $rows
        className: m-b-none
        columnsTogglable: false
        columns:
          - name: id
            label: ID
            fixed: left
          - name: engine
            label: Engine
            groupName: Group-1
            fixed: left
          - name: grade
            label: Grade
          - name: version
            label: Version
          - name: browser
            label: Browser
            groupName: Group-2
            fixed: right
          - name: platform
            label: Platform
            groupName: Group-2
            fixed: right
```

勾选列、拖拽列和 Footable 的展开列会自动固定在左侧。

### 可复制

列上配置 `copyable: true`，内容旁边会多出一个复制图标，点击复制这一格显示的内容：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
        copyable: true
```

也可以写成对象，自定义复制的内容：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
        copyable:
          content: 复制的内容是：${engine}
```

### 弹出框（popOver）

列上配置 `popOver`，内容旁边会出现一个图标，点击后弹出框展示更多内容：

```schema: scope="body"
type: service
data:
  table:
    - id: 1
      text: The longest word in any of the major English language dictionaries is pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.
    - id: 2
      text: The longest word in any of the major English language dictionaries is pneumonoultramicroscopicsilicovolcanoconiosis, a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.
body:
  - type: table
    source: ${table}
    columns:
      - name: id
        label: ID
      - type: container
        label: long text
        style:
          display: inline-block
        body:
          type: tpl
          name: text
          className: text-ellipsis
          style:
            max-width: 300px
        popOver:
          body:
            type: tpl
            tpl: ${text}
```

还可以配置 `offset`，调整弹出框的位置：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
        popOver:
          body:
            type: tpl
            tpl: 偏了一点的popover
          offset:
            y: 100
```

popOver 的其它配置见 [popover](/components/popover)。

### 表头样式

列上配置 `isHead: true`，这一列的单元格会按表头的样式展示。典型用法是做「左侧表头」：

1. 所有列的 `label` 都写空字符串，顶部表头就不显示了
2. 配置 `combineNum` 合并单元格
3. 在第一列上配置 `isHead: true`

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    combineNum: 1
    columns:
      - name: engine
        label: ""
        isHead: true
      - name: browser
        label: ""
      - name: platform
        label: ""
      - name: version
        label: ""
      - name: grade
        label: ""
```

## 嵌套

行数据里有 `children` 时自动嵌套展示：第一列前面出现展开箭头，子行逐层缩进，表头上的箭头一次展开或收起全部。子行字段名可以用 `childrenColumnName` 改。

```schema: scope="body"
type: service
data:
  rows:
    - engine: Trident
      browser: Internet Explorer 4.0
      platform: Win 95+
      version: "4"
      grade: X
      id: 1
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 1001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 1002
    - engine: Trident
      browser: Internet Explorer 5.0
      platform: Win 95+
      version: "5"
      grade: C
      id: 2
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 2001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 2002
    - engine: Trident
      browser: Internet Explorer 5.5
      platform: Win 95+
      version: "5.5"
      grade: A
      id: 3
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 3001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 3002
    - engine: Trident
      browser: Internet Explorer 6
      platform: Win 98+
      version: "6"
      grade: A
      id: 4
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 4001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 4002
    - engine: Trident
      browser: Internet Explorer 7
      platform: Win XP SP2+
      version: "7"
      grade: A
      id: 5
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 5001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 5002
body:
  - type: table
    source: $rows
    className: m-b-none
    columnsTogglable: false
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

默认全部收起。`expandConfig.expand` 写 `first` 默认展开第一行，写 `all` 全部展开；`expandConfig.accordion: true` 时同一层只保留一行展开。

### 懒加载子行

数据量比较大、不适合一次把子行都带回来时，给行数据标上 `defer: true`，再在表格上配置 `deferApi`：这一行第一次展开时才请求接口，请求期间展开箭头的位置显示加载中，失败后变成重试按钮。行数据里自己带的 `deferApi` 优先于表格上的。

注意 `deferApi` 返回的是**这一行的详情**，不是列表，子行放在详情的 `children` 里，所以它还可以顺带补全这一行的其他字段。子行里继续标 `defer: true` 就能逐层懒加载。

```json
{
  "status": 0,
  "data": {
    "id": 1,
    "engine": "Trident",
    "children": [
      {
        "id": 11,
        "engine": "子节点"
      }
    ]
  }
}
```

```schema: scope="body"
type: service
api: /api/mock2/crud/table6
body:
  - type: table
    source: $rows
    deferApi: /api/mock2/crud/table6?parentId=${id}
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
      - name: browser
        label: Browser
```

## 显示序号

配置 `showIndex: true` 开启序号列。嵌套的子行显示成 `1.1`、`1.2`：

```schema: scope="body"
type: service
data:
  rows:
    - engine: Trident
      browser: Internet Explorer 4.0
      platform: Win 95+
      version: "4"
      grade: X
      id: 1
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 1001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 1002
    - engine: Trident
      browser: Internet Explorer 5.0
      platform: Win 95+
      version: "5"
      grade: C
      id: 2
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 2001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 2002
    - engine: Trident
      browser: Internet Explorer 5.5
      platform: Win 95+
      version: "5.5"
      grade: A
      id: 3
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 3001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 3002
    - engine: Trident
      browser: Internet Explorer 6
      platform: Win 98+
      version: "6"
      grade: A
      id: 4
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 4001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 4002
    - engine: Trident
      browser: Internet Explorer 7
      platform: Win XP SP2+
      version: "7"
      grade: A
      id: 5
      children:
        - engine: Trident
          browser: Internet Explorer 4.0
          platform: Win 95+
          version: "4"
          grade: X
          id: 5001
        - engine: Trident
          browser: Internet Explorer 5.0
          platform: Win 95+
          version: "5"
          grade: C
          id: 5002
body:
  - type: table
    source: $rows
    className: m-b-none
    columnsTogglable: false
    showIndex: true
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

## 底部展示 (Footable)

列太多放不下时，可以把一部分列收到行的下面，让用户点箭头展开查看。开启 `footable`，再给想收起来的列加 `breakpoint: "*"`：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    className: m-b-none
    columnsTogglable: false
    footable: true
    columns:
      - name: engine
        label: Engine
      - name: grade
        label: Grade
      - name: version
        label: Version
        breakpoint: "*"
      - name: browser
        label: Browser
        breakpoint: "*"
      - name: id
        label: ID
        breakpoint: "*"
      - name: platform
        label: Platform
        breakpoint: "*"
```

默认都不展开。想默认展开第一行，把 `footable` 写成对象：

```json
{
  "footable": {
    "expand": "first"
  }
}
```

`expand` 写 `all` 表示全部展开；`accordion: true` 时一次只展开一行。

`breakpoint` 除了 `*`（任何宽度都收起），还可以写 `xs`（小于 768px）、`sm`（768–991px）、`md`（992–1199px）、`lg`（1200px 及以上），多个用空格或逗号隔开，只在命中的视口宽度下收起。

## 合并单元格

配置 `combineNum` 即可：它表示从左数多少列以内自动合并单元格，相邻行在同一列的值相同就合并。后面的列只在前一列已经合并的那一段里继续合并。

不想从第一列开始，可以配置 `combineFromIndex`。写 1 跳过第一列；写 2 跳过前两列，从第三列开始向右合并 `combineNum` 列。

```schema: scope="body"
type: service
data:
  rows:
    - engine: Trident
      browser: Internet Explorer 4.2
      platform: Win 95+
      version: "4"
      grade: A
    - engine: Trident
      browser: Internet Explorer 4.2
      platform: Win 95+
      version: "4"
      grade: B
    - engine: Trident
      browser: AOL browser (AOL desktop)
      platform: Win 95+
      version: "4"
      grade: C
    - engine: Trident
      browser: AOL browser (AOL desktop)
      platform: Win 98
      version: "3"
      grade: A
    - engine: Trident
      browser: AOL browser (AOL desktop)
      platform: Win 98
      version: "4"
      grade: A
    - engine: Gecko
      browser: Firefox 1.0
      platform: Win 98+ / OSX.2+
      version: "4"
      grade: A
    - engine: Gecko
      browser: Firefox 1.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: A
    - engine: Gecko
      browser: Firefox 2.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: B
    - engine: Gecko
      browser: Firefox 2.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: C
    - engine: Gecko
      browser: Firefox 2.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: D
body:
  - type: table
    source: $rows
    className: m-b-none
    combineNum: 3
    columnsTogglable: false
    columns:
      - name: engine
        label: Rendering engine
      - name: browser
        label: Browser
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

`combineNum` 支持变量：

```schema: scope="body"
type: service
data:
  rows:
    - engine: Trident
      browser: Internet Explorer 4.2
      platform: Win 95+
      version: "4"
      grade: A
    - engine: Trident
      browser: Internet Explorer 4.2
      platform: Win 95+
      version: "4"
      grade: B
    - engine: Trident
      browser: AOL browser (AOL desktop)
      platform: Win 95+
      version: "4"
      grade: C
    - engine: Trident
      browser: AOL browser (AOL desktop)
      platform: Win 98
      version: "3"
      grade: A
    - engine: Trident
      browser: AOL browser (AOL desktop)
      platform: Win 98
      version: "4"
      grade: A
    - engine: Gecko
      browser: Firefox 1.0
      platform: Win 98+ / OSX.2+
      version: "4"
      grade: A
    - engine: Gecko
      browser: Firefox 1.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: A
    - engine: Gecko
      browser: Firefox 2.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: B
    - engine: Gecko
      browser: Firefox 2.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: C
    - engine: Gecko
      browser: Firefox 2.0
      platform: Win 98+ / OSX.2+
      version: "5"
      grade: D
  combineNum: 3
body:
  - type: table
    source: $rows
    className: m-b-none
    combineNum: $combineNum
    columnsTogglable: false
    columns:
      - name: engine
        label: Rendering engine
      - name: browser
        label: Browser
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

## 超级表头

超级表头是指表头再分一层组。给列加 `groupName`，相邻且同名的列会并到一个分组下；没写 `groupName` 的列在表头里占两行。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    className: m-b-none
    columns:
      - name: engine
        label: Engine
        groupName: 分组1
      - name: grade
        label: Grade
        groupName: 分组1
      - name: version
        label: Version
        groupName: 分组2
      - name: browser
        label: Browser
        groupName: 分组2
      - name: id
        label: ID
        toggled: false
        groupName: 分组2
      - name: platform
        label: Platform
        groupName: 分组2
```

## 高亮行

通过 `rowClassNameExpr` 给行加 CSS 类，支持 [模板](/concepts/template) 语法。

下例的 `${id % 2 ? "bg-success" : ""}` 表示行数据的 `id` 不能被 2 整除时给这一行加 `bg-success`，也就是绿色背景：

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

所有行都要加的类名直接写 `rowClassName`。

## 总结行

通过 `prefixRow` 或 `affixRow` 在表格顶部或底部加总结行。总结行里的每一项对应一列，数据域里可以用 `rows`（或 `items`）拿到当前全部行：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: browser
        label: Browser
      - name: version
        label: Version
    affixRow:
      - type: text
        text: 总计
      - type: tpl
        tpl: ${rows|pick:version|sum}
```

`affixRowClassNameExpr`、`affixRowClassName`、`prefixRowClassNameExpr`、`prefixRowClassName` 用来控制总结行的样式：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: browser
        label: Browser
      - name: version
        label: Version
    affixRowClassNameExpr: "${SUM(ARRAYMAP(rows, item => item.version)) > 30 ? 'text-success' : ''}"
    affixRow:
      - type: text
        text: 总计
      - type: tpl
        tpl: ${rows|pick:version|sum}
```

### 配置合并单元格

总结项可以配置 `colSpan` 指定它占几列：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
      - name: browser
        label: Browser
      - name: version
        label: Version
    affixRow:
      - type: text
        text: 总计
        colSpan: 2
      - type: tpl
        tpl: ${rows|pick:version|sum}
```

上例给「总计」配置了 `colSpan: 2`，它占掉前两列。总结项上还可以写 `isHead: true`（按表头样式）、`align`、`vAlign`、`cellClassName`。

### 配置多行

配置成二维数组就是多行总结行：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: browser
        label: Browser
      - name: version
        label: Version
    affixRow:
      - - type: text
          text: 总计1
        - type: tpl
          tpl: ${rows|pick:version|sum}
      - - type: text
          text: 总计2
        - type: tpl
          tpl: ${rows|pick:version|sum}
```

## 行操作按钮

通过 `itemActions` 设置鼠标移到某一行上时，在行的右侧浮出一组操作按钮。按钮里可以用这一行的数据：

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    itemActions:
      - label: 编辑
        type: button
        actionType: dialog
        dialog:
          title: 编辑
          body: 这是个简单的编辑弹框
      - label: 删除
        type: button
        actionType: ajax
        confirmText: 确认要删除？
        api: /api/mock2/form/saveForm
    columns:
      - name: browser
        label: Browser
      - name: version
        label: Version
```

## 单行点击操作

除了 `itemActions`，还可以配置 `itemAction`，点击某一行时执行它。支持 [action](/components/action) 里的所有配置，比如弹框、刷新其它组件。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    itemAction:
      type: button
      actionType: dialog
      dialog:
        title: 详情
        body: "当前行的数据 browser: ${browser}, version: ${version}"
    columns:
      - name: browser
        label: Browser
      - name: version
        label: Version
```

注意这个属性和 `checkOnItemClick` 冲突，两个都在定义「点击行」的行为。开启 `itemAction` 后 `checkOnItemClick` 失效。

## 行角标

通过 `itemBadge` 给行配置 [角标](/components/badge)，可以用 [数据映射](/concepts/data-mapping) 给每一行算出不同的角标属性。[`visibleOn`](/concepts/expression) 控制显示条件，表达式里的 `this` 能取到这一行的数据。比如行数据里有 `badgeText` 才显示角标，就写 `visibleOn: "this.badgeText"`：

```schema: scope="body"
type: service
body:
  type: table
  source: ${table}
  syncLocation: false
  itemBadge:
    text: ${badgeText}
    mode: ribbon
    position: top-left
    level: ${badgeLevel}
    visibleOn: this.badgeText
  columns:
    - name: id
      label: ID
    - name: engine
      label: Rendering engine
    - name: browser
      label: Browser
    - name: platform
      label: Platform(s)
    - name: version
      label: Engine version
    - name: grade
      label: CSS grade
data:
  table:
    - id: 1
      engine: Trident
      browser: Internet Explorer 4.0
      platform: Win 95+
      version: "4"
      grade: X
      badgeText: 默认
      badgeLevel: info
    - id: 2
      engine: Trident
      browser: Internet Explorer 5.0
      platform: Win 95+
      version: "5"
      grade: C
      badgeText: 危险
      badgeLevel: danger
    - id: 3
      engine: Trident
      browser: Internet Explorer 5.5
      platform: Win 95+
      version: "5.5"
      grade: A
    - id: 4
      engine: Trident
      browser: Internet Explorer 6
      platform: Win 98+
      version: "6"
      grade: A
    - id: 5
      engine: Trident
      browser: Internet Explorer 7
      platform: Win XP SP2+
      version: "7"
      grade: A
```

## 表格内容高度自适应

通过 `autoFillHeight` 让表格内容区自适应高度：内容区吃满视口里剩下的高度，行多的时候在内容区里滚动，表头吸在内容区顶部，上面的筛选和下面的翻页位置都不动。

- `autoFillHeight: true`：内容区高度 = 视口高度 − 内容区上边 − 下方元素的高度
- `autoFillHeight: { height: 300 }`：固定高度
- `autoFillHeight: { maxHeight: 300 }`：最多这么高，行少时不撑开

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    autoFillHeight:
      maxHeight: 250
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
      - name: browser
        label: Browser
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

## 固定表头与底栏

`affixHeader` 默认开启：页面往下滚、表头要滚出视口时，工具栏、标题和表头一起吸在顶部，离顶部的距离用 CSS 变量 `--affix-offset-top` 调整（比如页面自己有固定的顶栏）。`affixFooter: true` 让底部（有 `footer` 时是 footer，否则是底部工具栏）贴在视口底部，距离用 `--affix-offset-bottom` 调整。开了 [高度自适应](#表格内容高度自适应) 时表头本来就吸在内容区顶部，`affixHeader` 自动关闭。

本站的示例预览默认关掉了 `affixHeader`，免得每个示例的表头都跟着页面走；下面这个例子显式打开，滚动页面可以看到效果。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=20
body:
  - type: table
    source: $rows
    title: 固定表头与底栏
    affixHeader: true
    affixFooter: true
    footer: 表格底栏
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
      - name: browser
        label: Browser
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
```

行数超过 `lazyRenderAfter`（默认 100）时，表格只渲染视口附近的行，其余用占位撑住高度，滚动时再补上，行数很多也不会卡。

## 选择模式

`selectable: true` 显示勾选列。默认是多选：每行一个多选框，表头可以全选，按住 Shift 点可以连选一段；`multiple: false` 改成单选圆点。`itemCheckableOn` 用 [表达式](/concepts/expression) 决定某一行能不能勾，`checkOnItemClick: true` 时点行也能勾选（和 `itemAction` 互斥）。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    selectable: true
    multiple: true
    checkOnItemClick: true
    itemCheckableOn: ${id != 3}
    columns:
      - name: id
        label: ID
      - name: browser
        label: Browser
      - name: version
        label: Version
```

勾选结果从组件的 `getData().selectedItems` 读，勾选变化派发 [selectedChange](#selectedchange)。

## 表头排序、搜索与过滤

列上配置 `sortable: true`，表头出现排序图标，点击在升序、降序、不排序之间切换；`searchable: true` 出现放大镜，点开是一张小搜索表单；`filterable` 出现过滤图标，点开是选项菜单。三者都只在当前已有的行里做本地处理，并分别派发 `columnSort` / `columnSearch` / `columnFilter`，要走接口请在事件里自己刷新数据，或者直接用 [CRUD](/components/crud)。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Trident
            - Gecko
      - name: browser
        label: Browser
        sortable: true
        remark: 点右侧图标排序
      - name: version
        label: Engine version
        sortable: true
```

- `searchable` 写成对象时可以换成别的表单项，例如 `{ type: select, name: grade, options: [...] }`；也可以写 `body` 放多个表单项。
- `filterable.options` 是选项数组（字符串或 `{ label, value }`）；没写时取这一列里出现过的值。`filterable.multiple: true` 可以多选。`filterable.source` 可以写变量（如 `${options}`），也可以写接口地址，接口返回 `{ options: [...] }`。
- `remark` 在标题后面加一个提示图标。

## 拖拽排序

`draggable: true` 且多于一行时，工具栏出现「开始排序」按钮。点了之后每行左侧出现拖拽手柄，拖动行调整顺序；有行挪过位置后，标题栏会提示有几条记录改了顺序，点「提交」才派发 [orderChange](#orderchange) 并把新顺序留下，点「放弃」恢复原样。`itemDraggableOn` 用 [表达式](/concepts/expression) 决定某一行能不能拖。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    draggable: true
    columns:
      - name: id
        label: ID
      - name: browser
        label: Browser
      - name: version
        label: Version
```

## 快速编辑

列配置 `quickEdit: true`，鼠标移到单元格上出现编辑图标，点击就地编辑。写成对象可以换控件：`type` 支持 `input-text`、`input-number`、`select`（配 `options`）、`textarea`。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=5
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
      - name: browser
        label: Browser
        quickEdit: true
      - name: grade
        label: CSS grade
        quickEdit:
          type: select
          options:
            - A
            - B
            - C
            - X
```

改过的行会高亮，标题栏提示有几条记录修改但没有提交：点「提交」派发 `quickEditSubmit`（带 `rows` / `rowsDiff` / `rowsOrigin` / `indexes`），点「放弃」恢复成修改前的值。每改一格还会派发一次 `quickEdit`。列上写 `quickEdit.saveImmediately: true` 表示改完立即生效，不进「未提交」状态；表格上写 `hideQuickSaveBtn: true` 可以不显示这一条提示，再用动作 `submitQuickEdit` 自己提交。

## 独立数据域

表格注册了组件 API：`getData()` 返回 `items` / `rows` / `total` / `selectedItems` / `unSelectedItems`；`setValue` 动作可以整表替换，也可以只改某几行，见 [setValue](#setvalue)。表格需要配置 `id`。

## 属性表
| 属性名 | 类型 | 默认值 | 说明 |
| ------ | ---- | ------ | ---- |
| type | `string` | | `"type"` 指定为 table 渲染器 |
| title | `string` | | 标题 |
| source | `string` | `${items}` | 数据源，绑定当前数据域里的变量 |
| columns | `Array<Column>` | | 列信息，见 [列配置属性表](#列配置属性表) |
| columnsTogglable | `auto` 或 `boolean` | `auto` | 是否显示「自定义列」开关。`auto` 表示列数超过 5 列时自动开启 |
| placeholder | `string` | `暂无数据` | 没有数据时的文字提示 |
| className | [ClassName](/types/classname) | | 外层 CSS 类名 |
| bordered | `boolean` | `false` | **Vamis 优化**。给表格内容区画一圈圆角描边（`--border` + `--borderRadiusLg`）。不是 [Table2](/components/table2) 的单元格网格。默认仍无外边框。作者 helper `className: b` / `b-a` 仍可用 |
| tableClassName | [ClassName](/types/classname) | | 表格 CSS 类名 |
| headerClassName | [ClassName](/types/classname) | | 顶部外层 CSS 类名 |
| footerClassName | [ClassName](/types/classname) | | 底部外层 CSS 类名 |
| toolbarClassName | [ClassName](/types/classname) | | 工具栏 CSS 类名 |
| headingClassName | [ClassName](/types/classname) | | 标题栏 CSS 类名 |
| header | [SchemaNode](/types/schemanode) | | 顶部内容，在工具栏上面 |
| footer | [SchemaNode](/types/schemanode) | | 底部内容，在工具栏下面 |
| actions | Array<[Action](/components/action)> | | 工具栏按钮。「自定义列」和「开始排序」会自动追加到顶部工具栏 |
| showHeader | `boolean` | `true` | 是否显示顶部（`header` 与顶部工具栏） |
| showFooter | `boolean` | `true` | 是否显示底部（`footer` 与底部工具栏） |
| showIndex | `boolean` | `false` | 是否展示序号 |
| combineNum | `number` 或变量 | | 自动合并单元格的列数 |
| combineFromIndex | `number` | `0` | 跳过前几列再开始合并 |
| itemActions | Array<[Action](/components/action)> | | 悬浮行操作按钮组 |
| itemAction | [Action](/components/action) | | 点击整行时执行的动作 |
| itemCheckableOn | [表达式](/concepts/expression) | | 当前行是否可勾选 |
| itemDraggableOn | [表达式](/concepts/expression) | | 当前行是否可拖拽 |
| checkOnItemClick | `boolean` | `false` | 点击数据行是否勾选当前行 |
| hideCheckToggler | `boolean` | `false` | 不显示勾选列（仍可以通过动作选中） |
| rowClassName | `string` | | 给行添加 CSS 类名 |
| rowClassNameExpr | [模板](/concepts/template) | | 通过模板给行添加 CSS 类名 |
| prefixRow | `Array` | | 顶部总结行 |
| affixRow | `Array` | | 底部总结行 |
| prefixRowClassName / affixRowClassName | `string` | | 总结行 CSS 类名 |
| prefixRowClassNameExpr / affixRowClassNameExpr | [模板](/concepts/template) | | 通过模板给总结行添加 CSS 类名 |
| itemBadge | [BadgeSchema](/components/badge) | | 行角标配置 |
| autoFillHeight | `boolean` 或 `{height: number}` 或 `{maxHeight: number}` | | 内容区域自适应高度，可选自适应、固定高度和最大高度 |
| resizable | `boolean` | `true` | 列宽是否可以拖拽调整 |
| selectable | `boolean` | `false` | 支持勾选 |
| multiple | `boolean` | `true` | 勾选是否为多选 `checkbox`，`false` 时是单选 `radio` |
| draggable | `boolean` | `false` | 是否可以拖拽排序 |
| footable | `boolean` 或 `{expand: "first" \| "all" \| "none", accordion: boolean}` | | 是否开启底部展示 |
| expandConfig | `{expand: "first" \| "all" \| "none", accordion: boolean}` | | 嵌套行的默认展开方式 |
| childrenColumnName | `string` | `children` | 嵌套子行所在的字段 |
| tableLayout | `auto` 或 `fixed` | `auto` | 写成 `fixed` 时内容不会撑开表格，自动换行 |
| hideQuickSaveBtn | `boolean` | `false` | 快速编辑后不显示标题栏里的提交 / 放弃 |
| affixHeader | `boolean` | `true` | 页面滚动时固定表头（连同工具栏和标题）；开了 `autoFillHeight` 时自动关闭 |
| affixFooter | `boolean` | `false` | 页面滚动时把底部（`footer` 或底部工具栏）固定在视口底部 |
| deferApi | [API](/types/api) | | 行数据有 `defer: true` 时，展开这一行用它加载详情和子行，见 [懒加载子行](#懒加载子行) |
| lazyRenderAfter | `number` | `100` | 行数超过它时只渲染视口附近的行 |
| reUseRow | `false` 或 `match` | | 数据更新时怎么复用已有的行。**未接**：Vamis 始终按行对象 / 主键识别同一行，写了也不改变行为 |
| persistKey | `string` | | 列显示状态的本地缓存 key，支持 [模板](/concepts/template)；没写就不缓存 |

### 列配置属性表

| 属性名 | 类型 | 默认值 | 说明 |
| ------ | ---- | ------ | ---- |
| label | [模板](/concepts/template) | | 表头文本内容 |
| name | `string` | | 通过名称关联数据 |
| type | `string` | | 列的渲染器，见 [列类型](#列类型)。没写就是纯文本 |
| tpl | [模板](/concepts/template) | | 纯文本列按模板出内容 |
| placeholder | `string` | `-` | 值为空时的占位 |
| width | `number` 或 `string` | | 列宽 |
| remark | `string` 或 [Remark](/components/remark) | | 标题后面的提示信息 |
| fixed | `left` 或 `right` 或 `none` | | 是否固定当前列 |
| popOver | [PopOver](/components/popover) | | 弹出框 |
| copyable | `boolean` 或 `{icon: string, content: string, tooltip: string}` | | 是否可复制 |
| style | `object` | | 单元格自定义样式 |
| innerStyle | `object` | | 单元格内部组件自定义样式 |
| className | [ClassName](/types/classname) | | 这一列表头和单元格的 CSS 类名 |
| labelClassName | [ClassName](/types/classname) | | 表头 CSS 类名 |
| classNameExpr | [模板](/concepts/template) | | 按行数据动态添加单元格 CSS 类名 |
| innerClassName | [ClassName](/types/classname) | | 单元格内部组件 CSS 类名 |
| align | `left` 或 `right` 或 `center` 或 `justify` | | 单元格对齐方式 |
| headerAlign | `left` 或 `right` 或 `center` 或 `justify` | | 表头单元格对齐方式 |
| vAlign | `top` 或 `middle` 或 `bottom` | | 单元格垂直对齐方式 |
| textOverflow | `string` | `default` | 文本溢出后的展示形式，默认换行。可选 `ellipsis` 溢出隐藏，`noWrap` 不换行（仅纯文本列生效） |
| groupName | `string` | | 超级表头的分组名 |
| toggled | `boolean` | `true` | 是否默认显示 |
| breakpoint | `*` 或 `xs` 或 `sm` 或 `md` 或 `lg` | | 开启 `footable` 后，在哪些宽度下收到底部展示 |
| isHead | `boolean` | `false` | 这一列的单元格按表头样式展示 |
| backgroundScale | `{min, max, colors: string[], source}` | | 背景色阶 |
| sortable | `boolean` | `false` | 表头可排序 |
| searchable | `boolean` 或 [SchemaNode](/types/schemanode) | `false` | 表头快速搜索 |
| filterable | `{options: any[], multiple: boolean, source: string}` | | 表头快速过滤 |
| quickEdit | `boolean` 或 `{type, options, saveImmediately}` | `false` | 快速编辑 |
| onEvent | `object` | | 列上的事件，见 [列的事件表](#列的事件表) |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 监听，再用 `actions` 配置要执行的动作。在 `actions` 里用 `${事件参数名}` 或 `${event.data.[事件参数名]}` 取事件带出来的数据，详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
| -------- | -------- | ---- |
| selectedChange | `selectedItems: item[]` 已选择行<br/>`selectedIndexes: string[]` 已选择行索引<br/>`unSelectedItems: item[]` 未选择行 | 手动选择表格项时触发 |
| columnSort | `orderBy: string` 列排序列名<br/>`orderDir: string` 列排序值 | 点击列排序时触发 |
| columnFilter | `filterName: string` 列筛选列名<br/>`filterValue: string` 列筛选值 | 点击列筛选时触发 |
| columnSearch | `searchName: string` 列搜索列名<br/>`searchValue: object` 列搜索数据 | 点击列搜索时触发 |
| orderChange | `movedItems: item[]` 已排序数据 | 手动拖拽行排序并提交时触发 |
| columnToggled | `columns: item[]` 当前显示的列配置数据 | 点击自定义列时触发 |
| rowClick | `item: object` 行点击数据<br/>`index: number` 行索引<br/>`indexPath: string` 行索引路径 | 单击整行时触发 |
| rowDbClick | `item: object` 行点击数据<br/>`index: number` 行索引<br/>`indexPath: string` 行索引路径 | 双击整行时触发 |
| rowMouseEnter | `item: object` 行移入数据<br/>`index: number` 行索引<br/>`indexPath: string` 行索引路径 | 移入整行时触发 |
| rowMouseLeave | `item: object` 行移出数据<br/>`index: number` 行索引<br/>`indexPath: string` 行索引路径 | 移出整行时触发 |
| quickEdit | `item: object` 修改后的行数据<br/>`name: string` 列名<br/>`value: any` 新值<br/>`index: number` 行索引 | 快速编辑改完一格时触发 |
| quickEditSubmit | `rows: item[]` 修改过的行<br/>`rowsDiff: object[]` 每行改了哪些字段<br/>`rowsOrigin: item[]` 修改前的行<br/>`indexes: string[]` 行索引 | 快速编辑点「提交」或执行 `submitQuickEdit` 时触发 |

`columnSort`、`columnFilter`、`columnSearch`、`orderChange`、`quickEditSubmit` 可以在动作里阻止默认行为（`preventDefault`），阻止后表格不做对应的本地处理。

### selectedChange

开启勾选后才会用到，可以试着勾选表格的行记录。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    selectable: true
    onEvent:
      selectedChange:
        actions:
          - actionType: toast
            args:
              msg: 已选择${event.data.selectedItems.length}条记录
    columns:
      - name: id
        label: ID
      - name: engine
        label: Rendering engine
      - name: browser
        label: Browser
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### columnSort

列排序，可以试着点 `Browser` 列右侧的排序图标。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      columnSort:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: orderBy：${event.data.orderBy},orderDir：${event.data.orderDir}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### columnFilter

列过滤，可以试着点 `Rendering engine` 列右侧的筛选图标。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      columnFilter:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: filterName：${event.data.filterName},filterValue：${event.data.filterValue}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### columnSearch

列检索，可以试着点 `ID` 列右侧的检索图标。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      columnSearch:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: searchName：${event.data.searchName},searchValue：${event.data.searchValue|json}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### columnToggled

点击自定义列，可以试着在「自定义列」里勾掉几列。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      columnToggled:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 当前显示${event.data.columns.length}列
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### orderChange

开启拖拽排序后才会用到，点「提交」确认排序后触发。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    draggable: true
    onEvent:
      orderChange:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: ${event.data.movedItems.length}行发生移动
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### rowClick

点击行记录。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    selectable: true
    onEvent:
      rowClick:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 行单击数据：${event.data.item|json}；行索引：${event.data.index}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### rowDbClick

双击整行时触发。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      rowDbClick:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 行双击数据：${event.data.item|json}；行索引：${event.data.index}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### rowMouseEnter

鼠标移入行记录。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      rowMouseEnter:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 行索引：${event.data.index}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### rowMouseLeave

鼠标移出行记录。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    onEvent:
      rowMouseLeave:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 行索引：${event.data.index}
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
      - name: browser
        label: Browser
        sortable: true
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

### 列的事件表

表格的默认列（纯文本列）自带下面三个事件：click、mouseenter、mouseleave。列写了 `type` 换成其它组件时，事件表就是那个组件的事件表，例如列是 Switch 组件，可以监听 [Switch 的 change 事件](/components/form/switch#事件表)。

| 事件名称 | 事件参数 | 说明 |
| -------- | -------- | ---- |
| click | `[columnName]: string` 对应列名的值<br/>`index: number` 行索引 | 点击这一列的单元格时触发 |
| mouseenter | `[columnName]: string` 对应列名的值<br/>`index: number` 行索引 | 鼠标移入这一列的单元格时触发 |
| mouseleave | `[columnName]: string` 对应列名的值<br/>`index: number` 行索引 | 鼠标移出这一列的单元格时触发 |

可以试着点某一行的 `Rendering engine` 列，或者把鼠标移到某一行的 `Browser` 列上。

```schema: scope="body"
type: service
api: /api/mock2/sample?perPage=10
body:
  - type: table
    source: $rows
    columns:
      - name: id
        label: ID
        searchable: true
      - name: engine
        label: Rendering engine
        filterable:
          options:
            - Internet Explorer 4.0
            - Internet Explorer 5.0
        onEvent:
          click:
            actions:
              - actionType: toast
                args:
                  msgType: info
                  msg: 第${event.data.index}行的${event.data.engine}
      - name: browser
        label: Browser
        sortable: true
        onEvent:
          mouseenter:
            actions:
              - actionType: toast
                args:
                  msgType: info
                  msg: 第${event.data.index}行的${event.data.browser}
          mouseleave:
            actions:
              - actionType: toast
                args:
                  msgType: info
                  msg: 第${event.data.index}行的${event.data.browser}
      - name: platform
        label: Platform(s)
      - name: version
        label: Engine version
      - name: grade
        label: CSS grade
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定 `actionType: 动作名称`、`componentId: 该组件id` 来触发这些动作，参数写在 `args: {动作配置项名称: xxx}` 里，详见 [事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置 | 说明 |
| -------- | -------- | ---- |
| select | `args.index` 可选，指定行，支持表达式，支持树形路径（嵌套表格用，例如 `0.1`）<br/>`args.condition` 可选，通过表达式指定选中哪些行，支持条件组合<br/>`args.selected` 条件表达式，**不推荐**。表达式里用 `record`（行数据）和 `rowIndex`（行索引），例如 `data.rowIndex === 1` | 设置表格的选中项 |
| selectAll | - | 设置表格全部项选中 |
| clearAll | - | 清空表格所有选中项 |
| initDrag | - | 开启表格拖拽排序功能 |
| cancelDrag | - | 放弃表格拖拽排序功能 |
| setValue | `args.value`: object<br/>`args.index` 可选，指定行，支持表达式，支持树形路径<br/>`args.condition` 可选，通过表达式指定更新哪些行，支持条件组合 | 更新列表记录 |
| submitQuickEdit | - | 快速编辑数据提交 |
| toggleExpanded | `args.index` 可选，指定行，支持表达式，支持树形路径<br/>`args.condition` 可选，通过表达式指定哪些行，支持条件组合 | 切换某行数据是展开还是收起 |
| setExpanded | `args.index` 可选，指定行，支持表达式，支持树形路径<br/>`args.condition` 可选，通过表达式指定哪些行，支持条件组合<br/>`args.value` 展开还是收起 | 设置某行数据展开还是收起 |

`setValue` 整表更新时的 value 结构：

| 属性名 | 类型 | 默认值 | 说明 |
| ------ | ---- | ------ | ---- |
| items 或 rows | `item[]` | | 列表记录 |

### select

- `args.index` 可选，指定行，支持表达式，支持树形路径（嵌套表格用）。多行用逗号隔开，例如 `0,1`
- `args.condition` 可选，通过表达式指定选中哪些行，支持条件组合。表达式的上下文是那一行的数据
- `args.selected` 不推荐使用，请用上面两个代替

```schema: scope="body"
- type: button-toolbar
  className: m-b
  buttons:
    - name: trigger1
      id: trigger1
      type: action
      label: 选中前两个
      onEvent:
        click:
          actions:
            - actionType: select
              componentId: table-select
              args:
                index: 0,1
- type: service
  api: /api/mock2/sample?perPage=10
  body:
    - id: table-select
      type: table
      source: $rows
      selectable: true
      multiple: true
      columns:
        - name: id
          label: ID
        - name: browser
          label: Browser
        - name: version
          label: Version
```

### selectAll

```schema: scope="body"
- type: button-toolbar
  className: m-b
  buttons:
    - name: trigger2
      id: trigger2
      type: action
      label: 设置表格全部项选中
      onEvent:
        click:
          actions:
            - actionType: selectAll
              componentId: table-select
              description: 点击设置指定表格全部内容选中
- type: service
  api: /api/mock2/sample?perPage=10
  body:
    - id: table-select
      type: table
      source: $rows
      selectable: true
      multiple: true
      columns:
        - name: id
          label: ID
        - name: browser
          label: Browser
        - name: version
          label: Version
```

### clearAll

```schema: scope="body"
- type: button-toolbar
  className: m-b
  buttons:
    - name: trigger3
      id: trigger3
      type: action
      label: 清空表格全部选中项
      onEvent:
        click:
          actions:
            - actionType: clearAll
              componentId: table-select
              description: 点击设置指定表格全部选中项清空
- type: service
  api: /api/mock2/sample?perPage=10
  body:
    - id: table-select
      type: table
      source: $rows
      selectable: true
      multiple: true
      columns:
        - name: id
          label: ID
        - name: browser
          label: Browser
        - name: version
          label: Version
```

### initDrag & cancelDrag

```schema: scope="body"
- type: button-toolbar
  className: m-b
  buttons:
    - name: trigger4
      id: trigger4
      type: action
      label: 开启表格行排序
      onEvent:
        click:
          actions:
            - actionType: initDrag
              componentId: table-select
              description: 点击开启表格行排序功能
    - name: trigger5
      id: trigger5
      type: action
      label: 取消表格行排序
      onEvent:
        click:
          actions:
            - actionType: cancelDrag
              componentId: table-select
              description: 点击取消表格行排序功能
- type: service
  api: /api/mock2/sample?perPage=10
  body:
    - id: table-select
      type: table
      source: $rows
      columns:
        - name: id
          label: ID
        - name: browser
          label: Browser
        - name: version
          label: Version
```

### toggleExpanded & setExpanded

展开或收起嵌套行（Footable 的展开行同样适用）。`args.index` 写树形路径可以指到子行。

```schema: scope="body"
- type: button-toolbar
  className: m-b
  buttons:
    - type: action
      label: 切换第一行
      onEvent:
        click:
          actions:
            - actionType: toggleExpanded
              componentId: table-expand
              args:
                index: 0
    - type: action
      label: 展开 id 为 2 的行
      onEvent:
        click:
          actions:
            - actionType: setExpanded
              componentId: table-expand
              args:
                condition: ${id == 2}
                value: true
- type: table
  id: table-expand
  data:
    items:
      - id: 1
        engine: Trident
        browser: Internet Explorer 4.0
        children:
          - id: 1001
            engine: Trident
            browser: Internet Explorer 5.0
      - id: 2
        engine: Gecko
        browser: Firefox 1.0
        children:
          - id: 2001
            engine: Gecko
            browser: Firefox 1.5
  columns:
    - name: engine
      label: Engine
    - name: id
      label: ID
    - name: browser
      label: Browser
```

### setValue

#### 更新列表记录

```schema: scope="body"
- type: button
  label: 更新列表记录
  onEvent:
    click:
      actions:
        - actionType: setValue
          componentId: table_setvalue
          args:
            value:
              items:
                - engine: Trident - f12fj
                  browser: Internet Explorer 4.0
                  platform: Win 95+
                  version: "4"
                  grade: X
                  badgeText: 默认
                  id: 1
                - engine: Trident - oqvc0e
                  browser: Internet Explorer 5.0
                  platform: Win 95+
                  version: "5"
                  grade: C
                  badgeText: 危险
                  id: 2
- type: button
  label: 清空列表
  className: ml-2
  onEvent:
    click:
      actions:
        - actionType: setValue
          componentId: table_setvalue
          args:
            value:
              items: []
- type: service
  id: u:b25a8ef0050b
  api:
    method: get
    url: /api/mock2/sample?perPage=5
  body:
    - type: table
      id: table_setvalue
      title: 引擎列表
      source: $rows
      columns:
        - name: engine
          label: Engine
          id: u:4aa2e9034698
          inline: true
        - name: version
          label: Version
          id: u:8b4cb96ca2bf
          inline: true
          tpl: v${version}
```

#### 更新指定行记录

指定 `index` 或 `condition`，可以分别更新指定索引的行记录，或者满足条件（条件表达式或者 ConditionBuilder 的条件组合）的行记录。指定行时始终和原来的行数据合并（对齐 Amis `IRow.updateData`）；`args.replace` 不会把没写的字段清掉。

```schema
type: page
data:
  i: 1,3
body:
  - type: button
    label: 更新index为1和3的行记录
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: table_setvalue_item
            args:
              value:
                engine: amis
                browser: Chrome
                platform: Mac Pro
                version: "8"
                grade: Y
                badgeText: 你好！
                id: 1234
              index: ${i}
  - type: button
    label: 更新index为1和3的行记录(替换)
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: table_setvalue_item
            args:
              value:
                engine: amis
                id: 1234
              index: ${i}
              replace: true
  - type: button
    label: 更新version=7的行记录
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: table_setvalue_item
            args:
              value:
                engine: amis
                browser: Chrome
                platform: Mac Pro
                version: "4"
                grade: Y
                badgeText: 你好！
                id: 1234
              condition: ${version === '7'}
  - type: button
    label: 更新version=4的行记录
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: table_setvalue_item
            args:
              value:
                engine: amis
                browser: Chrome
                platform: Mac Pro
                version: "4"
                grade: Y
                badgeText: 你好！
                id: 1234
              condition:
                conjunction: and
                children:
                  - left:
                      type: field
                      field: version
                    op: equal
                    right: "4"
  - type: service
    id: u:b25a8ef0050b
    api:
      method: get
      url: /api/mock2/sample?perPage=5
    body:
      - type: table
        id: table_setvalue_item
        title: 引擎列表
        source: $rows
        columns:
          - name: engine
            label: Engine
            id: u:4aa2e9034698
            inline: true
          - name: version
            label: Version
            id: u:8b4cb96ca2bf
            inline: true
            tpl: ${version}
```

## 和 Amis 文档的差异
- 作者态同时支持 YAML 与 JSON，本页示例用 YAML 书写，换成 JSON 等价；YAML 字面量遵循 1.2 Core。
- Amis 文档里列宽、可复制、表头样式、弹出框偏移的示例用的是 `crud`，本页换成 `service` + `table`，只展示 Table 自己的能力。
- 表头排序、搜索、过滤是本地处理（只动当前已有的行）。要走接口，在 `columnSort` / `columnSearch` / `columnFilter` 事件里刷新数据。
- 快速编辑是 Vamis 在 Table 上直接提供的能力，控件只有 `input-text` / `input-number` / `select` / `textarea`；提交事件叫 `quickEditSubmit`。
- 拖拽排序只支持顶层行，嵌套表格不出现「开始排序」。
- 默认没有外边框（对齐 Amis `.Table`）。`bordered: true` 是 Vamis 优化，给内容区画圆角卡片外框（不是 Table2 的单元格网格）。作者 helper `className: b` / `b-a` 仍可用。
- `persistKey` 没写时不缓存列的显示状态（Amis 会按页面路径自动生成一个 key）；缓存的只有哪些列被收起。
- 本站示例预览把 `affixHeader` 的默认值关掉了（Amis 文档站同样如此），正式嵌入时默认开启；需要整棵树默认关闭可以给 `env.affixHeader` 传 `false`。
- 指定行 `setValue` 对齐 Amis 源码：始终把 `value` 合并进原行。文档示例里的 `replace: true` 不会丢掉 version 等没写的字段（Amis `CmptAction` 也不把 `args.replace` 传给 `setData`）。
- 未接：`reUseRow`（Vamis 始终按行对象 / 主键识别同一行）、工具栏的 `export-excel` / `export-excel-template`（需要额外的 Excel 依赖）。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
