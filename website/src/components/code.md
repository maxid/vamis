---
title: Code 代码高亮
outline: deep
---

# Code 代码高亮

::: info 实现进度 92% · 进行中
文档主路径已对齐。展示用只读 Monaco 编辑器；行号 / 折叠 / 感知默认关，`wordWrap` 默认开。多行 `value` 用 YAML `|`。`customLang` monarch 挂在 inherit 共享主题上，滚动回来高亮不会被 `setTheme` 冲掉。表单 `editor` / `diff-editor` 仍待接同一实例。
:::

用代码高亮显示一段文本。对齐 Amis 同名 schema；YAML 与 JSON 同等有效。属于侧栏分类 **数据展示**。

## 基本用法

```schema: scope="body"
type: code
language: html
value: "<div>html</div>"
```

## 语言设置

默认语言是 `plaintext`。`language` 可指定：

`bat`、`c`、`coffeescript`、`cpp`、`csharp`、`css`、`dockerfile`、`fsharp`、`go`、`handlebars`、`html`、`ini`、`java`、`javascript`、`json`、`less`、`lua`、`markdown`、`objective-c`、`php`、`plaintext`、`powershell`、`python`、`ruby`、`scss`、`shell`、`sql`、`swift`、`typescript`、`vb`、`xml`、`yaml`

多行 `value` 用 YAML `|` 块标量（JSON 里仍写 `\n`，同等有效）：

```schema: scope="body"
type: code
language: javascript
value: |
  (function () {
    let schema = {
      type: 'page',
      title: '表单页面',
      body: {
        type: 'form',
        mode: 'horizontal',
        api: '/saveForm',
        body: [
          {
            label: 'Name',
            type: 'input-text',
            name: 'name'
          },
          {
            label: 'Email',
            type: 'input-email',
            name: 'email'
          }
        ]
      }
    };
    console.log(schema);
  })();
```

`language` 支持从数据域取值：

```schema
type: page
data:
  lang: javascript
body:
  type: code
  language: "${lang}"
  value: |
    function hello() {
      console.log('vamis');
    }
```

## 动态数据

用 `name` 从当前数据域取值，所以也可以放在表单、CRUD 里展示代码：

```schema
type: page
data:
  sourcecode: "<div>html</div>"
body:
  type: code
  language: html
  name: sourcecode
```

## 主题及 tab 大小

`editorTheme` 设主题（`vs` / `vs-dark`），`tabSize` 设 tab 宽度（默认 4）。未写 `editorTheme` 时随文档浅色 / 深色走。

```schema: scope="body"
type: code
language: javascript
tabSize: 4
value: |
  function hello() {
  	console.log('vamis');
  }
```

## 超出换行

`wordWrap` 控制是否折行，默认折行。

```schema: scope="body"
type: code
language: typescript
tabSize: 4
wordWrap: false
value: |
  function hello() {
  	console.log('vamis')	console.log('vamis')	console.log('vamis')	console.log('vamis')	console.log('vamis')	console.log('vamis');
  }
```

## 最大高度

`maxHeight` 限制高度，超出滚动。

```schema: scope="body"
type: code
language: javascript
className: border
maxHeight: 200
value: |
  (function () {
    let schema = {
      type: 'page',
      title: '表单页面',
      body: {
        type: 'form',
        mode: 'horizontal',
        api: '/saveForm',
        body: [
          {
            label: 'Name',
            type: 'input-text',
            name: 'name'
          },
          {
            label: 'Email',
            type: 'input-email',
            name: 'email'
          }
        ]
      }
    };
    console.log(schema);
  })();
```

## 自定义语言高亮

`customLang.tokens` 按顺序匹配当前剩余文本（对齐 Amis monarch 第一命中）：

- `name`：词法名称
- `regex`：正则。写在字符串里时 `\` 要写成 `\\`
- `regexFlags`：可选
- `color`：颜色
- `fontStyle`：可选，如 `bold`

```schema
type: page
body:
  type: code
  customLang:
    name: myLog
    tokens:
      - name: custom-error
        regex: "\\[error.*"
        color: "#ff0000"
        fontStyle: bold
      - name: custom-notice
        regex: "\\[notice.*"
        color: "#FFA500"
      - name: custom-info
        regex: "\\[info.*"
        color: "#808080"
      - name: custom-date
        regex: "\\[[a-zA-Z 0-9:]+\\]"
        color: "#008800"
  value: |
    [Sun Mar 7 16:02:00 2021] [notice] Apache/1.3.29 (Unix) configured -- resuming normal operations
    [Sun Mar 7 16:02:00 2021] [info] Server built: Feb 27 2021 13:56:37
    [Sun Mar 7 16:02:00 2021] [notice] Accept mutex: sysvsem (Default: sysvsem)
    [Sun Mar 7 17:21:44 2021] [info] [client xx.xx.xx.xx] (104)Connection reset by peer: client stopped connection
    [Sun Mar 7 17:23:53 2021] statistics: Use of uninitialized value in concatenation (.) or string at /home/httpd line 528.
    [Sun Mar 7 17:27:37 2021] [error] [client xx.xx.xx.xx] File does not exist: /home/httpd/twiki/view/Main/WebHome
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `className` | `string` | | 外层 CSS 类名 |
| `value` | `string` | | 要显示的代码。YAML 多行走块标量 `value: \|` |
| `name` | `string` | | 从数据域取代码 |
| `language` | `string` | `plaintext` | 高亮语言，支持 `${lang}` |
| `tabSize` | `number` | `4` | tab 宽度 |
| `editorTheme` | `string` | `vs` | `vs` / `vs-dark`。未写时随文档浅色 / 深色 |
| `wordWrap` | `boolean` | `true` | 是否折行。`false` 时长行横向滚动 |
| `maxHeight` | `string` \| `number` | | 最大高度，超出滚动 |
| `lineNumbers` | `boolean` \| `'on'` \| `'off'` \| `'relative'` | `off` | 行号，默认关 |
| `folding` | `boolean` | `false` | 代码折叠，默认关 |
| `options` | `object` | | 传给 `monaco.editor.create` 的额外项。悬停 / 补全等感知默认关，在此打开 |
| `customLang` | `object` | | 自定义词法 |
| `wrapperComponent` | `string` | | 展示壳已是编辑器容器，本字段忽略 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。多行 `value` 用 `|`；从 JSON 同步过来时 `stringifyYaml` 也会写成块标量。
- Amis `code` 只用 `colorize` 出 HTML。Vamis 用只读 `monaco.editor.create`。行号、折叠、悬停与补全默认关（`lineNumbers` / `folding` / `options` 可打开）。
- `customLang` 的 token 规则 inherit 进共享 `vs` / `vs-dark`，不再 `defineTheme(inherit: false)`，避免滚动后其它块高亮被冲掉。
- Amis 文档「主题及 tab」示例把字段写成 `tagSize`，源码与属性表是 `tabSize`。Vamis 只认 `tabSize`。
- `className: b-a` 边框 helper 未接，示例改用 `border`。
- 表单 `editor` / `diff-editor` 仍是 textarea。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
