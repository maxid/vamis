---
title: API
outline: deep
---

# API

::: tip 实现进度 90% · 已完成
kernel D3 P0 已落地：`requestApi` 管线（sendOn / cache / adaptor / `responseData` / `replaceData` / `messages` / `dataType` / GraphQL）与文档主路径对齐。P1：`qsOptions`、全局 `addApiRequestAdaptor`、blob `Content-Disposition` 下载。
:::

接口配置与 Amis 同形：字符串或对象。所有数据请求走同一条 D3 管线 `requestApi`（normalize → sendOn → requestAdaptor → cache → fetch → payload → adaptor → responseData），由 `env.fetcher` 发出。渲染器禁止自己 `fetch`。

## 简单配置

只需要地址时，用字符串：

```
[<method>:]<url>
```

- **method**：`get` / `post` / `put` / `patch` / `delete`，默认 `get`。表单提交接口未写 method 时默认 `post`。
- **url**：支持模板字符串。

```json
{
  "api": "get:/api/initData",
  "api": "post:/api/initData"
}
```

## 接口返回格式

约定：

```json
{
  "status": 0,
  "msg": "",
  "data": {}
}
```

- **status**：`0` 为成功，其它按失败处理
- **msg**：提交或失败时的提示
- **data**：给组件的数据对象

也兼容这些错误写法：`errorCode` + `errorMessage`、`errno` + `errmsg`、`error` / `error.code`、`message` 当作 `msg`。没有 `status` 字段时，把整个 JSON 当作成功的 `data`（无法用业务码表达错误，只能靠 HTTP 状态）。

可用 `msgTimeout`（毫秒）控制提示停留时间。

## 复杂配置

### 基本用法

```json
{
  "api": {
    "method": "get",
    "url": "/api/xxx",
    "data": {}
  }
}
```

### 请求方式与地址

`method` 支持 get / post / put / patch / delete。`url` 支持 [模板](../concepts/template)。

### 请求数据

`data` 按 [数据映射](../concepts/data-mapping) 从当前域取值。GET 时这些字段拼进 query。

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "data": {
      "myName": "${name}",
      "myEmail": "${email}"
    }
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" },
    { "name": "email", "type": "input-email", "label": "邮箱：" }
  ]
}
```

未填写的值默认仍会作为空字符串发出。不想发时写成 `"${name|default:undefined}"`，映射结果为 `undefined` 的 key 会被丢掉。

对象 key 带路径（`a.b`、`c[d]`）默认转成嵌套对象。不想转就设 `convertKeyToPath: false`。

没写 `data` 时，form 提交会带上全部表单项（`autoAppend`）。

### 数据体格式 dataType

默认 `json`（`application/json`）。`form` 为 `application/x-www-form-urlencoded`，`form-data` 为 `multipart/form-data`。数据里有文件时自动改用 `form-data`。

`&: $$`（或文档里偶见的 `$$$$`）表示把当前域全部铺进发送体。

```schema: scope="body"
{
  "type": "form",
  "title": "默认 JSON",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "data": { "&": "$$" }
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" },
    { "name": "email", "type": "input-email", "label": "邮箱：" }
  ]
}
```

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "dataType": "form"
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" },
    { "name": "email", "type": "input-email", "label": "邮箱：" }
  ]
}
```

### 请求头

`headers` 同样走数据映射。

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "headers": { "my-header": "aaa" }
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" }
  ]
}
```

### 请求条件 sendOn

表达式为假时不发请求。

```schema: scope="body"
{
  "type": "form",
  "mode": "horizontal",
  "body": [
    {
      "label": "选项1",
      "type": "radios",
      "name": "a",
      "inline": true,
      "options": [
        { "label": "选项A", "value": 1 },
        { "label": "选项B", "value": 2 },
        { "label": "选项C", "value": 3 }
      ]
    },
    {
      "label": "选项2",
      "type": "select",
      "name": "b",
      "source": {
        "method": "get",
        "url": "/api/mock2/options/level2?a=${a}",
        "sendOn": "this.a === 2"
      },
      "description": "只有选项1选 B 时，才拉选项2 的 source"
    }
  ],
  "actions": []
}
```

### 接口缓存 cache

`cache` 为毫秒。相同 method + url + body 在窗口内复用上次结果。适合列表每一行都打同一个 Service。

```schema: scope="body"
{
  "type": "crud",
  "api": "/api/mock2/sample",
  "columns": [
    { "name": "id", "label": "ID" },
    {
      "type": "service",
      "label": "数据",
      "api": {
        "method": "get",
        "url": "/api/mock2/page/initData",
        "cache": 2000
      },
      "body": { "type": "tpl", "tpl": "当前日期是：${date}" }
    }
  ]
}
```

### 返回数据 responseData

对接口 `data` 再做一次映射。可映射的上下文是接口实际数据，外加 `api`（`api.query` / `api.body`）。`{"&": "$$"}` 先铺平原始字段。

假如接口返回 `{ items: [{a: 1}, {a: 2}] }`，下面会得到 `items` + `first`：

```json
{
  "initApi": {
    "url": "/api/xxx",
    "responseData": {
      "&": "$$",
      "first": "${items|first}"
    }
  }
}
```

数组直接放在 `data` 里时，会先包成 `{ items: [...] }` 再映射。

### 发送 / 接收适配器

`requestAdaptor` 在发出前改 `api`（`url` / `data` / `headers` / `query` / `context`）。`adaptor` 在收到后改 payload。

- **函数**：JS 里直接传函数
- **字符串函数体**：只在 `env.trusted: true` 时执行（Playground / 文档预览默认开；嵌入 SDK 默认关）。更推荐改 `env.fetcher` 或注册函数。

字符串 adaptor 会被包成 `function (payload, response, api, context) { ... }`，最后必须 `return`。

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "requestAdaptor": "return {\n  ...api,\n  data: { ...api.data, foo: 'bar' }\n}"
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" },
    { "name": "email", "type": "input-email", "label": "邮箱：" }
  ]
}
```

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "adaptor": "return { ...payload, status: payload.status == null ? 0 : payload.status }"
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" }
  ]
}
```

`requestAdaptor` 里给 api 加上 `mockResponse` 会拦住真实请求，直接用这份结果（便于本地模拟）。

### 文件下载

`responseType: "blob"` 时 fetcher 返回 Blob。完整下载还依赖响应头 `Content-Disposition`；跨域需暴露该头。覆盖 `env.fetcher` 时自己处理附件。

### 提示信息 messages

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "data": {
      "myName": "${name}",
      "myEmail": "${email}"
    },
    "messages": {
      "success": "好耶，成功了！",
      "failed": "糟糕，失败了！"
    }
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" },
    { "name": "email", "type": "input-email", "label": "邮箱：" }
  ]
}
```

