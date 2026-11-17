---
title: BarCode 条形码
outline: deep
---

# BarCode 条形码

::: warning 实现进度 45% · 进行中
已注册
:::

`barcode` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema: scope="body"
{
  "type": "barcode",
  "value": "amis"
}
```

## 条形码配置

通过 options 属性配置，具体请参考[这里](https://github.com/lindell/JsBarcode/wiki/Options)，比如

```schema: scope="body"
{
  "type": "barcode",
  "value": "123",
  "options": {
    "format": "pharmacode",
    "lineColor": "#0aa",
    "width": "4",
    "height": "40"
  }
}
```

## 属性表

| 属性名    | 类型     | 默认值 | 说明                           |
| --------- | -------- | ------ | ------------------------------ |
| className | `string` |        | 外层 CSS 类名                  |
| value     | `string` |        | 显示的颜色值                   |
| name      | `string` |        | 在其他组件中，时，用作变量映射 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：已注册。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
