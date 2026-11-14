---
title: Tabs 选项卡
outline: deep
---

# Tabs 选项卡

::: info 实现进度 95% · 进行中
文档主路径已对齐：`tabs[].body` / `tab`、`source`、`activeKey` / `defaultKey`、`disabled`、`tabsMode` 九种、工具栏、图标、`showTip`、表单 `name`、增删改拖（Sortable 250ms）、折叠「更多」下拉、地址栏 `#hash` 来回同步、`change` / `delete`、`changeActiveKey` / `deleteTab`。余项：`swipeable`、chrome 耳朵 SVG、`themeCss`。
:::

选项卡容器。Vamis 用 YAML 或 JSON 书写，字段名不改写。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

## 基本用法

```schema: scope="body"
{
    "type": "tabs",
    "swipeable": true,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

默认按 `tabs` 成员数生成选项卡。根据数据动态生成时再配 `source`：模板会按数组重复，`${a}` / `${b}` 取当前项。

```schema
{
    "type": "page",
    "data": {
        "arr": [
            {
                "a": "收入",
                "b": 199
            },
            {
                "a": "支出",
                "b": 299
            }
        ]
    },
    "body": [
        {
            "type": "tabs",
            "source": "${arr}",
            "tabs": [
                {
                    "title": "${a}",
                    "body": {
                        "type": "tpl",
                        "tpl": "金额：${b|number}元"
                    }
                }
            ]
        }
    ]
}
```

## 拖拽排序

```schema: scope="body"
{
    "type": "tabs",
    "draggable": true,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        },
        {
            "title": "Tab 3",
            "tab": "Content 3"
        }
    ]
}
```

## 可增加、删除

单个 tab 的 `closable` 优先级高于整体。`addBtnText` 改新增按钮文案。

```schema: scope="body"
{
    "type": "tabs",
    "closable": true,
    "addable": true,
    "addBtnText": "新增Tab",
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1",
            "closable": false
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

## 可编辑标签名

双击标签名进入编辑。`title` 为 SchemaNode 时不支持双击改名。

```schema: scope="body"
{
    "type": "tabs",
    "editable": true,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        },
        {
            "title": "双击编辑",
            "tab": "Content 2"
        }
    ]
}
```

## 可禁用

```schema: scope="body"
{
    "type": "tabs",
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2",
            "disabled": true
        }
    ]
}
```

## 显示提示

```schema: scope="body"
{
    "type": "tabs",
    "showTip": true,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

## 作为表单项的值

表单里给 tabs 配了 `name`，它会作为提交项。默认取 `title`。

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "type": "tabs",
            "name": "tab",
            "tabs": [
                {
                    "title": "Tab 1",
                    "tab": "Content 1"
                },
                {
                    "title": "Tab 2",
                    "tab": "Content 2"
                }
            ]
        }
    ]
}
```

不想用 title 时，给每个 tab 设 `value`：

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "type": "tabs",
            "name": "tab",
            "tabs": [
                {
                    "title": "Tab 1",
                    "tab": "Content 1",
                    "value": 0
                },
                {
                    "title": "Tab 2",
                    "tab": "Content 2",
                    "value": 1
                }
            ]
        }
    ]
}
```

## 展示模式

`tabsMode` 默认 `line`。也可写 `mode`（动作示例里常见）。

### 简约

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "simple",
    "tabs": [
        {
            "title": "简约(10)",
            "body": "选项卡内容1",
            "icon": "fa fa-home"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 加强

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "strong",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 线型

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "line",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 卡片

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "card",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 仿 Chrome

仿 Chrome tab 样式。耳朵形 SVG **未接**，当前是圆角条。

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "chrome",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 水平铺满

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "tiled",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        },
        {
            "title": "选项卡4",
            "body": "选项卡内容4"
        }
    ]
}
```

### 选择器型

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "radio",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 垂直

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "vertical",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "选项卡内容1"
        },
        {
            "title": "选项卡2",
            "body": "选项卡内容2"
        },
        {
            "title": "选项卡3",
            "body": "选项卡内容3"
        }
    ]
}
```

### 侧边栏模式

`sidePosition` 设标签栏位置。

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "sidebar",
    "sidePosition": "right",
    "tabs": [
        {
            "title": "按钮",
            "body": "选项卡内容1",
            "icon": "fa fa-square"
        },
        {
            "title": "动作",
            "body": "选项卡内容2",
            "icon": "fa fa-gavel"
        }
    ]
}
```

