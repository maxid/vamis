---
title: Nav 导航
outline: deep
---

# Nav 导航

::: warning 实现进度 55% · 进行中
主路径可交互（未逐章节两站核完，不进 80%）：`links` / `source`、默认 `stacked`、`stacked: false` 横排、多级 `children` / `unfolded`、`active`、URL `icon`。缺 overflow 收纳、缩起、搜索、拖拽排序、itemBadge。
:::

用来展示链接导航。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。`type: nav` 根标签是 `<nav>`。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

对照不跑外链。活示例用站内 hash：

```schema: scope="body"
type: nav
stacked: true
className: w-md
links:
  - label: Nav 1
    to: "?to=nav1"
    active: true
  - label: Nav 2
    to: "?to=nav2"
  - label: Nav 3
    to: "?to=nav3"
```

## 配置多层级

`unfolded: true` 默认展开子级。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "links": [
    { "label": "Nav 1", "to": "?to=n1", "active": true },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [{ "label": "Nav 2-1-1", "to": "?to=n211" }]
        },
        { "label": "Nav 2-2", "to": "?to=n22" }
      ]
    },
    { "label": "Nav 3", "to": "?to=n3" }
  ]
}
```

## 横向摆放

`stacked: false`（或 `mode: horizontal`）：

```schema: scope="body"
{
  "type": "nav",
  "stacked": false,
  "links": [
    { "label": "Nav 1", "to": "?to=h1" },
    { "label": "Nav 2", "to": "?to=h2" },
    { "label": "Nav 3", "to": "?to=h3" }
  ]
}
```

`overflow` 收纳对照不跑。

## 动态导航

`source` 取上下文数组：

```schema
{
  "type": "page",
  "data": {
    "nav": [
      { "label": "Nav 1", "to": "?to=d1" },
      { "label": "Nav 2", "to": "?to=d2" }
    ]
  },
  "body": {
    "type": "nav",
    "stacked": true,
    "source": "${nav}"
  }
}
```

## 懒加载

可以一次只加载部分层级，更深层次的选项可以标记为 `defer` 为 true，这样只有点开的时才会加载。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "source": "/api/options/nav?parentId=${value}"
}
```

## 更多操作

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "className": "w-md",
  "draggable": true,
  "saveOrderApi": "/api/options/nav",
  "source": "/api/options/nav?parentId=${value}",
  "style": {
    "width": 160
  },
  "itemActions": [
    {
      "type": "icon",
      "icon": "cloud",
      "visibleOn": "this.to === '?cat=1'"
    },
    {
      "type": "dropdown-button",
      "level": "link",
      "icon": "fa fa-ellipsis-h",
      "hideCaret": true,
      "buttons": [
        {
          "type": "button",
          "label": "编辑"
        },
        {
          "type": "button",
          "label": "删除"
        }
      ]
    }
  ]
}
```

## 悬浮导航

可以通过设置`mode`属性来控制导航模式，不设置默认为内联导航模式

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "mode": "float",
  "style": {
    "width": "200px"
  },
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user",
      "active": true
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers"
    }
  ]
}
```

## 悬浮面板模式

设置`mode`属性为 panel，开启悬浮面板模式，最多支持 3 级菜单

