---
title: Definitions
outline: deep
---

# Definitions

::: tip 实现进度 100% · 已完成
顶级 `definitions` / `$ref`、本地字段覆盖、递归按需展开与未知引用诊断均已接入；YAML 与 JSON 走同一实现。
:::

顶级节点可以写 `definitions`，其它节点用 `$ref` 引用。作者态 YAML 与 JSON 同等有效。

`Definitions`建立当前页面公共的配置项，在其他组件中可以通过`$ref`来引用当前配置项中的内容。

> 注意 definitions 只能在顶级节点中定义。

```schema
{
  "definitions": {
    "aa": {
      "type": "input-text",
      "name": "jack",
      "value": "ref value",
      "labelRemark": "通过<code>\\$ref</code>引入的组件"
    }
  },
  "type": "page",
  "title": "引用",
  "body": [
    {
      "type": "form",
      "api": "api/xxx",
      "actions": [],
      "body": [
        {
          "$ref": "aa"
        }
      ]
    }
  ]
}
```

## 树形结构

`Definitions` 最大的作用其实是能够实现对数据格式的递归引用，实现无限层级编辑：

```schema
{
  "definitions": {
    "options": {
      "type": "combo",
      "multiple": true,
      "multiLine": true,
      "name": "options",
      "items": [
        {
          "type": "group",
          "body": [
            {
              "label": "名称",
              "name": "label",
              "type": "input-text",
              "required": true
            },
            {
              "label": "值",
              "name": "value",
              "type": "input-text",
              "required": true
            }
          ]
        },
        {
          "label": "包含子选项",
          "type": "switch",
          "name": "hasChildren",
          "value": false,
          "mode": "inline",
          "className": "block"
        },
        {
          "$ref": "options",
          "label": "子选项",
          "name": "children",
          "visibleOn": "${hasChildren === true}",
          "addButtonText": "新增子选项"
        }
      ]
    }
  },
  "type": "page",
  "title": "引用",
  "body": [
    {
      "type": "form",
      "api": "api/xxx",
      "actions": [],
      "body": [
        {
          "$ref": "options",
          "label": "选项"
        },
        {
          "type": "static",
          "label": "当前值",
          "tpl": "<pre>${options|json}</pre>"
        }
      ]
    }
  ]
}
```

## 合并规则与失败态

- `$ref` 的值是顶级 `definitions` 中的 key；引用节点的本地字段覆盖定义同名字段。
- 解析发生在实际渲染节点时，递归定义不会在初始化阶段无限展开。上面的树形示例中，只有打开「包含子选项」后才继续创建子级编辑器。
- 未知 key 不渲染该节点，并通过 `env.onDiagnostic` 发出 `type: renderer`、`path` 为引用名的诊断。
- 子节点自己的 `definitions` 不会建立另一套注册表；请统一定义在顶级节点。

```json
{
  "type": "page",
  "definitions": {},
  "body": { "$ref": "missing" }
}
```

Definitions 是 [SchemaNode](/types/schemanode) 的复用机制，不改变数据域与组件事件规则。
