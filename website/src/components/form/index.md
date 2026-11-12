---
title: Form 表单
outline: deep
---

# Form 表单

::: info 实现进度 88% · 进行中
主路径已对齐：`initApi` / 提交 API / 校验 / 重置 / 调试、`initApiFinished` / `inited` / `change` / `validateSucc` / `validateError` / `submit` / `submitSucc` / `submitFail` 事件、表单 `rules` 组合校验、`submitOnInit`、`submitOnChange`、`resetAfterSubmit`、`redirect`、`messages`、`trimValues`、`persistData`（含 `persistDataKeys` / `clearPersistDataAfterSubmit`）、`preventEnterSubmit`、`autoFocus`、`static` 切换、`target` / `reload`、`debug`。缺 `interval` / `silentPolling` / `asyncApi` / `initAsyncApi`、`promptPageLeave`、`columnCount`、`canAccessSuperData`、`horizontal` 比例、`validate` / `validateFormItem` 动作；combo 独立域。
:::

`type: form` 是数据输入的根。子节点是表单项（`name` 写入表单数据）。提交走 `api` + `env.fetcher`。对齐 Amis 同名 schema；YAML 与 JSON 同等有效。默认吃满布局槽，不必先写 `size` / `w-full`。

```schema
type: form
title: 新建设备
mode: horizontal
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    label: 名称
    required: true
  - type: input-email
    name: email
    label: 邮箱
  - type: radios
    name: status
    label: 状态
    options:
      - label: 在线
        value: online
      - label: 离线
        value: offline
```

水平布局的标签宽度走 `--form-label-width`。路径值、`validateApi`、提交 `errors`、`autoFill` 见 [FormItem](/components/form/formitem)。

## 表单展示

### 水平模式

`mode: horizontal`；`labelWidth` 控制标签列宽：

```schema
type: form
title: 水平模式
mode: horizontal
labelWidth: 120
body:
  - type: input-text
    name: name
    label: 名称
  - type: input-text
    name: email
    label: 邮箱
```

### 内联模式

```schema
type: form
title: 内联模式
mode: inline
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    placeholder: 名称
  - type: input-text
    name: email
    placeholder: 邮箱
```

### 自定义底部按钮

不写 `actions` 时只画默认「提交」；`reset: true` 多一个重置。自定义按钮写在 `actions`：

```schema
type: form
title: 自定义按钮
body:
  - type: input-text
    name: name
    label: 名称
actions:
  - type: button
    label: 取消
    level: default
  - type: submit
    label: 保存
    level: primary
```

### 去掉表单边框

`wrapWithPanel: false` 后不再画 Card 面板，底栏默认仍保留；配 `actions: []` 可完全去掉：

```schema
type: form
title: 无面板
wrapWithPanel: false
body:
  - type: input-text
    name: name
    label: 名称
actions: []
```

## 表单静态展示

`static: true` 让整个表单进入静态态；也可由其它组件发 `static` / `nonstatic` 动作切换：

```schema
type: form
id: static_form
title: 静态切换
actions:
  - type: button
    label: 切静态
    onEvent:
      click:
        actions:
          - actionType: static
            componentId: static_form
  - type: button
    label: 切输入
    onEvent:
      click:
        actions:
          - actionType: nonstatic
            componentId: static_form
body:
  - type: input-text
    name: name
    label: 名称
    value: hello
```

## 表单项数据初始化

`initApi` 拉初始数据；`initFetch: false` 可先不拉，交给动作 `reload`。返回 `data` 合并进表单域：

```schema
type: form
title: 初始化
initApi: /api/mock2/form/initData
debug: true
body:
  - type: input-text
    name: name
    label: 名称
  - type: input-text
    name: email
    label: 邮箱
```

`initApi` 完成后触发 `initApiFinished`，`event.data.__trigger` 区分 `init` / `reload`。

## 表单提交

`api` 默认 POST；成功返回的 `data` 合并进表单域，并触发 `submitSucc`：

```schema
type: form
title: 提交
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    label: 名称
    required: true
  - type: input-text
    name: email
    label: 邮箱
```

```schema
type: form
title: 提交事件
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    label: 名称
    value: amis
  - type: input-text
    name: email
    label: 邮箱
    value: amis@example.com
onEvent:
  submit:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: submit ${event.data.name}
```

