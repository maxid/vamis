---
title: Transfer 穿梭器
outline: deep
---

# Transfer 穿梭器

::: tip 实现进度 100% · 已完成
主路径：`options` / 远程 `source`、list / table / tree / chained / associated、左侧统计 / 全选、右侧已选项 / 清除 / 移除、`value` / `joinValues` / `delimiter`、`searchable` + `searchPlaceholder`、`searchApi`、`searchResultMode` / `searchResultColumns`、`resultSearchable`、`resultListModeFollowSelect`、`table.columns`、`selectTitle` / `resultTitle`、`showArrow`、`menuTpl` / `valueTpl`、`showInvalidMatch`、`sortable` 拖拽排序、前后端分页，list / table / tree 已接虚拟窗口；`change` / `selectAll` 和 `clear` / `reset` / `clearSearch` / `selectAll` / `setValue` 已接。375px 双栏堆叠与下划线搜索已对齐 Amis。
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

### 分组

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "分组",
      "type": "transfer",
      "name": "transfer",
      "options": [
        {
          "label": "法师",
          "children": [
            {
              "label": "诸葛亮",
              "value": "zhugeliang"
            }
          ]
        },
        {
          "label": "战士",
          "children": [
            {
              "label": "曹操",
              "value": "caocao"
            },
            {
              "label": "钟无艳",
              "value": "zhongwuyan"
            }
          ]
        },
        {
          "label": "打野",
          "children": [
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
          ]
        }
      ]
    }
  ]
}
```

### 表格模式

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "表格形式",
      "type": "transfer",
      "name": "transfer",
      "selectMode": "table",
      "columns": [
        {
          "name": "label",
          "label": "英雄"
        },
        {
          "name": "position",
          "label": "位置"
        }
      ],
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang",
          "position": "中单"
        },
        {
          "label": "曹操",
          "value": "caocao",
          "position": "上单"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan",
          "position": "上单"
        },
        {
          "label": "李白",
          "value": "libai",
          "position": "打野"
        },
        {
          "label": "韩信",
          "value": "hanxin",
          "position": "打野"
        },
        {
          "label": "云中君",
          "value": "yunzhongjun",
          "position": "打野"
        }
      ]
    }
  ]
}
```

### 树形模式

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "树型展示",
      "type": "transfer",
      "name": "transfer4",
      "selectMode": "tree",
      "searchable": true,
      "options": [
        {
          "label": "法师",
          "children": [
            {
              "label": "诸葛亮",
              "value": "zhugeliang"
            }
          ]
        },
        {
          "label": "战士",
          "children": [
            {
              "label": "曹操",
              "value": "caocao"
            },
            {
              "label": "钟无艳",
              "value": "zhongwuyan"
            }
          ]
        },
        {
          "label": "打野",
          "children": [
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
          ]
        }
      ]
    }
  ]
}
```

### 级联选择

`selectMode: chained` 使用共享的级联选择 pane：父节点只展开下一列，叶子才写入值，多选和全选只作用于叶子：

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "级联选择",
      "type": "transfer",
      "name": "transfer5",
      "selectMode": "chained",
      "options": [
        {
          "label": "法师",
          "children": [
            {
              "label": "诸葛亮",
              "value": "zhugeliang"
            }
          ]
        },
        {
          "label": "战士",
          "children": [
            {
              "label": "曹操",
              "value": "caocao"
            },
            {
              "label": "钟无艳",
              "value": "zhongwuyan"
            }
          ]
        },
        {
          "label": "打野",
          "children": [
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
          ]
        }
      ]
    }
  ]
}
```

