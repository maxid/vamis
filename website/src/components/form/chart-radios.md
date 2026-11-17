---
title: ChartRadios 图表单选框
outline: deep
---

# ChartRadios 图表单选框

::: danger 实现进度 35% · 进行中
**精简**：无真实图表点选
:::

`chart-radios` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

图表点选功能，用来做多个图表联动。

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "type": "chart-radios",
      "name": "main",
      "chartValueField": "num",
      "options": [
        {
          "label": "A",
          "num": 100,
          "value": "a"
        },
        {
          "label": "B",
          "num": 120,
          "value": "b"
        },
        {
          "label": "C",
          "num": 30,
          "value": "c"
        },
        {
          "label": "D",
          "num": 40,
          "value": "d"
        }
      ]
    }
  ]
}
```

## 属性表

除了支持 [普通表单项属性表](./formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8) 中的配置以外，还支持下面一些配置

| 属性名                 | 类型      | 默认值    | 说明 ## 二级标题           |
| ---------------------- | --------- | --------- | -------------------------- |
| config                 | `object`  |           | echart 图表配置            |
| showTooltipOnHighlight | `boolean` | `false`   | 高亮的时候是否显示 tooltip |
| chartValueField        | `string`  | `"value"` | 图表数值字段名             |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：**精简**：无真实图表点选。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
