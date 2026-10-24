---
title: DropDownButton 下拉按钮
outline: deep
---

# DropDownButton 下拉按钮

::: info 实现进度 80% · 进行中
文档主路径已对齐：`buttons` / `body`、分组 `children`、`closeOnClick` / `closeOnOutside`、`trigger: hover`、`hideCaret` / `iconOnly`、`defaultIsOpened`、`align`。缺 `popOverContainerSelector`、菜单进出动画。
:::

点击（或悬停）展开更多按钮。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。按钮保持内容宽度。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

对照时菜单默认收起（Amis 弹出层不在根节点里，打开会对不齐树结点）。对照不跑 dialog。三角用图标，不进按钮文本，这样对照能按 `label` 定位。

```schema: scope="body"
type: dropdown-button
label: 下拉菜单
buttons:
  - label: 按钮1
    disabled: true
  - label: 按钮2
  - label: 按钮3
```

## 分组展示模式

`buttons[].children` 做分组。`visible: false` 的项不出现。

```schema: scope="body"
{
  "type": "dropdown-button",
  "label": "分组菜单",
  "buttons": [
    {
      "label": "RD",
      "children": [
        { "label": "前端FE" },
        { "label": "后端RD" }
      ]
    },
    {
      "label": "QA",
      "children": [
        { "label": "测试QA" },
        { "type": "divider" }
      ]
    }
  ]
}
```

## 关闭下拉菜单

`closeOnClick: true` 点菜单项后收起。`closeOnOutside` 默认 true。

```schema: scope="body"
{
  "type": "dropdown-button",
  "label": "下拉菜单",
  "closeOnClick": true,
  "closeOnOutside": true,
  "buttons": [
    { "label": "按钮1", "disabled": true },
    { "label": "按钮2" },
    { "label": "按钮3" }
  ]
}
```

## 触发方式

默认 click。`trigger: hover` 悬停展开。对照不跑 toast：

```yaml
type: dropdown-button
label: 悬停下拉
trigger: hover
onEvent:
  mouseenter:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: mouseenter
buttons:
  - type: button
    label: 按钮1
```

## 只显示图标

`hideCaret` 藏三角。`icon` 含 `/` 当图片；fa 字体未接。`tooltip` 目前落到原生 `title`。

```schema: scope="body"
{
  "type": "dropdown-button",
  "label": "更多",
  "hideCaret": true,
  "tooltip": "提示",
  "buttons": [
    { "label": "按钮1" },
    { "label": "按钮2" }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `dropdown-button` | 类型 |
| label | `string` | | 按钮文本 |
| buttons | `Array` | | 下拉项；可含 `children` 分组 |
| block | `boolean` | | 块状 |
| size | `string` | | xs / sm / md / lg |
| align | `left` / `right` | `left` | 菜单对齐 |
| defaultIsOpened | `boolean` | | 默认展开 |
| closeOnOutside | `boolean` | `true` | 点外侧收起 |
| closeOnClick | `boolean` | `false` | 点项收起 |
| trigger | `click` / `hover` | `click` | 触发方式 |
| hideCaret | `boolean` | `false` | 隐藏下拉三角 |
| iconOnly | `boolean` | | 只显示 icon |
| icon / rightIcon | `string` | | 含 `/` 当图片 |

## 事件表

| 事件名称 | 说明 |
|----------|------|
| mouseenter | hover 模式下移入。宿主也会派一次 |
| mouseleave | hover 模式下移出 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 `popOverContainerSelector`、菜单进出动画、fontawesome。
