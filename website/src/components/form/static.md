---
title: Static 静态展示
outline: deep
---

# Static 静态展示

::: info 实现进度 55% · 进行中
能展示；`popOver`/`quickEdit` 无
:::

`static` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
title: static
body:
  - type: form
    mode: horizontal
    body:
      - type: static
        name: status
        label: 状态
        value: 在线
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

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）和事件对象（D4）尚未落地，高级示例可能与 Amis 官网行为不一致。
