---
title: ButtonGroup 按钮组
outline: deep
---

# ButtonGroup 按钮组

::: info 实现进度 85% · 进行中
文档主路径已对齐：`buttons` / `body`、`vertical`、`tiled`、`btnLevel`（按钮自己的 `level` 优先）。缺 `btnActiveLevel`（点选用）、按钮圆角拼接像素级。
:::

把多个按钮组合展示。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。按钮保持内容宽度；`tiled` 时才拉满一行。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

对照不跑 dialog / url 活示例：

```yaml
type: button-group
buttons:
  - type: button
    label: Button
    actionType: dialog
    dialog:
      confirmMode: false
      title: 提示
      body: 对，你刚点击了！
  - type: button
    actionType: url
    url: https://www.baidu.com
    blank: true
    label: 百度一下
  - type: button
    label: 普通按钮
```

活示例只用普通按钮：

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面是按钮组。"
}
```

```schema: scope="body"
{
  "type": "button-group",
  "buttons": [
    { "type": "button", "label": "按钮甲" },
    { "type": "button", "label": "按钮乙" },
    { "type": "button", "label": "普通按钮" }
  ]
}
```

```schema: scope="body"
type: button-group
buttons:
  - type: button
    label: 按钮甲 YAML
  - type: button
    label: 按钮乙 YAML
  - type: button
    label: 普通按钮 YAML
```

## 垂直模式

配置 `vertical: true`：

```schema: scope="body"
{
  "type": "button-group",
  "vertical": true,
  "buttons": [
    { "type": "button", "label": "按钮1" },
    { "type": "button", "label": "按钮2" },
    { "type": "button", "label": "按钮3" }
  ]
}
```

## 平铺模式

配置 `tiled: true`：

```schema: scope="body"
{
  "type": "button-group",
  "tiled": true,
  "buttons": [
    { "type": "button", "label": "平铺1" },
    { "type": "button", "label": "平铺2" },
    { "type": "button", "label": "平铺3" }
  ]
}
```

## 按钮主题样式

`btnLevel` 统一设置按钮主题；`buttons` 里的 `level` 优先。`btnActiveLevel` 给点选激活态用，普通按钮组不切换选中。

```schema: scope="body"
{
  "type": "button-group",
  "btnLevel": "light",
  "buttons": [
    { "type": "button", "label": "浅色1" },
    { "type": "button", "label": "浅色2" },
    { "type": "button", "label": "覆盖", "level": "primary" }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"button-group"` | 指定为 button-group 渲染器 |
| vertical | `boolean` | `false` | 垂直模式 |
| tiled | `boolean` | `false` | 平铺模式 |
| btnLevel | `string` | `"default"` | 统一按钮样式 |
| btnActiveLevel | `string` | `"default"` | 选中样式（点选） |
| buttons | `Array<Action>` | | [按钮](/components/action) |
| body | 同 buttons | | 兼容写法 |
| className | `string` | | 打在宿主 `div.vamis-node` |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未做 cxd 按钮组负边距拼缝与圆角裁切；`btnActiveLevel` 留给 [ButtonGroupSelect](/components/form/button-group-select)。
