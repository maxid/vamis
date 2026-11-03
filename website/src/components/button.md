---
title: Button 按钮
outline: deep
---

# Button 按钮

::: info 实现进度 94% · 进行中
`button` 是 `action` 的别名，同一渲染器。文档主路径已对齐：`level` / `primary`、`size`、`block`、`loading` / `loadingOn`、`tooltip` / `disabledTip` / `tooltipPlacement`。按钮 `secondary` / `dark` / `light` 与尺寸阶梯已按 cxd 像素转写。复杂行为见 [Action 行为按钮](/components/action)。
:::

`button` 实际上是 `action` 的别名，更多用法见 [Action](/components/action)。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。按钮保持内容宽度，不要写成 `w-full` 才像按钮。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

```schema: scope="body"
label: 弹个框
type: button
actionType: dialog
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

JSON 同等有效，切格式走「编辑 Schema」。

## 尺寸与主题

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 默认尺寸
  - type: button
    label: 小
    size: sm
  - type: button
    label: 主要
    level: primary
  - type: button
    label: 危险
    level: danger
```

`block: true` 把按钮拉满父宽：

```schema: scope="body"
type: button
label: 按钮页块级
level: primary
block: true
```

`loading: true` 显示转圈，表达式用 `loadingOn`：

```schema: scope="body"
type: button
label: 按钮页加载
level: primary
loading: true
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| className | `string` | | 指定添加 button 类名 |
| url | `string` | | 点击跳转，行为与 a 链接一致 |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | | 按钮大小 |
| actionType | `string` | `button` | 见 [Action](/components/action) |
| level | `string` | `default` | 按钮样式 |
| tooltip | `string` / 对象 | | 悬停提示 |
| tooltipPlacement | `string` | `top` | 提示位置 |
| disabled | `boolean` | `false` | 失效 |
| disabledTip | `string` / 对象 | | 失效时的提示 |
| block | `boolean` | `false` | 拉满父宽 |
| loading | `boolean` | `false` | 显示 loading |
| loadingOn | `string` | | loading 表达式 |

完整字段、事件、动作出 [Action](/components/action)。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 与 Action 同一渲染器；未接项见 Action 页。
