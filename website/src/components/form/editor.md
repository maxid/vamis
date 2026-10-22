---
title: Editor 代码编辑器
outline: deep
---

# Editor 代码编辑器

::: info 实现进度 85% · 进行中
主路径已接 Monaco：语言 / 表单项 `value` 回填 / `options` / `disabled` / `size`（高度，含 `full`）/ `allowFullscreen` / `hideButtons` / `intellisense: schema`（`registerRenderer` 自述即感知；按组件树定位 type，同名属性/事件/动作不再串文档）。文档「编辑 Schema」只消费该能力。`editorDidMount` 未接（禁止隐式 `eval`）。组件动作 `clear` / `reset` / `focus` / `setValue` 打到表单项自身仍缺 D7。
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

`intellisense` 控制补全 / 悬停。默认 `true` 走语言自带（JSON 有 worker）。`false` 关掉。

`schema` 是 **包内能力**，不是文档站点特有。实现对齐 monaco-editor 的 JSON Schema 树（`$defs` + `if/then` 按 `type` 分支）：先定位光标所在组件节点，再用**该 type** 的属性 / 事件 / 动作说明。同名键（如 `size`、`options`、`change`、`setValue`）不会串到别的组件。

感知目录来自 **组件自述**：`registerRenderer({ name, description, schema, isFormItem, alias })` 注册即补全 / 悬停。`isFormItem: true` 自动带上表单项通用字段；`alias` 共用同一套说明。已注册的布局 / 表单 / 展示 / 反馈组件都有各自的属性、事件、动作说明（同名 `size` / `options` 按当前节点 type 分支）。低码应用自定义 type 把字段写在 `schema` 即可。

目录查询在 `@vamis/core`（`catalogFor(type)`），Monaco 挂载在 `vamis` 的 `registerSchemaIntellisense`。两种用法：

1. schema 写 `intellisense: schema`（`yaml-editor` / `json-editor` 或 `language: yaml|json`），Editor 自动挂上。
2. 自管 Monaco 时 `import { registerSchemaIntellisense } from 'vamis'`，对 yaml/json 模型调用一次。

仍可用 `registerSchemaTypeDoc` / `registerSchemaFieldDoc` 事后补一条。不要把网站 Markdown 当目录源。YAML 与 JSON 都有效。

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
| `intellisense` | `boolean \| 'schema'` | `true` | 代码感知。`false` 关闭；`schema` 按组件树定位封装节点的 `type`，再补全该组件的字段 / 事件 / 动作 |
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
- 文档「编辑 Schema」用本组件（`yaml-editor` / `json-editor` + `hideButtons` + `intellisense: schema`），不是 textarea。感知来自 `registerRenderer` 自述，站点只消费。
- `editorDidMount` 未接：Amis 允许函数或字符串 `new Function`；Vamis 禁止隐式 `eval`。
- 动作 `clear` / `reset` / `focus` / 针对本组件的 `setValue` 仍缺 D7。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
