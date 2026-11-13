---
title: Service 功能型容器
outline: deep
---

# Service 功能型容器

::: info 实现进度 90% · 进行中
主路径已对齐：独立 Scope、`api` / `schemaApi`、轮询、错误 Alert、`reload` / `rebuild` / `setValue`。文档章节对标 Amis。未接 `dataProvider` / `ws` / jsonp / `js:` schemaApi。
:::

部分展示组件自己不会拉接口，要用 `source` 从数据链取数。例如 [Table](./table)、[Cards](./cards)、[List](./list)。`Service` 负责配置初始化接口、写入本域，子组件再按数据链取值。

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本使用

最基本的用法是配初始化接口 `api`，把返回数据写入自身数据域，子组件再按 [数据链](/concepts/datascope-and-datachain) 取值。

```schema: scope="body"
type: service
api: /api/mock2/page/initData
body:
  type: panel
  title: $title
  body: 现在是：${date}
```

接口返回结构：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "title": "Test Page Component",
    "date": "2017-10-13"
  }
}
```

子组件里就可以用 `${title}` 和 `${date}`。静态 `data` 同样进本域，不必先打接口。

## 展示列表

常见组合是 Service + Table：接口里的列表用 `source: $rows` 交给表格。

```schema: scope="body"
{
  "type": "service",
  "api": "/api/mock2/crud/table?perPage=5",
  "body": [
    {
      "type": "table",
      "title": "表格1",
      "source": "$rows",
      "columns": [
        { "name": "engine", "label": "Engine" },
        { "name": "version", "label": "Version" }
      ]
    },
    {
      "type": "table",
      "source": "$rows",
      "columns": [
        { "name": "engine", "label": "Engine" },
        { "name": "version", "label": "Version" }
      ]
    }
  ]
}
```

`table` 配 `source: $rows` 即可拿到接口 `data.rows`。

## 动态渲染页面

`schemaApi` 把接口 `data` 当成子 schema 渲染（有 `type` 就整棵画）。

```schema: scope="body"
type: service
schemaApi: /api/mock2/service/schema?type=tabs
```

接口 `data` 类似：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "type": "tabs",
    "tabs": [
      { "title": "TabA", "body": "卡片A内容" },
      { "title": "TabB", "body": "卡片B内容" }
    ]
  }
}
```

### jsonp 请求

::: warning 未接
`schemaApi: jsonp:…` 尚未接入。下面是对标 schema，当前不会拉 jsonp。
:::

```yaml
type: service
schemaApi: jsonp:/api/mock2/service/jsonp
```

接口返回的是立即执行的 JS，通过 `callback` 或 `request._callback` 调函数名：

```javascript
(function () {
  window.axiosJsonpCallbackxxxx &&
    window.axiosJsonpCallbackxxxx({
      status: 0,
      msg: '',
      data: {
        type: 'page',
        title: 'jsonp 示例',
        body: 'this is tpl from jsonp'
      }
    });
})();
```

### js 请求

::: warning 未接
`schemaApi: js:…` 尚未接入（下载 JS 后执行）。下面是对标 schema。
:::

```yaml
type: service
schemaApi: js:/api/mock2/service/jsschema
```

期望返回一段 JavaScript，例如：

```javascript
return {
  type: 'button',
  label: '按钮修改',
  onClick: (e, props) => {
    alert('消息通知');
  }
};
```

## 动态渲染表单项

默认 `schemaApi` 渲染页面节点。若要在表单里动态出表单项，接口可以返回 `controls` / `body` 数组（无 `type` 时按表单项落下）：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "type": "container",
    "body": [
      {
        "type": "input-text",
        "name": "text",
        "label": "文本输入"
      }
    ]
  }
}
```

例如下例（表单槽里的 Service）：

```schema: scope="form-item2"
{
  "type": "service",
  "schemaApi": "/api/mock2/service/schema?type=controls"
}
```

`schemaApi` 也可以同时带回表单数据：接口 `data.data` 会写入当前表单域。

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "data": {
      "a": "b"
    },
    "body": [
      {
        "type": "select",
        "name": "a",
        "label": "选项",
        "options": [
          {"label": "A", "value": "a"},
          {"label": "B", "value": "b"}
        ]
      }
    ]
  }
}
```

