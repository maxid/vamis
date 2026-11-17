---
title: 事件动作
---

# 事件动作

::: info 实现进度 85% · 进行中
文档已按 Amis「事件动作」补齐章节与活示例：`onEvent`、常用 `actionType`、`event` / `__rendererData`、`preventDefault` / `stopPropagation` / `ignoreError` / `expression`、SDK `doAction`，以及复制 / 邮件 / 等待 / 组件动作。JSON 与 YAML 同等有效。控制流（switch / loop / parallel）、广播、自定义 JS、浏览器前进后退刷新仍 **未接**，契约已列出。
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



## 浏览器

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

### 浏览器回退

通过配置`actionType: 'goBack'`实现页面回退。

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "回退",
      "level": "primary",
      "className": "ml-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "goBack"
            }
          ]
        }
      }
    }
  ]
}
```

### 前进/后退到指定页面

通过配置`actionType: 'goPage'`实现浏览器页面的前进/后退。只有当历史记录中存在目标页面时才会生效。

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "后退到上上个页面",
      "level": "primary",
      "className": "ml-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "goPage",
              "args": {
                "delta": -2
              }
            }
          ]
        }
      }
    }
  ]
}
```

**动作属性（args）**

> `< 1.8.0 及以下版本`，以下属性与 args 同级。

| 属性名 | 类型     | 默认值 | 说明 |
| ------ | -------- | ------ | ---- |
| delta  | `string` | `0`    | 位置 |

### 浏览器刷新

通过配置`actionType: 'refresh'`实现浏览器刷新。

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "刷新页面",
      "level": "primary",
      "className": "ml-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "refresh"
            }
          ]
        }
      }
    }
  ]
}
```

## 复制

通过配置`actionType: 'copy'`和复制属性实现文本的复制操作，该动作需实现 env.copy(contents: string, options?: any) => void 方法。

```schema
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "复制一段文本",
      "level": "primary",
      "className": "mr-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "copy",
              "args": {
                "content": "http://www.baidu.com"
              }
            }
          ]
        }
      }
    },
    {
      "type": "button",
      "label": "复制一段富文本",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "copy",
              "args": {
                "copyFormat": "text/html",
                "content": "<a href='http://www.baidu.com'>link</a> <b>bold</b>"
              }
            }
          ]
        }
      }
    }
  ]
}
```

**动作属性（args）**

> `< 1.8.0 及以下版本`，以下属性与 args 同级。

| 属性名     | 类型                                 | 默认值 | 说明                               |
| ---------- | ------------------------------------ | ------ | ---------------------------------- |
| copyFormat | `string`                             | -      | 复制格式                           |
| content    | [模板](/concepts/template) | -      | 指定复制的内容。可用 `${xxx}` 取值 |

## 打印

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

> 6.2.0 及以后版本

打印页面中的某个组件，对应的组件需要配置 `id`，如果要打印多个，可以使用 `"ids": ["x", "y"]` 来打印多个组件，只支持主要是容器类组件 `crud`、`crud2`、`form`、`table`、`wrapper`、`container`、`flex`、`grid`、`grid2d`、`tableview`

> breaking：在 6.2.0 版本中配置是 testid，但这个配置会导致性能问题，所以新版使用 id 作为标识。

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "打印",
      "level": "primary",
      "className": "mr-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "print",
              "args": {
                "id": "mycrud"
              }
            }
          ]
        }
      }
    },
    {
      "type": "crud",
      "api": "/api/mock2/sample",
      "id": "mycrud",
      "syncLocation": false,
      "columns": [
        {
          "name": "id",
          "label": "ID"
        },
        {
          "name": "engine",
          "label": "Rendering engine"
        },
        {
          "name": "browser",
          "label": "Browser"
        },
        {
          "name": "platform",
          "label": "Platform(s)"
        },
        {
          "name": "version",
          "label": "Engine version"
        },
        {
          "name": "grade",
          "label": "CSS grade"
        }
      ]
    }
  ]
}
```

| 属性名  | 类型       | 默认值 | 说明              |
| ------- | ---------- | ------ | ----------------- |
| testid  | `string`   |        | 组件的 testid     |
| testids | `string[]` | -      | 多个组件的 testid |

## 发送邮件

通过配置`actionType: 'email'`和邮件属性实现发送邮件操作。

```schema
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "发送邮件",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "email",
              "args": {
                "to": "amis@baidu.com",
                "cc": "baidu@baidu.com",
                "subject": "这是邮件主题",
                "body": "这是邮件正文"
              }
            }
          ]
        }
      }
    }
  ]
}
```