提交成功后可以用 `resetAfterSubmit: true` 重置，用 `redirect` 跳转，用 `messages.saveSuccess` 覆盖提示：

```schema
type: form
title: 提交后重置
api: /api/mock2/form/saveForm
resetAfterSubmit: true
body:
  - type: input-text
    name: name
    label: 名称
    value: 初始值
```

## 表单校验

表单项走 `validations`；跨字段组合校验用 `rules`（表达式里通过 `data.字段` 取值），命中 `name` 可高亮对应表单项：

```schema
type: form
title: 组合校验
rules:
  - rule: "!(data.a && data.b)"
    message: a 和 b 不能同时有值
    name: [a, b]
body:
  - type: input-text
    name: a
    label: A
  - type: input-text
    name: b
    label: B
```

## 重置表单

`reset: true` 给默认底栏加重置；动作 `reset` / `clear` 也可由其它组件按 `componentId` 触发：

```schema
type: form
title: 重置
data:
  name: 初始值
body:
  - type: input-text
    name: name
    label: 名称
actions:
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
```

## 表单数据域调试

`debug: true` 会在表单下方展示当前数据域：

```schema
type: form
title: 调试
debug: true
body:
  - type: input-text
    name: name
    label: 名称
    value: 调试值
```

## 持久化保存表单项数据

`persistData` 是 localStorage key；`persistDataKeys` 可只存指定字段。提交成功后默认清除缓存（`clearPersistDataAfterSubmit: false` 可保留）：

```schema
type: form
title: 持久化
persistData: vamis-form-demo
body:
  - type: input-text
    name: name
    label: 名称
```

## 禁用回车提交

```schema
type: form
title: 禁用回车
preventEnterSubmit: true
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    label: 名称
```

## lazyLoad