### replaceData

返回数据默认**追加**到当前域。`replaceData: true` 则整份替换。

## 自动刷新

拉取类接口（form `initApi`、select `source`、service `api`、page `initApi`）默认会盯 url 里的 `${var}`。变量变了会再请求一次。

```schema: scope="body"
{
  "type": "form",
  "mode": "horizontal",
  "title": "监听表单内部的修改",
  "initApi": "/api/mock2/form/initData?tpl=${tpl}",
  "actions": [],
  "body": [
    {
      "label": "数据模板",
      "type": "select",
      "name": "tpl",
      "value": "tpl1",
      "inline": true,
      "options": [
        { "label": "模板1", "value": "tpl1" },
        { "label": "模板2", "value": "tpl2" },
        { "label": "模板3", "value": "tpl3" }
      ]
    },
    { "label": "名称", "type": "static", "name": "name" },
    { "label": "作者", "type": "static", "name": "author" },
    { "label": "请求时间", "type": "static", "name": "date" }
  ]
}
```

关掉自动刷新有两种办法：

1. 把依赖写进对象形式的 `data`，而不是 url：`{ method: 'get', url: '/api/xxx', data: { xx: '${xxx}' } }`
2. 设 `autoRefresh: false`

配合 `sendOn` 可以串行：接口 2 的 url 引用接口 1 才会返回的字段，并设 sendOn 为该字段存在。

## 跟踪数据 trackExpression

想跟踪 url 以外的变量时显式写。对象数据建议 `"${field|json}"`，避免 `[object Object]`。

```schema: scope="body"
{
  "type": "form",
  "mode": "horizontal",
  "body": [
    {
      "label": "选项1",
      "type": "radios",
      "name": "a",
      "inline": true,
      "options": [
        { "label": "选项A", "value": 1 },
        { "label": "选项B", "value": 2 },
        { "label": "选项C", "value": 3 }
      ]
    },
    {
      "label": "选项2",
      "type": "select",
      "name": "b",
      "source": {
        "method": "get",
        "url": "/api/mock2/options/level2?a=${a}",
        "trackExpression": "${a}"
      },
      "description": "切换选项1 会重新拉选项2"
    }
  ],
  "actions": []
}
```

## GraphQL

配了 `graphql` 时，发送体自动变成 `{ query, variables }`。`data` 当作 variables。

```schema: scope="body"
{
  "type": "form",
  "api": {
    "method": "post",
    "url": "/api/mock2/form/saveForm",
    "graphql": "mutation AddUser($name: String, $email: String) { insert_user(object: { name: $name, email: $email }) { name email } }"
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "姓名：" },
    { "name": "email", "type": "input-email", "label": "邮箱：" }
  ]
}
```

## 属性表

| 字段 | 说明 | 类型 |
|------|------|------|
| method | 请求方式 | `get` / `post` / `put` / `patch` / `delete` |
| url | 地址，支持模板 | 字符串 |
| data | 发送数据，支持映射 | 对象 |
| dataType | `json`（默认）/ `form` / `form-data` | 字符串 |
| qsOptions | form / form-data 的序列化选项 | 对象 |
| headers | 请求头，支持映射 | 对象 |
| sendOn | 发送条件 | 表达式 |
| cache | 缓存毫秒 | 数字 |
| requestAdaptor | 发送适配器 | 函数或字符串函数体（需 `env.trusted`） |
| adaptor | 接收适配器 | 同上 |
| replaceData | 是否整份替换当前数据，默认追加 | 布尔 |
| responseType | 下载时设 `blob` | 字符串 |
| autoRefresh | 是否跟踪 url 自动刷新 | 布尔 |
| responseData | 对返回 data 再映射 | 对象 |
| trackExpression | 额外跟踪表达式 | 字符串 |
| graphql | GraphQL 查询，data 当 variables | 字符串 |
| messages | `success` / `failed` 提示 | 对象 |
| mockResponse | 适配器里拦截真实请求 | 对象 |
| convertKeyToPath | 映射 key 是否转路径，默认 true | 布尔 |

P1 未齐：`qsOptions` 细项、全局 `addApiRequestAdaptor`、blob 附件头的完整下载动作。自动刷新目前接在 page / form `initApi`、service、select `source`。