**动作属性（args）**

> `< 1.8.0 及以下版本`，以下属性与 args 同级。

| 属性名  | 类型     | 默认值 | 说明                           |
| ------- | -------- | ------ | ------------------------------ |
| to      | `string` | -      | 收件人邮箱，可用 ${xxx} 取值   |
| cc      | `string` | -      | 抄送邮箱，可用 ${xxx} 取值     |
| bcc     | `string` | -      | 匿名抄送邮箱，可用 ${xxx} 取值 |
| subject | `string` | -      | 邮件主题，可用 ${xxx} 取值     |
| body    | `string` | -      | 邮件正文，可用 ${xxx} 取值     |

## 更新事件上下文数据

修改 `event.data` 对象中的数据，修改后，后续的动作中可以引用，及时生效，不像更新组件上下文数据是个异步操作。可以用来临时存储数据。

```schema
{
  "type": "page",
  "title": "获取页面标题并弹出",
  "body": [
    {
      "type": "button",
      "className": "ml-2",
      "label": "toast 页面标题",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "setEventData",
              "args": {
                "key": "title",
                "value": "页面标题：${window:document[title]}"
              }
            },
            {
              "actionType": "toast",
              "args": {
                "msg": "${title}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

## 等待

通过配置`actionType: 'wait'`，等待指定时间（`args.time` 毫秒数）后执行后续动作。

```schema
{
  "type": "page",
  "title": "3 秒后 toast 页面标题",
  "body": [
    {
      "type": "button",
      "className": "ml-2",
      "label": "toast 页面标题",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "wait",
              "args": {
                "time": 3000
              }
            },
            {
              "actionType": "setEventData",
              "args": {
                "key": "title",
                "value": "页面标题：${window:document[title]}"
              }
            },
            {
              "actionType": "toast",
              "args": {
                "msg": "${title}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

**动作属性（args）**

> `< 1.8.0 及以下版本`，以下属性与 args 同级。

| 属性名 | 类型     | 默认值 | 说明                 |
| ------ | -------- | ------ | -------------------- |
| time   | `number` | -      | 等待时间，单位是毫秒 |

## 自定义 JS

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

通过配置`actionType: 'custom'`实现自定义 JS。JS 中可以访问以下对象和方法：

- context，渲染器上下文
- doAction() 动作执行方法，用于调用任何 actionType 指定的动作
- event，事件对象，可以调用 setData()、stopPropagation()、preventDefault()分别实现事件上下文设置、动作干预、事件干预，可以通过 event.data 获取事件上下文

自定义函数签名： `script:(context,doAction,event)=>{}`

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "发送一个 http 请求",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "custom",
              "script": "doAction({actionType: 'ajax', args: {api: '/api/mock2/form/saveForm'}});\n //event.stopPropagation();"
            }
          ]
        }
      }
    }
  ]
}
```

**动作属性**

| 属性名 | 类型                | 默认值 | 说明                                                                                                                                            |
| ------ | ------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| script | `string`/`function` | -      | 自定义 JS 脚本代码，代码内可以通过调用`doAction`执行任何[动作](/concepts/event-action#动作) ，通过事件对象`event`可以实现事件动作干预 |

### 支持异步

- 方式一：通过返回 Promise 实例的方式

```json
{
  "type": "page",
  "body": [
    {
      "type": "form",
      "title": "表单",
      "body": [
        {
          "label": "编号",
          "type": "input-text",
          "name": "pId",
          "id": "u:e47e2c8e6be8",
          "mode": "horizontal",
          "addOn": {
            "label": "自动获取",
            "type": "button",
            "onEvent": {
              "click": {
                "actions": [
                  {
                    "componentId": "u:52cd013e120f",
                    "actionType": "disabled"
                  },
                  {
                    "script": "return new Promise((resolve, reject) => {setTimeout(() => {event.setData({...event.data, pId: '01027359'});resolve();}, 3000)})",
                    "actionType": "custom"
                  },
                  {
                    "componentId": "u:e47e2c8e6be8",
                    "args": {
                      "value": "${pId}"
                    },
                    "actionType": "setValue"
                  },
                  {
                    "componentId": "u:52cd013e120f",
                    "actionType": "enabled"
                  }
                ],
                "weight": 0
              }
            },
            "id": "u:52cd013e120f"
          }
        }
      ],
      "apiFromAPICenter": false,
      "id": "u:76203156676b"
    }
  ]
}
```

- 方式二：通过返回 Thunk 的方式

```json
{
  "type": "page",
  "body": [
    {
      "type": "form",
      "title": "表单",
      "body": [
        {
          "label": "编号",
          "type": "input-text",
          "name": "pId",
          "id": "u:e47e2c8e6be7",
          "mode": "horizontal",
          "addOn": {
            "label": "自动获取",
            "type": "button",
            "onEvent": {
              "click": {
                "actions": [
                  {
                    "componentId": "u:52cd013e120e",
                    "actionType": "disabled"
                  },
                  {
                    "script": "return (callback) => { setTimeout(() => {event.setData({...event.data, pId: '01027359' });callback();}, 3000) };",
                    "actionType": "custom"
                  },
                  {
                    "componentId": "u:e47e2c8e6be7",
                    "args": {
                      "value": "${pId}"
                    },
                    "actionType": "setValue"
                  },
                  {
                    "componentId": "u:52cd013e120e",
                    "actionType": "enabled"
                  }
                ],
                "weight": 0
              }
            },
            "id": "u:52cd013e120e"
          }
        }
      ],
      "apiFromAPICenter": false,
      "id": "u:76203156676a"
    }
  ]
}
```

### 存储数据

有时在执行自定义 JS 的时候，希望该过程中产生的数据可以分享给后面的动作使用，此时可以通过`event.setData()`来实现事件上下文的设置，这样后面动作都可以通过事件上下文来获取共享的数据。

> 注意：直接调用`event.setData()`将修改事件的原有上下文，如果不希望覆盖可以通过`event.setData({...event.data, ...{xxx: xxx}})`来进行数据的合并。

## 触发广播

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

通过配置`actionType: 'broadcast'`实现触发一个广播。

```json
{
  "type": "page",
  "body": [
    {
      "name": "role",
      "type": "select",
      "label": "广播一下",
      "mode": "row",
      "options": [
        {
          "label": "海贼王的男人",
          "value": "路飞"
        },
        {
          "label": "海上华佗",
          "value": "乔巴"
        },
        {
          "label": "海上食神",
          "value": "山治"
        }
      ],
      "onEvent": {
        "change": {
          "actions": [
            {
              "actionType": "broadcast",
              "args": {
                "eventName": "broadcast_1"
              },
              "data": {
                "myrole": "${role}",
                "age": 18
              }
            }
          ]
        }
      }
    },
    {
      "type": "form",
      "id": "form_001",
      "title": "表单1（优先级低）",
      "name": "sub-form1",
      "body": [
        {
          "type": "input-text",
          "label": "昵称",
          "name": "myname",
          "disabled": false,
          "mode": "horizontal"
        }
      ],
      "onEvent": {
        "broadcast_1": {
          "actions": [
            {
              "actionType": "reload",
              "componentId": "form_001",
              "data": {
                "myname": "${myrole}"
              }
            },
            {
              "actionType": "toast",
              "args": {
                "msgType": "info",
                "msg": "表单1刷新完成"
              }
            }
          ]
        }
      }
    },
    {
      "type": "form",
      "name": "form2",
      "id": "form_002",
      "title": "表单2（优先级中）",
      "body": [
        {
          "type": "input-text",
          "label": "角色",
          "name": "myrole",
          "disabled": false,
          "mode": "horizontal"
        },
        {
          "type": "input-text",
          "label": "年龄",
          "name": "age",
          "disabled": false,
          "mode": "horizontal"
        }
      ],
      "onEvent": {
        "broadcast_1": {
          "weight": 2,
          "actions": [
            {
              "actionType": "reload",
              "componentId": "form_002",
              "data": {
                "myrole": "${myrole}",
                "age": "${age}"
              }
            },
            {
              "actionType": "toast",
              "args": {
                "msgType": "info",
                "msg": "表单2刷新完成"
              }
            }
          ]
        }
      }
    },
    {
      "type": "form",
      "name": "form3",
      "id": "form_003",
      "title": "表单3（优先级高）",
      "body": [
        {
          "type": "input-text",
          "id": "form_003_text_01",
          "label": "职业",
          "name": "job",
          "disabled": false,
          "mode": "horizontal"
        }
      ],
      "api": "https://api/form/form3",
      "onEvent": {
        "broadcast_1": {
          "weight": 3,
          "actions": [
            {
              "actionType": "reload",
              "componentId": "form_003",
              "data": {
                "job": "${myrole}"
              }
            },
            {
              "actionType": "toast",
              "args": {
                "msgType": "info",
                "msg": "表单3刷新完成"
              }
            }
          ]
        }
      }
    }
  ]
}
```

**动作属性（args）**

> `< 2.3.2 及以下版本`，以下属性与 args 同级。

| 属性名    | 类型     | 默认值 | 说明                                             |
| --------- | -------- | ------ | ------------------------------------------------ |
| eventName | `string` | -      | 广播动作对应的自定义事件名称，用于广播事件的监听 |

**其他属性**

| 属性名 | 类型     | 默认值 | 说明                                                     |
| ------ | -------- | ------ | -------------------------------------------------------- |
| weight | `number` | 0      | 可以通过配置动作执行优先级来控制所有监听者的动作执行顺序 |

## 条件

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

通过配置`expression: 表达式或ConditionBuilder组合条件`来实现条件逻辑。

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "expression": "okk",
      "name": "amis",
      "features": [
        "flexible",
        "powerful"
      ],
      "tool": "amis-editor",
      "platform": "aisuda",
      "detail": {
        "version": "2.8.0",
        "github": "https://github.com/maxid/vamis"
      }
    },
    "body": [
      {
        "type": "button",
        "label": "符合条件的执行",
        "level": "primary",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "toast",
                "args": {
                  "msgType": "success",
                  "msg": "expression表达式 ok~"
                },
                "expression": "expression === \"okk\""
              },
              {
                "actionType": "toast",
                "args": {
                  "msg": "1"
                },
                "expression": "expression === \"nono\""
              },
              {
                "actionType": "toast",
                "args": {
                  "msgType": "success",
                  "msg": "conditin-builder条件组合 也ok~"
                },
                "expression": {
                  "id": "b6434ead40cc",
                  "conjunction": "and",
                  "children": [
                    {
                      "id": "e92b93840f37",
                      "left": {
                        "type": "field",
                        "field": "name"
                      },
                      "op": "equal",
                      "right": "amis"
                    },
                    {
                      "id": "3779845521db",
                      "left": {
                        "type": "field",
                        "field": "features"
                      },
                      "op": "select_any_in",
                      "right": "${[LAST(features)]}"
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    ]
  }
}
```

