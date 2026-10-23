---
title: ClassName
---

# ClassName

::: info 实现进度 70% · 进行中
`resolveClassName` 已接字符串 / 对象 / 模板 / `m-t-xs` / `w-*` / `h-*` / 布局 helper / `m:` `pc:`。表单项 `className` 会落到标签（对齐 Amis `/style` 的 `text-green-700`）。Page / Form / FormItem / Container / Panel 的常用 `xxxClassName` 已打到子节点。其余组件、hover 前缀全矩阵与 `registerTheme` 仍是 D12 P1。
:::

`className` 支持字符串、对象和模板。内核 `resolveClassName` 在 `SchemaRenderer` 上统一落地。布局容器和表单控件**默认已经铺满宽度**，不必为了宽度先写 `w-full`；`className` 只在要覆盖（半宽、等高、间距、状态色）时写。

高度辅助类与 Amis 相同：`h-full` 是 `height: 100%`，用在 Grid 列里的 `panel` 上可以把两列卡片拉齐。`min-h-full` / `h-1/2` / `h-screen` 以及 `m:` / `pc:` 前缀同样可用。

```yaml
type: tpl
className: m-t-md text-sm
tpl: 间距走 cxd gap 阶
```

对象 + 表达式（数据变了 class 跟着变）：

```schema
type: page
data:
  status: 1
body:
  - type: radios
    name: status
    label: 状态
    options:
      - label: 离线
        value: 1
      - label: 在线
        value: 2
  - type: tpl
    className:
      text-danger: ${status == 1}
      text-success: ${status == 2}
    tpl: 当前状态 ${status}
```

`text-danger` 会映到 `text-destructive`。`m:` / `pc:` 前缀作用在间距、宽高、display / flex、语义色上（手机 &lt;768px / 桌面 ≥768px）。Playground 里其它 Tailwind 类也可加这对前缀。

打到子节点的 `xxxClassName`（本轮已接）：

| 组件 | 字段 |
|------|------|
| Page | `headerClassName` / `toolbarClassName` / `bodyClassName` / `asideClassName` |
| Form | `panelClassName` / `headerClassName` / `titleClassName` / `bodyClassName` / `actionsClassName` |
| FormItem | `labelClassName` / `inputClassName` / `descriptionClassName` |
| Container | `bodyClassName` |
| Panel | `headerClassName` / `bodyClassName` |

`className` 仍打在 SchemaRenderer 外层 `div.vamis-node`。完整辅助类清单在顶栏 [样式](/style/)。

```schema: height=280
type: grid
columns:
  - type: panel
    className: h-full
    body:
      - type: tpl
        tpl: 这一列只有一行
  - type: panel
    className: h-full
    body:
      - type: tpl
        tpl: 这一列比较高
      - type: tpl
        tpl: 第二行
      - type: tpl
        tpl: 第三行
```