```schema: scope="body"
{
  "type": "nav",
  "stacked": false,
  "mode": "panel",
  "overflow": {
    "enable": true
  },
  "links": [
    {
      "label": "Nav 1",
      "to": "?to=nav1",
      "children": [
        {
          "label": "Nav 1-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav1-1"
        },
        {
          "label": "Nav 1-2",
          "icon": "fa fa-user",
          "to": "?to=nav1-2"
        }
      ]
    },
    {
      "label": "Nav 2",
      "to": "?to=nav2",
      "children": [
        {
          "label": "Nav 2-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "icon": "fa fa-user",
              "to": "?to=nav2-1-1"
            },
            {
              "label": "Nav 2-1-2",
              "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
              "to": "http://www.baidu.com/",
              "target": "_blank"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "?to=nav3"
    },
    {
      "label": "Nav 4",
      "to": "?to=nav4"
    },
    {
      "label": "Nav 5",
      "to": "?to=nav5"
    },
    {
      "label": "Nav 6",
      "to": "?to=nav6"
    },
    {
      "label": "Nav 7",
      "to": "?to=nav7"
    },
    {
      "label": "Nav 8",
      "to": "?to=nav8",
      "children": [
        {
          "label": "Nav 8-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav8-1"
        }
      ]
    },
    {
      "label": "Nav 9",
      "to": "?to=nav9",
      "children": [
        {
          "label": "Nav 9-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav9-1",
          "children": [
            {
              "label": "Nav 9-1-1",
              "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
              "to": "?to=nav9-1-1"
            },
            {
              "label": "Nav 9-1-2",
              "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
              "to": "?to=nav13"
            }
          ]
        },
        {
          "label": "Nav 9-2",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav9-2"
        }
      ]
    }
  ]
}
```

设置竖向展示

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "mode": "panel",
  "overflow": {
    "enable": true
  },
  "style": {
    "width": 200
  },
  "links": [
    {
      "label": "Nav 1",
      "to": "?to=nav1",
      "children": [
        {
          "label": "Nav 1-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav1-1"
        },
        {
          "label": "Nav 1-2",
          "icon": "fa fa-user",
          "to": "?to=nav1-2"
        }
      ]
    },
    {
      "label": "Nav 2",
      "to": "?to=nav2",
      "children": [
        {
          "label": "Nav 2-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "icon": "fa fa-user",
              "to": "?to=nav2-1-1"
            },
            {
              "label": "Nav 2-1-2",
              "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
              "to": "http://www.baidu.com/",
              "target": "_blank"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "?to=nav3"
    },
    {
      "label": "Nav 4",
      "to": "?to=nav4"
    },
    {
      "label": "Nav 5",
      "to": "?to=nav5"
    },
    {
      "label": "Nav 6",
      "to": "?to=nav6"
    },
    {
      "label": "Nav 7",
      "to": "?to=nav7"
    },
    {
      "label": "Nav 8",
      "to": "?to=nav8",
      "children": [
        {
          "label": "Nav 8-1",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav8-1"
        }
      ]
    },
    {
      "label": "Nav 9",
      "to": "?to=nav9",
      "children": [
        {
          "label": "Nav 9-1",
          "to": "?to=nav9-1",
          "children": [
            {
              "label": "Nav 9-1-1",
              "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
              "to": "?to=nav9-1-1"
            },
            {
              "label": "Nav 9-1-2",
              "to": "?to=nav9-1-2"
            }
          ]
        },
        {
          "label": "Nav 9-2",
          "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg",
          "to": "?to=nav9-2"
        }
      ]
    }
  ]
}
```

## 导航缩起

`collapsed`属性控制导航的展开和缩起，缩起状态下，导航内容仅展示图标或第一个文字，悬浮展开全部内容或子导航项

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "collapsed": true,
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers"
    }
  ]
}
```

## 导航分割线

导航项`mode`属性控制导航项的展示模式，支持`divider`（分割线）和`group`（分组）两种模式，不设置默认为普通导航项

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "style": {
    "width": "160px"
  },
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "mode": "divider"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers",
      "disabled": true,
      "disabledTip": "导航项禁用"
    }
  ]
}
```

## 导航分组

分组模式（`"mode": "group"`）的导航项展示为分组标题形式

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "mode": "group",
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers",
      "mode": "group",
      "children": [
        {
          "label": "Nav 3-1",
          "to": "/docs/api-2-1"
        }
      ]
    }
  ]
}
```

## 默认展开层级

当前导航最大层级为 4，可通过`defaultOpenLevel`来控制默认 2 层级全部展开

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "defaultOpenLevel": "2",
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1",
              "children": [
                {
                  "label": "Nav 2-1-1-1",
                  "to": "/docs/api-2-1-1-1"
                }
              ]
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers",
      "children": [
        {
          "label": "Nav 3-1",
          "to": "/docs/api-2-1"
        }
      ]
    }
  ]
}
```

## 自定义展开按钮

可以设置`expandIcon`为 icon 的名称字符串

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "expandIcon": "close",
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers",
      "children": [
        {
          "label": "Nav 3-1",
          "to": "/docs/api-2-1"
        }
      ]
    }
  ]
}
```

