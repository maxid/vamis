---
title: Picker 列表选择器
outline: deep
---

# Picker 列表选择器

::: warning 实现进度 97% · 进行中
默认 trigger 对齐 Amis 单输入框，tag 内嵌关闭、label 可触发 `itemClick`；静态 `options`、`multiple`、`joinValues` / `extractValue`、`embed`、`overflowConfig.maxTagCount` / `displayPosition`、`itemClearable`、`staticItemClick`、`strictMode`、远程 / 数据链 `source`、`pickerSchema` selectedItems / valueField 桥接均已接。默认弹框已复用 CRUD `mode: list`，`modalMode: dialog | drawer` 与 `modalSize` 均已接；标题、单选、选中行、内容区、按钮与关闭钮按 Amis 盒模型对齐。余标签收纳浮层与树选择。
:::

列表选取，在功能和 Select 类似，但它能显示更复杂的信息。Picker 属于普通表单项，通用字段见 [FormItem](./formitem)。

## 基本用法

默认和 Select 很像，但请看后面的 pickerSchema 设置。

Picker trigger 始终铺满 FormItem 的值列；示例中的 `size: lg` 不会把它锁成 320px 固定宽度。

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

## 配置 pickerSchema

可以配置 pickerSchema，实现弹框 crud 选择模式，更多 crud 配置可查看 crud 文档，选择之后最终的值通过 `valueField` 来设置。

`multiple: true` 时，已选项由内层 CRUD 顶部统一展示为 `已选N条：`、标签和“清空”，不是 Picker trigger 自己维护的第二套界面。

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

## 内嵌模式

可以配置 `"embed": true`，实现内嵌 Picker。内嵌列表仍复用同一份 CRUD schema，选择后立即写值：

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

设置 `overflowConfig.maxTagCount` 后可以限制标签的最大展示数量，仅在多选模式开启后生效。超出数量的标签折叠成 `+N`：

```yaml
type: picker
name: picker
label: 限制标签
multiple: true
    value: a,b,c
    overflowConfig:
      maxTagCount: 2
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
  - label: 选项 C
    value: c
```

## 属性表

当做选择器表单项使用时，除了支持 [普通表单项属性表](./formitem) 中的配置以外，还支持下面一些配置：

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `options` | `Array<object>` / `Array<string>` | | [选项组](./options#静态选项组-options) |
| `source` | `string` / API / 数据映射 | | [动态选项组](./options#动态选项组-source) |
| `multiple` | `boolean` | `false` | 是否为多选 |
| `delimiter` | `string` | `","` | 多选值拼接符 |
| `labelField` | `string` | `"label"` | 选项标签字段 |
| `valueField` | `string` | `"value"` | 选项值字段 |
| `joinValues` | `boolean` | `true` | 多选时是否用分隔符拼接 |
| `extractValue` | `boolean` | `false` | 多选时是否只提取值，不返回完整对象 |
| `autoFill` | `object` | | 选项自动填充 |
| `modalTitle` | `string` | `"请选择"` | 模态框标题 |
| `modalMode` | `"dialog"` / `"drawer"` | `"dialog"` | 弹层宿主 |
| `modalSize` | `string` | | 弹框大小；drawer 默认按 `md`，窄屏铺满 |
| `pickerSchema` | `Schema` | `{ mode: "list" }` | 用 CRUD / List 展示候选项，更多配置参考 [CRUD](../crud) |
| `embed` | `boolean` | `false` | 是否使用内嵌模式 |
| `overflowConfig` | `OverflowConfig` | | 标签收纳配置 |
| `itemClearable` | `boolean` | `true` | 是否显示已选项的删除图标 |

### OverflowConfig

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `maxTagCount` | `number` | `-1` | 最大展示标签数；正数才启用，超出折叠为 `+N` |
| `displayPosition` | `("select" \| "crud")[]` | `["select", "crud"]` | 收纳标签生效位置；未开启内嵌时默认选择器，开启后默认选择器与 CRUD 顶部 |
| `overflowTagPopover` | `TooltipObject` | `{ placement: "top", trigger: "hover", showArrow: false, offset: [0, -10] }` | 选择器内收纳标签的浮层配置 |
| `overflowTagPopoverInCRUD` | `TooltipObject` | `{ placement: "bottom", trigger: "hover", showArrow: false, offset: [0, 10] }` | CRUD 顶部收纳标签的浮层配置 |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 监听并配置动作。`[name]` 表示当前组件的 `name`；没有 `name` 时通过 `value` 取值。

| 事件名称 | 事件参数 | 说明 |
|---|---|---|
| `change` | `[name]` 组件的值；`selectedItems` 选中项；`items` / `option` | 选中值变化并写回表单时触发 |
| `itemClick` | `item: Option` | 已选标签被点击时触发 |
| `staticItemClick` | `item: Option` | 静态展示时选项被点击时触发 |

### change

`change` 在写值前派发，可 `preventDefault()` 阻断提交。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "picker",
      "name": "picker",
      "label": "picker",
      "options": [
        { "label": "A", "value": "a" },
        { "label": "B", "value": "b" },
        { "label": "C", "value": "c" }
      ],
      "onEvent": {
        "change": {
          "actions": [
            {
              "actionType": "toast",
              "args": { "msg": "${event.data.value}" }
            }
          ]
        }
      }
    }
  ]
}
```

### itemClick

输入框内已被选中的选项被点击时触发。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "picker",
      "name": "picker",
      "label": "picker",
      "options": [
        { "label": "A", "value": "a" },
        { "label": "B", "value": "b" },
        { "label": "C", "value": "c" }
      ],
      "onEvent": {
        "itemClick": {
          "actions": [
            {
              "actionType": "toast",
              "args": { "msg": "${event.data.item|json}" }
            }
          ]
        }
      }
    }
  ]
}
```