## 接口联动

`api` 和 `schemaApi` 都支持 [接口联动](/concepts/linkage)：url 里的 `${tpl}` 随表单域变化会重拉。

```schema: scope="body"
{
    "title": "",
    "type": "form",
    "api": "/api/mock2/form/saveForm?waitSeconds=1",
    "mode": "horizontal",
    "body": [
        {
        "label": "数据模板",
        "type": "select",
        "name": "tpl",
        "value": "tpl1",
        "size": "sm",
        "options": [
            {
            "label": "模板1",
            "value": "tpl1"
            },
            {
            "label": "模板2",
            "value": "tpl2"
            },
            {
            "label": "模板3",
            "value": "tpl3"
            }
        ],
        "description": "<span class=\"text-danger\">请修改该下拉选择器查看效果</span>"
        },
        {
        "type": "service",
        "api": "/api/mock2/form/initData?tpl=${tpl}",
        "body": [
            {
            "label": "名称",
            "type": "input-text",
            "name": "name"
            },
            {
            "label": "作者",
            "type": "input-text",
            "name": "author"
            },
            {
            "label": "请求时间",
            "type": "input-datetime",
            "name": "date"
            }
        ]
        }
    ],
    "actions": []
}
```

变更**数据模板**会触发 Service 重拉，并更新当前数据域。

## 定时轮询刷新

设置 `interval`（ms，最低 1000）会定时重拉 `api` / `schemaApi`；`stopAutoRefreshWhen` 命中表达式时停止。轮询时的 Spinner 遮罩是绝对定位，不会改已渲染内容的盒模型。

```schema: scope="body"
type: service
api: /api/mock2/number/random?waitSeconds=1
interval: 2000
stopAutoRefreshWhen: this.random === 6
body:
  type: panel
  title: 随机数字
  body: 现在是：${random}
```

### 静默轮询

`silentPolling: true` 时轮询不显示 loading（仅配 `interval` 生效）：

```schema: scope="body"
type: service
api: /api/mock2/number/random?waitSeconds=1
interval: 2000
silentPolling: true
stopAutoRefreshWhen: this.random === 6
body:
  type: panel
  title: 随机数字
  body: 现在是：${random}
```

## 通过 WebSocket 实时获取数据

::: warning 未接
`ws` / `env.wsFetcher` 尚未接入。无示例服务，Amis 文档同样不能在线演示。
:::

可以只设 `ws` 拿实时数据，也可以同时设 `api` 拉全量、`ws` 推增量。

```json
{
  "type": "service",
  "ws": "ws://localhost:8777",
  "body": {
    "type": "panel",
    "title": "$title",
    "body": "随机数：${random}"
  }
}
```

对象形式可在建连时发送初始 `data`：

```json
{
  "type": "service",
  "ws": {
    "url": "ws://localhost:8777?name=${name}",
    "data": {
      "name": "${name}"
    }
  },
  "body": {
    "label": "名称",
    "type": "static",
    "name": "name"
  }
}
```

非 JSON 字符串结果可配 `responseKey`，把原文落到该字段。定制协议（如 socket.io）应对齐 Amis 覆盖 `env.wsFetcher`，返回 `{ close }`。

## 调用外部函数获取数据

::: warning 未接
`dataProvider`（字符串 / 函数 / 按事件 `inited` · `onApiFetched` · `onSchemaApiFetched` · `onWsFetched`）尚未接入。下面是对标 schema，当前不会跑函数。
:::

```yaml
type: service
dataProvider: "setData({ now: new Date().toString() })"
body:
  type: tpl
  tpl: 现在是：${now}
```

函数参数是 `data`、`setData`；可返回清理函数，组件销毁时执行。函数类型只能在 JS SDK / Vue 宿主里传，不能写进 JSON。字符串形式在受信任模式下才应编译（对齐 `env.trusted`）。

按事件触发的写法（未接）：

```yaml
type: service
api: /api/mock2/page/initData
dataProvider:
  inited: "setData({ addedNumber: data.number + 1  })"
  onApiFetched: "setData({ year: new Date(data.date).getFullYear() })"
data:
  number: 8887
body:
  type: panel
  title: $title
  body:
    - type: tpl
      tpl: 静态数字为：${addedNumber}
    - type: tpl
      tpl: 接口返回值的日期为：${date}
```