也可以将`expandIcon`设置为`SchemaObject`

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "expandIcon": {
    "type": "icon",
    "icon": "far fa-address-book"
  },
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers",
      "children": [
        {
          "label": "Nav 3-1",
          "to": "/docs/api-2-1"
        }
      ]
    }
  ]
}
```

## 搜索导航项

> `3.5.0` 及以上版本

开启`"searchable": true`后，支持搜索当前数据源内的导航项，支持自定义匹配函数[`NavMatchFunc`](#navmatchfunc)，如果不设置默认模糊匹配导航对象中的`label`, `title` 和 `key` 字段。

```schema: scope="body"
{
  "type": "container",
  "className": "w-40",
  "body": [
    {
      "type": "nav",
      "stacked": true,
      "searchable": true,
      "searchConfig": {
        "matchFunc": "return link.searchKey === keyword;"
      },
      "links": [
        {
          "label": "Nav 1",
          "to": "?to=nav1",
          "searchKey": "1"
        },
        {
          "label": "Nav 2",
          "to": "?to=nav2",
          "searchKey": "2",
          "children": [
            {
              "label": "Nav 2-1",
              "to": "?to=nav2-1",
              "searchKey": "2-1",
              "children": [
                {
                  "label": "Nav 2-1-1",
                  "to": "?to=nav2-1-1",
                  "searchKey": "2-1-1"
                }
              ]
            }
          ]
        },
        {
          "label": "Nav 3",
          "to": "?to=nav3",
          "searchKey": "3",
          "children": [
            {
              "label": "Nav 3-1",
              "to": "?to=nav3-1",
              "searchKey": "3-1"
            }
          ]
        },
        {
          "label": "Nav 4",
          "to": "?to=nav4",
          "searchKey": "4"
        },
        {
          "label": "Nav 5",
          "to": "?to=nav5",
          "searchKey": "5"
        }
      ]
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"nav"` | 指定为 Nav |
| stacked | `boolean` | `true` | `false` 横排 |
| mode | `string` | `inline` | `horizontal` 也横排。悬浮面板未接 |
| source | 表达式 / Api | | 动态 links。远程 api 未接 |
| links | `Array` | | 链接集合 |
| links[].label | `string` | | 名称 |
| links[].to | 模板 | | 地址 |
| links[].icon | `string` | | 含 `/` 当图片 |
| links[].children | `Array` | | 子链接 |
| links[].unfolded | `boolean` | | 初始展开 |
| links[].active | `boolean` | | 高亮 |
| collapsed | `boolean` | | 缩起，尚未接入 |
| overflow | `object` | | 横排收纳，尚未接入 |
| className | `string` | | 打在宿主 |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，在`actions`中可以通过`${事件参数名}`或`${event.data.[事件参数名]}`来获取事件产生的数据，详细查看[事件动作](/concepts/event-action)。

| 事件名称  | 事件参数                                                        | 说明                     |
| --------- | --------------------------------------------------------------- | ------------------------ |
| loaded    | `items: item[]` 数据源<br/>`item?: object` 懒加载时所点击导航项 | 异步加载数据源完成时触发 |
| collapsed | `collapsed: boolean` 缩起展开状态                               | 导航缩起展开时触发       |
| toggled   | `item: object` 导航项数据<br/>`open: boolean` 展开状态          | 点击导航展开按钮时触发   |
| change    | `value: item[]` 选中导航项数据                                  | 导航项选中有变化时触发   |
| click     | `item: object` 点击导航项数据                                   | 手动点击导航项时触发     |

### loaded

数据源加载完成，可以尝试将`source`配置为 api 地址或者开启懒加载。

```schema
{
  "type": "page",
  "body": [
    {
      "type": "action",
      "label": "刷新",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "reload",
              "componentId": "test"
            }
          ]
        }
      }
    },
    {
      "id": "test",
      "type": "nav",
      "stacked": true,
      "valueField": "label",
      "source": "/api/options/nav?parentId=${value}",
      "onEvent": {
        "loaded": {
          "actions": [
            {
              "actionType": "toast",
              "args": {
                "msg": "已加载${event.data.items.length}条记录"
              }
            }
          ]
        }
      }
    }
  ]
}
```

### collapsed

导航缩起，可以尝试修改导航的`collapsed`属性。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "collapsed": true,
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers"
    }
  ],
  "onEvent": {
    "collapsed": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "${event.data.collapsed ? '导航缩起' : '导航展开'}"
          }
        }
      ]
    }
  }
}
```

