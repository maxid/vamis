---
title: Page 页面
outline: deep
---

# Page 页面

::: tip 实现进度 95% · 已完成
文档主路径已对齐：独立数据域、URL 查询种子、`initApi` overlay、轮询、aside、reload / setValue（含 override）、`css` / remark、完整事件对象（`event.data` / `__rendererData` / `preventDefault` / `stopPropagation` / `setData`）。`pullRefresh` 明确未接（Amis 仅移动端）。
:::

`page` 是页面入口容器，对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。

默认铺满布局槽（`w-full min-w-0`），不必先写 `size` / `w-full`。作者态 YAML 与 JSON 同等有效。

## 基本用法

内容区可以是字符串，也可以继续嵌套其它组件。

```schema
{
  "type": "page",
  "title": "标题",
  "body": "Hello World!"
}
```

## 数据域

Page 会新建一层数据域（D1）。根 Scope 先吃地址栏 query（`?word=myquery` → `${word}`），再合并 `env.initialData` / 入参 `data`；本页 `data` 与 `initApi` 返回盖在上面。子节点沿数据链向上找，`${__super.word}` 读上一层。

```schema
{
  "type": "page",
  "body": {
    "type": "tpl",
    "tpl": "URL word=${word|default:'(无)'}。地址栏加上 ?word=myquery 后刷新即可看到。"
  }
}
```

## 渲染组件

