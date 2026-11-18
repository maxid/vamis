---
title: 模板
---

# 模板

::: info 实现进度 95% · 进行中
已对齐并核完 Amis「模板」主路径：插值、缺失 / 空值与对象转换、HTML / `raw` 信任边界、表达式、过滤器及注意事项均有活示例。`json` 默认紧凑，`json:2` 由作者显式选择格式化。不实现 lodash `<% %>`（D2）。
:::

模板用来把数据域里的值填进文本。主路径是 `${name}` 插值，由 `@vamis/formula` 求值。作者态 **JSON 与 YAML 并列**，解析后进同一引擎。

`page` 的 `body` 如果是字符串，会当成 `tpl`。`label`、`title`、`confirmText` 等文本属性同样走模板。

## 模板字符串

### 普通文本

配置一段普通文本并输出。

```schema
type: page
body: Hello World!
```

### 文本中获取变量

在普通文本里用数据映射语法 `${xxx}` 取当前数据域的值：

```schema
type: page
data:
  text: World!
body: Hello ${text}
```

找不到的变量会变成空字符串。`null` 也输出为空；对象和数组若直接插值，会按普通字符串转换。需要稳定、可读的 JSON 时显式使用 `json` 过滤器。

```schema
type: page
data:
  missingValue: null
  user:
    name: Ada
  tags:
    - A
    - B
body:
  - type: tpl
    tpl: "缺失=[${missing}]；null=[${missingValue}]"
  - type: tpl
    tpl: "对象=[${user}]；数组=[${tags}]"
  - type: tpl
    tpl: "对象 JSON=${user|json}；数组 JSON=${tags|json}"
```

更多 `${xxx}` 写法见 [数据映射](/concepts/data-mapping)。

### 渲染 html

`tpl` 和 `html` 是同一渲染器（对齐 Amis）：模板里的标签会生效。Tailwind Preflight 会把 `h1`–`h6`、段落、列表、链接收成正文；运行时只在 `tpl`/`html` 这块岛（`.vamis-html`）补回，**不会**打到 Page 标题、按钮、输入框。`${}` 插值默认转义，变量里的 `<` 不会变成标签。

```schema
type: page
data:
  text: World!
body: "<h1>Hello</h1> <span>${text}</span>"
```

变量本身已经是可信 HTML 时，加上 `|raw`：

```schema
type: page
data:
  text: <b>World!</b>
body: "<h1>Hello</h1> <span>${text|raw}</span>"
```

```schema
type: page
data:
  name: <b>Ada</b>
  unsafe: <img src=x onerror="alert('不应执行')">
body:
  - type: tpl
    tpl: 默认转义：${name}
  - type: tpl
    tpl: raw 才当 HTML：${name|raw}
  - type: tpl
    tpl: "用户输入保持文本：${unsafe}"
```

`|raw` 会关闭插值转义，只能用于可信作者内容。不要把用户输入、URL 参数或接口返回的未消毒 HTML 交给它；上面的 `unsafe` 没有 `raw`，因此只显示标签文本，不创建图片，也不会执行事件处理器。

```schema
type: page
body:
  type: tpl
  inline: false
  tpl: |
    <p>段落里的 <a href="#">链接</a></p>
    <ul>
      <li>一项</li>
      <li>二项</li>
    </ul>
```

只写 `text:` 才会把整段当纯文本。URL、接口地址、`jumpTo` 仍按原文拼接，不会把 `&` 转成 `&amp;`。不补 `button` / `input` 的浏览器默认皮，避免和 shadcn 控件打架。

### 表达式

`${}` 里可以写简单运算和公式，详见 [表达式](/concepts/expression)。

```schema
type: page
data:
  xxx: 1
body:
  type: tpl
  tpl: "${xxx == 1 ? 'One' : 'Others'}"
```

### 过滤器

`${expr|filter:arg}`：先求值表达式，再依次过过滤器。常用过滤器：

| 过滤器 | 作用 |
|--------|------|
| `raw` | 不转义，Tpl 才按 HTML 插入 |
| `html` | 转义 `<` `>` `&` 等 |
| `json` | 默认紧凑序列化；`json:2` 才按两格缩进格式化 |
| `date` / `datetime` | 时间格式化（`date` 默认按 Unix 秒） |
| `number` | 千分位 |
| `percent` | 乘 100 加 `%` |
| `default` | 空值回落 |
| `truncate` | 截断 |
| `first` | 取数组第一项 |

```schema
type: page
data:
  n: 1234567.89
  ratio: 0.1234
  title: hello world
  obj:
    a: 1
  age: ''
body:
  - type: tpl
    tpl: "数字 ${n|number} · 比例 ${ratio|percent:2}"
  - type: tpl
    tpl: "截断 ${title|truncate:5} · JSON ${obj|json} · 空值 ${age|default:'-'}"
  - type: tpl
    tpl: "<pre>${obj|json:2}</pre>"
```

`json` 默认输出紧凑文本；只有 `${obj|json:2}` 才带换行和两格缩进。Toast 正文会保留这些换行；其它 HTML 场景可用 `<pre>` 包裹。

写法：`${name|raw}`、`${n|percent:2}`、`${d|date:'YYYY-MM-DD':'YYYY-MM-DD'}`。完整映射、链式调用和扩展过滤器见 [数据映射 · 过滤器](/concepts/data-mapping#过滤器)；公式函数见 [表达式](/concepts/expression)。需要组件而不是一段 HTML 时，使用 [SchemaNode](/types/schemanode)，不要在模板字符串里嵌 schema。

## JavaScript 模板引擎

Amis 另有一条 lodash template 路径：`<% 语句 %>`、`<%- data.user %>`，取值写成 `data.xxx`。Vamis **不实现**（D2：需要执行 JS、XSS 面大，且和纯数据作者态冲突）。

循环、条件请用公式、三元，或 `type: each`（item 默认 inline，可以跟在一段文本后面）。

要换行，对齐 Amis：`inline: false` 变成块级，独占一行；同一行里硬换行就在模板里写 `<br>`。

```schema
type: page
data:
  user: no one
  items:
    - A
    - B
    - C
  more:
    - D
    - E
body:
  - type: tpl
    tpl: "User: ${user}"
    inline: false
  - type: divider
  - type: tpl
    tpl: "Array: "
  - type: each
    source: ${items}
    inline: true
    items:
      type: tpl
      className: "ml-1 rounded-sm bg-primary px-1.5 py-0.5 text-xs text-primary-foreground"
      tpl: "${item}"
  - type: tpl
    tpl: "<br>Also: "
  - type: each
    source: ${more}
    inline: true
    items:
      type: tpl
      className: "ml-1 rounded-sm bg-primary px-1.5 py-0.5 text-xs text-primary-foreground"
      tpl: "${item}"
```

lodash 里的 `formatNumber` / `formatDate` 对应过滤器 `|number`、`|date`。

## 注意事项

### 1. 不要写成 ${data.xxx}

模板字符串的数据域已经是当前作用域，直接写 `${xxx}`。`${data.xxx}` 会去找名叫 `data` 的字段，通常是错的。

错误（去找名叫 `data` 的字段，结果是 `false`）：

```schema
type: page
data:
  xxx: a
body:
  type: tpl
  tpl: "${data.xxx === 'a'}"
```

正确（当前数据域里的 `xxx`，结果是 `true`）：

```schema
type: page
data:
  xxx: a
body:
  type: tpl
  tpl: "${xxx === 'a'}"
```

`${name}` 是模板插值；`visibleOn: ${status === "online"}` 是布尔表达式。两者进同一引擎。不实现 lodash `<% %>`，也就不存在和它交叉使用的问题。
