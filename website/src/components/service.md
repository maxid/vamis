---
title: Service 功能型容器
outline: deep
---

# Service 功能型容器

::: info 实现进度 75% · 进行中
文档主路径已对齐：独立 Scope、静态 `data`、`api` 按 `isApiOutdated` 刷新、`schemaApi` 把返回的 `data` 当子 schema 渲染、`initFetch: false`、`reload`。缺 `dataProvider`、jsonp/js schema、`interval` 轮询。
:::

部分展示组件自己不会拉接口，要用 `source` 从数据链取数。`Service` 负责拉数（或拉 schema），子组件再从它的数据域取值。

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本使用

对照不跑远程 `api`（避免 Amis / Vamis 两套 mock 对不齐）。静态 `data` 同样进本域：

```schema: scope="body"
{
  "type": "service",
  "data": {
    "title": "Test Page Component",
    "date": "2017-10-13"
  },
  "body": {
    "type": "tpl",
    "tpl": "${title} · 现在是：${date}"
  }
}
```

```schema: scope="body"
type: service
data:
  title: Test Page YAML
  date: 2017-10-14
body:
  type: tpl
  tpl: ${title} · 现在是：${date}
```

远程 `api` 对照不跑：

```yaml
type: service
api: /api/mock2/page/initData
body:
  type: tpl
  tpl: 现在是：${date}
```

## 展示列表

子组件用 `source: $rows` 取本域列表。对照不跑 crud 接口：

```schema: scope="body"
{
  "type": "service",
  "data": {
    "rows": [
      { "engine": "Trident", "version": "4" },
      { "engine": "Gecko", "version": "1.9" }
    ]
  },
  "body": {
    "type": "tpl",
    "tpl": "首行 ${rows[0].engine}"
  }
}
```

## 动态渲染页面

`schemaApi` 把接口 `data` 当成子 schema 渲染（有 `type` 就整棵画）。jsonp / `js:` 未接。对照不跑：

```yaml
type: service
schemaApi: /api/mock2/service/schema?type=tabs
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"service"` | 指定为 Service |
| api | Api | | 拉数，写入本域 |
| schemaApi | Api | | 拉子 schema |
| body | Schema | | 静态内容；有 schemaApi 结果时被替换 |
| data | `object` | | 初始数据域 |
| initFetch | `boolean` | `true` | `false` 时不在挂载拉 api |
| interval | `number` | | 轮询，尚未接入 |
| name | `string` | | 可 `${id}` 动态名 |
| className | `string` | | 打在宿主 |

## 事件表

| 事件名称 | 说明 |
|----------|------|
| fetchInited | api 完成。尚未派发 |
| fetchSchemaInited | schemaApi 完成。尚未派发 |

## 动作表

| 动作名称 | 说明 |
|----------|------|
| reload | 重拉 api / schemaApi |
| setValue | 写入本域（走组件 `reload(data)`） |
| rebuild | 重拉 schemaApi。尚未单独暴露 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 `dataProvider`、jsonp / `js:` schema、`interval` 轮询、`ws`。