### staticItemClick

静态展示时选项被点击时触发。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "picker",
      "name": "picker",
      "label": "picker",
      "static": true,
      "value": "a,b",
      "multiple": true,
      "options": [
        { "label": "A", "value": "a" },
        { "label": "B", "value": "b" },
        { "label": "C", "value": "c" }
      ],
      "onEvent": {
        "staticItemClick": {
          "actions": [
            {
              "actionType": "toast",
              "args": { "msg": "${event.data.item|json}" }
            }
          ]
        }
      }
    }
  ]
}
```

**补充：多选与值格式。** `multiple: true` 可多选；`joinValues` / `extractValue` / `delimiter` 控制写回 string、array 或完整 option。

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

**补充：远程 source。** `source` 支持数据域变量或 API；返回数组或 `{ options }` / `{ items }` / `{ records }`：

```yaml
type: picker
name: picker
label: 远程选择
source: /api/mock2/form/options
labelField: label
valueField: value
```

**补充：分组 options。** `children` 由默认 CRUD list 保留为顶层组行，不自动展开子项；复杂层级请使用 `pickerSchema`：

```yaml
type: picker
name: picker
label: 分组选择
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

**补充：分页。** `perPage` 交给默认 CRUD 本地分页，跨页选中由 `keepItemSelectionOnPageChange` 保留。

`picker` 没有专属动作。

## 和 Amis 文档的差异

- 章节顺序与 Amis 6.13 对齐：基本用法、配置 pickerSchema、内嵌模式、限制标签最大展示数量、属性表 / OverflowConfig、事件表 / change / itemClick / staticItemClick。
- 默认 Picker 已按 Amis `buildSchema()` 生成 CRUD `mode: list`；500px dialog、`modalMode: drawer`、drawer 桌面 500px / 窄屏全宽、已有值回填、选中行与 `itemClearable` 已对齐。
- `overflowConfig.maxTagCount` 与 `displayPosition` 已接；`overflowTagPopover`、`overflowTagPopoverInCRUD` 的浮层样式尚未接。
- `staticItemClick` 与 `strictMode` 已接；树选择尚未完成。
- Vamis 额外保留顶层 `maxTagCount`、`clearable`、`placeholder`、`perPage` 兼容字段；Amis 主字段仍以本文属性表为准。
