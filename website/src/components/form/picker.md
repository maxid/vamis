---
title: Picker 列表选择器
outline: deep
---

# Picker 列表选择器

::: warning 实现进度 90% · 进行中
默认 trigger 对齐 Amis 单输入框，tag 内嵌关闭、label 可触发 `itemClick`；静态 `options`、`multiple`、`joinValues` / `extractValue`、`embed`、`maxTagCount`、`clearable`、远程 / 数据链 `source`、`pickerSchema` selectedItems / valueField 桥接均已接。默认弹框已复用 CRUD `mode: list`，标题、单选、选中行、内容区、按钮与关闭钮按 Amis 盒模型对齐；已有值会在打开时回填选中行。余 `modalMode: drawer`、`strictMode` 与树选择。
:::

列表选择器：弹层里选选项，确认后写回表单。属于普通表单项，通用属性见 [FormItem](./formitem)。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: picker
    name: picker
    label: picker
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 多选

`multiple: true` 可多选；`joinValues` + `delimiter` 控制写回格式：

```yaml
type: picker
name: picker
label: 多选
multiple: true
joinValues: true
delimiter: ","
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 内嵌模式

`embed: true` 不弹层，直接把列表画在表单里：

```yaml
type: picker
name: picker
label: 内嵌
embed: true
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 限制标签最大展示数量

`maxTagCount: 2` 只展示前 2 个标签，其余折叠成 `+N`：

```yaml
type: picker
name: picker
label: 限制标签
multiple: true
maxTagCount: 2
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
  - label: 选项 C
    value: c
```

## 远程选项

`source` 支持数据域变量或 API；返回数组 / `{options}` / `{items}` / `{records}`：

```yaml
type: picker
name: picker
label: 远程选择
source: /api/mock2/form/options
labelField: label
valueField: value
```

```yaml
type: picker
name: picker
label: 本地变量
source: "${dict}"
```

## 分组选项

`options` 带 `children` 时，Amis 默认 CRUD list 保留顶层组行，不会自动展开子项；需要复杂层级时请使用 `pickerSchema`：

```yaml
type: picker
name: picker
label: 分组选择
multiple: true
options:
  - label: 前端
    children:
      - label: Vue
        value: vue
      - label: React
        value: react
  - label: 后端
    children:
      - label: Node
        value: node
```

## 自定义弹层（pickerSchema）

`pickerSchema` 替代默认列表；内层可选 table / crud 读取 `selectedItems`，内层 form 读取 `valueField` 字段，确认时写回：

```yaml
type: picker
name: picker
label: 表格选择
valueField: id
labelField: name
pickerSchema:
  type: table
  name: picker_table
  selectable: true
  source: /api/mock2/sample
  columns:
    - name: id
      label: ID
    - name: name
      label: 名称
```

> 内层 table 读取 `selectedItems`；内层 form 读取 `valueField` 对应字段（数组 / 单值）。

## 分页

`perPage` 控制弹层每页选项数，搜索时自动回到第一页：

