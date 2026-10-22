---
title: 配置与组件
---

# 配置与组件

::: tip 实现进度 95% · 已完成
文档主路径已对齐 Amis「配置与组件」：`type` + 属性、组件树、`page` 唯一顶级、树形布局示例可跑。JSON / YAML / IR 走同一渲染管线。`LazyComponent` 用法写在本页。渲染器 `test` / `weight` / `isolateScope` 已接；错误边界仍属 D8。
:::

一份 Vamis 页面是一棵 **widget 树**。节点靠 `type` 选渲染器，其余字段名与 Amis 相同。作者态 **JSON 与 YAML 并列**，解析后进同一运行时。

## 最简单的配置

一个最简单的配置看起来是这样的：

```json
{
  "type": "page",
  "body": "Hello World!"
}
```

请观察上面的代码：

1. `type` 是节点里最重要的字段，它告诉运行时当前要渲染 `page`。
2. `body` 会作为 `page` 的属性，页面按这个值画内容。字符串会当成 `tpl` 文本。

这段配置的效果如下（JSON / YAML 都能改）：

```schema
{
  "type": "page",
  "body": "Hello World!"
}
```

YAML 写同一份：

```schema
type: page
body: Hello World!
```

## 组件

`type` 决定渲染哪个组件。组件节点永远由 **`type`**（标识组件）和 **属性** 构成：

```
{
  "type": "xxx",
  ...其它属性
}
```

## 组件树

这次看一个稍微复杂一点的配置：`page` 的 `body` 不再是字符串，而是另一个带 `type` 的对象。

```schema
{
  "type": "page",
  "body": {
    "type": "tpl",
    "tpl": "Hello World!"
  }
}
```

最终效果和前面一样，但这次 `body` 里明确渲染 `tpl` 模板组件。

`body` 也可以是数组，一次放下多个节点：

```schema: scope="body"
- type: tpl
  tpl: Hello World!
- type: divider
- type: form
  title: ''
  mode: horizontal
  actions: []
  body:
    - type: input-text
      name: name
      label: 姓名
```

通过数组加上了 `divider` 和 `form`。

除了 `page`，很多**容器**都有 `body`。靠这种树形结构就能拼复杂页面。子节点还可以是字符串、对象或数组，见 [SchemaNode](/types/schemanode)。

> **注意：** `page` 是完整页面配置里**必须也是唯一的顶级节点**。局部预览可以用 `form` / `tpl` 等子树，文档会自动包一层 `page`。

## 通过树形来实现布局

下面这个页面就是通过树形组合出来的，大体结构是这样：

```
Page
  ├── Toolbar
  │  └─ Form 顶部表单项
  ├── Grid // 用于水平布局
  │  ├─ Panel
  │  │  └─ Tabs
  │  │    └─ Chart
  │  └─ Panel
  │     └─ Chart
  └── CRUD
```

```schema: height=560
{
  "type": "page",
  "toolbar": [{
    "type": "form",
    "panelClassName": "mb-0",
    "title": "",
    "body": [{
      "type": "select",
      "label": "区域",
      "name": "businessLineId",
      "mode": "inline",
      "options": ["北京", "上海"]
    }],
    "actions": [],
    "mode": "inline"
  }],
  "body": [{
    "type": "grid",
    "columns": [
      {
        "type": "panel",
        "className": "h-full",
        "body": {
          "type": "tabs",
          "tabs": [{
            "title": "消费趋势",
            "tab": [{
              "type": "chart",
              "config": {
                "title": { "text": "消费趋势" },
                "tooltip": {},
                "xAxis": {
                  "type": "category",
                  "boundaryGap": false,
                  "data": ["一月", "二月", "三月", "四月", "五月", "六月"]
                },
                "yAxis": {},
                "series": [{
                  "name": "销量",
                  "type": "line",
                  "areaStyle": {},
                  "data": [5, 20, 36, 10, 10, 20]
                }]
              }
            }]
          }, {
            "title": "账户余额",
            "tab": "0"
          }]
        }
      },
      {
        "type": "panel",
        "className": "h-full",
        "body": [{
          "type": "chart",
          "config": {
            "title": { "text": "使用资源占比" },
            "series": [{
              "type": "pie",
              "data": [
                { "name": "BOS", "value": 70 },
                { "name": "CDN", "value": 68 },
                { "name": "BCC", "value": 48 },
                { "name": "DCC", "value": 40 },
                { "name": "RDS", "value": 32 }
              ]
            }]
          }
        }]
      }
    ]
  }, {
    "type": "crud",
    "syncLocation": false,
    "api": "/api/mock2/sample",
    "columns": [
      { "name": "id", "label": "ID" },
      { "name": "engine", "label": "Rendering engine" },
      { "name": "browser", "label": "Browser" },
      { "name": "platform", "label": "Platform(s)" },
      { "name": "version", "label": "Engine version" },
      { "name": "grade", "label": "CSS grade" }
    ]
  }]
}
```