### 关联选择模式

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "关联选择模式",
      "type": "transfer",
      "name": "b",
      "sortable": true,
      "searchable": true,
      "deferApi": "/api/mock2/form/deferOptions?label=${label}",
      "selectMode": "associated",
      "leftMode": "tree",
      "leftOptions": [
        {
          "label": "法师",
          "children": [
            {
              "label": "诸葛亮",
              "value": "zhugeliang"
            }
          ]
        },
        {
          "label": "战士",
          "children": [
            {
              "label": "曹操",
              "value": "caocao"
            },
            {
              "label": "钟无艳",
              "value": "zhongwuyan"
            }
          ]
        },
        {
          "label": "打野",
          "children": [
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
          ]
        }
      ],
      "options": [
        {
          "ref": "zhugeliang",
          "children": [
            {
              "label": "A",
              "value": "a"
            }
          ]
        },
        {
          "ref": "caocao",
          "children": [
            {
              "label": "B",
              "value": "b"
            },
            {
              "label": "C",
              "value": "c"
            }
          ]
        },
        {
          "ref": "zhongwuyan",
          "children": [
            {
              "label": "D",
              "value": "d"
            },
            {
              "label": "E",
              "value": "e"
            }
          ]
        },
        {
          "ref": "libai",
          "defer": true,
          "label": "lazy-option-libai"
        },
        {
          "ref": "hanxin",
          "defer": true,
          "label": "lazy-option-hanxin"
        },
        {
          "ref": "yunzhongjun",
          "defer": true,
          "label": "lazy-option-yunzhongjun"
        }
      ]
    }
  ]
}
```

### 延时加载

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "延时加载",
      "type": "transfer",
      "name": "transfer7",
      "selectMode": "tree",
      "deferApi": "/api/mock2/form/deferOptions?label=${label}&waitSeconds=2",
      "options": [
        {
          "label": "法师",
          "children": [
            {
              "label": "诸葛亮",
              "value": "zhugeliang"
            }
          ]
        },
        {
          "label": "战士",
          "defer": true
        },
        {
          "label": "打野",
          "children": [
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
          ]
        }
      ]
    }
  ]
}
```

### 支持搜索

#### 左侧搜索功能

通过 `searchable` 字段控制左侧选项栏搜索。未设置 `searchApi` 时，按选项 `value` / `label` 本地匹配。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "带搜索",
      "type": "transfer",
      "name": "transfer6",
      "selectMode": "chained",
      "searchable": true,
      "sortable": true,
      "options": [
        {
          "label": "法师",
          "children": [
            {
              "label": "诸葛亮",
              "value": "zhugeliang"
            }
          ]
        },
        {
          "label": "战士",
          "children": [
            {
              "label": "曹操",
              "value": "caocao"
            },
            {
              "label": "钟无艳",
              "value": "zhongwuyan"
            }
          ]
        },
        {
          "label": "打野",
          "children": [
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
          ]
        }
      ]
    }
  ]
}
```

#### 右侧结果搜索功能

`resultSearchable: true` 开启右侧结果本地过滤；默认按 `value` / `label` 匹配，`resultSearchPlaceholder` 可单独配置提示。结果树只搜索已选叶子并保留其祖先，组名本身不会展开全部子项；输入框右侧 clear X 恢复完整结果树。

```schema: scope="body"
{
  "type": "page",
  "body": {
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
      {
        "label": "树型展示",
        "type": "transfer",
        "name": "transfer4",
        "selectMode": "tree",
        "searchable": true,
        "resultListModeFollowSelect": true,
        "resultSearchable": true,
        "options": [
          {
            "label": "法师",
            "children": [
              {
                "label": "诸葛亮",
                "value": "zhugeliang"
              }
            ]
          },
          {
            "label": "战士",
            "children": [
              {
                "label": "曹操",
                "value": "caocao"
              },
              {
                "label": "钟无艳",
                "value": "zhongwuyan"
              }
            ]
          },
          {
            "label": "打野",
            "children": [
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
            ]
          }
        ]
      }
    ]
  }
}
```

#### searchApi

通过 `searchApi` 检索左侧选项；默认 GET，携带 `term`，并使用与基础数据源相同的 `page` / `perPage` 分页参数。返回值按 `data.options` / `data.items` / 数组归一。清空搜索恢复基础 options。

```schema: scope="body"
{
  "type": "page",
  "body": {
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
      {
        "label": "searchApi",
        "type": "transfer",
        "name": "transfer",
        "searchable": true,
        "selectMode": "tree",
        "searchApi": "/api/mock2/options/transfer?term=${term}",
        "options": [
          {
            "label": "法师",
            "children": [
              {
                "label": "诸葛亮",
                "value": "zhugeliang"
              }
            ]
          },
          {
            "label": "战士",
            "value": "zhanshi",
            "children": [
              {
                "label": "曹操",
                "value": "caocao"
              },
              {
                "label": "钟无艳",
                "value": "zhongwuyan"
              }
            ]
          },
          {
            "label": "打野",
            "children": [
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
            ]
          }
        ]
      }
    ]
  }
}
```

### 结果面板跟随模式

`resultListModeFollowSelect` 开启结果面板跟随模式。`table` 使用相同 `columns` 渲染结果表格；`tree` 在没有 defer 时使用结果树，只保留已选叶子及祖先。其它情况保持列表结果。

#### 表格跟随模式

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "表格形式",
      "type": "transfer",
      "name": "transfer",
      "selectMode": "table",
      "resultListModeFollowSelect": true,
      "columns": [
        {
          "name": "label",
          "label": "英雄"
        },
        {
          "name": "position",
          "label": "位置"
        }
      ],
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang",
          "position": "中单"
        },
        {
          "label": "曹操",
          "value": "caocao",
          "position": "上单"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan",
          "position": "上单"
        },
        {
          "label": "李白",
          "value": "libai",
          "position": "打野"
        },
        {
          "label": "韩信",
          "value": "hanxin",
          "position": "打野"
        },
        {
          "label": "云中君",
          "value": "yunzhongjun",
          "position": "打野"
        }
      ]
    }
  ]
}
```

