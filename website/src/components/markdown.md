---
title: Markdown 渲染
outline: deep
---

# Markdown 渲染

::: warning 实现进度 45% · 进行中
已注册；远程 `src` 按 `isApiOutdated` 拉。渲染库精简
:::

`markdown` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

> 1.1.6 版本开始

## 基本用法

```schema
{
  "type": "page",
  "body": {
    "type": "markdown",
    "value": "# title\n markdown **text**"
  }
}
```

## 动态数据

动态数据可以通过 name 来关联，类似 [static](form/static) 组件

## 基于 Editor 和数据联动来实现预览功能

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "group",
      "body": [
        {
          "type": "editor",
          "name": "md",
          "language": "markdown"
        },
        {
          "type": "markdown",
          "name": "md"
        }
      ]
    }
  ]
}
```

## 加载外部 markdown 文件

可以通过 `src` 属性来加载外部 markdown 文件，比如

```schema: scope="body"
{
  "type": "markdown",
  "src": "/api/mock2/sample/mirror?json=%7B%22status%22%3A0%2C%22data%22%3A%22%23%23%20title%20%5Cn%20content%22%7D"
}
```

这个接口的返回格式可以是两种，一种是 JSON，类似

```
{
    "status": 0,
    "msg": "",
    "data": "markdown"
}
```

另一种是返回 `content-type` 为 `text/markdown` 或 `text/x-markdown` 的纯文本。

## 视频

可以使用 `![text](video.mp4)` 语法来嵌入视频。

## 支持 latex

公式渲染使用 KaTeX 实现，由于体积太大默认不提供，需要自己去[下载](https://github.com/KaTeX/KaTeX/releases)，在页面中引入以下三个文件：

```
<link rel="stylesheet" href="katex/katex.min.css">
<script src="katex/katex.min.js"></script>
<script src="katex/contrib/auto-render.min.js"></script>
```

markdown 中的 `$` 或 `$$` 包裹的内容就能以公式展现，比如 `$\sqrt{a^2 + b^2}$`，如果是在代码中 `\` 要转义为 `\\`

```schema
{
  "type": "page",
  "body": {
    "type": "markdown",
    "value": "$$\\hat{f} (\\xi)=\\int_{-\\infty}^{\\infty}f(x)e^{-2\\pi ix\\xi}dx$$"
  }
}
```

## 高级配置

有以下配置：

- html，是否支持 html 标签，默认 false
- linkify，是否自动识别链接，默认值是 true
- breaks，是否回车就是换行，默认 false

```schema
{
  "type": "page",
  "body": {
    "type": "markdown",
    "value": "# title\n <b>markdown</b>\n http://www.github.com/",
    "options": {
      "linkify": false,
      "html": true,
      "breaks": true
    }
  }
}
```

## 属性表

| 属性名    | 类型     | 默认值 | 说明     |
| --------- | -------- | ------ | -------- |
| name      | `string` |        | 名称     |
| value     | `string` |        | 静态值   |
| className | `string` |        | 类名     |
| src       | `Api`    |        | 外部地址 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：已注册；远程 `src` 按 `isApiOutdated` 拉。渲染库精简。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