## 配置顶部工具栏

配置 `toolbar` 实现顶部工具栏。

```schema: scope="body"
{
    "type": "tabs",
    "toolbar": [
        {
            "type": "button",
            "label": "按钮",
            "size": "sm",
            "actionType": "dialog",
            "dialog": {
                "title": "弹窗标题",
                "body": "你点击了"
            }
        }
    ],
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

## 配置 hash

单个 tab 可写 `hash`。来回切换都会同步地址栏 `#hash`，浏览器前进后退也会切回对应项。

```schema: scope="body"
{
    "type": "tabs",
    "tabs": [
        {
            "title": "Tab 1",
            "hash": "tab1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "hash": "tab2",
            "tab": "Content 2"
        }
    ]
}
```

## 默认显示某个选项卡

配 `activeKey`，hash 或索引（`0` 是第一项）。

#### 配置 hash 值

支持变量，如 `"tab${id}"`。

```schema: scope="body"
{
    "type": "tabs",
    "activeKey": "tab2",
    "tabs": [
        {
            "title": "Tab 1",
            "hash": "tab1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "hash": "tab2",
            "tab": "Content 2"
        }
    ]
}
```

内容来源于 source：

```schema: scope="body"
{
    "type": "page",
    "data": {
        "arr": [
            {
                "a": "收入",
                "b": 199,
                "key": "a"
            },
            {
                "a": "支出",
                "b": 299,
                "key": "b"
            }
        ]
    },
    "body": [
        {
            "type": "tabs",
            "activeKey": "b",
            "source": "${arr}",
            "tabs": [
                {
                    "title": "${a}",
                    "hash": "${key}",
                    "body": {
                        "type": "tpl",
                        "tpl": "金额：${b|number}元"
                    }
                }
            ]
        }
    ]
}
```

#### 配置索引值

单个 tab 不要配 `hash`，`0` 代表第一个。支持变量，如 `"${id}"`。

