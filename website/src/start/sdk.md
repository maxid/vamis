---
title: JS SDK
---

# JS SDK

::: info 实现进度 80% · 进行中
P0 `vamis.embed` / `updateSchema` / `updateProps` / `unmount` 已落地。`getComponentByName` / `doAction` 仍抛未实现，等 D5。
:::

任意 HTML 页面用 `<script>` 嵌入 Vamis，对齐 Amis 的 `amis.embed`。内部仍是 `VamisRoot`，不是第二套运行时。

构建：`pnpm --filter @vamis/sdk build`，产物在 `packages/vamis-sdk/dist/`（`sdk.js` + `sdk.css` + `hello.html`）。Playground 在 `/sdk/hello.html` 提供同一份无构建示例。Vue 工程请走 [快速开始](/start/getting-started)。

下面 iframe 跑打包后的 `sdk.js`：

<iframe src="../../sdk/hello.html" title="Vamis JS SDK hello" style="width:100%;height:420px;border:1px solid var(--border, #e5e7eb);border-radius:8px;background:var(--card, #fff)"></iframe>

## 用法

```html
<link rel="stylesheet" href="sdk.css" />
<div id="root"></div>
<script src="sdk.js"></script>
<script>
  const scoped = vamis.embed('#root', {
    type: 'page',
    title: '表单页面',
    body: {
      type: 'form',
      mode: 'horizontal',
      body: [
        { type: 'input-text', name: 'name', label: 'Name' },
      ],
    },
  })
</script>
```

`schema` 可以是裸 widget（`{ type: 'page', ... }`）、JSON 字符串、YAML 字符串，或 IR 信封（`apiVersion: lcdp.ir/v1`）。

## API

```ts
vamis.embed(container, schema, props?, env?) → VamisScoped
```

参数顺序对齐 Amis：`(container, schema, props, env)`。

| 方法 | 说明 |
|------|------|
| `updateProps(props)` | 改 `data` / `context` / `locale`，不重挂应用 |
| `updateSchema(schema, props?)` | 换整页 schema |
| `unmount()` | 卸 Vue app |
| `getComponentByName(name)` | 依赖 D5；未落地前会标明未实现 |
| `doAction(actions, ctx?)` | 依赖 D4；未落地前会标明未实现 |

全局辅助：`vamis.registerRenderer`、`vamis.parseSchemaText`、`vamis.yamlFromUnknown`。

不传 `env.fetcher` 时，SDK 用 `window.fetch`，按 `{ status, msg, data }` 解析。`notify` / `alert` / `confirm` / `jumpTo` 有默认实现，宿主可覆盖。

## 和 Vue 的关系

```
任意 HTML  →  sdk.js IIFE  ─┐
Vue 应用   →  vamis ESM    ─┴→  VamisRoot → registerRenderer
```

Playground 和文档站点继续走 ESM，不必改成 SDK。

## 明确不搬

- 没有 `amisRequire` AMD，只有 `window.vamis`
- 没有 `cxd.css` / `antd.css` 换肤包，皮肤是 shadcn token
- 不支持 IE
- 自定义组件走 Vue 组件或已有 `custom` DOM，不把 React 打进 SDK

完整契约见仓库 `docs/superpowers/specs/2026-10-21-vamis-js-sdk.md`。
