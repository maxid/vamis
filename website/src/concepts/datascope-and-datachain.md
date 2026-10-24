---
title: 数据域与数据链
---

# 数据域与数据链

::: info 实现进度 75% · 进行中
文档主路径已对齐 Amis 同名页：`initApi` / `data` 进数据域、发生了什么、page → service 变量遮蔽、`__super`、URL 查询种子、非容器上的 `data` 不建域、表单提交 merge、`__prev` / `__changeReason`。JSON 与 YAML 同等有效。`trackExpression`（D9）、CRUD filter 独立域（D10）、表单项写到 page 域（D6）仍缺。
:::

每个能取数的容器有自己的**数据域**，子节点沿**数据链**向上找。这是 kernel D1。作者态 JSON 与 YAML 并列。

## 基本的数据展示

先看最简单的页面：内容区是一段固定文本。

```json
{
  "type": "page",
  "body": "Hello World!"
}
```

YAML 写出来是同一棵树：

```yaml
type: page
body: Hello World!
```

接下来要解决的是：**用接口把数据拉回来，填进内容区**。

## 添加初始化接口

```schema
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "body": "date is ${date}"
}
```

接口按 `{ status, msg, data }` 返回。同一份 YAML：

```yaml
type: page
initApi: /api/mock2/page/initData
body: date is ${date}
```

