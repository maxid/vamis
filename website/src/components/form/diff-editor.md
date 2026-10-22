---
title: DiffEditor 对比编辑器
outline: deep
---

# DiffEditor 对比编辑器

::: info 实现进度 65% · 进行中
主路径已接 Monaco Diff：左侧 `diffValue`（只读，支持模板），右侧绑 `name`。`disabled` 只关右侧。`change` / `focus` / `blur` 已发。`options` 可传。组件动作仍缺 D7。
:::

左右对比编辑。左侧始终只读，右侧写入表单。对齐 Amis 同名 schema；YAML 与 JSON 同等有效。属于侧栏分类 **数据输入**。Monaco 参数与 [Editor options](/components/form/editor#options-monaco-编辑器配置) 相同。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: diff-editor
    name: diff
    label: Diff-Editor
    diffValue: hello world
    value: hello
```

## 禁用编辑器

左侧始终不可编辑。右侧用 `disabled` / `disabledOn`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: diff-editor
    name: diff
    label: Diff-Editor
    diffValue: hello world
    value: hello
    disabledOn: this.isDisabled
  - type: switch
    name: isDisabled
    label: 是否禁用
```

## 数据域中的两个变量

左侧 `"diffValue": "${value1}"`，右侧 `"name": "value2"`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
data:
  value1: hello world
  value2: hello wrold
body:
  - type: diff-editor
    name: value2
    label: Diff-Editor
    diffValue: "${value1}"
```

## 属性表

除 [FormItem](/components/form/formitem) 通用配置外：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `language` | `string` | `javascript` | 高亮语言，见 [Editor 支持的语言](/components/form/editor#支持的语言) |
| `diffValue` | 模板 / `string` | | 左侧值 |
| `options` | `object` | | 传给 Monaco Diff，见 [Editor options](/components/form/editor#options-monaco-编辑器配置) |
| `size` | `string` | `md` | 高度档，同 Editor |
| `editorTheme` | `string` | | `vs` / `vs-dark`。未写时随文档浅色 / 深色 |

## 事件表

可以用 `onEvent` 监听，再配 `actions`。公式可读 `${字段}`、`${event.data.字段}`。详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: string` | 右侧代码变化 |
| `focus` | `[name]: string` | 右侧获得焦点 |
| `blur` | `[name]: string` | 右侧失去焦点 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | | **未齐**（D7） |
| `reset` | | **未齐** |
| `focus` | | **未齐**（应对准右侧） |
| `setValue` | `value: string` | **未齐**（应更新右侧） |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON。
- 走 monaco `createDiffEditor`，不再是左右 textarea。
- 组件动作仍缺 D7。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