## 两种外形

1. **裸 widget**：`{ type: page, body: [...] }`，和 Amis 页面 JSON 同构。
2. **IR 信封**：`apiVersion` + `kind: UiPage` + `metadata` + `spec`。`spec` 就是那棵 widget 树。

`VamisRoot` 和 JS SDK `vamis.embed` 两种都收。未知 `type` 显示占位，不崩。

## 书写规则

- 作者态同时支持 YAML 与 JSON，不强制某一种。YAML 字面量用 1.2 Core。
- 扩展只加新字段或新 IR `kind`，不把 `type: form` 改成别的名字。
- 子节点可以是字符串（当成 `tpl`）、对象或数组，见 [SchemaNode](/types/schemanode)。

## 渲染管线

`parseSchemaText` → `jsonToIr` → `compileIrToWidget` → `SchemaRenderer` 按 `type` 查注册表。playground 的 Vite 根在 `playground/`，渲染器要在 `packages/vamis/src/register.ts` **显式 import**，不能靠 glob。

所有节点还共享显隐：`visible` / `hidden` / `visibleOn` / `hiddenOn`，由 `SchemaRenderer` 在进组件之前统一处理，不是每个 type 自己判断。

```
YAML / JSON / 对象  →  parseSchemaText  ─┐
IR 信封            ─────────────────────┴→  jsonToIr → compileIrToWidget → SchemaRenderer → type 注册表
```

## LazyComponent

`LazyComponent` **不是** schema `type`。它是 `@vamis/core` / `vamis` 导出的 Vue 组件，对齐 `amis-core/LazyComponent`：进视口才渲染默认槽，一旦可见就保持。这一层管挂载时机，不改 schema 字段名。

没有全局「等可见才打 `initApi`」开关。Page / Form 的 `initApi` 仍在组件 `onMounted` 时发出。文档 ` ```schema ` 外包了这一层（placeholder `加载中，请稍后。。。`，对齐 Amis `MdRenderer`），所以示例看起来像滚到才请求：

```schema
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "body": "date is ${date}"
}
```

切文档页会按路径销毁并重建 Play，不沿用上一页的 `visible`。侧栏改 body 模板不重挂，不会重打 `initApi`。

宿主预览、自定义重组件同样包一层。JSON / YAML / 对象都能进 `VamisRoot`。JS SDK `vamis.embed` **不会**自动包；非 Vue 宿主要同样效果，自己对容器做可见性判断。

```vue
<script setup lang="ts">
import { VamisRoot, LazyComponent } from 'vamis'

const schema = {
  type: 'page',
  initApi: '/api/mock2/page/initData',
  body: 'date is ${date}',
}
</script>

<template>
  <LazyComponent placeholder="加载中，请稍后。。。">
    <VamisRoot :schema="schema" />
  </LazyComponent>
</template>
```

| 属性 | 默认 | 含义 |
|------|------|------|
| `defaultVisible` | `false` | 未进视口不挂默认槽 |
| `unMountOnHidden` | `false` | 滚出后不卸载；`true` 才拆掉再进再挂 |
| `partialVisibility` | `true` | 露出一点就算可见 |
| `placeholder` | `Loading...` | 未可见时的占位 |
| `className` | | 传感器外层 class |

观察根是最近的 overflow 祖先（文档正文 `article` 也是），不是 `window`。`defaultVisible: true` 且未开 `unMountOnHidden` 时跳过传感器，立刻挂槽。

作者可见的 schema 开关只有两条（Amis 源码有、官方属性表未列）：

| 字段 | 组件 | 默认 | 作用 |
|------|------|------|------|
| `lazyLoad` | [Form](/components/form/) | `false` | `true` 时整棵表单（含面板）进视口再画。`initApi` 仍随 Form 挂载发出 |
| `unMountOnHidden` | [Chart](/components/chart) | `false` | Chart 画布始终包一层；为 `true` 时滚出卸载 echarts。`api` 仍随 Chart 挂载发出 |

重组件也可以自己包，见 [自定义组件](/extend/custom)。Vue 用默认槽，没有 Amis 的 `getComponent`；异步拆包用 `defineAsyncComponent`。