文档里这个 Play 进视口才请求，是外包的 [LazyComponent](/concepts/schema#lazycomponent)，不是 Page 内核在等可见。

## 发生了什么?

输出变成接口返回的日期，过程是：

1. 给 `Page` 配了 `initApi`，初始化时请求这个接口。
2. 请求成功后，`Page` 把返回里的 `data` 写进**当前数据域**。
3. 渲染 `body` 时遇到 `${date}`，就到当前数据域取 `date`，替换后再输出。

接口形态是：

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

> 下一节是 [模板](/concepts/template)。`body` 字符串本身支持模板；很多组件的文本属性也一样。

## 数据域

数据域是运行时最重要的概念之一。下面这段没有配任何数据：

```schema
{
  "type": "page",
  "body": "Hello ${text}"
}
```

`${text}` 在空域里找不到，渲染成 `Hello`。

组件的 `data` 是初始化数据域的一种方式：

```schema
{
  "type": "page",
  "data": {
    "text": "World!"
  },
  "body": "Hello ${text}"
}
```

没写 `data` 时，可以当成 `"data": {}`。组件树会带出一棵数据域树，它们之间的关系就是下面的**数据链**。

## 数据链

当前组件要取值（模板、表单、列表等）时：

1. 先在本层数据域找；找到就停。
2. 找不到就沿父组件向上找，重复 1。
3. 一直找到顶级 `page`。
4. 如果地址栏还有查询参数，再往上看这一层，所以常常可以直接 `${id}` 取 URL 参数。

> 这一章的例子多用 `data` 初始化，方便讲链。组件如果支持 `initApi` / `api`，也可以用接口灌数据。

```schema
{
  "type": "page",
  "data": {
    "name": "zhangsan",
    "age": 20
  },
  "body": [
    {
      "type": "tpl",
      "tpl": "my name is ${name}"
    },
    {
      "type": "service",
      "data": {
        "name": "lisi"
      },
      "body": {
        "type": "tpl",
        "tpl": "my name is ${name}, I'm ${age} years old"
      }
    }
  ]
}
```

组件树：

```
page
  ├─ tpl
  └─ service
       └─ tpl
```

数据链（`__sub` 只是方便理解，不是真实字段）：

```json
{
  "name": "zhangsan",
  "age": 20,
  "__sub": {
    "name": "lisi"
  }
}
```

page 下的 tpl：本层找到 `name = zhangsan`，输出 `my name is zhangsan`。

service 里的 tpl：本层 `name = lisi`，`age` 本层没有，向上在 page 找到 `20`，输出 `my name is lisi, I'm 20 years old`。

沿链取上一层也可以写 `${__super.age}`。取值语法在不同字段上可能不同，见 [模板](/concepts/template) 和 [表达式](/concepts/expression)。

```schema
type: page
data:
  name: zhangsan
  age: 20
body:
  type: service
  data:
    name: lisi
  body:
    type: tpl
    tpl: 本层 ${name}，上层年龄 ${__super.age}
```

### 具备数据域的组件

只有少数容器会新建数据域。Amis 列表如下；Vamis 已建独立 Scope 的标了 ✓。

- App
- Page ✓
- Cards
- Chart
- CRUD ✓
- CRUD2 ✓
- Dialog
- Drawer
- List
- Form ✓
- PaginationWrapper
- Service ✓
- Wizard
- Combo
- InputArray
- Table
- Table2

CRUD 里的 filter 其实是一个 form，所以 CRUD 有两层数据域。Vamis 这一层还没拆开（D10）。

### 常见误解

给 `container` 这类**不建域**的组件写 `data` 不会生效：

```schema
{
  "type": "page",
  "data": {
    "name": "zhangsan"
  },
  "body": [
    {
      "type": "tpl",
      "tpl": "my name is ${name}"
    },
    {
      "type": "container",
      "data": {
        "name": "lisi"
      },
      "body": {
        "type": "tpl",
        "tpl": "my name is ${name}"
      }
    }
  ]
}
```

两行都是 `zhangsan`。要用 Service 包一层才建新域：

```schema
{
  "type": "page",
  "data": {
    "name": "zhangsan"
  },
  "body": [
    {
      "type": "tpl",
      "tpl": "my name is ${name}"
    },
    {
      "type": "service",
      "data": {
        "name": "lisi"
      },
      "body": {
        "type": "container",
        "body": {
          "type": "tpl",
          "tpl": "my name is ${name}"
        }
      }
    }
  ]
}
```

## 初始化数据域

有两种方式。

### 1. 配置初始化接口

```json
{
  "type": "page",
  "initApi": "/api/mock2/page/initData",
  "body": "Hello ${title}"
}
```

接口必须是：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "text": "World!"
  }
}
```

注意：

1. 不是所有组件都有 `initApi`。没有的用 [Service](/components/service) 辅助灌数。
2. `status`、`msg`、`data` 是必要字段。
3. `data` 必须是对象，不能是字符串或数组。

`api` 也可以写成对象，见 [API](/types/api)。

### 2. 显式配置 data

```schema
{
  "type": "page",
  "data": {
    "text": "World!",
    "name": "vamis"
  },
  "body": "Hello ${text}, my name is ${name}."
}
```

### 同时配置

同时写 `initApi` 和 `data` 时，两份会 **merge**：先 `data`，接口返回盖在上面。

## 更新数据域

部分交互会改当前域。下面这个表单提交后，mock 会带回 `id`，静态文本跟着变：

```schema
{
  "type": "page",
  "body": {
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
      {
        "type": "input-text",
        "name": "name",
        "label": "姓名："
      },
      {
        "type": "input-text",
        "name": "age",
        "label": "年龄："
      },
      {
        "type": "static-tpl",
        "tpl": "生成的id为：${id}"
      }
    ]
  }
}
```

提交返回会 **merge** 进当前 form 域。`Formula` 等组件也有类似行为。

## 更新数据链

顶层域一变，子层带数据域的组件通常也要刷新，否则拿不到新值。Amis 3.2 起用 `trackExpression` 声明本层关心哪些上层变量：`"none"` 不追踪，`"${name}"` 只在 name 变时更新。语法见 [表达式](/concepts/expression)。

Vamis 里 `trackExpression` 目前只接到 **API 自动刷新**（D3），还没有接到「数据域组件是否随上层刷新」（D9）。下面这份配置能渲染，开关不会改变 CRUD filter 是否跟上 `name`：

```json
{
  "type": "page",
  "data": {
    "name": "vamis"
  },
  "body": [
    { "type": "input-text", "name": "name", "label": "请修改输入框" },
    { "type": "switch", "name": "syncSwitch", "label": "同步更新" },
    {
      "type": "crud",
      "filter": {
        "trackExpression": "${syncSwitch ? name : ''}",
        "body": ["my name is ${name}"]
      }
    }
  ]
}
```

另外：表单项写在 page 下、不包 form 时，Amis 会把值写进 page 域；Vamis 表单项目前只写 form 域，所以上面的输入框改了也不会改 page 的 `name`。

## URL 参数

地址栏查询会进顶层数据域。点 [这里](/concepts/datascope-and-datachain?word=myquery#url-参数) 再看 `${word}`。

```schema
{
  "type": "page",
  "body": "${word}"
}
```

## 隐藏数据

这些字段不会被枚举，但可以读：

- `__prev` 修改前的值
- `__changeReason` 修改原因（对象）
- `__changeReason.type`
  - `input` 用户输入
  - `api` 接口返回
  - `formula` 公式
  - `hide` 显隐变化
  - `init` 表单项初始化
  - `action` 事件动作
- `__super` 数据链上一层

```schema
{
  "type": "form",
  "id": "form_data",
  "data": {
    "name": "vamis"
  },
  "actions": [
    {
      "type": "button",
      "label": "接口获取",
      "actionType": "ajax",
      "api": {
        "method": "get",
        "url": "/api/mock2/form/saveForm",
        "mockResponse": {
          "status": 200,
          "data": {
            "name": "vamis-demo"
          }
        }
      }
    },
    {
      "type": "button",
      "label": "设置值",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "setValue",
              "componentId": "form_data",
              "args": {
                "value": {
                  "name": "vamis-demo2"
                }
              }
            }
          ]
        }
      }
    }
  ],
  "body": [
    {
      "type": "input-text",
      "name": "name",
      "label": "姓名"
    },
    {
      "type": "tpl",
      "tpl": "当前值：${name}；修改前：${__prev.name}；原因：${__changeReason|json}"
    }
  ]
}
```

输入框改值会记 `input`。`setValue` 记 `action`；`ajax` 记 `api`。`formula` / `hide` 仍精简。