Amis 源码有 `lazyLoad`，官方文档属性表未列。默认 `false`。为 `true` 时用内核 [LazyComponent](/concepts/schema#lazycomponent) 等进视口再画整棵表单（面板也算）；**`initApi` 仍在 Form 挂载时发**，不跟视口走。没有全局「等可见才拉数」开关。

```schema
type: form
title: 进视口再绘制
lazyLoad: true
mode: horizontal
body:
  - type: input-text
    name: name
    label: 名称
  - type: input-text
    name: email
    label: 邮箱
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"form"` | 指定为 Form |
| `name` / `id` | `string` | | 给其它组件发 `reload` / `setValue` 用 |
| `mode` | `string` | `"normal"` | `normal` / `horizontal` / `inline` |
| `labelWidth` | `number` / `string` | | 标签列宽（CSS 变量 `--form-label-width`） |
| `title` | `string` / `false` | `"表单"` | 面板标题。`false` 或 `""` 隐藏 |
| `submitText` | `string` | `"提交"` | 默认提交按钮文案 |
| `body` / `controls` | [SchemaNode](/types/schemanode) | | 表单项列表 |
| `actions` | [SchemaNode](/types/schemanode)[] | | 底栏按钮；`[]` 不画 |
| `wrapWithPanel` | `boolean` | `true` | 是否带 Card 面板 |
| `api` | [API](/types/api) | | 提交接口，默认 POST |
| `initApi` | [API](/types/api) | | 初始化拉数 |
| `initFetch` / `initFetchOn` | `boolean` / 表达式 | `true` | 是否首次拉取 |
| `rules` | `Array<{rule,message,name?}>` | | 组合校验；`rule` 为表达式，`name` 高亮表单项 |
| `messages` | `object` | | `fetchSuccess` / `fetchFailed` / `saveSuccess` / `saveFailed` / `validateFailed` 文案 |
| `submitOnChange` | `boolean` | `false` | 改值即提交 |
| `submitOnInit` | `boolean` | `false` | 初始化后自动提交一次 |
| `resetAfterSubmit` | `boolean` | `false` | 提交成功后重置 |
| `reset` | `boolean` | `false` | 默认底栏显示重置钮 |
| `redirect` | `string` | | 提交成功后跳转（支持表达式） |
| `reload` | `string` | | 提交成功后刷新目标 `name` |
| `target` | `string` | | 提交后把数据发给目标组件并刷新 |
| `trimValues` | `boolean` | `false` | 提交前 trim 所有字符串值 |
| `persistData` | `string` | | localStorage key，开启本地缓存 |
| `persistDataKeys` | `string[]` | | 只缓存指定 key |
| `clearPersistDataAfterSubmit` | `boolean` | `true` | 提交成功后清除缓存 |
| `preventEnterSubmit` | `boolean` | `false` | 禁用回车提交 |
| `autoFocus` | `boolean` | `false` | 自动聚焦第一个可聚焦控件 |
| `static` | `boolean` | | 整个表单静态展示 |
| `debug` | `boolean` | `false` | 展示当前数据域 |
| `lazyLoad` | `boolean` | `false` | 进视口再绘制 |
| `wrapperComponent` | `"form"` / `"div"` | 顶层 `form`，嵌套 `div` | 禁止嵌套 HTML form |
| `horizontal` / `labelAlign` | | | 未齐（横排比例 / 标签对齐） |
| `interval` / `silentPolling` / `stopAutoRefreshWhen` | | | **未接** 轮询 |
| `asyncApi` / `initAsyncApi` / `checkInterval` / `finishedField` | | | **未接** 异步任务 |
| `promptPageLeave` / `columnCount` / `canAccessSuperData` / `inheritData` | | | **未接** |
| `onEvent` | `object` | | 见事件表 |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `inited` | `responseData` / `responseStatus` / `responseMsg` / `error` | 初始化完成（含 initApi 响应） |
| `change` | 当前表单数据 | 表单值变化 |
| `formItemValidateSucc` | `__formName` / `__formValue` | 单表单项校验通过 |
| `formItemValidateError` | `__formName` / `__formValue` / `__errors` | 单表单项校验失败 |
| `validateSucc` / `validateError` | 当前表单数据 | 整表校验结果 |
| `submit` | 当前表单数据 | 提交触发（Vamis 先校验并保存，再发事件） |
| `submitSucc` | `result` 接口返回 | 提交成功 |
| `submitFail` | `error` 错误信息 | 提交失败 |
| `initApiFinished` | `responseData` / `responseStatus` / `responseMsg` / `__trigger` | initApi 完成（`init` / `reload`） |
| `asyncApiFinished` | | **未接**（`asyncApi` 未做） |

### submit

```schema
type: form
title: 提交事件
api: /api/mock2/form/saveForm
actions: []
body:
  - type: input-text
    name: name
    label: 名称
    value: amis
onEvent:
  submit:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: submit ${event.data.name}
```

## 动作表

其它组件通过 `actionType` + `componentId`（或 `target`）触发。`reload` / `setValue` / `submit` / `reset` / `clear` 认 Form 的 `id` / `name`：

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `submit` | | 校验并提交 |
| `reset` | | 重置到初始数据 |
| `clear` | | 把所有字段写成空串 |
| `reload` | 可选 `data`；`dataMergeMode: override` | 写入数据后再拉 `initApi` |
| `setValue` | `args.value` 对象 | 合并进表单域 |
| `static` / `nonstatic` | `componentId` / `componentName` | 切换表单静态态 |
| `validate` | `outputVar` | **未接**为组件动作 |
| `validateFormItem` / `clearError` | | **未接** |

### reload

```schema
type: form
id: form_reload_1
title: 刷新 initApi
initApi: /api/mock2/form/initData
body:
  - type: button
    label: 刷新
    className: mb-2
    onEvent:
      click:
        actions:
          - componentId: form_reload_1
            actionType: reload
  - type: static
    name: name
    label: 名称
actions: []
```

### setValue

```schema
type: form
id: form_set_1
title: 写入表单域
body:
  - type: button
    label: 填入名称
    className: mb-2
    onEvent:
      click:
        actions:
          - componentId: form_set_1
            actionType: setValue
            args:
              value:
                name: 泵房-A
  - type: input-text
    name: name
    label: 名称
actions: []
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- `submit` 事件不会拦掉默认提交；Vamis 先校验并保存，再发事件（Amis 配了 submit 事件会改成自定义提交）。
- 未接：`interval` / `silentPolling` / `stopAutoRefreshWhen`、`asyncApi` / `initAsyncApi`、`promptPageLeave`、`columnCount`、`canAccessSuperData`、`horizontal` 比例与 `labelAlign`、`validate` / `validateFormItem` / `clearError` 动作；combo 独立数据域（D6）。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
