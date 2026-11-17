---
title: InputGroup 输入框组合
outline: deep
---

# InputGroup 输入框组合

::: warning 实现进度 55% · 进行中
能并排控件
:::

`input-group` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

**输入框组合选择器** 可用于输入框与其他组件进行组合。

## 基本用法

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-group",
      "name": "input-group",
      "label": "input 组合",
      "body": [
        {
          "type": "input-text",
          "placeholder": "搜索作业ID/名称",
          "inputClassName": "b-r-none p-r-none",
          "name": "input-group"
        },
        {
          "type": "submit",
          "label": "搜索",
          "level": "primary"
        }
      ]
    },
    {
      "type": "input-group",
      "label": "各种组合",
      "body": [
        {
          "type": "select",
          "name": "memoryUnits",
          "options": [
            {
              "label": "Gi",
              "value": "Gi"
            },
            {
              "label": "Mi",
              "value": "Mi"
            },
            {
              "label": "Ki",
              "value": "Ki"
            }
          ],
          "value": "Gi"
        },
        {
          "type": "input-text",
          "name": "memory"
        },
        {
          "type": "select",
          "name": "memoryUnits2",
          "options": [
            {
              "label": "Gi",
              "value": "Gi"
            },
            {
              "label": "Mi",
              "value": "Mi"
            },
            {
              "label": "Ki",
              "value": "Ki"
            }
          ],
          "value": "Gi"
        },
        {
          "type": "button",
          "label": "Go"
        }
      ]
    }
  ]
}
```

## 校验

input-group 配置校验方法较为特殊，需要配置下面步骤：

1. input-group 上配置任意`name`值 (必填, 否则表单内存在多个输入组合时无法定位)
2. input-group 的 body 内配置的表单项上配置校验规则
3. 如果 input-group 的子元素配置了`label`, 则会在校验失败时作为标识符展示, 否则仅使用索引值作为标识符
4. 单个子元素多条校验信息会使用`; `分隔
5. 可以使用`"errorMode": "full" | "partial"`设置错误提示风格, `full`整体飘红, `partial`仅错误元素飘红, 默认为`"full"`

> 细粒度错误提示需`2.7.1`及以上版本

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-group",
      "name": "input-group",
      "label": "输入组合校验",
      "body": [
        {
          "type": "input-text",
          "placeholder": "请输入长度不超过6的数字类型",
          "name": "group-input1",
          "label": "子元素一",
          "validations": {
            "isNumeric": true,
            "maxLength": 6
          }
        },
        {
          "type": "input-text",
          "placeholder": "请输入长度不少于5的文本",
          "name": "group-input2",
          "required": true,
          "validations": {
            "minLength": 5
          }
        }
      ]
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| ---------------- | ----------------------------------------- | -------- | ----------------------------------------------------- |
| className | `string` |  | CSS 类名 |
| body | Array<[表单项](./formitem)> |  | 表单项集合 |
| validationConfig | `Record<'errorMode' \| 'delimiter', any>` | - | 校验相关配置, 具体配置属性如下 |
| +errorMode | `"full" \| "partial"` | `"full"` | 错误提示风格, `full`整体飘红, `partial`仅错误元素飘红 |
| +delimiter | `string` | `"; "` | 单个子元素多条校验信息的分隔符 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：能并排控件。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