## 隐藏错误信息

默认会把接口错误以 Alert 画在 Service 顶部，同时 toast。`"showErrorMsg": false` 只藏 Alert，仍保留 toast。

```schema: scope="body"
{
  "type": "service",
  "api": "/api/mock2/page/initDataError",
  "body": [
    {
      "type": "tpl",
      "tpl": "展示错误信息"
    },
    {
      "type": "icon",
      "icon": "fa-solid fa-arrow-up"
    }
  ]
}
```

```schema: scope="body"
{
  "type": "service",
  "api": "/api/mock2/page/initDataError",
  "showErrorMsg": false,
  "body": [
    {
      "type": "tpl",
      "tpl": "不展示错误信息"
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"service"` | 指定为 Service |
| className | `[ClassName](/types/classname)` | | 打在宿主 |
| body | `[SchemaNode](/types/schemanode)` | | 静态内容；有 schemaApi 结果时被替换 |
| api | `[API](/types/api)` | | 初始化数据域 |
| ws | `string` / `object` | | WebSocket 地址。**未接** |
| dataProvider | `string` 或按事件的函数表 | | 外部取数。**未接** |
| initFetch | `boolean` | `true` | `false` 时挂载不拉 `api` |
| schemaApi | `[API](/types/api)` | | 远程子 schema。jsonp / `js:` **未接** |
| initFetchSchema | `boolean` | `true` | `false` 时挂载不拉 `schemaApi` |
| messages | `Object` | | toast 文案覆写 |
| messages.fetchSuccess | `string` | | 请求成功 toast |
| messages.fetchFailed | `string` | `"初始化失败"` | 请求失败 toast / Alert |
| interval | `number` | | 轮询间隔 ms（最低 1000） |
| silentPolling | `boolean` | `false` | 轮询时不显示 loading |
| stopAutoRefreshWhen | [表达式](/concepts/expression) | | 满足即停止轮询 |
| showErrorMsg | `boolean` | `true` | 是否以 Alert 展示接口错误；`false` 只留 toast |
| name | `string` | | 可 `${id}` 动态名 |
| data | `object` | | 初始数据域 |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 监听，`actions` 里用 `${事件参数名}` 或 `${event.data.[事件参数名]}` 取值，详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| init | - | 挂载后触发 |
| fetchInited | `responseData` / `responseStatus` / `responseMsg` / `error`，以及当前域字段 | api 完成 |
| fetchSchemaInited | 同上 | schemaApi 完成 |

### init

```schema: scope="body"
{
  "type": "service",
  "api": "/api/mock2/page/initData",
  "body": {
    "type": "panel",
    "title": "$title",
    "body": "现在是：${date}"
  },
  "onEvent": {
    "init": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "init"
          }
        }
      ]
    }
  }
}
```

### fetchInited

```schema: scope="body"
{
  "type": "service",
  "api": "/api/mock2/page/initData",
  "body": [
    {
      "type": "panel",
      "title": "$title",
      "body": "现在是：${date}"
    }
  ],
  "onEvent": {
    "fetchInited": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "title:${event.data.responseData.title}，date:${date}，status:${event.data.responseStatus}"
          }
        }
      ]
    }
  }
}
```

### fetchSchemaInited

```schema: scope="body"
[
  {
    "type": "service",
    "schemaApi": "/api/mock2/service/schema?type=tabs",
    "onEvent": {
      "fetchSchemaInited": {
        "actions": [
          {
            "actionType": "toast",
            "args": {
              "msg": "type:${event.data.responseData.type}，status:${event.data.responseStatus}"
            }
          }
        ]
      }
    }
  }
]
```

## 动作表

其他组件可通过 `actionType` + `componentId` 触发，详见 [事件动作](/concepts/event-action)。

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| reload | - | 重拉 `api`，刷新数据域 |
| rebuild | - | 按 `args` 重拉 `schemaApi`，重建子 schema |
| setValue | - | 更新数据域 |

### reload

#### 只做刷新