```schema: scope="body"
{
    "type": "tabs",
    "activeKey": 1,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

### 动态设置选项卡

```schema
{
  "type": "page",
    "data": {
    "key": 2
  },
  "body": [
    {
      "type": "radios",
      "name": "key",
      "mode": "inline",
      "label": "激活的选项卡",
      "options": [
        {
          "label": "Tab 1",
          "value": 0
        },
        {
          "label": "Tab 2",
          "value": 1
        },
        {
          "label": "Tab 3",
          "value": 2
        }
      ]
    },
    {
      "type": "tabs",
      "activeKey": "${key|toInt}",
      "tabs": [
        {
          "title": "Tab 1",
          "tab": "Content 1"
        },
        {
          "title": "Tab 2",
          "tab": "Content 2"
        },
        {
          "title": "Tab 3",
          "tab": "Content 3"
        }
      ]
    }
  ]
}
```

### 初始化设置默认选项卡

```schema
{
  "type": "page",
  "data": {
    "defaultKey": 1,
    "key": 2
  },
  "body": [
    {
      "type": "radios",
      "name": "key",
      "mode": "inline",
      "label": "激活的选项卡",
      "options": [
        {
          "label": "Tab 1",
          "value": 0
        },
        {
          "label": "Tab 2",
          "value": 1
        },
        {
          "label": "Tab 3",
          "value": 2
        }
      ]
    },
    {
      "type": "tabs",
      "activeKey": "${activeKey|toInt}",
      "defaultKey": "${defaultKey|toInt}",
      "tabs": [
        {
          "title": "Tab 1",
          "tab": "Content 1"
        },
        {
          "title": "Tab 2",
          "tab": "Content 2"
        },
        {
          "title": "Tab 3",
          "tab": "Content 3"
        }
      ]
    }
  ]
}
```

初始化时若 `activeKey` 求空，会落到 `defaultKey`。`defaultKey` 只在挂载时用一次，不跟上下文变。

## 图标

`icon` 可以是 Font Awesome class 或带 `.` 的 URL。

```schema: scope="body"
{
    "type": "tabs",
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1",
            "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

## title 自定义

`title` 可以是 SchemaNode。此时 `editable` 双击改名无效。

```schema: scope="body"
{
    "type": "tabs",
    "addBtnText": "新增Tab",
    "showTip": true,
    "tabs": [
        {
            "title": {
                "type": "container",
                "body": [
                    {
                        "type": "tpl",
                        "tpl": "这里是容器内容区"
                    },
                    {
                        "type": "icon",
                        "icon": "cloud"
                    }
                ]
            },
            "closable": true,
            "tab": "Content 1",
            "tip": "容器内容区提示"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        }
    ]
}
```

## 配置超出折叠

`collapseOnExceed` 超出后折进「更多」；`collapseBtnLabel` 改按钮文案。

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "tiled",
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2"
        },
        {
            "title": "Tab 3",
            "tab": "Content 3"
        },
        {
            "title": "Tab 4",
            "tab": "Content 4"
        },
        {
            "title": "Tab 5",
            "tab": "Content 5"
        }
    ],
    "collapseOnExceed": 3
}
```

## mountOnEnter

默认 `mountOnEnter: true`：只有点中的 tab 才挂载内容。内容多时能提升性能，第一次点击会有一点停顿。

## unmountOnExit

切走时销毁隐藏项，配 `"unmountOnExit": true`。

## 监听切换事件

切换走 `onEvent.change`。Amis 文档里的 `onSelect: "alert(key)"` 字符串函数 **未接**。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"tabs"` | 指定为 Tabs 渲染器 |
| defaultKey | `string` / `number` | | 初始化激活项，hash 或索引，支持表达式 |
| activeKey | `string` / `number` | | 激活项，hash 或索引，支持表达式，可跟数据变化 |
| className | [`ClassName`](/types/classname) | | 外层 class，打在 `div.vamis-node` |
| linksClassName | [`ClassName`](/types/classname) | | 标题区 class |
| contentClassName | [`ClassName`](/types/classname) | | 内容区 class |
| tabsMode | `string` | `"line"` | `line` / `card` / `radio` / `vertical` / `chrome` / `simple` / `strong` / `tiled` / `sidebar`。也可写 `mode` |
| tabs | `Array` | | 选项卡列表 |
| source | `string` | | 关联数据后重复生成选项卡 |
| toolbar | [`SchemaNode`](/types/schemanode) | | 顶部工具栏 |
| toolbarClassName | [`ClassName`](/types/classname) | | 工具栏 class |
| tabs[x].title | `string` \| [`SchemaNode`](/types/schemanode) | | 标题；为 SchemaNode 时不支持 `editable` 双击改名 |
| tabs[x].icon | `icon` | | 图标 |
| tabs[x].iconPosition | `left` / `right` | `left` | 图标位置 |
| tabs[x].tab / body | [`SchemaNode`](/types/schemanode) | | 内容区，`body` 优先 |
| tabs[x].hash | `string` | | 激活 key；与 `activeKey` 对应 |
| tabs[x].reload | `boolean` | | **未接**。Amis 每次进入都重渲 |
| tabs[x].unmountOnExit | `boolean` | | **未接** 单项。请用组件级 `unmountOnExit` |
| tabs[x].className | [`ClassName`](/types/classname) | | Tab 内容区 class |
| tabs[x].tip | `string` | | 开启 `showTip` 后 hover 提示；不写则用 title |
| tabs[x].closable | `boolean` | false | 是否可删，优先于组件 `closable` |
| tabs[x].disabled | `boolean` | false | 是否禁用 |
| tabs[x].value | `any` | | 作为表单项时写入的值，默认 title |
| mountOnEnter | `boolean` | true | 点中才挂载 |
| unmountOnExit | `boolean` | false | 切走卸载 |
| addable | `boolean` | false | 是否支持新增 |
| addBtnText | `string` | `新增` | 新增按钮文案 |
| closable | `boolean` | false | 是否支持删除 |
| draggable | `boolean` | false | 是否支持拖拽 |
| showTip | `boolean` | false | 是否支持提示 |
| showTipClassName | `string` | | 提示的 class |
| editable | `boolean` | false | 是否可编辑标签名 |
| scrollable | `boolean` | true | 属性废弃，未接 |
| sidePosition | `left` / `right` | `left` | `sidebar` 模式下标签栏位置 |
| collapseOnExceed | `number` | | 超出后开始折叠 |
| collapseBtnLabel | `string` | `more` | 折叠按钮文案。未写时 zh-CN 显示「更多」 |
| swipeable | `boolean` | false | **未接**。移动端手势滑动 |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听，`actions` 里用 `${event.data.[参数名]}` 取数据，详见 [事件动作](/concepts/event-action)。

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| change | `value: number \| string` 选项卡 hash 或索引 | 切换选项卡时触发 |
| delete | `value: number \| string` 选项卡 hash 或索引 | 删除选项卡时触发 |

