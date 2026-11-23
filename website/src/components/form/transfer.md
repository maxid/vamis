---
title: Transfer 穿梭器
outline: deep
---

# Transfer 穿梭器

::: warning 实现进度 70% · 进行中
主路径：`options` / 远程 `source`、list / table / tree、左右移动 / 全部 / 清空、`value` / `joinValues` / `delimiter`、`searchable` + `searchPlaceholder`、`leftTitle` / `rightTitle`，list 与 table 已接虚拟窗口。仍缺 chained / associated、事件与 scoped 动作、分页、排序、拖拽、tree 虚拟化和移动端专用布局。
:::

穿梭选择器。属于普通表单项，通用属性见 [FormItem](./formitem)。Vamis 用 YAML 或 JSON 书写。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: transfer
    name: transfer
    label: 默认
    value: zhugeliang,libai
    options:
      - label: 诸葛亮
        value: zhugeliang
      - label: 曹操
        value: caocao
      - label: 钟无艳
        value: zhongwuyan
      - label: 李白
        value: libai
      - label: 韩信
        value: hanxin
      - label: 云中君
        value: yunzhongjun
```

## 展示模式

`mode` 支持 `list`（默认）/ `table` / `tree`；`tree` 按 `children` 渲染可展开/折叠的层级（父节点仅展开、不参与选择），`chained` 未接。

```yaml
type: transfer
name: transfer
label: 表格模式
mode: table
leftTitle: 待选
rightTitle: 已选
options:
  - label: 选项 A
    value: a
  - label: 选项 B
    value: b
```

## 搜索

`searchable: true` 时左侧出现搜索框；未配 `searchApi` 时按 label / value 本地匹配。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: transfer
    name: transfer
    label: 带搜索
    searchable: true
    options:
      - label: 诸葛亮
        value: zhugeliang
      - label: 曹操
        value: caocao
      - label: 钟无艳
        value: zhongwuyan
      - label: 李白
        value: libai
      - label: 韩信
        value: hanxin
      - label: 云中君
        value: yunzhongjun
```

## 树形模式

`mode: tree` 时按选项 `children` 渲染树，点击父节点展开/折叠，叶子节点才加入选择：

```yaml
type: transfer
name: transfer
label: 树形穿梭
mode: tree
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

## 远程选项

`source` 支持数据域变量 / API，归一到 options / items / records：

```yaml
type: transfer
name: transfer
label: 远程穿梭
source: /api/mock2/form/options
labelField: label
valueField: value
```

## 分页

当数据量庞大时，可以开启数据源分页，此时左侧列表底部会出现分页控件，相关配置参考属性表。通常在提交表单中使用分页场景，处理数据量较大的数据源。如果需要在表单中回显已选值，建议同时设置`{"joinValues": false, "extractValue": false}`，因为已选数据可能位于不同的分页，如果仅使用 value 值作为提交值，可能会导致右侧结果区无法正确渲染。

> 仅列表（list）和表格（table）展示模式支持分页，接口的数据结构参考[CRUD 数据源接口格式](../crud#数据结构)

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "joinValues": false,
      "extractValue": false,
      "source": "/api/mock2/options/transfer?page=${page}&perPage=${perPage}",
      "pagination": {
        "enable": true,
        "layout": [
          "pager",
          "perpage",
          "total"
        ],
        "popOverContainerSelector": ".cxd-Panel--form"
      },
      "value": [
        {
          "label": "Laura Lewis",
          "value": "1",
          "id": 1
        },
        {
          "label": "Christopher Rodriguez",
          "value": "3",
          "id": 3
        },
        {
          "label": "Laura Miller",
          "value": "12",
          "id": 12
        },
        {
          "label": "Patricia Robinson",
          "value": "14",
          "id": 14
        }
      ]
    }
  ]
}
```

### 前端分页

当使用数据域变量作为数据源时，支持实现前端一次性加载并分页

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "type": "service",
      "api": {
        "url": "/api/mock2/options/loadDataOnce",
        "method": "get",
        "responseData": {
          "transferOptions": "${items}"
        }
      },
      "body": [
        {
          "label": "默认",
          "type": "transfer",
          "name": "transfer",
          "joinValues": false,
          "extractValue": false,
          "source": "${transferOptions}",
          "pagination": {
            "enable": true,
            "layout": [
              "pager",
              "perpage",
              "total"
            ],
            "popOverContainerSelector": ".cxd-Panel--form"
          },
          "value": [
            {
              "label": "Laura Lewis",
              "value": "1",
              "id": 1
            },
            {
              "label": "Christopher Rodriguez",
              "value": "3",
              "id": 3
            },
            {
              "label": "Laura Miller",
              "value": "12",
              "id": 12
            },
            {
              "label": "Patricia Robinson",
              "value": "14",
              "id": 14
            }
          ]
        }
      ]
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `options` | `Option[]` | | 静态选项 |
| `value` / `name` | | | 已选值 |
| `joinValues` | `boolean` | `true` | 是否用分隔符拼接 |
| `delimiter` | `string` | `,` | 拼接分隔符 |
| `searchable` | `boolean` | `false` | 左右搜索框 |
| `searchPlaceholder` | `string` | `搜索` | 搜索占位 |
| `leftTitle` / `rightTitle` | `string` | | 左右栏标题 |
| `mode` | `string` | `list` | `list` / `table` / `tree`（扁平缩进）；chained 未接 |
| `source` | API / 变量 | | 远程或数据域选项 |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，在`actions`中可以通过`${事件参数名}`或`${event.data.[事件参数名]}`来获取事件产生的数据，详细请查看[事件动作](/concepts/event-action)。

