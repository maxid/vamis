---
title: 自定义组件
---

# 自定义组件

::: warning 实现进度 55% · 进行中
注册、匹配优先级、作用域、Vue / SDK 同注册表、校验扩展与渲染错误边界均已按源码核对；插件市场和远程加载不在当前范围。
:::

用 `registerRenderer` 注册 Vue 组件。渲染器通过 props 接收 `schema` / `data`；`env` 不是在 SchemaRenderer 上逐项转发的普通 prop，而是在组件内用 `useEnv()` 注入。

```ts
import { defineComponent, h } from 'vue'
import { registerRenderer, useEnv } from '@vamis/core'

registerRenderer({
  type: 'hello',
  test: /^hello-/,
  weight: 0,
  isolateScope: false,
  component: defineComponent({
    props: {
      schema: { type: Object, required: true },
      data: { type: Object, required: true },
    },
    setup(props) {
      const env = useEnv()
      return () => h('button', {
        class: 'text-sm',
        onClick: () => env.notify('info', `你好 ${props.data.name || ''}`),
      }, String(props.schema.text || 'hello'))
    },
  }),
})
```

```yaml
type: page
data:
  name: Vamis
body:
  type: hello
  text: 自定义节点
```

不要在组件里直接 `fetch`。需要请求就通过注入的 `env` 走统一管线，或包在 `service` 里。重组件（图表、编辑器）可以包一层 [LazyComponent](/concepts/schema#lazycomponent)，默认进视口再挂。

`type` 精确匹配优先；没有精确命中时再按 `weight` 从高到低检查 `test`。重复注册同一个 `type` 会更新既有注册，不会叠加两个组件。`isolateScope: true` 会截断父域查找，只用于数据隔离，不是安全沙箱。

JS SDK 宿主用同一套注册表：`vamis.registerRenderer({ type, component })`。不要把函数写进 YAML。非 Vue 页面也可以用已有 `custom` 的 `onMount` 往 DOM 插节点。不提供 `amisRequire('react')`。

## 失败态

- 未注册 type 会显示占位并进入诊断；先检查注册是否发生在 `VamisRoot` / `embed` 之前。
- 重复 `type` 是覆盖更新；需要多个匹配规则时用 `test` / `weight`，不要依赖注册顺序猜结果。
- 组件抛错会由 [SchemaRenderer 错误边界](/concepts/schema) 显示带路径的错误块，并调用 `env.onDiagnostic`；不需要每个扩展组件另写一套全局错误处理。

调试与诊断字段见 [调试](/extend/debug)，SDK 加载顺序见 [JS SDK](/start/sdk)。

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
