---
title: InputArray 数组输入框
outline: deep
---

# InputArray 数组输入框

::: info 实现进度 50% · 进行中
能增删行；子域/校验未齐
:::

`input-array` 对齐 Amis 同名 schema。Vamis 用 **YAML 1.2 Core** 书写，字段名不改写；UI 走 shadcn-vue token，不使用 `cxd-` 类名。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
title: input-array
body:
  - type: form
    title: input-array
    mode: horizontal
    api: /api/mock2/form/saveForm
    body:
      - type: input-array
        name: input_array
        label: input-array
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `type` | 表单项种类 |
| `name` | 写入表单数据的字段名 |
| `label` | 标签 |
| `value` | 默认值 |
| `required` | 必填 |
| `disabled` / `disabledOn` | 禁用 |
| `visibleOn` / `hiddenOn` | 显隐表达式 |
| `validations` / `validationErrors` | 校验（部分落地） |
| `description` | 说明文案 |

## 和 Amis 文档的差异

- 作者态是 YAML，不是 JSON；字面量遵循 YAML 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）和事件对象（D4）尚未落地，高级示例可能与 Amis 官网行为不一致。
