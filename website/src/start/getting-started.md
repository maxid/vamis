---
title: 快速开始
---

# 快速开始

Vamis 有两种用法，和 Amis 一样：

- [JS SDK](/start/sdk)：任意 HTML 外链 `sdk.js`，`vamis.embed('#root', schema)`
- [Vue 3](#vue)：工程里用 `<VamisRoot :schema="..." />`

作者态同时支持 YAML 与 JSON（IR 信封也能进）。两条入口走同一套渲染器，不是两套运行时。

两条现在都能跑。JS SDK 先 `pnpm --filter @vamis/sdk build`，产物在 `packages/vamis-sdk/dist/`。

## Vue

仓库是 pnpm workspace：

```bash
pnpm install
pnpm dev          # 同一应用：文档（首页）/ 组件 / 示例 / 编辑器，http://127.0.0.1:5173
```

在自己的 Vue 应用里引用 workspace 包（或之后发布的 npm 名）：

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VamisRoot } from 'vamis'
import '@vamis/ui/styles.css'
import 'vamis'

const app = createApp({
  components: { VamisRoot },
  setup() {
    const schema = {
      type: 'page',
      title: 'Hello',
      body: '来自 schema 的页面',
    }
    return { schema }
  },
  template: '<VamisRoot :schema="schema" />',
})
app.use(createPinia())
app.mount('#app')
```

必须挂 Pinia：内部状态 hub 用它，不引入 MST。

## JS SDK

无 npm、无 Vite 的页面用 SDK。见 [JS SDK](/start/sdk)。外链 `sdk.js` / `sdk.css`：

```html
<link rel="stylesheet" href="sdk.css" />
<div id="root"></div>
<script src="sdk.js"></script>
<script>
  vamis.embed('#root', {
    type: 'page',
    title: '表单页面',
    body: { type: 'tpl', tpl: 'Hello' },
  })
</script>
```

## 作者态：YAML 或 JSON

两种写法同等有效，都交给 `parseSchemaText`（以 `{` / `[` 开头当 JSON）。

```schema
type: page
title: Hello
body:
  - type: tpl
    tpl: 你好，点下面提交会打 mock API
  - type: form
    api: /api/mock2/form/saveForm
    body:
      - type: input-text
        name: name
        label: 名称
        value: Vamis
        required: true
```

同一份用 JSON：

```schema
{
  "type": "page",
  "title": "Hello JSON",
  "body": [
    { "type": "tpl", "tpl": "JSON 作者态，和 YAML 进同一运行时" }
  ]
}
```

```ts
import { parseSchemaText, VamisRoot } from 'vamis'
const schema = parseSchemaText(text) // YAML 或 JSON 字符串
```

也可以直接喂对象。`jsonToIr()` 会包上信封：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage
metadata:
  name: hello
spec:
  type: page
  title: Hello
  body: []
```

`spec` 里仍是 Amis widget 树。字段名不改写。

## 注入 env

请求、跳转、提示都走 `env`，渲染器禁止自己 `fetch`：

```ts
import { createDefaultEnv } from '@vamis/core'

const env = createDefaultEnv({
  fetcher: (api) => fetch(api.url).then((r) => r.json()),
  jumpTo: (to) => router.push(to),
})
```

```vue
<VamisRoot :schema="schema" :data="{ name: '操作员' }" :env="env" />
```

文档和 Playground 的 `/api/mock2/*` 是本地 mock，方便演示 form / crud。SDK 落地后不传 `env.fetcher` 时会用内置 `window.fetch`。

## 下一步

- [JS SDK](/start/sdk)
- [配置与 Schema](/concepts/schema)
- [Form 表单](/components/form/)
- [CRUD](/components/crud)
- [样式系统](/style/)
