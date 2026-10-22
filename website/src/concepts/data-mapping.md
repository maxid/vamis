---
title: 数据映射
---

# 数据映射

::: tip 实现进度 90% · 已完成
文档主路径已对齐 Amis「数据映射」：模板字符串、链式取值、转义、`api.data`、`&` 展开、`$rows` 数组提取、namespace、P0 过滤器与串联。JSON 与 YAML 同等有效。Amis 其余过滤器（`split` / `map` / `bytes` 等）仍 P1。
:::

数据映射用 `${xxx}` 从当前数据链取值，写进模板、接口发送体、`responseData` 等。作者态 **JSON 与 YAML 并列**，解析后走同一套 `dataMapping`。

旧写法 `$xxx`（不加大括号）在模板里仍能取值，新示例统一用 `${}`，和 [表达式](/concepts/expression) / [模板](/concepts/template) 同一套语法。

## 模板字符串

```schema
type: page
data:
  name: rick
body:
  type: tpl
  tpl: my name is ${name}
```

同一份 JSON 也有效：

```schema
{
  "type": "page",
  "data": { "name": "rick" },
  "body": {
    "type": "tpl",
    "tpl": "my name is ${name}"
  }
}
```

默认遇到 `$` 会尝试取值。要输出纯文本 `${xxx}`，在 `$` 前加 `\`：

```schema
{
  "type": "page",
  "data": { "name": "rick" },
  "body": {
    "type": "tpl",
    "tpl": "my name is \\${name}"
  }
}
```

## 支持链式取值

用 `.` 往下取：

```schema
type: page
data:
  name: rick
  company:
    name: baidu
    department: it
body:
  type: tpl
  tpl: "my name is ${name}, I work for ${company.name}"
```

## 自定义 api 请求体数据格式

表单提交时，默认把当前数据域发给接口。后端字段名对不上时，不要改表单项 `name`，配置 `api.data` 做映射。

```schema: scope="body"
type: form
data:
  name: rick
  email: rick@gmail.com
api:
  method: post
  url: /api/mock2/form/saveForm
  data:
    userName: ${name}
    userEmail: ${email}
body:
  - type: input-text
    name: name
    label: 姓名：
  - type: input-text
    name: email
    label: 邮箱：
  - type: tpl
    tpl: "提交后回显映射字段：${userName} / ${userEmail}"
```

mock 会把请求体原样塞回 `data`。提交后应看到 `userName` / `userEmail`，而不是把表单项改名叫这两个字段。完整接口字段见 [API](/types/api)。

## 复杂配置

### 展开所配置的数据

映射 key 写成 `` "&" ``，会把右侧对象铺进当前层。字段多的时候不用逐个 `${c.e}`。

先看逐个写：

```schema: scope="body"
type: form
data:
  name: rick
  email: rick@gmail.com
  a: "1"
  b: "2"
  c:
    e: "3"
    f: "4"
    g: "5"
api:
  method: post
  url: /api/mock2/form/saveForm
  data:
    name: ${name}
    email: ${email}
    e: ${c.e}
    f: ${c.f}
    g: ${c.g}
body:
  - type: input-text
    name: name
    label: 姓名：
  - type: input-text
    name: email
    label: 邮箱：
  - type: tpl
    tpl: "提交后回显：e=${e} f=${f} g=${g}"
```

改成 `"&": "${c}"`，效果相同：

```schema: scope="body"
type: form
data:
  name: rick
  email: rick@gmail.com
  a: "1"
  b: "2"
  c:
    e: "3"
    f: "4"
    g: "5"
api:
  method: post
  url: /api/mock2/form/saveForm
  data:
    name: ${name}
    email: ${email}
    "&": "${c}"
body:
  - type: input-text
    name: name
    label: 姓名：
  - type: input-text
    name: email
    label: 邮箱：
  - type: tpl
    tpl: "提交后回显：e=${e} f=${f} g=${g}"
```

`api.data` 里 `"&": "$$"`（或文档里偶见的 `$$$$`）表示把**当前域全部**铺进发送体。对象 key 带 `.` / `[]` 默认转成嵌套路径；`convertKeyToPath: false` 保持原 key。

### 数组提取值

映射对象只有一个 `$` 开头的 key、值又是对象时，会遍历这个数组，按内层字段抽出新数组（对齐 Amis `$table`）：

```schema: scope="body"
type: form
data:
  table:
    - a: a1
      b: b1
      c: c1
    - a: a2
      b: b2
      c: c2
    - a: a3
      b: b3
      c: c3
api:
  method: post
  url: /api/mock2/form/saveForm
  data:
    items:
      $table:
        a: ${a}
        c: ${c}
body:
  - type: input-table
    name: table
    label: table
    columns:
      - name: a
        label: A
        type: input-text
      - name: b
        label: B
        type: input-text
      - name: c
        label: C
        type: input-text
  - type: tpl
    tpl: "提交后 items：${items|json}"
```

只抽出 `table` 里的 `a`、`c`，赋给 `items`。提交后回显应是 `[{a,c},{a,c},{a,c}]`，没有 `b`。

### namespace

默认从当前数据链取值。数据在全局、`localStorage`、`sessionStorage` 或 cookie 里时，写成 `${ns:path}`：

- `window`：全局变量，如 `${window:document[title]}`
- `ls`：`localStorage`；值若是 JSON 可当对象用
- `ss`：`sessionStorage`
- `cookie`：cookies

```schema
type: page
body: "当前页面标题为：${window:document[title]}"
```

## 过滤器

`${xxx | filter1 | filter2}`：先取值，再依次处理。1.5.0 起 Amis 更推荐函数调用，如 `${html(xxx)}`；`|filter` 在公式解析里兼容，Vamis 同样。

P0 已接的过滤器下面都有活示例。Amis 其余过滤器见文末表，仍 P1。

### html

转义成可安全插入的文本（`<` 变成 `&lt;` 等）。Tpl 默认已经对插值做 `|html`。

```schema
type: page
data:
  html: "<div>这是一段<code>html</code></div>"
