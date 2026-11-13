---
title: Service 功能型容器
outline: deep
---

# Service 功能型容器

::: info 实现进度 85% · 进行中
主路径已对齐：独立 Scope、静态 `data`、`api` 拉数、`schemaApi` 子 schema、`initFetch`、`reload`、`interval` 轮询 / `silentPolling` / `stopAutoRefreshWhen`、`init` / `fetchInited` / `fetchSchemaInited` 事件、`messages.fetchSuccess`、`showErrorMsg`。缺 `dataProvider` / `ws` / `rebuild`。
:::

部分展示组件自己不会拉接口，要用 `source` 从数据链取数。例如 [Table](./table)、[Cards](./cards)、[List](./list)。`Service` 负责配置初始化接口、写入本域，子组件再按数据链取值。

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本使用

最基本的用法是配初始化接口 `api`，把返回数据写入自身数据域，子组件再按 [数据链](/concepts/datascope-and-datachain) 取值。

```schema: scope="body"
type: service
api: /api/mock2/page/initData
body:
  type: panel
  title: $title
  body: 现在是：${date}
```

接口返回结构：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "title": "Test Page Component",
    "date": "2017-10-13"
  }
}
```

子组件里就可以用 `${title}` 和 `${date}`。静态 `data` 同样进本域，不必先打接口。

## 展示列表

常见组合是 Service + Table：接口里的列表用 `source: $rows` 交给表格。

```schema: scope="body"
{
  "type": "service",
  "api": "/api/mock2/crud/table?perPage=5",
  "body": [
    {
      "type": "table",
      "title": "表格1",
      "source": "$rows",
      "columns": [
        { "name": "engine", "label": "Engine" },
        { "name": "version", "label": "Version" }
      ]
    },
    {
      "type": "table",
      "source": "$rows",
      "columns": [
        { "name": "engine", "label": "Engine" },
        { "name": "version", "label": "Version" }
      ]
    }
  ]
}
```

`table` 配 `source: $rows` 即可拿到接口 `data.rows`。

## 动态渲染页面

`schemaApi` 把接口 `data` 当成子 schema 渲染（有 `type` 就整棵画）。

```schema: scope="body"
type: service
schemaApi: /api/mock2/service/schema?type=tabs
```

接口 `data` 类似：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "type": "tabs",
    "tabs": [
      { "title": "TabA", "body": "卡片A内容" },
      { "title": "TabB", "body": "卡片B内容" }
    ]
  }
}
```

jsonp / `js:` schemaApi **未接**。

## 定时轮询刷新

设置 `interval`（ms，最低 1000）会定时重拉 `api` / `schemaApi`；`stopAutoRefreshWhen` 命中表达式时停止。

```schema: scope="body"
type: service
api: /api/mock2/number/random?waitSeconds=1
interval: 2000
stopAutoRefreshWhen: this.random === 6
body:
  type: panel
  title: 随机数字
  body: 现在是：${random}
```

### 静默轮询

`silentPolling: true` 时轮询不显示 loading（仅配 `interval` 生效）：

```schema: scope="body"
type: service
api: /api/mock2/number/random?waitSeconds=1
interval: 2000
silentPolling: true
stopAutoRefreshWhen: this.random === 6
body:
  type: panel
  title: 随机数字
  body: 现在是：${random}
```

## 隐藏错误信息

`showErrorMsg: false` 时不 toast 接口错误；`messages.fetchSuccess` 可覆写成功提示。WebSocket（`ws`）与 `dataProvider` 未接。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"service"` | 指定为 Service |
| api | Api | | 拉数，写入本域 |
| schemaApi | Api | | 拉子 schema |
| body | Schema | | 静态内容；有 schemaApi 结果时被替换 |
| data | `object` | | 初始数据域 |
| initFetch | `boolean` | `true` | `false` 时不在挂载拉 api |
| interval | `number` | | 轮询间隔 ms（最低 1000）；随 api / schemaApi 刷新 |
| silentPolling | `boolean` | `false` | 轮询时不显示 loading |
| stopAutoRefreshWhen | 表达式 | | 满足即停止轮询 |
| messages.fetchSuccess | `string` | | 拉取成功提示 |
| showErrorMsg | `boolean` | `true` | 是否 toast 接口错误 |
| name | `string` | | 可 `${id}` 动态名 |
| className | `string` | | 打在宿主 |

## 事件表

| 事件名称 | 说明 |
|----------|------|
| `init` | 组件挂载后触发 |
| `fetchInited` | api 完成；参数 responseData / responseStatus / responseMsg / error |
| `fetchSchemaInited` | schemaApi 完成；参数同上 |

## 动作表

| 动作名称 | 说明 |
|----------|------|
| reload | 重拉 api / schemaApi |
| setValue | 写入本域（走组件 `reload(data)`） |
| rebuild | **未接**（当前用 `reload` 重拉 schemaApi） |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 已接 `interval` 轮询 / `silentPolling` / `stopAutoRefreshWhen`、`init` / `fetchInited` / `fetchSchemaInited` 事件；未接 `dataProvider`、jsonp / `js:` schema、`ws`、独立 `rebuild` 动作。
