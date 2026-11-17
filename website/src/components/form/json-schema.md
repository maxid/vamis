---
title: JsonSchema
outline: deep
---

# JsonSchema

::: danger 实现进度 30% · 进行中
**精简**：只渲染 string/number/boolean 属性
:::

`json-schema` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

这个组件可以基于 JSON Schema 生成表单项，方便对接类似 OpenAPI/Swagger Specification 的接口规范，可基于接口定义自动生成 amis 表单项。

> 此组件还在实验阶段，很多 json-schema 属性没有对应实现，使用前请先确认你要的功能满足了需求

基于 json-schema 定义生成表单输入项。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "json-schema",
      "name": "value",
      "label": "字段值",
      "schema": {
        "type": "object",
        "properties": {
          "id": {
            "type": "number",
            "title": "ID"
          },
          "name": {
            "type": "string",
            "title": "名称"
          },
          "description": {
            "type": "string",
            "title": "描述"
          }
        }
      }
    }
  ]
}
```

## 复杂 case

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "json-schema",
      "name": "value",
      "label": "字段值",
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "type": "number",
            "title": "ID"
          },
          "name": {
            "type": "string",
            "title": "名称"
          },
          "description": {
            "type": "string",
            "title": "描述"
          },
          "date": {
            "type": "object",
            "title": "日期",
            "additionalProperties": false,
            "required": [
              "year",
              "month",
              "day"
            ],
            "properties": {
              "year": {
                "type": "number",
                "title": "年"
              },
              "month": {
                "type": "number",
                "title": "月"
              },
              "day": {
                "type": "number",
                "title": "日"
              }
            }
          },
          "tag": {
            "type": "array",
            "title": "个人标签",
            "items": {
              "type": "string"
            },
            "minContains": 2,
            "maxContains": 10
          }
        }
      }
    }
  ]
}
```

## 搭配公式使用

通过配置 `formula` 属性，可以配合公式使用。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "json-schema",
      "name": "value",
      "label": "字段值",
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name"
        ],
        "properties": {
          "id": {
            "type": "number",
            "title": "ID"
          },
          "name": {
            "type": "string",
            "title": "名称"
          },
          "description": {
            "type": "string",
            "title": "描述"
          },
          "date": {
            "type": "object",
            "title": "日期",
            "additionalProperties": false,
            "required": [
              "year",
              "month",
              "day"
            ],
            "properties": {
              "year": {
                "type": "number",
                "title": "年"
              },
              "month": {
                "type": "number",
                "title": "月"
              },
              "day": {
                "type": "number",
                "title": "日"
              }
            }
          },
          "tag": {
            "type": "array",
            "title": "个人标签",
            "items": {
              "type": "string"
            },
            "minContains": 2,
            "maxContains": 10
          }
        }
      },
      "formula": {
        "mode": "input-group",
        "mixedMode": true,
        "variables": [
          {
            "label": "表单字段",
            "children": [
              {
                "label": "文章名",
                "value": "name",
                "tag": "文本"
              },
              {
                "label": "作者",
                "value": "author",
                "tag": "文本"
              },
              {
                "label": "售价",
                "value": "price",
                "tag": "数字"
              },
              {
                "label": "出版时间",
                "value": "time",
                "tag": "时间"
              },
              {
                "label": "版本号",
                "value": "version",
                "tag": "数字"
              },
              {
                "label": "出版社",
                "value": "publisher",
                "tag": "文本"
              }
            ]
          },
          {
            "label": "流程字段",
            "children": [
              {
                "label": "联系电话",
                "value": "telphone"
              },
              {
                "label": "地址",
                "value": "addr"
              }
            ]
          },
          {
            "label": "长文本测试分类长文本测试分类长文本测试分类长文本测试分类",
            "children": [
              {
                "label": "这是一段测试长文本这是一段测试长文本这是一段测试长文本",
                "value": "longtext",
                "tag": "文本"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## 远程获取 schema

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "type": "json-schema",
      "name": "value",
      "label": "字段值",
      "schema": "/api/mock2/json-schema"
    }
  ]
}
```

## 属性表

| 属性名 | 类型                 | 默认值 | 说明             |
| ------ | -------------------- | ------ | ---------------- |
| schema | `object` \| `string` |        | 指定 json-schema |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：**精简**：只渲染 string/number/boolean 属性。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
