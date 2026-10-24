---
title: 样式
---

# 样式

::: info 实现进度 75% · 进行中
文档主路径已对齐 Amis「样式」基本使用：`className` helper、`cssVars`、密度、FormItem `size`、默认自适应、指向 `/style` 辅助类。JSON 与 YAML 同等有效。色盘表、Panel 像素级、`registerTheme` 仍是 D12。
:::

Vamis 和 Amis 一样：绝大多数观感用 **className 辅助类** 就能调，不必手写 CSS。作者态 **JSON 与 YAML 并列**。

实现上分两层，不要混着用同一串 class 名当「主题默认」：

1. **主题 token**（`--primary`、`--radius`、`--fonts-base-family`、`--control-h`）打在组件默认外观上。主色走 `--primary`；顶栏 5 色是云舍蓝 / 翠绿 / 琥珀 / 青空 / 玫红，云舍蓝是默认色点。
2. **辅助 class** 写在节点的 `className` 上，落在 `div.vamis-node`。间距、宽高、布局、颜色、圆角、阴影与 Amis `/style` **同一 class、同一元素、同一属性、同一计算值**。不搬 `.cxd-` 前缀。

完整辅助类目录在顶栏 [样式](/style/)。本页只讲 schema 里怎么用。

## 基本使用

两个按钮默认会挨在一起（同一份 schema 用 JS SDK 对照 Amis：[/sdk/compare.html](/sdk/compare.html)，页内可 YAML / JSON 编辑）：

```schema: scope="body"
- type: button
  label: 按钮1
  actionType: dialog
  dialog:
    title: 弹框
    body: Hello World!
- type: button
  label: 按钮2
  actionType: dialog
  dialog:
    title: 弹框
    body: Hello World!
```

按钮支持 `className`。Amis `.m-l` 是硬编码 `margin-left: 15px`。Vamis 目前走 `var(--gap-base)`（12px），同一份 schema 在 [SDK 对照页](/sdk/compare.html?case=style-two-buttons-ml) 能量出这条差。给第二个按钮加上就能拉开缝：

```schema: scope="body"
- type: button
  label: 按钮1
  actionType: dialog
  dialog:
    title: 弹框
    body: Hello World!
- type: button
  label: 按钮2
  className: m-l
  actionType: dialog
  dialog:
    title: 弹框
    body: Hello World!
```

同一份 JSON 也有效：

```schema: scope="body"
[
  {
    "type": "button",
    "label": "按钮1",
    "actionType": "dialog",
    "dialog": { "title": "弹框", "body": "Hello World!" }
  },
  {
    "type": "button",
    "label": "按钮2",
    "className": "m-l",
    "actionType": "dialog",
    "dialog": { "title": "弹框", "body": "Hello World!" }
  }
]
```

绝大部分组件都支持 `className`（字符串、对象、模板），再搭配 `/style` 里的 helper。对象写法见 [ClassName](/types/classname)。

布局容器和未写 `size` 的表单控件**默认吃满父槽**，不必先写 `w-full` / `size: full`。`className` 只在要覆盖（半宽、间距、状态色）时写。

## CSS 变量

`page.cssVars` 改这一页的 token。Amis 盒子名会映射到 Vamis（`--Form-input-height` → `--control-h`）。对照见 [CSS 变量](/style/css-vars)。

```schema
type: page
cssVars:
  --primary: "#CD3632"
body:
  - type: button
    label: 被 cssVars 染色
    level: primary
  - type: form
    body:
      - type: input-text
        name: text
        label: 文本
```

IR 信封也可以带样式，不改 `spec` 里的 widget 树：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage
metadata:
  name: themed
  style:
    cssVars:
      --primary: "#1d4ed8"
    density: compact
spec:
  type: page
  body:
    - type: tpl
      tpl: metadata.style 会合并进 page
```

## 密度

`data-density="compact|comfortable"` 默认跟页面 html。IR `metadata.style.density` 或根节点可以覆盖这一棵树。compact 更接近 Amis 后台的信息密度。

## 表单项宽度

未写 `size` 时控件随容器伸缩。`size: xs|sm|md|lg` 才钉 `--form-control-width-*`（≥576px，且 `max-width: 100%`）。`size: full` 与默认铺满同效果，留给 inline / 多列剩余。

```schema: scope="body"
type: form
mode: horizontal
body:
  - type: input-text
    name: a
    label: 默认（吃满）
  - type: input-text
    name: b
    label: sm
    size: sm
  - type: input-text
    name: c
    label: lg
    size: lg
```

## 状态与响应式

Amis helper 的状态前缀和设备前缀 Vamis 同样认。`hover:` 见 [辅助类-状态样式](/style/state)；`m:`（&lt;768px）/ `pc:`（≥768px）见 [辅助类-响应式设计](/style/responsive-design)。

```schema: scope="body"
type: tpl
className: p-4 rounded bg-pink-500 text-white shadow hover:bg-pink-600
tpl: hover 时背景会加深
```

圆角档位与主题 token 不是同一件事：组件默认用 `rounded`（4px = `--radius`）；作者写 `className: rounded-md` 才是 Amis helper 的 6px。不要把 helper 类名填进 shadcn 原语当默认皮肤。

## 还缺什么

Layout / Flex / Grid / 间距 / 宽高 / 排版（除色）/ 边框半径宽度样式 / 阴影 / 透明度 / 状态前缀已按盒模型对齐，进度写在各 `/style` 页上。仍缺：

- 色盘表逐项核对（`text-color` / `background-color` / `border-color`）
- Panel 像素级
- 其余组件的 `xxxClassName`
- `registerTheme` 运行时换肤
