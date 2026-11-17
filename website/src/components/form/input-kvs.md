---
title: InputKVS 键值对象
outline: deep
---

# InputKVS 键值对象

::: warning 实现进度 45% · 进行中
结构精简
:::

`input-kvs` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

这个组件的功能和 `input-kv` 类似，`input-kv` 的 value 值只支持一个对象，`input-kvs` 的最大不同就是 value 支持对象和数组，可以用来支持深层结构编辑

## 基本用法

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-kvs",
      "name": "field",
      "addButtonText": "新增字段",
      "keyItem": {
        "label": "字段名"
      },
      "valueItems": [
        {
          "type": "switch",
          "name": "primary",
          "label": "是否是主键"
        },
        {
          "type": "select",
          "name": "type",
          "label": "字段类型",
          "options": [
            "text",
            "int",
            "float"
          ]
        }
      ]
    }
  ]
}
```

其中 `keyItem` 可以用来修改 key 值控件，比如可以改成下拉框

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-kvs",
      "name": "field",
      "addButtonText": "新增字段",
      "keyItem": {
        "label": "字段名",
        "type": "select",
        "options": [
          "id",
          "title",
          "content"
        ]
      },
      "valueItems": [
        {
          "type": "switch",
          "name": "primary",
          "label": "是否是主键"
        },
        {
          "type": "select",
          "name": "type",
          "label": "字段类型",
          "options": [
            "text",
            "int",
            "float"
          ]
        }
      ]
    }
  ]
}
```

而 `valueItems` 是用来控制值的控件，这里的配置和 combo 的 items 一样，唯一限制是不允许有 `"name": "_key"` 值的情况，因为这个值被当成对象 key 了。

## 水平模式

通过 `"mode": "horizontal"` 设置，需要分别在 `keyItem` 和 `valueItems` 里设置

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-kvs",
      "name": "field",
      "addButtonText": "新增字段",
      "keyItem": {
        "label": "字段名",
        "mode": "horizontal"
      },
      "valueItems": [
        {
          "type": "switch",
          "name": "primary",
          "mode": "horizontal",
          "label": "是否是主键"
        },
        {
          "type": "select",
          "name": "type",
          "label": "字段类型",
          "mode": "horizontal",
          "options": [
            "text",
            "int",
            "float"
          ]
        }
      ]
    }
  ]
}
```

## 嵌套的场景

`valueItems` 可以进一步嵌套，比如里面又嵌一个 `input-kvs` 实现深层结构编辑

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-kvs",
      "name": "dataModel",
      "addButtonText": "新增表",
      "keyItem": {
        "label": "表名",
        "mode": "horizontal",
        "type": "select",
        "options": [
          "table1",
          "table2",
          "table3"
        ]
      },
      "valueItems": [
        {
          "type": "input-kvs",
          "addButtonText": "新增字段",
          "name": "column",
          "keyItem": {
            "label": "字段名",
            "mode": "horizontal",
            "type": "select",
            "options": [
              "id",
              "title",
              "content"
            ]
          },
          "valueItems": [
            {
              "type": "switch",
              "name": "primary",
              "mode": "horizontal",
              "label": "是否是主键"
            },
            {
              "type": "select",
              "name": "type",
              "label": "字段类型",
              "mode": "horizontal",
              "options": [
                "text",
                "int",
                "float"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

前面的嵌套会多一个层级，如果想去掉这个层级 `column`，可以将 `"name": "column"` 改成 `"name": "_value"`，这时值就会直接放入

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-kvs",
      "name": "dataModel",
      "addButtonText": "新增表",
      "keyItem": {
        "label": "表名",
        "mode": "horizontal",
        "type": "select",
        "options": [
          "table1",
          "table2",
          "table3"
        ]
      },
      "valueItems": [
        {
          "type": "input-kvs",
          "addButtonText": "新增字段",
          "name": "_value",
          "keyItem": {
            "label": "字段名",
            "mode": "horizontal",
            "type": "select",
            "options": [
              "id",
              "title",
              "content"
            ]
          },
          "valueItems": [
            {
              "type": "switch",
              "name": "primary",
              "mode": "horizontal",
              "label": "是否是主键"
            },
            {
              "type": "select",
              "name": "type",
              "label": "字段类型",
              "mode": "horizontal",
              "options": [
                "text",
                "int",
                "float"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

除了前面的对象，值也可以是数组，需要配置一下 `valueIsArray`

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-kvs",
      "name": "dataModel",
      "addButtonText": "新增表",
      "valueIsArray": true,
      "keyItem": {
        "label": "表名",
        "mode": "horizontal",
        "type": "select",
        "options": [
          "table1",
          "table2",
          "table3"
        ]
      },
      "valueItems": [
        {
          "type": "checkboxes",
          "name": "_value",
          "joinValues": false,
          "extractValue": true,
          "options": [
            {
              "label": "查询",
              "value": "select"
            },
            {
              "label": "写入",
              "value": "insert"
            },
            {
              "label": "更新",
              "value": "update"
            },
            {
              "label": "删除",
              "value": "delete"
            }
          ]
        }
      ]
    }
  ]
}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：结构精简。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
