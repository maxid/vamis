---
title: Page 页面
outline: deep
---

# Page 页面

::: info 实现进度 70% · 进行中
`initApi` 走本地 overlay + `extra-data`；initFetch / interval / aside 区域 / reload 已接。缺 D1 Scope 与 URL 种子、D4 事件对象、pullRefresh、css 字符串块
:::

`page` 是页面入口容器，对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。

默认铺满布局槽（`w-full min-w-0`），不必先写 `size` / `w-full`。作者态 YAML 与 JSON 同等有效。

## 基本用法

内容区可以是字符串，也可以继续嵌套其它组件。

```schema
{
  "type": "page",
  "title": "标题",
  "body": "Hello World!"
}
```

```schema
type: page
title: 页面标题
subTitle: 最外层页面容器
body:
  - type: tpl
    tpl: 页面正文
  - type: divider
  - type: form
    wrapWithPanel: false
    body:
      - type: input-text
        name: name
        label: 姓名
```

## 区域：body / aside / toolbar

Page 默认分成内容区（`body`）、侧边栏（`aside`）和工具栏（`toolbar`）。侧栏默认在左侧，可用 `asidePosition: right` 换到右边；`asideSticky` 默认开启。

```schema
type: page
title: 分区
aside:
  - type: tpl
    tpl: 侧边栏
toolbar:
  - type: tpl
    tpl: 工具栏
body:
  - type: tpl
    tpl: 内容区
```

侧栏可拖宽（`asideResizor`），宽度夹在 `asideMinWidth` / `asideMaxWidth` 之间（未写时约 160–400）。

```schema
type: page
asideResizor: true
asidePosition: right
asideMinWidth: 160
asideMaxWidth: 360
aside:
  - type: tpl
    tpl: 可拖动的右侧栏
body:
  - type: tpl
    tpl: 内容区
```

## 页面初始化请求

配置 `initApi` 后，Page 会在挂载时请求接口，把返回的 `data` 放进本页 overlay，子节点用 `${date}` 就能读到。默认会拉（`initFetch` 为 true）；可用 `initFetch: false` 或 `initFetchOn` 表达式关掉首次请求。

```schema
type: page
initApi: /api/mock2/page/initData
body:
  - type: tpl
    tpl: 当前时间是：${date}
```

## 轮询

`interval` 单位毫秒，最小 1000。请求成功后才会继续下一轮；`stopAutoRefreshWhen` 为真时停下。`silentPolling` 在 Vamis 里表示轮询出错不弹 notify。

```schema
type: page
initApi: /api/mock2/page/initData
interval: 3000
body:
  - type: tpl
    tpl: 当前时间是：${date}
```

## CSS 变量

`cssVars` 写在 schema 上，会映射到 shadcn token（例如 Amis `--text-color` → `--foreground`）。

```schema
type: page
cssVars:
  --text-color: '#108cee'
body:
  type: form
  wrapWithPanel: false
  body:
    - type: input-text
      label: 文本框
      name: text
```

## 事件：init / inited

挂载时派发 `init`；`initApi` 结束（成功或失败）派发 `inited`。D4 事件对象尚未落地，动作用 `${date}` / `${responseStatus}` 读扁平字段，不要写 `${event.data.xxx}`。

```schema
type: page
initApi: /api/mock2/page/initData
body:
  - type: tpl
    tpl: 当前时间是：${date}
onEvent:
  init:
    actions:
      - actionType: toast
        msg: init
  inited:
    actions:
      - actionType: toast
        msg: 'inited ${date}'
```

## 动作：reload

给 Page 写 `id`（或 `name`），其它组件用 `actionType: reload` + `componentId` 重新拉 `initApi`。

```schema
type: page
id: page_reload_1
initApi: /api/mock2/page/initData
body:
  - type: button
    label: 刷新时间
    onEvent:
      click:
        actions:
          - componentId: page_reload_1
            actionType: reload
  - type: tpl
    tpl: 当前时间是：${date}
```

`setValue` 会把对象合并进本页 overlay。`dataMergeMode: override` 尚未接。

## 属性表

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `"page"` | 指定为 Page |
| `title` | SchemaNode | | 标题。字符串走 tpl；对象走子渲染器 |
| `subTitle` | SchemaNode | | 副标题，同上 |
| `remark` | SchemaNode | | **Vamis**：字符串当说明文字，不渲染 Remark 图标；对象才交给子渲染器 |
| `aside` | SchemaNode | | 侧栏 |
| `asideResizor` | `boolean` | | 侧栏可拖宽 |
| `asideMinWidth` | `number` | `160` | 拖宽下限（未写时） |
| `asideMaxWidth` | `number` | `400` | 拖宽上限（未写时） |
| `asideSticky` | `boolean` | `true` | 侧栏 CSS sticky |
| `asidePosition` | `"left" \| "right"` | `"left"` | 侧栏位置 |
| `toolbar` | SchemaNode | | 顶栏右侧（无标题时仍在顶部） |
| `body` | SchemaNode | | 内容区 |
| `className` | `string` | | 外层 class，由 SchemaRenderer 套上，Page 内部不再重复加 |
| `headerClassName` / `toolbarClassName` / `bodyClassName` / `asideClassName` | `string` | | 打到对应区域，走 `resolveClassName` |
| `cssVars` | `object` | | 自定义 CSS 变量 |
| `css` | `object` | | **Vamis 未接**：不会注入 `<style>` 块 |
| `initApi` | API | | 拉初始数据。返回字段进入本页 overlay |
| `initFetch` | `boolean` | `true` | 是否首次拉取 |
| `initFetchOn` | 表达式 | | 首次是否拉取 |
| `interval` | `number` | | 轮询间隔（最小 1000） |
| `silentPolling` | `boolean` | `false` | 轮询失败时不 notify |
| `stopAutoRefreshWhen` | 表达式 | | 为真则停止轮询 |
| `pullRefresh` | `object` | | **Vamis 未接**（Amis 仅移动端） |
| `data` | `object` | | 静态数据，与父级浅合并。无独立 Scope / URL 种子（D1） |
| `onEvent` | `object` | | 事件到动作（D4 精简） |

## 事件表

| 事件 | 数据 | 说明 |
|------|------|------|
| `init` | 当前数据 | 插入 DOM 时。无事件对象 |
| `inited` | `responseData` / `responseStatus` / `responseMsg` 以及接口字段 | `initApi` 结束后。`${event.data.*}` 与 `\|json` 过滤器不可用（D4 / D2） |
| `pullRefresh` | — | **Vamis 未接** |

## 动作表

| 动作 | 配置 | 说明 |
|------|------|------|
| `reload` | `componentId` | 重新请求 `initApi`。动作上的 `data` 会先合并进 overlay |
| `setValue` | `args.value` 对象 | 合并进 overlay。覆盖模式 `dataMergeMode: override` 未接 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）和事件对象（D4）尚未落地：没有 URL 查询种子、没有 `event.data`、adaptor / `replaceData` 未接。
- `pullRefresh`、schema `css` 字符串块、字符串 `remark` 的问号图标未做。
