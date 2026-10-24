---
title: Wrapper 包裹容器
outline: deep
---

# Wrapper 包裹容器

::: info 实现进度 90% · 进行中
文档主路径已对齐：`body`、默认 `size: md` 内边距、`xs`–`lg` / `none`、`style` 对象与 `${style}`、`wrap`。缺 `themeCss`。`className` / `style` 打在宿主 `div.vamis-node`。
:::

简单的包裹容器，相当于用 `div` 包一层，最大用处是配合 css 布局。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。比 [Container](/components/container) 更薄：不按 `wrapperComponent` 换标签，也不默认再套内容区。

## 基本用法

`className: b` 是 Amis 文档里用来加淡边框、让容器看得见的写法。

```schema: scope="body"
{
    "type": "wrapper",
    "body": "内容",
    "className": "b"
}
```

同一段也可以写成 YAML：

```schema: scope="body"
type: wrapper
body: 内容 YAML
className: b
```

## 动态获取

`style` 可以是表达式，解析后得到对象：

```schema
{
  "type": "page",
  "data": {
    "style": {
      "color": "#aaa"
    }
  },
  "body": [
    {
      "type": "wrapper",
      "body": "内容",
      "className": "b",
      "style": "${style}"
    }
  ]
}
```

也可以写对象，值里再插变量：

```schema
{
  "type": "page",
  "data": {
    "color": "#aaa"
  },
  "body": [
    {
      "type": "wrapper",
      "body": "内容字号",
      "className": "b",
      "style": {
        "color": "${color}",
        "fontSize": "30px"
      }
    }
  ]
}
```

## 不同内边距

通过 `size` 调内边距。未写时默认 `md`（`padding: var(--gap-md)`）。`none` 无内边距。

```schema: scope="body"
[
  {
    "type": "wrapper",
    "body": "默认内边距",
    "className": "b"
  },
  {
    "type": "divider"
  },
  {
    "type": "wrapper",
    "body": "极小的内边距",
    "size": "xs",
    "className": "b"
  },
  {
    "type": "divider"
  },
  {
    "type": "wrapper",
    "body": "小的内边距",
    "size": "sm",
    "className": "b"
  },
  {
    "type": "divider"
  },
  {
    "type": "wrapper",
    "body": "中等的内边距",
    "size": "md",
    "className": "b"
  },
  {
    "type": "divider"
  },
  {
    "type": "wrapper",
    "body": "大的内边距",
    "size": "lg",
    "className": "b"
  },
  {
    "type": "divider"
  },
  {
    "type": "wrapper",
    "body": "无内边距",
    "size": "none",
    "className": "b"
  }
]
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"wrapper"` | 指定为 Wrapper 渲染器 |
| className | `string` | | 外层 class，打在 `div.vamis-node` |
| size | `string` | `"md"` | `xs` / `sm` / `md` / `lg` / `xl` / `none` |
| style | `Object` \| `string` | | 自定义样式，对象或 `${style}` |
| body | SchemaNode | | 内容 |
| wrap | `boolean` | `true` | `false` 时不再包一层（表单内部用法） |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `className` / `style` 落在 SchemaRenderer 宿主上；`size` 内边距打在内部 `div`。未接 `themeCss`。