#### 树形跟随模式

```schema: scope="body"
{
  "type": "page",
  "body": {
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
      {
        "label": "树型展示",
        "type": "transfer",
        "name": "transfer4",
        "selectMode": "tree",
        "searchable": true,
        "resultListModeFollowSelect": true,
        "options": [
          {
            "label": "法师",
            "children": [
              {
                "label": "诸葛亮",
                "value": "zhugeliang"
              }
            ]
          },
          {
            "label": "战士",
            "children": [
              {
                "label": "曹操",
                "value": "caocao"
              },
              {
                "label": "钟无艳",
                "value": "zhongwuyan"
              }
            ]
          },
          {
            "label": "打野",
            "children": [
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
            ]
          }
        ]
      }
    ]
  }
}
```

### 自定义选项展示

`menuTpl` 自定义左侧选项，`valueTpl` 自定义右侧结果；模板数据都包含当前 option。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "label": "默认",
      "type": "transfer",
      "name": "transfer",
      "menuTpl": "<div class='flex justify-between'><span>${label}</span><span class='text-muted m-r text-sm'>${tag}</span></div>",
      "valueTpl": "${label}(${value})",
      "options": [
        {
          "label": "诸葛亮",
          "value": "zhugeliang",
          "tag": "法师"
        },
        {
          "label": "曹操",
          "value": "caocao",
          "tag": "战士"
        },
        {
          "label": "钟无艳",
          "value": "zhongwuyan",
          "tag": "战士"
        },
        {
          "label": "李白",
          "value": "libai",
          "tag": "打野"
        },
        {
          "label": "韩信",
          "value": "hanxin",
          "tag": "打野"
        },
        {
          "label": "云中君",
          "value": "yunzhongjun",
          "tag": "打野"
        }
      ]
    }
  ]
}
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
        "popOverContainerSelector": "[data-vamis-panel]"
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
            "popOverContainerSelector": "[data-vamis-panel]"
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
| `options` | `Option[]` | | 静态选项，支持 `children` |
| `source` | API / 变量 | | 远程或数据域选项 |
| `value` / `name` | | | 已选值 |
| `joinValues` | `boolean` | `true` | 多选是否拼接为字符串 |
| `delimiter` | `string` | `,` | 多值拼接符 |
| `extractValue` | `boolean` | `false` | 只提交 option value |
| `labelField` / `valueField` | `string` | `label` / `value` | 选项字段映射 |
| `showArrow` | `boolean` | `false` | 两栏之间显示箭头 |
| `sortable` | `boolean` | `false` | 结果列表是否可通过拖拽手柄调整顺序 |
| `selectMode` | `string` | `list` | `list` / `table` / `tree` / `chained` / `associated` |
| `mode` | `string` | `list` | Vamis 兼容别名；`selectMode` 优先 |
| `resultListModeFollowSelect` | `boolean` | `false` | 结果区跟随选择模式；table / 非 defer tree 已接 |
| `leftOptions` | `Option[]` | | `associated` 左栏选项 |
| `leftDefaultValue` | | | `associated` 左栏默认值 |
| `leftMode` | `string` | `list` | `associated` 左栏 `list` / `tree` |
| `rightMode` | `string` | `list` | `associated` 右栏 `list` / `table` / `tree` / `chained` |
| `searchResultMode` | `string` | | 搜索结果面板模式：`list` / `table` / `tree` / `chained` |
| `columns` | `Object[]` | | `table` 列配置，已接共享 TableSelection |
| `searchResultColumns` | `Object[]` | | 搜索结果 table 列配置，优先于 `columns` |
| `searchable` | `boolean` | `false` | 左侧搜索 |
| `checkAll` | `boolean` | `true` | list / tree 左侧全选；chained / associated 在标题行显示全选 |
| `resultSearchable` | `boolean` | `false` | 右侧结果按 label / value 本地过滤；结果树只搜已选叶子 |
| `searchApi` | API | | 左侧远程搜索；携带 `term` / 分页参数 |
| `selectTitle` | `string` | `请选择` | 左侧标题 |
| `resultTitle` | `string` | `当前选择` | 右侧结果标题 |
| `leftTitle` / `rightTitle` | `string` | | Vamis 兼容别名 |
| `menuTpl` | SchemaNode | | 自定义左侧选项展示，模板数据含当前 option |
| `valueTpl` | SchemaNode | | 自定义右侧结果展示，模板数据含当前 option |
| `searchPlaceholder` | `string` | | 左侧搜索提示 |
| `resultSearchPlaceholder` | `string` | | 右侧结果搜索提示 |
| `statistics` | `boolean` | `true` | 显示左右选择数量，默认开启 |
| `itemHeight` | `number` | `38` | list / table 虚拟行高；tree 固定 32 |
| `virtualThreshold` | `number` | `100` | 开启虚拟窗口的选项阈值 |
| `showInvalidMatch` | `boolean` | `false` | 保留未匹配已选值，并控制是否按错误色标红 |
| `onlyChildren` | `boolean` | | 树形只提交叶子 |
| `initiallyOpen` | `boolean` | | 树形默认展开 |
| `autoCheckChildren` | `boolean` | `true` | 树形勾选联动 |
| `pagination` | `object` | | list / table 分页配置，支持 API 与数据域变量分页 |
| `pagination.enable` | `boolean` | | 是否开启分页 |
| `pagination.className` | `string` | | 分页 CSS 类名 |
| `pagination.layout` | `string[]` | `["pager"]` | 分页布局 |
| `pagination.perPageAvailable` | `number[]` | `[10,20,50,100]` | 每页条数 |
| `pagination.maxButtons` | `number` | `5` | 最多分页按钮 |
| `pagination.popOverContainerSelector` | `string` | | 每页切换控件挂载点；Vamis 示例用 `[data-vamis-panel]`，不要照搬 `cxd-*` 类名 |

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
- 与 Amis 一致：静态 options / 远程 source、list / table / tree / chained / associated、左侧统计 / 全选、右侧清除 / 单项移除、joinValues / delimiter、左右搜索、标题。
- 默认 list 已对齐 Amis `GroupedSelection + ResultList`：左侧统计 / 全选 / 分组 / option checkbox，已选项保留在左栏并显示 checked；右侧结果 / 清除 / 单项移除。
- 左右 pane 固定最小高度 **300px**、最大高度 **400px**，内容在 pane 内滚动；不再跟随少量选项缩高。
- 滚动条可见性是 Vamis 的可用性优化：Amis 未主动隐藏，但 macOS overlay scrollbar 会在组件列表 / 表格 / 树溢出时淡出。Vamis 隐藏不可控系统条，改用应用层 `VamisScrollbar` 计算并显示 thumb，支持轨道点击和拖拽；内容不溢出时仍不显示。
- 搜索框右侧固定搜索图标；延时加载树在 pane 内滚动，不再撑高组件；关联右栏超长文本显示省略号。
- 已接：list / table / tree 的 `virtualThreshold` 窗口、实测视口与上下 spacer；list / table 使用 `itemHeight`，tree 按 Amis Tree 固定 32px 行高，不消费 Transfer 的 `itemHeight`。
- 已接：`change` / `selectAll` 事件，`clear` / `reset` / `clearSearch` / `selectAll` / `setValue` 动作；`change` 在写值前派发并支持 `preventDefault`。
- 已接：`chained` 与 `associated` 复用 Select 的级联 / 关联 pane，支持 `leftOptions`、`leftDefaultValue`、`leftMode`、`rightMode` 和 source 信封。
- 已接：`associated` 的可选项统计与全选按 Amis 语义过滤 disabled / 无 `value` 的 `ref`、`defer` 组描述符；全选只写入右侧真实叶子，不会出现 `undefined` 结果。
- `chained` / `associated` 使用等宽选择面与结果面，全选 / 清空放在标题行，不占中间移动列。
- 属性表与编辑器补全已列全 Amis schema；标注“当前 Vamis 未接”的字段尚未实现。
- 已接：`showArrow`、`menuTpl` / `valueTpl`、`showInvalidMatch`。`menuTpl` 覆盖 list / tree / chained 左侧选项，`valueTpl` 覆盖右侧结果列表；未匹配已选值会保留并按 `showInvalidMatch` 决定是否标红。
- 已接：`sortable` 在结果列表只调整已选值顺序，不增减值；Cards / Tabs / Transfer 共用同一 Sortable 生命周期，搜索过滤时暂不显示拖拽手柄。
- 已接：`pagination` 在 list / table 左栏显示分页栏；API 响应读取 `page` / `total | count`，数据域变量一次性分页；`perpage` 显示并切换当前每页条数，翻页选项会累积用于右侧已选值回显。`joinValues:false` + `extractValue:false` 时保留完整 option 对象，不再出现 `[object Object]`。
- 已接：`resultListModeFollowSelect`；table 结果使用共享表格原语和 `columns`，tree 结果只保留已选分支，结果区关闭钮直接移除值。
- 已接：`resultSearchable` 的 label / value 匹配、结果树叶子搜索、祖先保留与 clear；tree 含 defer 时 Amis 不允许结果搜索，Vamis 同步关闭。
- 已接：分页示例使用 `[data-vamis-panel]` 作为 `popOverContainerSelector`；Vamis 不输出 Amis `.cxd-Panel--form`，不能照搬该选择器。
- 已接：`searchApi` 的 term 请求、`data.options` / `data.items` / 数组归一、搜索分页与清空恢复；`searchResultMode` 支持 list / table / tree / chained，table 使用 `searchResultColumns`。
- 已接：375px 移动布局；左右 pane 自然高度堆叠、间距 0，搜索框无外框/圆角，仅保留下边框。
- 运行时未接：无。
