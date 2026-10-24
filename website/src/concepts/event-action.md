---
title: 事件动作
---

# 事件动作

::: info 实现进度 85% · 进行中
文档主路径已对齐 Amis「事件动作」P0：`onEvent`、常用 `actionType`、`event` / `__rendererData`、`preventDefault` / `stopPropagation` / `ignoreError` / `expression`、SDK `doAction`。JSON 与 YAML 同等有效。控制流（switch / loop / parallel）、广播、自定义 JS 仍缺。
:::

上一节 [联动](/concepts/linkage) 解决显隐、禁用、接口重拉这类「表达式驱动」的场景。事件动作更灵活：渲染器抛事件，动作表按顺序响应，不必关心组件层级。作者态 **JSON 与 YAML 并列**。

kernel 决策是 **D4**：事件对象 + 动作注册表。新动作应 `registerAction`，不要在某个 Vue 文件里再开 `if (actionType === ...)`。

已经能做的：

- http 请求：`ajax`
- 弹窗：`dialog` / `drawer` / `toast` / `alert` / `confirm`
- 跳转：`link` / `url`
- 刷新组件：`reload`
- 组件数据：`setValue` / `setData`
- 表单：`submit` / `reset`
- 复制 / 等待：`copy` / `wait`
- 干预执行：`preventDefault` / `stopPropagation` / `ignoreError` / `expression`

还没齐的：广播、自定义 JS 片段、逻辑编排（条件循环排他并行）、浏览器前进后退刷新、打印、发邮件。

## 基本使用

### onEvent

用 `onEvent` 把渲染器事件绑到动作列表。键是该 type 自己的事件名（按钮是 `click` / `mouseenter` / `mouseleave`），值里的 `actions` 按顺序执行。

```schema
type: page
body:
  type: button
  label: 尝试点击、鼠标移入/移出
  level: primary
  onEvent:
    click:
      actions:
        - actionType: toast
          args:
            msgType: info
            msg: 派发点击事件
    mouseenter:
      actions:
        - actionType: toast
          args:
            msgType: info
            msg: 派发鼠标移入事件
    mouseleave:
      actions:
        - actionType: toast
          args:
            msgType: info
            msg: 派发鼠标移出事件
```

同一份 JSON 也有效：

```schema
{
  "type": "page",
  "body": {
    "type": "button",
    "label": "尝试点击",
    "level": "primary",
    "onEvent": {
      "click": {
        "actions": [
          {
            "actionType": "toast",
            "args": { "msgType": "info", "msg": "派发点击事件" }
          }
        ]
      }
    }
  }
}
```

按钮自己处理 `click`（避免和外壳重复派发）。`mouseenter` / `mouseleave` 由 `SchemaRenderer` 外壳接到。

动作参数可以写在顶层（`msg` / `dialog` / `api`），也可以放进 `args`（对齐 Amis 2.x）。模板 `${}` 会按当前数据域 + 事件上下文求值。

## 分类

事件分两类：

- **渲染器事件**：由具体组件抛出，见该组件文档的事件表，例如 [Page](/components/page)
- **广播事件**：自定义 `eventName`，其它组件监听同一名字。Vamis **还未接**

动作分：通用动作、组件动作、广播、自定义。用 `actionType` 指定。通用动作走内核注册表；组件动作通过 `componentId` / `target` 找到实例再 `setValue` / `reload` / `submit`。

## 发送 http 请求

`actionType: ajax` 走 `requestApi`（D3），需要 `env.fetcher`。Playground 默认有 mock。

```schema
type: page
data:
  name: vamis
body:
  type: button
  label: 发送 Ajax 请求
  level: primary
  confirmText: 确认要发出这个请求？
  onEvent:
    click:
      actions:
        - actionType: ajax
          api: /api/mock2/form/saveForm
        - actionType: toast
          args:
            msgType: success
            msg: 请求已发出
```

`confirmText` 写在按钮或动作上都可以：先 `env.confirm`，取消则整条链停掉。请求成功会把返回的 `data` merge 进当前域（有 form 就写 form）。同一条 `actions` 里后面的模板仍读派发时的 `ctx.data` 快照；要在页面上看到 `id`，请用表单项或 `tpl` 绑当前域，见 [数据域与数据链](/concepts/datascope-and-datachain)。

失败默认中断后续动作。加上 `ignoreError: true` 会继续走：

```schema: scope="body"
type: button
label: 忽略错误继续
onEvent:
  click:
    actions:
      - actionType: ajax
        api: /api/mock2/does-not-exist
        ignoreError: true
      - actionType: toast
        args:
          msg: 请求失败了，但这句还是会弹出
```

## 弹窗