body:
  type: tpl
  tpl: "html is: ${html|html}"
```

### raw

输出原始文本。Tpl 场景下变量里的标签会当成 HTML 插入。

```schema
type: page
data:
  html: "<div>这是一段<code>html</code></div>"
body:
  type: tpl
  tpl: "html is: ${html|raw}"
```

`raw` 能输出 HTML，动态渲染不可信内容会 XSS。不要渲染用户填写的内容。

### json

`JSON.stringify`。

```schema
type: page
data:
  info:
    name: rick
    company: baidu
body:
  type: tpl
  tpl: "my info is ${info|json}"
```

### date

把时间值格式化。默认输入是 Unix **秒**（`X`），输出 `LLL`（本地化长格式）。

```schema
type: page
data:
  now: 1586865590
body:
  type: tpl
  tpl: "now is ${now|date}"
```

毫秒时间戳要把输入格式改成 `x`：

```schema
type: page
data:
  now: 1586865590000
body:
  type: tpl
  tpl: "毫秒 ${now|date:LLL:x}"
```

指定输出格式：

```schema
type: page
data:
  now: 1586865590
body:
  type: tpl
  tpl: "now is ${now|date:YYYY-MM-DD}"
```

输入本身不是时间戳时，第三个参数写输入格式。过滤器参数里的 `:` 要写成 `\:`：

```schema
type: page
data:
  now: "2020/4/14 19:59:50"
body:
  type: tpl
  tpl: "now is ${now|date:LLL:YYYY/MM/DD HH\\:mm\\:ss}"
```

`datetime` 默认输出 `YYYY-MM-DD HH:mm:ss`。

### number

千分位：

```schema
type: page
data:
  price: 233333333
body:
  type: tpl
  tpl: "price is ${price|number}"
```

### percent

乘 100 加 `%`。第二个参数是小数位，默认 0。

```schema
type: page
data:
  value: 0.8232343
body:
  - type: tpl
    inline: false
    tpl: "value is ${value|percent}"
  - type: tpl
    inline: false
    tpl: "value is ${value|percent:2}"
```

### truncate

超出长度后面加省略号。默认长度 200，省略串 `...`。

```schema
type: page
data:
  text: 这是一段非常长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长的文字
body:
  type: tpl
  tpl: "text is ${text|truncate:10}"
```

### default

空字符串 / `null` / `undefined` 时用后备值。

```schema
type: page
data:
  value: ""
body:
  type: tpl
  tpl: "value is ${value|default:-}"
```

映射结果是 `undefined` 的 key，在 `api.data` 里会被丢掉（`"${name|default:undefined}"`）。

### first

取数组第一项。

```schema
type: page
data:
  array:
    - a
    - b
    - c
body:
  type: tpl
  tpl: "first element is ${array|first}"
```

## 串联使用过滤器

前一个过滤器的输出是下一个的输入：

```schema
type: page
data:
  array:
    - a
    - b
    - c
body:
  type: tpl
  tpl: "${array|first|default:-}"
```

## 自定义过滤器

从 `vamis` 或 `@vamis/formula` 取 `registerFilter`（不要用 `amisRequire`）：

```typescript
import { registerFilter } from 'vamis'

registerFilter('count', (input: string) =>
  typeof input === 'string' ? input.length : 0,
)
```

之后 `${xxx|count}` 返回字符串长度。方法名不要带 `-`，写成 `a_b`。需要参数时：

```typescript
registerFilter('my_replace', (input: string, search: string, replaceWith: string) =>
  typeof input === 'string' ? input.replace(search, replaceWith) : input,
)
```

用法 `${xxxx|my_replace:aaaa:bbbb}`。

## 尚未接入的过滤器（P1）

Amis 数据映射页其余过滤器 Vamis **尚未注册**。公式函数（`LEFT` / `UPPER` / `AVG` 等）请走 [表达式](/concepts/expression) 的函数手册，不要用下面这些 `|filter` 名去替代。

| 过滤器 | 用途 |
|--------|------|
| `toJson` / `toInt` / `toFloat` | 反序列化 / 转数字 |
| `now` / `toDate` / `dateModify` / `fromNow` | 当前时间、改日期、相对时间 |
| `trim` / `round` / `substring` / `lowerCase` / `upperCase` | 字符串 |
| `url_encode` / `url_decode` | URL 编解码 |
| `split` / `join` / `last` / `nth` / `pick` / `unique` / `sortBy` | 数组 |
| `objectToArray` / `asArray` / `topAndOther` | 结构转换 |
| `plus` / `minus` / `times` / `division` / `sum` / `abs` | 算术 |
| `duration` / `bytes` | 时长 / 字节 |
| `base64Encode` / `base64Decode` | Base64 |
| `isTrue` / `isFalse` / `isMatch` / `notMatch` / `isEquals` / `notEquals` | 条件 |
| `map` / `filter` | 数组上再套过滤器 |

P0 已接：`raw` / `html` / `json` / `date` / `datetime` / `number` / `percent` / `default` / `truncate` / `first`。