### change

```schema: scope="body"
{
    "type": "tabs",
    "mode": "line",
    "tabs": [
    {
        "title": "选项卡1",
        "body": "选项卡内容1"
    },
    {
        "title": "选项卡2",
        "body": "选项卡内容2"
    },
    {
        "title": "选项卡3",
        "body": "选项卡内容3"
    }
    ],
    "onEvent": {
        "change": {
            "actions": [
                {
                    "actionType": "toast",
                    "args": {
                    "msgType": "info",
                    "msg": "切换至选项卡${event.data.value}"
                    }
                }
            ]
        }
    }
}
```

### delete

```schema: scope="body"
{
    "type": "tabs",
    "closable": true,
    "mode": "line",
    "tabs": [
    {
        "title": "选项卡1",
        "body": "选项卡内容1"
    },
    {
        "title": "选项卡2",
        "body": "选项卡内容2"
    },
    {
        "title": "选项卡3",
        "body": "选项卡内容3"
    }
    ],
    "onEvent": {
        "delete": {
            "actions": [
                {
                    "actionType": "toast",
                    "args": {
                        "msgType": "info",
                        "msg": "删除选项卡${event.data.value}"
                    }
                }
            ]
        }
    }
}
```

## 动作表

其他组件可以通过 `actionType` + `componentId` 触发。详见 [事件动作](/concepts/event-action)。

| 动作名称 | 动作配置 | 说明 |
| --- | --- | --- |
| changeActiveKey | `activeKey: number \| string` | 激活指定选项卡。数字按 **从 1 起** 的序号 |
| deleteTab | `deleteHash: string` | 按 hash 删除指定选项卡 |

### changeActiveKey

```schema: scope="body"
[
    {
      "type": "action",
      "label": "激活选项卡1",
      "className": "mr-3 mb-3",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "changeActiveKey",
              "componentId": "tabs-change-receiver",
              "args": {
                "activeKey": 1
              }
            }
          ]
        }
      }
    },
    {
      "type": "action",
      "label": "激活选项卡2",
      "className": "mr-3 mb-3",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "changeActiveKey",
              "componentId": "tabs-change-receiver",
              "args": {
                "activeKey": 2
              }
            }
          ]
        }
      }
    },
    {
      "type": "action",
      "label": "激活选项卡3",
      "className": "mr-3 mb-3",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "changeActiveKey",
              "componentId": "tabs-change-receiver",
              "args": {
                "activeKey": 3
              }
            }
          ]
        }
      }
    },
    {
      "id": "tabs-change-receiver",
      "type": "tabs",
      "mode": "line",
      "tabs": [
        {
          "title": "选项卡1",
          "body": "选项卡内容1"
        },
        {
          "title": "选项卡2",
          "body": "选项卡内容2"
        },
        {
          "title": "选项卡3",
          "body": "选项卡内容3"
        }
      ]
    }
]
```

### deleteTab

```schema: scope="body"
[
    {
      "type": "action",
      "label": "删除选项卡1",
      "className": "mr-3 mb-3",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "deleteTab",
              "componentId": "tabs-delete-receiver",
              "args": {
                "deleteHash": "tab1"
              }
            }
          ]
        }
      }
    },
    {
      "type": "action",
      "label": "删除选项卡2",
      "className": "mr-3 mb-3",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "deleteTab",
              "componentId": "tabs-delete-receiver",
              "args": {
                "deleteHash": "tab2"
              }
            }
          ]
        }
      }
    },
    {
      "type": "action",
      "label": "删除选项卡3",
      "className": "mr-3 mb-3",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "deleteTab",
              "componentId": "tabs-delete-receiver",
              "args": {
                "deleteHash": "tab3"
              }
            }
          ]
        }
      }
    },
    {
      "id": "tabs-delete-receiver",
      "type": "tabs",
      "mode": "line",
      "tabs": [
        {
          "title": "选项卡1",
          "hash": "tab1",
          "body": "选项卡内容1"
        },
        {
          "title": "选项卡2",
          "hash": "tab2",
          "body": "选项卡内容2"
        },
        {
          "title": "选项卡3",
          "hash": "tab3",
          "body": "选项卡内容3"
        }
      ]
    }
]
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 `swipeable`、chrome 耳朵 SVG、`onSelect` 字符串、`tabs[x].reload`、单项 `unmountOnExit`、`themeCss`。
- Chrome 模式是圆角条近似，没有 Amis 那对 SVG 耳朵。
