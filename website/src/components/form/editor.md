---
title: Editor 代码编辑器
outline: deep
---

# Editor 代码编辑器

::: info 实现进度 78% · 进行中
主路径已接 Monaco：语言 / 表单项 `value` 回填 / `options` / `disabled` / `size`（高度，含 `full`）/ `allowFullscreen` / `hideButtons` / `intellisense` / 占位。文档「编辑 Schema」已换成本组件，YAML/JSON 走 `intellisense: schema`。`editorDidMount` 未接（禁止隐式 `eval`）。组件动作 `clear` / `reset` / `focus` / `setValue` 打到表单项自身仍缺 D7。
:::

用于代码编辑。富文本请用 [RichText](/components/form/input-rich-text)。只读高亮请用 [Code](/components/code)。对齐 Amis 同名 schema；YAML 与 JSON 同等有效。属于侧栏分类 **数据输入**。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: editor
    name: editor
    label: 编辑器
    value: |
      function hello() {
        console.log('hello world')
      }
```

## 占位

无值时 `placeholder` 画在内容区第一行，字体 / 行高跟行号对齐；不是语法高亮，也不是页面浮层的 `text-sm`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: editor
    name: editor
    label: 编辑器
    placeholder: |
      function hello() {
        console.log('hello world')
      }
```

## 支持的语言

`language` 指定高亮语言，默认 `javascript`，支持 `${xxx}`。也可以写成 `json-editor` 这种 `xxx-editor`（含 `js-editor` / `ts-editor`）。

`bat`、`c`、`coffeescript`、`cpp`、`csharp`、`css`、`dockerfile`、`fsharp`、`go`、`handlebars`、`html`、`ini`、`java`、`javascript`、`json`、`less`、`lua`、`markdown`、`msdax`、`objective-c`、`php`、`plaintext`、`postiats`、`powershell`、`pug`、`python`、`r`、`razor`、`ruby`、`sb`、`scss`、`shell`、`sol`、`sql`、`swift`、`typescript`、`vb`、`xml`、`yaml`

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: json-editor
    name: editor
    label: JSON 编辑器
    value: |
      {
        "hello": "vamis"
      }
```

## 只读模式

用 `disabled: true`，不要靠 `options.readOnly`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: json-editor
    name: editor
    disabled: true
    label: JSON 编辑器
    value: |
      {
        "hello": "vamis"
      }
```

## 全屏模式

`allowFullscreen: true` 显示全屏开关。`hideButtons: true` 时不显示。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: editor
    name: editor
    label: 支持全屏
    allowFullscreen: true
```

## 隐藏按钮区

`hideButtons: true` 藏掉编辑器工具按钮（全屏）。若它是表单 body 里**每一项**都开了的配置，默认的提交 / 重置也不画（仍可用 `actions: []` 显式关掉）。文档「编辑 Schema」用的就是这个开关，避免侧栏里再套一层表单按钮。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: editor
    name: editor
    label: 无按钮区
    hideButtons: true
    value: |
      function hello() {
        console.log('hello world')
      }
```

## Schema 代码感知

`intellisense` 控制补全 / 悬停。默认 `true` 走语言自带（JSON 有 worker）。`false` 关掉。`schema` 按 Vamis 组件 schema 识别：`type` 补已注册组件名，常见字段（`body` / `name` / `label` …）可补全。YAML 与 JSON 都有效。文档编辑 Schema 已打开此项。

```schema: scope="body"
type: form
body:
  - type: yaml-editor
    name: schema
    label: Schema
    hideButtons: true
    intellisense: schema
    size: lg
    value: |
      type: page
      body:
        - type: tpl
          tpl: Hello
```

## 属性表

除 [FormItem](/components/form/formitem) 通用配置外：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `language` | `string` | `javascript` | 高亮语言，支持 `${xxx}` |
| `size` | `string` | `md` | 编辑器**高度**：`sm` / `md` / `lg` / `xl` / `xxl` / `full`（吃满父级高度）。不是表单项宽度档 |
| `allowFullscreen` | `boolean` | `false` | 是否显示全屏开关。Amis 源码 defaultProps 为 `true`，文档表为 `false`；Vamis 跟文档，要显式打开 |
| `hideButtons` | `boolean` | `false` | 隐藏按钮区：不画全屏开关；作为表单唯一（或全部）项时也不画默认提交 / 重置 |
| `intellisense` | `boolean \| 'schema'` | `true` | 代码感知。`false` 关闭；`schema` 按 Vamis 组件 schema 补全 YAML / JSON 的 `type` 与字段 |
| `options` | `object` | | 传给 Monaco 的额外项，见 [options 说明](#options-monaco-编辑器配置)。不能用它设 `readOnly` |
| `placeholder` | `string` | | 无值时的占位，跟 Monaco 第一行对齐 |
| `editorTheme` | `string` | | `vs` / `vs-dark`。未写时随文档浅色 / 深色 |

### options（Monaco 编辑器配置）

`options` 原样传给 `monaco.editor.create`，类型是 [`IStandaloneEditorConstructionOptions`](https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html) / [`IEditorOptions`](https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IEditorOptions.html)。后合并；同名键盖掉内置默认。`readOnly` 始终跟 `disabled`，不能在 `options` 里改。

内置默认（对齐 Amis）：

| 参数 | 默认 | 说明 |
|------|------|------|
| `folding` | `true` | 代码折叠 |
| `minimap` | `{ enabled: false }` | 右侧缩略图 |
| `selectOnLineNumbers` | `true` | 点行号选中该行 |
| `scrollBeyondLastLine` | `false` | 最后一行后再滚 |
| `automaticLayout` | `true` | 随容器改尺寸 |
| `fixedOverflowWidgets` | `true` | 感知 / 悬停框 `position: fixed`，挂到带 Monaco 主题的 overflow 宿主 |
| `formatOnType` / `formatOnPaste` | `true` | 输入 / 粘贴时格式化 |

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: editor
    name: editor
    label: 编辑器
    options:
      lineNumbers: off
```

## 事件表

可以用 `onEvent` 监听，再配 `actions`。公式可读 `${字段}`、`${event.data.字段}`。详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: string` | 代码变化 |
| `focus` | `[name]: string` | 获得焦点 |
| `blur` | `[name]: string` | 失去焦点 |

```schema: scope="body"
type: form
debug: true
body:
  - type: editor
    name: editor
    label: 编辑器
    onEvent:
      change:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: "change ${event.data.editor}"
```

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | | **未齐**（D7：表单项未注册 `doAction`） |
| `reset` | | **未齐** |
| `focus` | | **未齐** |
| `setValue` | `value: string` | **未齐**（打到表单 `name` 可以改值，`componentId` 指本编辑器不生效） |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 展示组件是 `code`，编辑器是 `editor`。`code` 不收 `options`。
- 文档「编辑 Schema」用本组件（`yaml-editor` / `json-editor` + `hideButtons` + `intellisense: schema`），不是 textarea。
- `editorDidMount` 未接：Amis 允许函数或字符串 `new Function`；Vamis 禁止隐式 `eval`。
- 动作 `clear` / `reset` / `focus` / 针对本组件的 `setValue` 仍缺 D7。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
