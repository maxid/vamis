---
title: InputPassword 密码输入框
outline: deep
---

# InputPassword 密码输入框

::: info 实现进度 90% · 进行中
`input-text` 别名。主路径已对齐：默认 `revealPassword` 显隐钮、`revealPassword: false` 关掉。事件 / 动作与输入框相同。缺 `themeCss`。
:::

`input-password` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。同渲染器见 [输入框](./input-text)。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-password
    name: password
    label: 密码
```

## 配置密码显/隐藏

`revealPassword` 可以设置是否展示密码显/隐按钮，默认为 `true`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-password
    name: password
    label: 密码
    revealPassword: false
```

## 属性表

请参考[输入框](./input-text)。

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| revealPassword | `boolean` | `true` | 是否展示密码显/隐按钮 |

## 事件表

请参考[输入框](./input-text)。点显隐钮会派发 `review`（切到明文）/ `encrypt`（切回密文）；动作被 `prevented` 时不切换。

## 动作表

请参考[输入框](./input-text)。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `review` / `encrypt` 对齐 Amis 源码，Amis 文档页未列这两条。
- 焦点环走 token `box-shadow`，不搬 `.cxd-TextControl`。