```yaml
type: picker
name: picker
label: 分页选择
perPage: 10
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 配置 pickerSchema

可以配置 pickerSchema，实现弹框 crud 选择模式，更多 crud 配置可查看 crud 文档，选择之后最终的值通过 `valueField` 来设置。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "picker",
      "name": "type4",
      "joinValues": true,
      "valueField": "id",
      "labelField": "engine",
      "label": "多选",
      "source": "/api/mock2/sample",
      "size": "lg",
      "value": "4,5",
      "multiple": true,
      "pickerSchema": {
        "mode": "table",
        "name": "thelist",
        "quickSaveApi": "/api/mock2/sample/bulkUpdate",
        "quickSaveItemApi": "/api/mock2/sample/$id",
        "draggable": true,
        "headerToolbar": {
          "wrapWithPanel": false,
          "type": "form",
          "className": "text-right",
          "target": "thelist",
          "mode": "inline",
          "body": [
            {
              "type": "input-text",
              "name": "keywords",
              "addOn": {
                "type": "submit",
                "label": "搜索",
                "level": "primary",
                "icon": "fa fa-search pull-left"
              }
            }
          ]
        },
        "footerToolbar": [
          "statistics",
          {
            "type": "pagination",
            "showPageInput": true,
            "layout": "perPage,pager,go"
          }
        ],
        "columns": [
          {
            "name": "engine",
            "label": "Rendering engine",
            "sortable": true,
            "searchable": true,
            "type": "text",
            "toggled": true
          },
          {
            "name": "browser",
            "label": "Browser",
            "sortable": true,
            "type": "text",
            "toggled": true
          },
          {
            "name": "platform",
            "label": "Platform(s)",
            "sortable": true,
            "type": "text",
            "toggled": true
          },
          {
            "name": "version",
            "label": "Engine version",
            "quickEdit": true,
            "type": "text",
            "toggled": true
          },
          {
            "name": "grade",
            "label": "CSS grade",
            "quickEdit": {
              "mode": "inline",
              "type": "select",
              "options": [
                "A",
                "B",
                "C",
                "D",
                "X"
              ],
              "saveImmediately": true
            },
            "type": "text",
            "toggled": true
          },
          {
            "type": "operation",
            "label": "操作",
            "width": 100,
            "buttons": [
              {
                "type": "button",
                "icon": "fa fa-eye",
                "actionType": "dialog",
                "dialog": {
                  "title": "查看",
                  "body": {
                    "type": "form",
                    "body": [
                      {
                        "type": "static",
                        "name": "engine",
                        "label": "Engine"
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "static",
                        "name": "browser",
                        "label": "Browser"
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "static",
                        "name": "platform",
                        "label": "Platform(s)"
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "static",
                        "name": "version",
                        "label": "Engine version"
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "static",
                        "name": "grade",
                        "label": "CSS grade"
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "html",
                        "html": "<p>添加其他 <span>Html 片段</span> 需要支持变量替换（todo）.</p>"
                      }
                    ]
                  }
                }
              },
              {
                "type": "button",
                "icon": "fa fa-pencil",
                "actionType": "dialog",
                "dialog": {
                  "position": "left",
                  "size": "lg",
                  "title": "编辑",
                  "body": {
                    "type": "form",
                    "name": "sample-edit-form",
                    "api": "/api/mock2/sample/$id",
                    "body": [
                      {
                        "type": "input-text",
                        "name": "engine",
                        "label": "Engine",
                        "required": true
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "input-text",
                        "name": "browser",
                        "label": "Browser",
                        "required": true
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "input-text",
                        "name": "platform",
                        "label": "Platform(s)",
                        "required": true
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "input-text",
                        "name": "version",
                        "label": "Engine version"
                      },
                      {
                        "type": "divider"
                      },
                      {
                        "type": "select",
                        "name": "grade",
                        "label": "CSS grade",
                        "options": [
                          "A",
                          "B",
                          "C",
                          "D",
                          "X"
                        ]
                      }
                    ]
                  }
                }
              },
              {
                "type": "button",
                "icon": "fa fa-times text-danger",
                "actionType": "ajax",
                "confirmText": "您确认要删除?",
                "api": "delete:/api/mock2/sample/$id"
              }
            ],
            "toggled": true
          }
        ]
      }
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `options` | `Option[]` | | 静态选项；`children` 组行按 Amis 默认 list 展示 |
| `name` / `value` | | | 表单字段与初始值 |
| `multiple` | `boolean` | `false` | 多选 |
| `joinValues` | `boolean` | `true` | 多选时用分隔符拼接 |
| `delimiter` | `string` | `,` | 拼接分隔符 |
| `labelField` / `valueField` | `string` | `label` / `value` | 选项字段名 |
| `embed` | `boolean` | `false` | 内嵌列表 |
| `maxTagCount` | `number` | | 最多展示标签数，其余 `+N` |
| `perPage` | `number` | `10` | 弹层每页选项数 |
| `clearable` | `boolean` | `false` | 显示额外清除入口；tag 内仍可逐项移除 |
| `placeholder` | `string` | `请选择` | 未选占位 |
| `modalTitle` | `string` | | 弹层标题 |
| `pickerSchema` | Schema | | 自定义弹层；自动开启 pickerMode / checkOnItemClick，并向 table/crud selectedItems 或 form valueField 桥接 |
| `source` | API / 变量 | | 远程或数据域选项 |

## 事件表

| 事件名称 | 参数 | 说明 |
|---|---|---|
| `change` | `value` / `option` / `selectedItems` / `items` | 写值前派发，可 `preventDefault()` |
| `itemClick` | `item` | 点击已选 tag label 时触发 |

## 动作表

`picker` 没有专属动作。

## 和 Amis 文档的差异
- 与 Amis 一致：默认 trigger、tag ×、picker icon、multiple、joinValues/extractValue、默认 CRUD list 弹框、500px 内容宽、选中行、已有值回填、确认/取消、pickerSchema 对象值回填。
- 已加：`embed` 内嵌、`maxTagCount` 折叠标签与隐藏项 title。
- 已接：数据链 source、pickerSchema selectedItems 合并、`change` / `itemClick`、`resetValue` 清空。
- 未接：`modalMode: drawer`、`strictMode`、树选择。
