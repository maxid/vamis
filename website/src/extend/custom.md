---
title: 自定义组件
---

# 自定义组件

用 `registerRenderer` 注册 Vue 组件。渲染器只吃 `schema` / `data` / `env`。

```ts
import { defineComponent, h } from 'vue'
import { registerRenderer } from '@vamis/core'

registerRenderer({
  type: 'hello',
  component: defineComponent({
    props: { schema: { type: Object, required: true } },
    setup(props) {
      return () => h('p', { class: 'text-sm' }, String(props.schema.text || 'hello'))
    },
  }),
})
```

```yaml
type: hello
text: 自定义节点
```

不要在组件里 `fetch`。需要请求就走 `env.fetcher`，或包在 `service` 里。
