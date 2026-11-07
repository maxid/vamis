---
title: Spinner 加载中
outline: deep
---

# Spinner 加载中

::: info 实现进度 95% · 进行中
文档主路径已对齐：默认中心对称菱形 SVG（色走 `--primary`，2.7s 无限循环）、`show` / `showOn`、`size` sm|lg|空、`icon`（内置 `reload` / `fa` / URL）、`tip` / `tipPlacement`、`delay`、`body` 容器、`overlay`（源码默认 false）、父子 loading 互斥、`loadingConfig.root`。Page / Service 已挂同一套 Spinner。缺 Dialog / Form / Select 宿主细项。
:::

一般用来做 loading。Vamis 用 YAML 或 JSON 书写，字段名不改写；JSON 同等有效。UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。

`className` / `style` 打在宿主 `div.vamis-node`。裸 spinner 是 `inline-block`，和 Amis `inline-flex` 一样并排。有 `body` 时当容器，指示器叠在内容中间。

源码里 `overlay` 默认 **false**（文档有的写成 true）。`size` 空值是 32px，`sm` 16px，`lg` 48px。未写 `icon` 时用 Vamis 中心对称 loading 标（不是 Amis 六边形）：一枚原点向四向裂开，再沿菱形依次连线、依次消失、收回原点，2.7s 无限循环。色绑 `--primary`（跟顶栏 5 色）。

## 基本使用

`show` 控制是否画出指示器。默认 true。

```schema: scope="body"
type: spinner
show: true
```

`size` 只有 `sm`、`lg` 和空值三档。

```schema: scope="body"
type: flex
justify: flex-start
alignItems: center
items:
  - type: spinner
    show: true
    size: sm
    className: mr-4
  - type: spinner
    show: true
    size: ""
    className: mr-4
  - type: spinner
    show: true
    size: lg
```

`className` 打在最外层（`div.vamis-node`）。`spinnerClassName` 打在 icon 上。`spinnerWrapClassName` 只在作为容器时打在包裹层。

```schema: scope="body"
type: spinner
show: true
className: my-spinner
spinnerClassName: my-spinner-custom-icon
spinnerWrapClassName: my-spinner-wrap
```

`icon` 可以是内置名（文档主路径是 `reload`）、字体 class（如 `fa fa-spinner`）、或带 `.` 的图片 URL。

```schema: scope="body"
type: flex
justify: flex-start
alignItems: center
items:
  - type: spinner
    show: true
    icon: ""
    className: mr-4
  - type: spinner
    show: true
    icon: reload
    className: mr-4
  - type: spinner
    show: true
    icon: fa fa-spinner
    className: mr-4
  - type: spinner
    show: true
    icon: /examples/static/logo.png
```

`tip` 配文案。`tipPlacement` 相对图标：`top` / `right` / `bottom`（默认）/ `left`。

```schema: scope="body"
type: flex
justify: flex-start
alignItems: center
items:
  - type: spinner
    show: true
    tip: 加载中...
    className: mr-10
  - type: spinner
    show: true
    tip: 加载中...
    tipPlacement: right
    className: mr-10
  - type: spinner
    show: true
    tip: 加载中...
    tipPlacement: top
    className: mr-10
  - type: spinner
    show: true
    tip: 加载中...
    tipPlacement: left
```

`delay` 是 `show` 变为 true 之后再等多少毫秒才画出。默认 0。对照不要用 `delay: 1000` 当活示例（收割时指示器可能还没出现）。

## 作为容器使用

有 `body` 时指示器居中叠在内容上。`overlay: true` 才加半透明遮罩（源码默认 false）。遮罩默认 `rgba(255,255,255,0.1)` + 1px blur。

```schema: scope="body"
type: spinner
show: true
overlay: true
body:
  type: form
  body:
    - type: input-text
      name: name
      label: 姓名：
    - name: email
      type: input-email
      label: 邮箱：
```

## Spinner 在组件树中的默认表现

父组件和子组件同时 loading 时，只画父级；父级结束后才轮到子级。Page / Service 共用这一套 Spinner。

```schema
type: service
api: /api/mock2/sample?orderBy=id&orderDir=desc&perPage=10&waitSeconds=5
body:
  type: page
  initApi: /api/mock2/sample?orderBy=id&orderDir=desc&perPage=10&waitSeconds=10
```

这个例子里 `service` 会先 loading，5 秒后 `page` 才开始 loading。

## 动态控制组件渲染

`showOn` 表达式优先于 `show`。

```schema: scope="body"
type: form
body:
  - type: switch
    name: show
    label: show
    value: true
  - type: spinner
    overlay: false
    showOn: ${show}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `spinner` | 指定为 Spinner 渲染器 |
| show | `boolean` | `true` | 是否显示 |
| showOn | [表达式](/concepts/expression) | | 是否显示的条件，优先于 `show` |
| className | [ClassName](/types/classname) | | 打在宿主 `div.vamis-node` |
| spinnerClassName | [ClassName](/types/classname) | | 打在 icon 上 |
| spinnerWrapClassName | [ClassName](/types/classname) | | 作为容器时打在包裹层 |
| size | `string` | | `sm` / `lg` / 空（32px） |
| icon | `string` | | 内置名（如 `reload`）、字体 class、或带 `.` 的图片 URL。写了 `loadingConfig.root` 时强制默认 V 标 |
| tip | `string` | | 文案，可模板 |
| tipPlacement | `top` / `right` / `bottom` / `left` | `bottom` | 文案相对 icon 的位置 |
| delay | `number` | `0` | 延迟显示毫秒 |
| overlay | `boolean` | `false` | 是否显示遮罩（源码默认 false；写了 `loadingConfig.root` 时强制 true） |
| body | [SchemaNode](/types/schemanode) | | 作为容器时被包裹的内容 |
| loadingConfig | `{root?: string}` | | `root` 是挂载选择器；开启后强制 `overlay=true`，且 `icon` 失效 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `overlay` 跟 Amis **源码** 默认 false，不是部分文档写的 true。
- 默认指示器是中心对称菱形（原点裂开 → 连线 → 收回），不是 Amis 六边形，也不是开口 V。色走 `--primary`，不是写死 `#2468F2`。同一时钟 `repeatCount="indefinite"`，loading 期间一直转。
- 内置 icon 目前文档主路径接了 `reload`；Amis `icons.tsx` 全表未搬。
- `/examples/static/logo.png` 在 Amis 文档站有静态文件；Vamis playground 没有同路径时图片会空。
- Dialog / Form / Select 的 loading 宿主还没全部换成这套 Spinner。
