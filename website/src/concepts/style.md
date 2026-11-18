---
title: 样式
---

# 样式

::: tip 实现进度 100% · 已完成
已核完样式概念与四条作者通道：`className`、页面 `cssVars`、行内 `style`、运行时 `registerTheme`，并说明覆盖顺序、密度、尺寸和响应式。此进度不代表 `/style` 色盘或全部组件高级样式均已完成。
:::

Vamis 和 Amis 一样：绝大多数观感用 **className 辅助类** 就能调，不必手写 CSS。作者态 **JSON 与 YAML 并列**。

实现上分两层，不要混着用同一串 class 名当「主题默认」：

1. **主题 token**（`--primary`、`--radius`、`--fonts-base-family`、`--control-h`）打在组件默认外观上。主色走 `--primary`；顶栏 6 色点切 **云舍 / 仿 AntD / ang / 翠绿 / 琥珀 / 金色**，整站壳跟当前主色；浅色 / 深色是独立的明暗模式。
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

按钮支持 `className`。`.m-l` 对齐 Amis 的 `margin-left: 15px`；它是作者辅助类，不复用组件内部间距 `--gap-base`（12px）。同一份 schema 在 [SDK 对照页](/sdk/compare.html?case=style-two-buttons-ml) 可量出这条缝。给第二个按钮加上即可：

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

绝大部分组件都支持 `className`（字符串、对象、模板），再搭配 `/style` 里的 helper。对象写法见 [ClassName](/types/classname)。

布局容器和未写 `size` 的表单控件**默认吃满父槽**，不必先写 `w-full` / `size: full`。`className` 只在要覆盖（半宽、间距、状态色）时写。

`className` 落在组件外层的 `div.vamis-node`，适合间距和布局；要改表单项内部输入框，用组件提供的 `inputClassName`，不要靠后代选择器猜内部 DOM。

```schema: scope="body"
type: form
body:
  - type: input-text
    name: account
    label: 账号
    className: m-t-md
    inputClassName: border-danger
    description: 外层 className 增加顶部间距，inputClassName 只改输入框边框
```

不同组件的 `bodyClassName` / `labelClassName` 等区域入口见各自组件文档。

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

## 行内 style

只改一个节点且不形成可复用规则时，可以直接写 `style`。对象支持驼峰 CSS 属性；长度数字会补 `px`，`opacity` / `zIndex` 等无单位属性除外。字符串和 `${}` 模板也可使用。

```schema
type: page
data:
  emphasis: "#CD3632"
body:
  type: tpl
  tpl: 单个节点的行内样式
  style:
    color: "${emphasis}"
    padding: 8
```

行内 `style` 是可信作者配置，不要把未校验的用户输入拼进去。覆盖顺序上，行内样式优先于普通 class；`className` 用于作者覆盖组件默认皮肤；`cssVars` 则改变引用了对应变量的主题默认值。页面 `cssVars` / IR `metadata.style` 只影响自己的子树。

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

## 注册运行时主题

Vue 与 JS SDK 都可以注册一份 token，再用 `env.theme` 选择。请在挂载前注册；IR `metadata.style.cssVars` 的页面级覆盖优先级更高。

```js
import { registerTheme } from 'vamis'

registerTheme('brand-purple', {
  '--primary': '#7266ba',
  '--colors-brand-5': '#7266ba',
  '--primary-onHover': '#8c7cc8'
})
```

```js
vamis.embed('#root', schema, {}, { theme: 'brand-purple' })
```

## 还缺什么

Layout / Flex / Grid / 间距 / 宽高 / 排版（除色）/ 边框半径宽度样式 / 阴影 / 透明度 / 状态前缀已按盒模型对齐，进度写在各 `/style` 页上。`registerTheme` 已接。仍缺：

- 色盘表逐项核对（`text-color` / `background-color` / `border-color`）
- Panel 像素级
- 其余组件的 `xxxClassName`
