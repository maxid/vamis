---
title: 模板
---

# 模板

::: tip 实现进度 95% · 已完成
文档主路径已对齐 Amis「模板」：`tpl`/`html` 按 HTML 插入（插值默认转义、标题/列表/链接在 `.vamis-html` 岛内补回）、`${}`、`|raw`、表达式、注意事项均可跑。JSON 与 YAML 同等有效。不实现 lodash `<% %>`（D2）。Amis 其余运行时过滤器（`map` / `bytes` 等）仍 P1。
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

同一份 JSON 也有效：

```schema
{
  "type": "page",
  "body": "Hello World!"
}
```

### 文本中获取变量

在普通文本里用数据映射语法 `${xxx}` 取当前数据域的值：

```schema
type: page
data:
  text: World!
body: Hello ${text}
```

找不到的变量会变成空字符串。更多 `${xxx}` 写法见 [数据映射](/concepts/data-mapping)。

### 渲染 html

`tpl` 和 `html` 是同一渲染器（对齐 Amis）：模板里的标签会生效。Tailwind Preflight 会把 `h1`–`h6`、段落、列表、链接收成正文；运行时只在 `tpl`/`html` 这块岛（`.vamis-html`）补回，**不会**打到 Page 标题、按钮、输入框。`${}` 插值默认转义，变量里的 `<` 不会变成标签。

```schema
type: page
data:
  text: World!
body: "<h1>Hello</h1> <span>${text}</span>"
```

变量本身已经是 HTML 时，加上 `|raw`：

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
body:
  - type: tpl
    tpl: 默认转义：${name}
  - type: tpl
    tpl: raw 才当 HTML：${name|raw}
```

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

`${expr|filter:arg}`：先求值表达式，再依次过过滤器。P0 已接：

| 过滤器 | 作用 |
|--------|------|
| `raw` | 不转义，Tpl 才按 HTML 插入 |
| `html` | 转义 `<` `>` `&` 等 |
| `json` | `JSON.stringify` |
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
```

写法：`${name|raw}`、`${n|percent:2}`、`${d|date:'YYYY-MM-DD':'YYYY-MM-DD'}`。Amis 其余运行时过滤器（`map` / `bytes` 等）仍 P1。

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
