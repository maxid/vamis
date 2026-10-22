---
title: Code 代码高亮
outline: deep
---

# Code 代码高亮

::: info 实现进度 80% · 进行中
文档主路径已对齐：`language` / `name` / `value`、`tabSize`、`wordWrap`、`maxHeight`、`editorTheme`、`customLang`、`wrapperComponent`。高亮走 highlight.js（Monaco 非本阶段）；Amis 用 monaco `colorize`。
:::

用代码高亮显示一段文本。对齐 Amis 同名 schema；YAML 与 JSON 同等有效。属于侧栏分类 **数据展示**。

## 基本用法

```schema: scope="body"
{
  "type": "code",
  "language": "html",
  "value": "<div>html</div>"
}
```

## 语言设置

默认语言是 `plaintext`。`language` 可指定：

`bat`、`c`、`coffeescript`、`cpp`、`csharp`、`css`、`dockerfile`、`fsharp`、`go`、`handlebars`、`html`、`ini`、`java`、`javascript`、`json`、`less`、`lua`、`markdown`、`objective-c`、`php`、`plaintext`、`powershell`、`python`、`ruby`、`scss`、`shell`、`sql`、`swift`、`typescript`、`vb`、`xml`、`yaml`

```schema: scope="body"
{
  "type": "code",
  "language": "javascript",
  "value": "(function () {\n  let schema = {\n    type: 'page',\n    title: '表单页面',\n    body: {\n      type: 'form',\n      mode: 'horizontal',\n      api: '/saveForm',\n      body: [\n        {\n          label: 'Name',\n          type: 'input-text',\n          name: 'name'\n        },\n        {\n          label: 'Email',\n          type: 'input-email',\n          name: 'email'\n        }\n      ]\n    }\n  };\n  console.log(schema);\n})();"
}
```

`language` 支持从数据域取值：

```schema
{
  "type": "page",
  "data": {
    "lang": "javascript"
  },
  "body": {
    "type": "code",
    "language": "${lang}",
    "value": "function hello() {\n  console.log('vamis');\n}"
  }
}
```

## 动态数据

用 `name` 从当前数据域取值，所以也可以放在表单、CRUD 里展示代码：

```schema
{
  "type": "page",
  "data": {
    "sourcecode": "<div>html</div>"
  },
  "body": {
    "type": "code",
    "language": "html",
    "name": "sourcecode"
  }
}
```

## 主题及 tab 大小

`editorTheme` 设主题（`vs` / `vs-dark`），`tabSize` 设 tab 宽度（默认 4）。未写 `editorTheme` 时随文档浅色 / 深色走。

```schema: scope="body"
{
  "type": "code",
  "language": "javascript",
  "tabSize": 4,
  "value": "function hello() {\n\tconsole.log('vamis');\n}"
}
```

## 超出换行

`wordWrap` 控制是否折行，默认折行。

```schema: scope="body"
{
  "type": "code",
  "language": "typescript",
  "tabSize": 4,
  "wordWrap": false,
  "value": "function hello() {\n\tconsole.log('vamis')\tconsole.log('vamis')\tconsole.log('vamis')\tconsole.log('vamis')\tconsole.log('vamis')\tconsole.log('vamis');\n}"
}
```

## 最大高度

`maxHeight` 限制高度，超出滚动。

```schema: scope="body"
{
  "type": "code",
  "language": "javascript",
  "className": "border",
  "maxHeight": 200,
  "value": "(function () {\n  let schema = {\n    type: 'page',\n    title: '表单页面',\n    body: {\n      type: 'form',\n      mode: 'horizontal',\n      api: '/saveForm',\n      body: [\n        {\n          label: 'Name',\n          type: 'input-text',\n          name: 'name'\n        },\n        {\n          label: 'Email',\n          type: 'input-email',\n          name: 'email'\n        }\n      ]\n    }\n  };\n  console.log(schema);\n})();"
}
```

## 自定义语言高亮

`customLang.tokens` 按顺序匹配当前剩余文本（对齐 Amis monarch 第一命中）：

- `name`：词法名称
- `regex`：正则。写在字符串里时 `\` 要写成 `\\`
- `regexFlags`：可选
- `color`：颜色
- `fontStyle`：可选，如 `bold`

```schema
{
  "type": "page",
  "body": {
    "type": "code",
    "customLang": {
      "name": "myLog",
      "tokens": [
        {
          "name": "custom-error",
          "regex": "\\[error.*",
          "color": "#ff0000",
          "fontStyle": "bold"
        },
        {
          "name": "custom-notice",
          "regex": "\\[notice.*",
          "color": "#FFA500"
        },
        {
          "name": "custom-info",
          "regex": "\\[info.*",
          "color": "#808080"
        },
        {
          "name": "custom-date",
          "regex": "\\[[a-zA-Z 0-9:]+\\]",
          "color": "#008800"
        }
      ]
    },
    "value": "[Sun Mar 7 16:02:00 2021] [notice] Apache/1.3.29 (Unix) configured -- resuming normal operations\n[Sun Mar 7 16:02:00 2021] [info] Server built: Feb 27 2021 13:56:37\n[Sun Mar 7 16:02:00 2021] [notice] Accept mutex: sysvsem (Default: sysvsem)\n[Sun Mar 7 17:21:44 2021] [info] [client xx.xx.xx.xx] (104)Connection reset by peer: client stopped connection\n[Sun Mar 7 17:23:53 2021] statistics: Use of uninitialized value in concatenation (.) or string at /home/httpd line 528.\n[Sun Mar 7 17:27:37 2021] [error] [client xx.xx.xx.xx] File does not exist: /home/httpd/twiki/view/Main/WebHome"
  }
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `className` | `string` | | 外层 CSS 类名 |
| `value` | `string` | | 要显示的代码 |
| `name` | `string` | | 从数据域取代码 |
| `language` | `string` | `plaintext` | 高亮语言，支持 `${lang}` |
| `tabSize` | `number` | `4` | tab 宽度 |
| `editorTheme` | `string` | `vs` | `vs` / `vs-dark`。未写时随文档浅色 / 深色 |
| `wordWrap` | `boolean` | `true` | 是否折行 |
| `maxHeight` | `string` \| `number` | | 最大高度，超出滚动 |
| `customLang` | `object` | | 自定义词法 |
| `wrapperComponent` | `string` | 多行 `pre`，单行 `code` | 只认 `pre` / `code` / `div` / `span` |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 高亮引擎是 highlight.js，不是 monaco-editor（Monaco 非本阶段）。内置语言列表以 highlight.js 为准；`msdax` / `postiats` / `pug` / `r` / `razor` / `sb` / `sol` 会按纯文本显示。
- Amis 文档「主题及 tab」示例把字段写成 `tagSize`，源码与属性表是 `tabSize`。Vamis 只认 `tabSize`。
- `className: b-a` 边框 helper 未接，示例改用 `border`。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