**其他属性**

| 属性名     | 类型                                        | 默认值 | 说明                         |
| ---------- | ------------------------------------------- | ------ | ---------------------------- |
| expression | `boolean`\|[表达式](../concepts/expression) | -      | 执行条件，不设置表示默认执行 |

## 循环
::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

通过配置`actionType: 'loop'`实现循环逻辑。

### 单层循环

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "loopName": "loopData",
      "loopData": [
        {
          "name": "lv",
          "age": "19"
        },
        {
          "name": "xj",
          "age": "21"
        }
      ]
    },
    "body": [
      {
        "type": "button",
        "label": "循环发送两次请求，且每次携带了循环的数据",
        "level": "primary",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "loop",
                "args": {
                  "loopName": "${loopName}"
                },
                "children": [
                  {
                    "actionType": "ajax",
                    "args": {
                      "api": "https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/form/saveForm?name=${name}&age=${age}"
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 嵌套循环

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "loopName": "loopData",
      "loopData": [
        {
          "name": "lv",
          "age": "19"
        },
        {
          "name": "xj",
          "age": "21"
        }
      ]
    },
    "body": [
      {
        "type": "button",
        "label": "循环",
        "className": "m-2",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "loop",
                "preventDefault": false,
                "stopPropagation": false,
                "args": {
                  "loopName": "${loopName}"
                },
                "children": [
                  {
                    "actionType": "toast",
                    "args": {
                      "msg": "第1层循环动作1${name}"
                    },
                    "preventDefault": false,
                    "stopPropagation": false
                  },
                  {
                    "actionType": "toast",
                    "args": {
                      "msg": "第1层循环动作2${name}"
                    }
                  },
                  {
                    "actionType": "loop",
                    "args": {
                      "loopName": "${loopName}"
                    },
                    "children": [
                      {
                        "actionType": "toast",
                        "args": {
                          "msg": "第2层循环动作1${name}"
                        }
                      },
                      {
                        "actionType": "toast",
                        "args": {
                          "msg": "第2层循环动作2${name}"
                        },
                        "preventDefault": false,
                        "stopPropagation": false
                      },
                      {
                        "actionType": "continue"
                      },
                      {
                        "actionType": "toast",
                        "args": {
                          "msg": "第2层循环动作3${name}"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
```

**动作属性（args）**

> `< 1.8.0 及以下版本`，以下属性与 args 同级。

| 属性名   | 类型     | 默认值 | 说明         |
| -------- | -------- | ------ | ------------ |
| loopName | `string` | -      | 循环变量名称 |

**其他属性**

> `< 2.3.2 及以下版本`，以下属性与 args 同级。

| 属性名   | 类型                                                 | 默认值 | 说明                                  |
| -------- | ---------------------------------------------------- | ------ | ------------------------------------- |
| children | Array<[动作](/concepts/event-action#动作)> | -      | 子动作，可以通过`break动作`来跳出循环 |

### Break 动作

通过配置`actionType: 'loop'`和`actionType: 'break'`实现循环跳出。

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "loopName": "loopData",
      "loopData": [
        {
          "name": "lv",
          "age": "19"
        },
        {
          "name": "xj",
          "age": "21"
        }
      ]
    },
    "body": [
      {
        "type": "button",
        "label": "只执行了第一个动作就跳出了循环",
        "level": "primary",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "loop",
                "args": {
                  "loopName": "${loopName}"
                },
                "children": [
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "success",
                      "msg": "第 1 个动作",
                      "position": "top-right"
                    }
                  },
                  {
                    "actionType": "break"
                  },
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "success",
                      "msg": "第 2 个动作",
                      "position": "top-right"
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
```

### Continue 动作

通过配置`actionType: 'loop'`和`actionType: 'continue'`实现循环跳过。

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "loopName": "loopData",
      "loopData": [
        {
          "name": "lv",
          "age": "19"
        },
        {
          "name": "xj",
          "age": "21"
        }
      ]
    },
    "body": [
      {
        "type": "button",
        "label": "只循环执行第一个动作",
        "level": "primary",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "loop",
                "args": {
                  "loopName": "${loopName}",
                  "level": 3
                },
                "children": [
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "success",
                      "msg": "第 1 个动作",
                      "position": "top-right"
                    }
                  },
                  {
                    "actionType": "continue"
                  },
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "success",
                      "msg": "最后的动作",
                      "position": "top-right"
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
```

## 排他（switch）

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

通过配置`actionType: 'switch'`实现排他逻辑。

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "branchCont": 18
    },
    "body": [
      {
        "type": "button",
        "label": "只执行动作2",
        "level": "primary",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "switch",
                "children": [
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "info",
                      "msg": "动作1",
                      "position": "top-right"
                    },
                    "expression": "this.branchCont > 19",
                    "stopPropagation": true
                  },
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "info",
                      "msg": "动作2",
                      "position": "top-right"
                    },
                    "expression": "this.branchCont > 17"
                  },
                  {
                    "actionType": "toast",
                    "args": {
                      "msgType": "info",
                      "msg": "动作3",
                      "position": "top-right"
                    },
                    "expression": "this.branchCont > 16"
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
```

**其他属性**

| 属性名   | 类型                                                 | 默认值 | 说明                                                   |
| -------- | ---------------------------------------------------- | ------ | ------------------------------------------------------ |
| children | Array<[动作](/concepts/event-action#动作)> | -      | 子动作，每个子动作可以通过配置`expression`来匹配的条件 |

## 并行

::: danger 未接
该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。
:::

通过配置`actionType: 'parallel'`实现并行执逻辑。

```json
{
  "type": "page",
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "data": {
      "name": "lvxj",
      "age": "kkkk"
    },
    "body": [
      {
        "type": "button",
        "label": "同时发送两个ajax请求，并显示请求返回",
        "level": "primary",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "parallel",
                "children": [
                  {
                    "actionType": "ajax",
                    "args": {
                      "api": {
                        "url": "https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/form/initData?name=${name}",
                        "method": "get"
                      },
                      "messages": {
                        "success": "请求1成功了！欧耶",
                        "failed": "失败了呢。。"
                      }
                    },
                    "outputVar": "var1"
                  },
                  {
                    "actionType": "ajax",
                    "args": {
                      "api": {
                        "url": "https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/form/saveForm?name=${name}",
                        "method": "get"
                      },
                      "messages": {
                        "success": "请求2成功了！欧耶",
                        "failed": "失败了呢。。"
                      }
                    },
                    "outputVar": "var2"
                  },
                  {
                    "actionType": "ajax",
                    "args": {
                      "api": {
                        "url": "https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/form/saveForm?name=${name}",
                        "method": "get"
                      },
                      "messages": {
                        "success": "请求3成功了！欧耶",
                        "failed": "失败了呢。。"
                      }
                    },
                    "outputVar": "var3"
                  }
                ]
              },
              {
                "actionType": "toast",
                "args": {
                  "msg": "var1:${event.data.var1|json}, var2:${event.data.var2|json}, var3:${event.data.var3|json}"
                }
              }
            ]
          }
        }
      }
    ]
  }
}
```

**其他属性**

| 属性名   | 类型                                                 | 默认值 | 说明   |
| -------- | ---------------------------------------------------- | ------ | ------ |
| children | Array<[动作](/concepts/event-action#动作)> | -      | 子动作 |

# 动作间数据传递

从事件触发开始，整个数据流包含事件本身产生的事件数据和动作产生的动作数据，事件源头产生的数据在 AMIS 事件动作机制底层已经自动加入渲染器数据域，可以通过`xxx`直接获取（`< 2.3.2 及以下版本 为 event.data.xxx`），而部分动作产生的数据如何流动需要交互设计者进行介入，对于数据流动可以通过数据映射，将上一个动作产生的数据作为动作参数写入下一个动作。

#### 传递数据

通过 `data` 指定输入的参数数据（`< 2.3.2 及以下版本`通过`args`传递数据），它是一个键值对。

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "id": "b_001",
      "label": "发一个广播，携带动作参数",
      "className": "mb-2",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "broadcast",
              "args": {
                "eventName": "broadcast_1"
              },
              "data": {
                "name": "lvxj",
                "age": 18
              },
              "description": "一个按钮的点击事件"
            }
          ]
        }
      }
    },
    {
      "type": "form",
      "name": "form1",
      "id": "form_001",
      "title": "接收广播事件的参数",
      "debug": true,
      "body": [
        {
          "type": "input-text",
          "id": "form_001_text_01",
          "label": "年龄",
          "name": "age",
          "disabled": false,
          "mode": "horizontal"
        }
      ],
      "data": {
        "name": "amis"
      },
      "onEvent": {
        "broadcast_1": {
          "actions": [
            {
              "actionType": "reload",
              "data": {
                "age": "${age}",
                "name": "${name}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

#### 引用 http 请求返回的数据

http 请求动作执行结束后，后面的动作可以通过 `${responseResult}`或`${{outputVar}}`来获取请求响应结果，响应结果的结构定义参考[发送 http 请求](/concepts/event-action#发送-http-请求)。

> `< 2.3.2 及以下版本 需要通过 ${event.data.{xxx}}`来获取以上信息，例如：${event.data.responseResult}

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "发送Ajax请求，并把返回数据传给弹窗",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "ajax",
              "args": {
                "api": "https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/form/saveForm"
              }
            },
            {
              "actionType": "dialog",
              "data": {
                "id": "${event.data.responseResult.responseData.id}"
              },
              "dialog": {
                "type": "dialog",
                "id": "dialog_005",
                "title": "弹框标题1",
                "data": {
                  "id": "${id}"
                },
                "body": [
                  {
                    "type": "form",
                    "body": [
                      {
                        "type": "tpl",
                        "tpl": "<p>请求返回的数据：id=${id}</p>",
                        "inline": false
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    }
  ]
}
```

#### 获取组件相关数据

可以通过表达式函数`GETRENDERERDATA(id, path)`和`GETRENDERERPROP(id, path)`分别获取指定组件的数据和属性。

```json
{
  "type": "page",
  "body": [
    {
      "type": "form",
      "id": "form_get_render",
      "wrapWithPanel": false,
      "data": {
        "name": "amis",
        "age": "18"
      },
      "body": [
        {
          "type": "input-text",
          "name": "name",
          "label": "name"
        },
        {
          "type": "input-text",
          "name": "age",
          "label": "age"
        }
      ],
      "className": "mb-2"
    },
    {
      "type": "button",
      "className": "mt-2",
      "label": "获取表单相关数据",
      "level": "primary",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "toast",
              "args": {
                "msg": "name:${GETRENDERERDATA(\"form_get_render\", \"name\")},type:${GETRENDERERPROP(\"form_get_render\", \"type\")}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

该函数参数说明如下：

| 参数名 | 说明                          |
| ------ | ----------------------------- |
| id     | 组件 ID，即组件的 id 属性的值 |
| path   | 数据路径，即数据变量的路径    |

# 干预动作执行

事件动作干预是指执行完当前动作后，干预所监听事件默认处理逻辑和后续其他动作的执行。通过`preventDefault`、`stopPropagation`分别阻止监听事件默认行为和停止下一个动作执行。

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
