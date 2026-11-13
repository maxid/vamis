---
title: Formula 公式
outline: deep
---

# Formula 公式

::: info 实现进度 65% · 进行中
`formula` 表达式求值并写回 `name` 字段、`initSet` 初始化应用、`autoSet` 自动监听字段变化、`condition` 条件应用、`id` + 按钮 `target` 手动应用。缺表达式层与 Formula 编辑器（input-formula）统一（D2）。
:::

公式表单项：按表达式计算结果写回表单字段。属于普通表单项，通用属性见 [FormItem](./formitem)。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

公式字段本身隐藏，把结果写到指定表单项。

```schema: scope="body"
type: form
body:
  - type: input-number
    name: a
    label: A
  - type: input-number
    name: b
    label: B
  - type: input-number
    name: sum
    label: 和
    disabled: true
    description: 自动计算 A + B
  - type: formula
    name: sum
    value: 0
    formula: "a + b"
```

## 自动应用

默认 `autoSet: true`，依赖字段变化时重算；`initSet` 默认 true，挂载即应用一次。

```schema: scope="body"
type: form
body:
  - type: input-number
    name: a
    label: A
  - type: input-number
    name: b
    label: B
  - type: input-number
    name: sum
    label: 和
    disabled: true
    description: 自动计算 A + B
  - type: formula
    name: sum
    value: 0
    formula: "a + b"
```

## 手动应用

`autoSet: false` + `initSet: false`，用按钮 `target` 指向 formula 的 `id` 触发：

```schema: scope="body"
type: form
body:
  - type: input-number
    name: a
    label: A
  - type: input-number
    name: b
    label: B
  - type: input-number
    name: sum
    label: 和
    disabled: true
  - type: formula
    name: sum
    id: theFormula
    value: 0
    formula: "a + b"
    autoSet: false
    initSet: false
  - type: button
    label: 计算
    target: theFormula
```

## 条件应用

`condition` 命中才应用；可写 tpl 依赖字段或表达式：

```schema: scope="body"
type: form
body:
  - type: radios
    name: radios
    label: radios
    options:
      - label: a
        value: a
      - label: b
        value: b
  - type: input-text
    name: b
    label: B
  - type: formula
    name: b
    formula: "''"
    condition: "${radios}"
    initSet: false
```

## 使用新表达式语法

`${...}` 模板可直接拼接字符串；不带 `${}` 的表达式走公式引擎：

```yaml
type: form
body:
  - type: input-text
    name: name
    label: 名称
    value: amis
  - type: input-text
    name: greet
    label: 问候
    disabled: true
  - type: formula
    name: greet
    formula: "你好，${name}"
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `name` | `string` | | 写回的表单字段 |
| `formula` | `string` | | 表达式 / 模板 |
| `value` | `any` | | 初始显示值 |
| `initSet` | `boolean` | `true` | 挂载时应用一次 |
| `autoSet` | `boolean` | `true` | 监听依赖字段自动应用 |
| `condition` | `string` | | 条件表达式 / tpl |
| `id` | `string` | | 手动 target 的组件 id |

## 和 Amis 文档的差异

- 与 Amis 一致：`formula` / `value`、`initSet`、`autoSet`、`condition`、`id` + `target` 手动应用。
- 未接：`input-formula` 可视化公式编辑器、表达式层与 D2 完全统一、`formula` 的 `evalMode` 细节。