> `[name]`表示当前组件绑定的名称，即`name`属性，如果没有配置`name`属性，则通过`value`取值。

| 事件名称  | 事件参数                                                                                  | 说明             |
| --------- | ----------------------------------------------------------------------------------------- | ---------------- |
| change    | `[name]: string` 组件的值<br/>`items: object[]`选项集合 为`options`） | 选中值变化时触发 |
| selectAll | `items: object[]`选项集合 为`options`）                               | 全选时触发       |

### change

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "value": "zhugeliang",
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang"
        },
        {
          "label": "曹操",
          "value": "caocao"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan"
        }
      ],
      "onEvent": {
        "change": {
          "actions": [
            {
              "actionType": "toast",
              "args": {
                "msg": "${event.data.value|json}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

### selectAll

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "value": "zhugeliang",
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang"
        },
        {
          "label": "曹操",
          "value": "caocao"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan"
        }
      ],
      "onEvent": {
        "selectAll": {
          "actions": [
            {
              "actionType": "toast",
              "args": {
                "msg": "${event.data.items|json}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定`actionType: 动作名称`、`componentId: 该组件id`来触发这些动作，动作配置可以通过`args: {动作配置项名称: xxx}`来配置具体的参数，详细请查看[事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称    | 动作配置                                          | 说明                                                                                                      |
| ----------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| clear       | -                                                 | 清空                                                                                                      |
| reset       | -                                                 | 将值重置为初始值。否则为`resetValue`                                                          |
| clearSearch | `left: boolean` 左侧搜索、`right:boolean`右侧搜索 | 默认清除所有搜索态，可以单独配置`left`、`right`为`true`来清空对应左侧或者右侧面板(支持） |
| selectAll   | -                                                 | 全选                                                                                                      |
| setValue    | `value: string` \| `string[]` 更新的值            | 更新数据，开启`multiple`支持设置多项，开启`joinValues`时，多值用`,`分隔，否则多值用数组                   |

### clear

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "value": "zhugeliang",
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang"
        },
        {
          "label": "曹操",
          "value": "caocao"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan"
        },
        {
          "label": "李白",
          "value": "libai"
        },
        {
          "label": "韩信",
          "value": "hanxin"
        },
        {
          "label": "云中君",
          "value": "yunzhongjun"
        }
      ],
      "id": "clear_text"
    },
    {
      "type": "button",
      "label": "清空",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "clear",
              "componentId": "clear_text"
            }
          ]
        }
      }
    }
  ]
}
```

### reset

如果配置了`resetValue`，则重置时使用`resetValue`的值，否则使用初始值。

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "value": "zhugeliang",
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang"
        },
        {
          "label": "曹操",
          "value": "caocao"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan"
        },
        {
          "label": "李白",
          "value": "libai"
        },
        {
          "label": "韩信",
          "value": "hanxin"
        },
        {
          "label": "云中君",
          "value": "yunzhongjun"
        }
      ],
      "id": "reset_text"
    },
    {
      "type": "button",
      "label": "重置",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "reset",
              "componentId": "reset_text"
            }
          ]
        }
      }
    }
  ]
}
```

### setValue

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "value": "zhugeliang",
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang"
        },
        {
          "label": "曹操",
          "value": "caocao"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan"
        },
        {
          "label": "李白",
          "value": "libai"
        },
        {
          "label": "韩信",
          "value": "hanxin"
        },
        {
          "label": "云中君",
          "value": "yunzhongjun"
        }
      ],
      "id": "setvalue_text"
    },
    {
      "type": "button",
      "label": "赋值",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "setValue",
              "componentId": "setvalue_text",
              "args": {
                "value": "yunzhongjun"
              }
            }
          ]
        }
      }
    }
  ]
}
```

## 和 Amis 文档的差异
- 与 Amis 一致：静态 options / 远程 source、list / table / tree、左右移动、全部 / 清空、joinValues / delimiter、左右搜索、标题。
- 已接：list / table 的 `virtualThreshold` / `itemHeight` 窗口、实测视口与上下 spacer。
- 未接：chained / associated、事件 / 动作、分页、排序、拖拽、tree 虚拟化、移动端专用布局。