```schema: scope="body"
[
  {
    "type": "button",
    "label": "刷新请求",
    "onEvent": {
      "click": {
        "actions": [
          {
            "componentId": "service-reload",
            "actionType": "reload"
          }
        ]
      }
    }
  },
  {
    "type": "service",
    "id": "service-reload",
    "name": "service-reload",
    "api": "/api/mock2/number/random",
    "body": "现在是：${random}"
  }
]
```

#### 发送数据并刷新

配了 `data` 会先合并进目标数据域（`dataMergeMode: override` 则覆盖），再请求。

```schema: scope="body"
[
  {
    "type": "button",
    "label": "刷新请求",
    "onEvent": {
      "click": {
        "actions": [
          {
            "componentId": "service-reload",
            "actionType": "reload",
            "data": {
              "date": "${NOW()}"
            }
          }
        ]
      }
    }
  },
  {
    "type": "service",
    "id": "service-reload",
    "name": "service-reload",
    "api": "/api/mock2/number/random",
    "body": "现在是：${random}, 当前时间：${date}"
  }
]
```

### rebuild

基于 `args` 和 `schemaApi` 绑定变量，让 Service 拉不同的 schema。

```schema: scope="body"
[
  {
    "type": "alert",
    "body": "请选择一种构建方式生成组件",
    "level": "info",
    "showIcon": true,
    "className": "mb-3",
    "visibleOn": "this.schemaType == null"
  },
  {
    "type": "button-group",
    "tiled": true,
    "className": "mb-3",
    "buttons": [
      {
        "type": "action",
        "label": "构建form",
        "icon": "fa fa-hammer",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "rebuild",
                "componentId": "service-rebuild",
                "args": {
                  "schemaType": "form"
                }
              }
            ]
          }
        }
      },
      {
        "type": "action",
        "label": "构建tabs",
        "icon": "fa fa-hammer",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "rebuild",
                "componentId": "service-rebuild",
                "args": {
                  "schemaType": "tabs"
                }
              }
            ]
          }
        }
      },
      {
        "type": "action",
        "label": "构建crud",
        "icon": "fa fa-hammer",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "rebuild",
                "componentId": "service-rebuild",
                "args": {
                  "schemaType": "crud"
                }
              }
            ]
          }
        }
      }
    ]
  },
  {
    "type": "service",
    "id": "service-rebuild",
    "name": "service-rebuild",
    "schemaApi": {
      "url": "/api/mock2/service/schema?type=${schemaType}",
      "method": "post",
      "sendOn": "this.schemaType != null"
    }
  }
]
```

### setValue

#### 合并数据

默认 `setValue` 会把新数据与目标组件数据合并。

```schema: scope="body"
[
    {
      "type": "button",
      "label": "更新数据",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "setValue",
              "componentId": "service-setvalue",
              "args": {
                "value": {
                  "name": "aisuda",
                  "email": "aisuda@baidu.com"
                }
              }
            }
          ]
        }
      }
    },
    {
      "type": "service",
      "id": "service-setvalue",
      "name": "service-setvalue",
      "data": {
        "name": "amis",
        "email": "amis@baidu.com"
      },
      "body": [
        {
          "type": "tpl",
          "tpl": "名字：${name|default:'-'}，邮箱：${email|default:'-'}"
        }
      ]
    }
]
```

#### 覆盖数据

`"dataMergeMode": "override"` 覆盖目标组件数据。

```schema: scope="body"
[
    {
      "type": "button",
      "label": "更新数据",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "setValue",
              "componentId": "service-setvalue",
              "args": {
                "value": {
                  "name": "aisuda"
                }
              },
              "dataMergeMode": "override"
            }
          ]
        }
      }
    },
    {
      "type": "service",
      "id": "service-setvalue",
      "name": "service-setvalue",
      "data": {
        "name": "amis",
        "email": "amis@baidu.com"
      },
      "body": [
        {
          "type": "tpl",
          "tpl": "名字：${name|default:'-'}，邮箱：${email|default:'-'}"
        }
      ]
    }
]
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 已接 `interval` 轮询 / `silentPolling` / `stopAutoRefreshWhen`、错误 Alert、`init` / `fetchInited` / `fetchSchemaInited`、`reload` / `rebuild` / `setValue`。
- 未接 `dataProvider`、jsonp / `js:` schema、`ws` / `env.wsFetcher`。
