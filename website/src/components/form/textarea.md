---
title: Textarea 多行文本输入框
outline: deep
---

# Textarea 多行文本输入框

::: info 实现进度 85% · 进行中
主路径已对齐：`minRows` / `maxRows` 自适应高度（清空时 0.2s 收缩过渡）、`trimContents`、`readOnly`、`showCounter` / `maxLength`、`clearable` / `resetValue`、`borderMode`、静态 `multiline-text`；`change` / `focus` / `blur`、`clear` / `reset` / `focus` / `setValue`。清空后支持 **Ctrl/⌘+Z** 撤销（Vamis 增强）。缺 `themeCss`。
:::

多行文本输入框。属于普通表单项，通用属性见 [FormItem](./formitem)；Vamis 用 YAML 或 JSON 书写，字段名不改写。JSON 同等有效。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本使用

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: textarea
    name: textarea
    label: 多行文本
```

## 清空输入框

带移除图标的输入框，点击图标删除所有内容：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: textarea
    name: textarea
    label: 多行文本
    clearable: true
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmodtion tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
```

清空时高度按 Amis 的 0.2s 过渡收缩；清空后按 **Ctrl/⌘+Z** 可恢复上一份内容（原生 undo 不认程序化清空，Vamis 额外记录）。

设置 `resetValue`，清空输入框后重置为指定值：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: textarea
    name: textarea
    label: 多行文本
    clearable: true
    resetValue: reset
```

## 显示计数器

配置 `"showCounter": true` 后输入框将显示计数器；配合 `maxLength` 限制输入长度。不设置 `maxLength` 时只看计数、不限制输入：

```schema: scope="body"
type: form
body:
  - type: textarea
    name: a
    label: A
    showCounter: true
    placeholder: 请输入
    clearable: true
  - type: textarea
    name: b
    label: B
    showCounter: true
    maxLength: 30
    placeholder: 请输入
```

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `minRows` | `number` | `3` | 最小行数 |
| `maxRows` | `number` | `20` | 最大行数 |
| `trimContents` | `boolean` | `true` | 失焦时去除首尾空白 |
| `readOnly` | `boolean` | `false` | 是否只读 |
| `showCounter` | `boolean` | `false` | 是否显示计数器 |
| `maxLength` | `number` | | 限制最大字数 |
| `clearable` | `boolean` | `false` | 是否可清除 |
| `resetValue` | `string` | `""` | 清空后的回填值 |
| `borderMode` | `"full" \| "half" \| "none"` | `full` | 边框模式 |
| `placeholder` | `string` | | 占位文案，支持表达式 |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: string` 组件的值 | 值变化时触发 |
| `focus` | `[name]: string` 组件的值 | 获取焦点时触发 |
| `blur` | `[name]: string` 组件的值 | 失去焦点时触发 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | - | 清空 |
| `reset` | - | 重置为初始值，否则用 `resetValue` |
| `focus` | - | 获取焦点 |
| `setValue` | `value: string` 更新的值 | 更新数据 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: textarea
    name: text
    id: clear_text
    label: text
    value: 清空我
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_text
```

### reset

如果配置了 `resetValue`，则重置时使用 `resetValue` 的值，否则使用初始值。

```schema: scope="body"
type: form
debug: true
body:
  - type: textarea
    name: text
    id: reset_text
    label: text
    value: 重置我
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset_text
```

### focus

```schema: scope="body"
type: form
debug: true
body:
  - type: textarea
    name: text
    id: focus_text
    label: text
    value: 聚焦我
  - type: button
    label: 聚焦
    onEvent:
      click:
        actions:
          - actionType: focus
            componentId: focus_text
```

### setValue

```schema: scope="body"
type: form
debug: true
body:
  - type: textarea
    name: text
    id: setvalue_text
    label: text
    value: amis
  - type: button
    label: 赋值
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: setvalue_text
            args:
              value: amis go go go!
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：`clearable` 的清除钮回填 `resetValue`；动作 `clear` 清空为空串；`trimContents` 在失焦时裁剪；静态态用 `multiline-text`（`staticSchema.limit` 控制行数，默认 5）。
- 清空按钮回填 `resetValue`、动作 `clear` 写空串、失焦裁剪、0.2s 高度收缩动画均对齐 Amis。
- **Vamis 增强**：清空后支持 `Ctrl/⌘+Z` 恢复被清掉的内容（重新输入后交还原生 undo）；Amis 的程序化清空会冲掉原生 undo 栈。
- `themeCss` 未接；Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
