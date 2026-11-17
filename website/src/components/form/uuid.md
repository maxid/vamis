---
title: UUID 随机 ID
outline: deep
---

# UUID 随机 ID

::: warning 实现进度 70% · 进行中
能生成；仍走扁平 name
:::

`uuid` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

随机生成一个 id，可以用于防止表单重复提交。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "uuid",
      "name": "uuid"
    }
  ]
}
```

这个字段是不显示的，上面这个例子之所以显示是因为加了 `debug: true`。

## length

目前 uuid 的唯一可设置参数是 length，用于生成短随机数

```schema:height="200" scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "uuid",
      "name": "uuid",
      "length": 8
    }
  ]
}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：能生成；仍走扁平 name。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