```schema: scope="body"
- type: button
  label: 打开弹窗
  level: primary
  onEvent:
    click:
      actions:
        - actionType: dialog
          dialog:
            title: 说明
            body:
              type: tpl
              tpl: 对话框内容 ${name|default:'-'}
        - actionType: toast
          args:
            msgType: info
            msg: 弹窗已打开
- type: button
  className: m-l
  label: 打开抽屉
  onEvent:
    click:
      actions:
        - actionType: drawer
          drawer:
            title: 抽屉
            body: 抽屉内容
```

在弹窗里可以用 `closeDialog` / `close` 关掉当前浮层。

## 跳转链接

```schema: scope="body"
type: button
label: 跳到快速开始
level: link
onEvent:
  click:
    actions:
      - actionType: link
        link: /start/getting-started
```

`url` 与 `link` 一样，都走 `env.jumpTo`。

## 刷新组件 / 改数据

给目标组件一个 `id` 或 `name`，动作里写 `componentId` / `target`。

```schema
type: page
body:
  type: form
  id: profile
  data:
    name: Ada
  body:
    - type: input-text
      name: name
      label: 姓名
    - type: tpl
      tpl: 当前值 ${name}
    - type: button
      label: 设成 Bob
      onEvent:
        click:
          actions:
            - actionType: setValue
              componentId: profile
              args:
                value:
                  name: Bob
            - actionType: toast
              args:
                msg: 已写入 Bob
```

`reload` 会让目标按自己的 `api` / `initApi` 再拉一次，也可以顺带塞 `data`。详见 [联动](/concepts/linkage)。

## 事件上下文

每条动作求值时能读：

| 变量 | 含义 |
|------|------|
| 当前数据域 | 普通 `${name}` |
| `event.data` | 这次事件带出来的数据（点击、接口返回等） |
| `event.context.nativeEvent` | 原生事件（有的话） |
| `__rendererData` | 派发时那一层数据域的快照 |

```schema
type: page
data:
  role: dev
body:
  type: button
  label: 看 __rendererData
  onEvent:
    click:
      actions:
        - actionType: toast
          args:
            msg: 角色是 ${__rendererData.role}，事件 ${event.context.nativeEvent.type}
```

后续动作还能读到前面 `ajax` 写回域里的字段。Amis 的 `event.setData` 内核已接，文档示例先用 `setValue` 改组件域。

## 干预执行

动作跑完可以改事件默认逻辑、截断后面的动作。

### 阻止默认行为

按钮在 `onEvent` 之后还会跑自己的 `actionType`（没写就是普通按钮）。`preventDefault: true` 会跳过这步。表达式字符串按数据域求值。

```schema: scope="body"
type: button
label: 只跑 onEvent，不跑按钮自身动作
actionType: toast
msg: 这句不该出现
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msg: 来自 onEvent
        preventDefault: true
```

也可以单独写一条 `actionType: preventDefault`。

### 停止后续动作

`stopPropagation: true` 之后的 `actions` 不再执行（对齐 Amis 字段名：这里停的是动作链，不是 DOM 冒泡）。

```schema: scope="body"
type: button
label: 只弹出前两句
level: primary
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msg: 动作1
      - actionType: toast
        args:
          msg: 动作2
        stopPropagation: true
      - actionType: toast
        args:
          msg: 动作3 不会出现
```

### 条件执行

动作上的 `expression` 为假就跳过这一条，后面的继续。

```schema: scope="body"
type: form
data:
  ok: false
body:
  - type: switch
    name: ok
    label: 允许提示
  - type: button
    label: 尝试提示
    onEvent:
      click:
        actions:
          - actionType: toast
            expression: "${ok}"
            args:
              msg: 开关打开才会看到
          - actionType: toast
            args:
              msg: 这条总会弹出
```

`wait` 用来在两条动作之间停一会儿：

```schema: scope="body"
type: button
label: 等一秒再提示
onEvent:
  click:
    actions:
      - actionType: wait
        args:
          timeMs: 1000
      - actionType: toast
        args:
          msg: 1 秒到了
```

## 从外部触发

JS SDK 的 `doAction` 走同一张动作表，不是另一套：

```js
const scoped = vamis.embed('#root', schema)
scoped.doAction({ actionType: 'toast', msg: '外部触发' })
```

组件实例也可以 `getComponentByName('form1').doAction(...)`。见 [JS SDK](/start/sdk)。

## 注册自定义动作

```js
import { registerAction } from '@vamis/core'

registerAction('myLog', async (action, ctx) => {
  console.log(action.args?.msg, ctx.data)
})
```

然后 schema 里写 `actionType: myLog`。不要把逻辑写进某个渲染器的 click 分支。