内容区同样可以渲染各种组件。下面是一个表单。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "name": "name",
      "label": "姓名："
    }
  ]
}
```

## 在其他区域渲染组件

Page 默认分成内容区（`body`）、侧边栏（`aside`）和工具栏（`toolbar`）。这些区域都是 Page 的子节点，读同一份页面数据。

```schema
{
  "type": "page",
  "aside": [
    {
      "type": "tpl",
      "tpl": "这是侧边栏部分"
    }
  ],
  "toolbar": [
    {
      "type": "tpl",
      "tpl": "这是工具栏部分"
    }
  ],
  "body": [
    {
      "type": "tpl",
      "tpl": "这是内容区"
    }
  ]
}
```

## 页面初始化请求

配置 `initApi` 后，Page 会在挂载时请求接口，把返回的 `data` 放进本页 overlay，子节点用 `${date}` 就能读到。默认会拉（`initFetch` 为 true）；可用 `initFetch: false` 或 `initFetchOn` 表达式关掉首次请求。

```schema
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "body": [
    {
      "type": "tpl",
      "tpl": "当前时间是：${date}"
    }
  ]
}
```

接口规范见 [API](/types/api)。adaptor / `replaceData` 等管线仍是 D3，尚未落地。

## 轮询初始化接口

1. 配置 `initApi`；
2. 配置 `interval`：单位毫秒，最小 1000。

请求成功后才会继续下一轮。`silentPolling` 在 Vamis 里表示轮询出错不弹 notify（Amis 原意是隐藏加载动画；Page 暂无全页 loading）。

```schema
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "interval": 3000,
  "body": [
    {
      "type": "tpl",
      "tpl": "当前时间是：${date}"
    }
  ]
}
```

满足条件时停止轮询，写 `stopAutoRefreshWhen`。Amis 示例用 `this.time % 5`；Vamis 同样把 `this` 指到当前数据域。

```schema
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "stopAutoRefreshWhen": "this.time % 5",
  "interval": 3000,
  "body": [
    {
      "type": "tpl",
      "tpl": "当前时间戳是：${date}"
    }
  ]
}
```

## 下拉刷新

Amis 的 `pullRefresh` 仅移动端。**Vamis 未接**，配置会被忽略，也不会派发 `pullRefresh` 事件。

## CSS 变量

`cssVars` 写在 schema 上，会映射到 shadcn token（例如 Amis `--text-color` → `--foreground`）。

```schema
{
  "type": "page",
  "cssVars": {
    "--text-color": "#108cee"
  },
  "body": {
    "type": "form",
    "wrapWithPanel": false,
    "body": [
      {
        "type": "input-text",
        "label": "文本框",
        "name": "text"
      }
    ]
  }
}
```

## 自定义 CSS

`css` 是选择器到声明的对象。Page 会插入一个 `<style>`，随页面卸载一起拿走（不写进 `document.head`）。选择器和属性值会丢掉含 `</`、`@import`、`expression(` 的内容。

```schema
{
  "type": "page",
  "css": {
    ".myClass": {
      "color": "blue"
    }
  },
  "body": {
    "type": "tpl",
    "tpl": "文本",
    "className": "myClass"
  }
}
```

## aside 可调整宽度

`asideResizor: true` 后可拖宽，夹在 `asideMinWidth` / `asideMaxWidth` 之间（未写时约 160–400）。

```schema
{
  "type": "page",
  "asideResizor": true,
  "asideMinWidth": 150,
  "asideMaxWidth": 400,
  "aside": [
    {
      "type": "tpl",
      "tpl": "这是侧边栏部分"
    }
  ],
  "body": [
    {
      "type": "tpl",
      "tpl": "这是内容区"
    }
  ]
}
```

## aside 位置固定

`asideSticky` 默认开启，侧栏 `position: sticky`。

## aside 展示位置

`asidePosition: right` 把侧栏换到右边。

```schema
{
  "type": "page",
  "asideResizor": true,
  "asidePosition": "right",
  "aside": [
    {
      "type": "tpl",
      "tpl": "这是侧边栏部分"
    }
  ],
  "body": [
    {
      "type": "tpl",
      "tpl": "这是内容区"
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"page"` | 指定为 Page |
| `title` | [SchemaNode](/types/schemanode) | | 页面标题。字符串走 tpl；对象走子渲染器 |
| `subTitle` | [SchemaNode](/types/schemanode) | | 副标题，同上 |
| `remark` | [Remark](/components/remark) / `string` | | 标题旁的提示图标。字符串当 `content`；对象交给 remark 渲染器 |
| `aside` | [SchemaNode](/types/schemanode) | | 侧栏 |
| `asideResizor` | `boolean` | | 侧栏可拖宽 |
| `asideMinWidth` | `number` | `160` | 拖宽下限（未写时） |
| `asideMaxWidth` | `number` | `400` | 拖宽上限（未写时） |
| `asideSticky` | `boolean` | `true` | 侧栏 CSS sticky |
| `asidePosition` | `"left" \| "right"` | `"left"` | 侧栏位置 |
| `toolbar` | [SchemaNode](/types/schemanode) | | 顶栏右侧（无标题时仍在顶部） |
| `body` | [SchemaNode](/types/schemanode) | | 内容区 |
| `className` | `string` | | 外层 class，由 SchemaRenderer 套上 |
| `cssVars` | `object` | | 自定义 CSS 变量 |
| `css` | `object` | | 选择器 → 声明，注入 `<style>` |
| `toolbarClassName` / `bodyClassName` / `asideClassName` / `headerClassName` | `string` | | 打到对应区域，走 `resolveClassName`。不搬 Amis 默认的 `wrapper` / `bg-light` 类名 |
| `initApi` | [API](/types/api) | | 拉初始数据。返回字段进入本页 overlay |
| `initFetch` | `boolean` | `true` | 是否首次拉取 |
| `initFetchOn` | [表达式](/concepts/expression) | | 是否首次拉取 |
| `interval` | `number` | | 轮询间隔（最小 1000） |
| `silentPolling` | `boolean` | `false` | 轮询失败时不 notify |
| `stopAutoRefreshWhen` | [表达式](/concepts/expression) | | 为真则停止轮询 |
| `pullRefresh` | `object` | `{disabled: true}` | **Vamis 未接**（Amis 仅移动端） |
| `data` | `object` | | 静态数据，写入本页 Scope，覆盖父级与 URL 同名键 |
| `onEvent` | `object` | | 见事件表 |

## 事件表

可以用 `onEvent` 监听，再配 `actions`。公式可读 `${字段}`、`${event.data.字段}`、`${__rendererData}`。动作上的 `preventDefault` / `stopPropagation` / `ignoreError` 已生效；`event.setData()` 会改后续动作看到的 `event.data`。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `init` | 当前数据域 | 插入 DOM 时 |
| `inited` | `responseData` / `responseStatus` / `responseMsg`，以及接口字段 | `initApi` 结束（成功或失败） |
| `pullRefresh` | — | **Vamis 未接** |

### init 和 inited

```schema
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "body": [
    {
      "type": "tpl",
      "tpl": "当前时间是：${date}"
    }
  ],
  "onEvent": {
    "init": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "init"
          }
        }
      ]
    },
    "inited": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "${event.data.responseData|json}"
          }
        }
      ]
    }
  }
}
```

## 动作表

其它组件通过 `actionType` + `componentId`（或 `target`）触发。参数可写在 `args`。详见 [事件动作](/concepts/event-action)。

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `reload` | 可选 `data`；`dataMergeMode: override` 覆盖 | 先把 `data` 写入 overlay，再请求 `initApi` |
| `setValue` | `args.value` 对象；`dataMergeMode: override` 覆盖 | 更新 overlay。默认合并 |

### reload

#### 只做刷新

只配 `componentId` 即可重新拉 `initApi`。

```schema
{
  "type": "page",
  "id": "page_reload_1",
  "initApi": "/api/mock2/page/initData",
  "body": [
    {
      "type": "button",
      "label": "刷新Page数据加载请求",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "page_reload_1",
              "actionType": "reload"
            }
          ]
        }
      }
    },
    {
      "type": "tpl",
      "tpl": "当前时间是：${date}"
    }
  ]
}
```

#### 发送数据并刷新

配置了 `data` 时，先合并进 overlay 再请求。`"dataMergeMode": "override"` 会先清空本页 overlay。

```schema
{
  "type": "page",
  "id": "page_reload_2",
  "initApi": "/api/mock2/page/initData",
  "body": [
    {
      "type": "button",
      "label": "刷新Page数据加载请求，并将我的年龄设置为18",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "page_reload_2",
              "actionType": "reload",
              "data": {
                "age": 18
              }
            }
          ]
        }
      }
    },
    {
      "type": "tpl",
      "tpl": "当前时间是：${date}， 我的年龄：${age|default:'-'}"
    }
  ]
}
```

### setValue

#### 合并数据

默认与目标组件数据合并。

```schema
{
  "type": "page",
  "id": "page02",
  "initApi": "/api/mock2/page/initData",
  "body": [
    {
      "type": "button",
      "label": "更新数据",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "page02",
              "actionType": "setValue",
              "args": {
                "value": {"date": "2023-05-01"}
              }
            }
          ]
        }
      }
    },
    {
      "type": "tpl",
      "tpl": "标题：${title} 当前时间是：${date}"
    }
  ]
}
```

#### 覆盖数据

`"dataMergeMode": "override"` 用新对象替换 overlay（接口字段若没写进 `value` 就会消失）。

```schema
{
  "type": "page",
  "id": "page02-override",
  "initApi": "/api/mock2/page/initData",
  "body": [
    {
      "type": "button",
      "label": "覆盖数据",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "page02-override",
              "actionType": "setValue",
              "args": {
                "value": {"date": "2023-05-01"}
              },
              "dataMergeMode": "override"
            }
          ]
        }
      }
    },
    {
      "type": "tpl",
      "tpl": "标题：${title|default:'-'} 当前时间是：${date}"
    }
  ]
}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `pullRefresh` 未做（Amis 仅移动端）。`silentPolling` 不控制加载动画。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
- `css` 挂在 Page 节点上，不写 `document.head`。
