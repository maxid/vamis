---
title: InputRepeat 重复频率
outline: deep
---

# InputRepeat 重复频率

::: warning 实现进度 40% · 进行中
已注册，选项精简
:::

`input-repeat` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-repeat",
      "name": "repeat",
      "label": "重复频率"
    }
  ]
}
```

## 属性表

当做选择器表单项使用时，除了支持 [普通表单项属性表](./formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8) 中的配置以外，还支持下面一些配置

| 属性名      | 类型     | 默认值                        | 说明                                                                     |
| ----------- | -------- | ----------------------------- | ------------------------------------------------------------------------ |
| options     | `string` | `hourly,daily,weekly,monthly` | 可用配置 `secondly,minutely,hourly,daily,weekdays,weekly,monthly,yearly` |
| placeholder | `string` | `不重复`                      | 当不指定值时的说明。                                                     |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：已注册，选项精简。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
