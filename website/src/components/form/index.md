---
title: Form 表单
outline: deep
---

# Form 表单

::: info 实现进度 58% · 进行中
initApi / validate / submit 走 `requestApi`；嵌套 form 默认降为 `div`。`lazyLoad` 默认关。属性表 / 事件表 / 动作表已按 Amis 列出：事件目前只接了 `submit`；动作 `reload` / `setValue` / `submit` / `reset` 可用。扁平 `name`、提交不合并、嵌套不递归校验（D6）。
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

水平布局的标签宽度走 `--form-label-width`。校验与 `xxx.yyy` 路径值仍是缺口，见 [FormItem](/components/form/formitem)。

## lazyLoad

Amis 源码有 `lazyLoad`，官方文档属性表未列。默认 `false`。为 `true` 时用内核 `LazyComponent` 等进视口再画整棵表单（面板也算）；**`initApi` 仍在 Form 挂载时发**，不跟视口走。没有全局「等可见才拉数」开关。

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
| `title` | `string` | | 面板标题 |
| `submitText` | `string` | `"提交"` | 默认提交按钮文案 |
| `className` | `string` | | 外层 class |
| `body` | [SchemaNode](/types/schemanode) | | 表单项列表；也认 `controls` |
| `actions` | [SchemaNode](/types/schemanode)[] | | 底栏按钮。不写则画默认提交；`[]` 不画 |
| `wrapWithPanel` | `boolean` | `true` | 是否带面板 |
| `panelClassName` | `string` | | 面板 class，可覆盖默认下边距 |
| `lazyLoad` | `boolean` | `false` | 进视口再绘制。Amis 源码有、文档未列 |
| `wrapperComponent` | `"form"` / `"div"` | 顶层 `form`，嵌套 `div` | 非法 HTML 不能 `<form>` 套 `<form>` |
| `api` | [API](/types/api) | | 提交接口，默认 method `post` |
| `initApi` | [API](/types/api) | | 初始化拉数。无 `$` 时只挂载拉一次 |
| `initFetch` | `boolean` | `true` | 是否首次拉取 |
| `initFetchOn` | [表达式](/concepts/expression) | | 是否首次拉取 |
| `reset` | `boolean` | `true` | 默认底栏是否带重置 |
| `data` | `object` | | 写入本表单 Scope |
| `reload` | `string` | | 提交成功后刷新目标 `name` |
| `messages` | `object` | | 走 `requestApi` 的成功/失败文案 |
| `onEvent` | `object` | | 见事件表 |
| `horizontal` / `labelAlign` / `labelWidth` | | | **未齐**（横排宽走 CSS 变量） |
| `rules` / `asyncApi` / `initAsyncApi` | | | **未接** |
| `submitOnChange` / `submitOnInit` / `resetAfterSubmit` | `boolean` | `false` | **未接** |
| `persistData` / `promptPageLeave` / `trimValues` / `columnCount` | | | **未接** |
| `inheritData` | `boolean` | `true` | 未接此开关；Form 固定自建数据域 |
| `static` / `canAccessSuperData` / `preventEnterSubmit` | | | **未接** |

## 事件表

可以用 `onEvent` 监听，再配 `actions`。公式可读 `${字段}`、`${event.data.字段}`。详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `submit` | 当前表单数据 | 提交成功后触发。Amis 配了此事件会拦掉默认校验/提交；**Vamis 仍先校验并提交 api，再发事件** |
| `inited` | `responseData` / `responseStatus` / `responseMsg` | **未接** |
| `change` | 当前表单数据 | **未接** |
| `formItemValidateSucc` / `formItemValidateError` | 表单项名/值 | **未接** |
| `validateSucc` / `validateError` | 当前表单数据 | **未接** |
| `submitSucc` / `submitFail` | 接口结果 / 错误 | **未接**（失败目前走 `notify`） |
| `initApiFinished` / `asyncApiFinished` | | **未接**（`asyncApi` 未做） |

### submit

```schema
{
  "type": "form",
  "title": "提交事件",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "name": "name",
      "label": "名称",
      "required": true
    }
  ],
  "onEvent": {
    "submit": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "submit ${event.data.name}"
          }
        }
      ]
    }
  }
}
```

## 动作表

其它组件通过 `actionType` + `componentId`（或 `target`）触发。`reload` / `setValue` 认 Form 的 `id` / `name`。`submit` / `reset` 目前走**最近一层 Form**（`ctx.form`），不按 `componentId` 找。详见 [事件动作](/concepts/event-action)。

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `reload` | 可选 `data`；`dataMergeMode: override` | 写入数据后再拉 `initApi` |
| `setValue` | `args.value` 对象 | 合并进表单域 |
| `submit` | | 校验并提交。走最近一层 Form |
| `reset` | | 重置。走最近一层 Form |
| `validate` | `outputVar` | **未接**为组件动作（内部校验会跑） |
| `clear` / `static` / `nonstatic` / `validateFormItem` | | **未接** |

### reload

```schema
{
  "type": "form",
  "id": "form_reload_1",
  "title": "刷新 initApi",
  "initApi": "/api/mock2/form/initData",
  "body": [
    {
      "type": "button",
      "label": "刷新",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "form_reload_1",
              "actionType": "reload"
            }
          ]
        }
      }
    },
    {
      "type": "static",
      "name": "name",
      "label": "名称"
    },
    {
      "type": "static",
      "name": "date",
      "label": "时间"
    }
  ],
  "actions": []
}
```

### setValue

```schema
{
  "type": "form",
  "id": "form_set_1",
  "title": "写入表单域",
  "body": [
    {
      "type": "button",
      "label": "填入名称",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "form_set_1",
              "actionType": "setValue",
              "args": {
                "value": { "name": "泵房-A" }
              }
            }
          ]
        }
      }
    },
    {
      "type": "input-text",
      "name": "name",
      "label": "名称"
    }
  ],
  "actions": []
}
```

### reset

按钮在表单内时，`actionType: reset` 清掉本表单输入。

```schema
{
  "type": "form",
  "title": "重置",
  "data": { "name": "初始值" },
  "body": [
    {
      "type": "input-text",
      "name": "name",
      "label": "名称"
    }
  ],
  "actions": [
    {
      "type": "button",
      "label": "重置",
      "onEvent": {
        "click": {
          "actions": [{ "actionType": "reset" }]
        }
      }
    }
  ]
}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `lazyLoad` 已接；Amis 官方属性表未写此字段，源码默认关。
- `onEvent.submit` 不会拦住默认提交。
- `submit` / `reset` 动作不按 `componentId` 找目标。
- 扁平 `name`、提交返回不合并进表单域、嵌套表单项不递归校验（D6）。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