### toggled

导航项收起展开，可以尝试点击导航项展开按钮。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers"
    }
  ],
  "onEvent": {
    "toggled": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "${event.data.item.label}${event.data.open ? '展开' : '收起'}"
          }
        }
      ]
    }
  }
}
```

### change

导航项选中，可以尝试手动修改任意导航项的`active`属性。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "links": [
    {
      "label": "Nav 1",
      "to": "/docs/index",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "unfolded": true,
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1",
              "to": "/docs/api-2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2",
          "to": "/docs/api-2-2"
        }
      ]
    },
    {
      "label": "Nav 3",
      "to": "/docs/renderers"
    }
  ],
  "onEvent": {
    "change": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "${event.data.value.length}项选中"
          }
        }
      ]
    }
  }
}
```

### click

导航项点击，可以尝试手动点击任意导航项。

```schema: scope="body"
{
  "type": "nav",
  "stacked": true,
  "links": [
    {
      "label": "Nav 1",
      "icon": "fa fa-user"
    },
    {
      "label": "Nav 2",
      "children": [
        {
          "label": "Nav 2-1",
          "children": [
            {
              "label": "Nav 2-1-1"
            }
          ]
        },
        {
          "label": "Nav 2-2"
        }
      ]
    },
    {
      "label": "Nav 3"
    }
  ],
  "onEvent": {
    "click": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "${event.data.item.label}被点击了，但不一定选中"
          }
        }
      ]
    }
  }
}
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定`actionType: 动作名称`、`componentId: 该组件id`来触发这些动作，动作配置可以通过`args: {动作配置项名称: xxx}`来配置具体的参数，详细请查看[事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称    | 动作配置                         | 说明                                                                                    |
| ----------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| updateItems | `value: string`或`value: item[]` | 更新导航数据源为指定导航项的子导航数据                                                  |
| reset       |                                  | 重置导航数据源，和 updateItems 搭配使用，没有经过 updateItems 操作的，执行 reset 无效果 |

### updateItems / reset

```schema: scope="body"
{
  "type": "page",
  "data": {
    "items": [
      {
        "label": "Nav 1",
        "to": "/docs/index",
        "icon": "fa fa-user"
      },
      {
        "label": "Nav 2",
        "unfolded": true,
        "active": true,
        "children": [
          {
            "label": "Nav 2-1",
            "children": [
              {
                "label": "Nav 2-1-1",
                "to": "/docs/api-2-1-1"
              }
            ]
          },
          {
            "label": "Nav 2-2",
            "to": "/docs/api-2-2"
          }
        ]
      },
      {
        "label": "Nav 3",
        "to": "/docs/renderers"
      }
    ]
  },
  "body": {
    "type": "container",
    "body": [
      {
        "type": "action",
        "label": "设置数据源",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "updateItems",
                "args": {
                  "value": "Nav 2"
                },
                "componentId": "asideNav"
              }
            ]
          }
        }
      },
      {
        "type": "action",
        "label": "重置数据源",
        "className": "mx-1",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "reset",
                "componentId": "asideNav"
              }
            ]
          }
        }
      },
      {
        "type": "container",
        "body": [
          {
            "type": "nav",
            "stacked": true,
            "source": "${items}",
            "id": "asideNav"
          }
        ]
      }
    ]
  }
}
```

## 和 Amis 文档的差异
- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 overflow、缩起、搜索、拖拽、`itemBadge`、悬浮面板、`deferApi`。
