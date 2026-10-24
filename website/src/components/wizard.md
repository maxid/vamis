---
title: Wizard 向导
outline: deep
---

# Wizard 向导

::: info 实现进度 80% · 进行中
文档主路径已对齐：`steps` 的 title/body、默认「上一步 / 下一步 / 完成」、最后一步改完成、`startStep` 从 1 计、`mode` 默认 horizontal、步骤表单 `wrapWithPanel: false`。缺 `initApi` / `api` 提交、自定义 `actions` 接到 prev/next、`jumpableOn` 像素级步骤条。
:::

表单向导。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

第一步不画「上一步」。最后一步按钮是「完成」。没写 `api` 时下一步只切步，不发请求。

## 基本使用

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面是向导甲。"
}
```

```schema: scope="body"
{
  "type": "wizard",
  "steps": [
    { "title": "第一步甲", "body": "内容甲一" },
    { "title": "第二步甲", "body": "内容甲二" }
  ]
}
```

```schema: scope="body"
type: wizard
steps:
  - title: 第一步乙
    body: 内容乙一
  - title: 第二步乙
    body: 内容乙二
```

## 从某一步开始

`startStep` 从 1 计，且必须是字符串（数字会被忽略）。下面从第二步起，能看到「上一步」和「完成」。

```schema: scope="body"
{
  "type": "wizard",
  "startStep": "2",
  "steps": [
    { "title": "起步甲1", "body": "隐藏甲" },
    { "title": "起步甲2", "body": "可见甲" }
  ]
}
```

```schema: scope="body"
type: wizard
startStep: "2"
steps:
  - title: 起步乙1
    body: 隐藏乙
  - title: 起步乙2
    body: 可见乙
```

## 按钮文案

```schema: scope="body"
{
  "type": "wizard",
  "actionPrevLabel": "回甲",
  "actionNextLabel": "去甲",
  "actionFinishLabel": "完甲",
  "steps": [
    { "title": "文案甲1", "body": "文案内容甲" },
    { "title": "文案甲2", "body": "文案结尾甲" }
  ]
}
```

```schema: scope="body"
type: wizard
actionPrevLabel: 回乙
actionNextLabel: 去乙
actionFinishLabel: 完乙
steps:
  - title: 文案乙1
    body: 文案内容乙
  - title: 文案乙2
    body: 文案结尾乙
```

## 竖排

`mode` 默认 `horizontal`。

```schema: scope="body"
{
  "type": "wizard",
  "mode": "vertical",
  "steps": [
    { "title": "竖甲1", "body": "竖内容甲" },
    { "title": "竖甲2", "body": "竖结尾甲" }
  ]
}
```

```schema: scope="body"
type: wizard
mode: vertical
steps:
  - title: 竖乙1
    body: 竖内容乙
  - title: 竖乙2
    body: 竖结尾乙
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"wizard"` | 指定为向导 |
| `mode` | `string` | `horizontal` | `horizontal` / `vertical` |
| `steps` | `Array` | | `title` / `body` / `api` / `actions` |
| `startStep` | `string` | `"1"` | 起始步，从 1 计。源码只认字符串 |
| `actionPrevLabel` | `string` | `上一步` | 上一步 |
| `actionNextLabel` | `string` | `下一步` | 下一步 |
| `actionNextSaveLabel` | `string` | `保存并下一步` | 当前步有 `api` 时 |
| `actionFinishLabel` | `string` | `完成` | 最后一步 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不接 `initApi` / 最后 `api` 提交；自定义 `actions` 只画出，不接 prev/next 组件动作。
- 视觉走 token 步骤条，不是 cxd Wizard 皮肤。
