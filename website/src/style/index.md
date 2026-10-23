---
title: 快速开始
---

# 快速开始

::: warning 实现进度 45% · 进行中
表单面板默认标题「表单」、只画提交、标题栏灰底，已对齐 Amis `/style` 活示例。调色盘 helper 进了 SDK。后续 helper 页按计算样式/盒模型对标（同一 class、同一元素、同一属性），不是截图近似。仍缺 hover/focus 全矩阵、`registerTheme`、其余组件 `xxxClassName`。
:::

Vamis 改观感有四条路，对齐 Amis 的用法，实现换成 shadcn token：

1. **CSS 变量**：`page.cssVars`（或 IR `metadata.style.cssVars`）改一整页的主色、控件高、间距。
2. **辅助 class**：节点写 `className`。间距 / 宽高走 `@vamis/ui` 的 helper（`m-t-xs`、`w-1/2`）；布局 / 颜色 / 圆角走 Tailwind 工具类。
3. **不要自己编译主题 CSS**。Amis 的 `scss/themes/cxd.scss` 和 `.cxd-*` 前缀 Vamis 不搬；同等盒子、密度、交互尽量像素级落到 token / Tailwind。
4. **`wrapper` 写内嵌 `style`**：只动这一块，不进主题。

YAML 与 JSON 同等有效。下面用 YAML 举例。

## CSS 变量

`page.cssVars` 写到根节点 style。Amis 盒子名会映射到 Vamis token（`--Form-input-height` → `--control-h`）。完整对照见 [CSS 变量](/style/css-vars)。

```schema
type: page
cssVars:
  --text-color: "#CD3632"
  --primary: "#CD3632"
  --primary-onHover: "#F23F3A"
  --primary-onActive: "#BB312D"
body:
  type: form
  body:
    - type: input-text
      label: 文本
      name: text
    - type: input-password
      label: 密码
      name: password
```

## 辅助 class

SDK 与 Playground 都打了 `@vamis/ui/styles.css`（间距 / 宽高 / 布局 / 调色盘 helper）。大多数节点都有 `className`。表单壳还可以写 `panelClassName`：

```schema: scope="body"
type: form
panelClassName: border-solid border-2 border-blue-500 rounded-xl shadow-lg
body:
  - type: input-text
    className: text-green-700
    label: 文本框
    name: text
  - type: input-password
    label: 密码
    name: password
```

还可以：

- `flex` / `flex-col` / `gap-2` 做布局（复杂布局用 `type: flex` / `type: grid`）
- `bg-muted` / `bg-primary` 设背景
- `shadow-md` 设投影
- `rounded-xl` 设圆角
- `text-xl` / `font-medium` 设字号字重

左侧目录是辅助类清单。间距、宽高、调色盘与 Amis helper 同名；语义色走 token。

## wrapper 内嵌 style

```schema
type: page
body:
  - type: wrapper
    style:
      background: var(--muted)
      padding: 12px
      border-radius: 8px
    body:
      - type: tpl
        tpl: 只动这一块，不改主题 token
```

## 默认自适应

page / form / 未写 `size` 的表单控件**默认吃满布局槽**，不必先写 `w-full` 或 `size: full`。`size: sm` 这类才是可选收窄。
