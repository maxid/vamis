---
title: 自定义组件
---

# 自定义组件

::: info 实现进度 55% · 进行中
`registerRenderer` 可用，D7 的 `test` / `weight` / `isolateScope` 已接。插件市场、错误边界仍缺。
:::

用 `registerRenderer` 注册 Vue 组件。渲染器只吃 `schema` / `data` / `env`。

```ts
import { defineComponent, h } from 'vue'
import { registerRenderer } from '@vamis/core'

registerRenderer({
  type: 'hello',
  test: /^hello-/,
  weight: 0,
  isolateScope: false,
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

不要在组件里 `fetch`。需要请求就走 `env.fetcher`，或包在 `service` 里。重组件（图表、编辑器）可以包一层 [LazyComponent](/concepts/schema#lazycomponent)，默认进视口再挂。

JS SDK 宿主用同一套注册表：`vamis.registerRenderer({ type, component })`。不要把函数写进 YAML。非 Vue 页面也可以用已有 `custom` 的 `onMount` 往 DOM 插节点。不提供 `amisRequire('react')`。

## 扩展表单验证

如果默认的表单检测规则不满足需求，还可以通过代码的方式扩展。

### 普通用法

JS SDK 中的用法：

```javascript
vamis.addRule(
  // 校验名
  'isZXS',
  // 校验函数，values 是表单里所有表单项的值，可用于做联合校验；value 是当前表单项的值
  (values, value) => {
    if (
      value === '北京' ||
      value === '上海' ||
      value === '天津' ||
      value === '重庆'
    ) {
      // return true 表示校验通过
      return true
    }
    // return false 表示校验不通过，会进行错误提示
    return false
  },
  // 出错时的报错信息
  '输入的不是直辖市'
)
```

这样在配置中就能使用下面的验证方法

```
"validations": {
  "isZXS": true
}
```

Vue 宿主的用法是类似的：

```javascript
import { addRule } from '@vamis/core'
```

### 更加灵活的提示错误

如果想在一个验证函数里根据不同情况提示不同的错误信息，需要返回固定格式的结果：

```js
{
  error: true,
  msg: '错误信息'
}
```

注意，当返回对象时，`error` 必须为 `true` 才会判定为错误。

具体用法如下：

```javascript
vamis.addRule(
  // 校验名
  'isZXS',
  // 校验函数，values 是表单里所有表单项的值，可用于做联合校验；value 是当前表单项的值
  (values, value) => {
    if (value === '新加坡') {
      // 校验不通过，提示：该地区不在国内
      return {
        error: true,
        msg: '该地区不在国内',
      }
    }

    if (
      value === '北京' ||
      value === '上海' ||
      value === '天津' ||
      value === '重庆'
    ) {
      // return true 表示校验通过
      return true
    }

    // 校验不通过，提示：输入的不是直辖市
    return {
      error: true,
      msg: '输入的不是直辖市',
    }
  }
)
```
