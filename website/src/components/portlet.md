---
title: Portlet 门户栏目
outline: deep
---

# Portlet 门户栏目

::: info 实现进度 85% · 进行中
文档主路径已对齐：`tabs[].body` / `tab`、`source`、`description`、`hideHeader`、默认分隔线 / `divider: false`、全局与 tab 级 `toolbar`、`mountOnEnter` 默认 false、`change`。缺 `themeCss`、icon 像素、`scrollable`、tabsMode 皮肤。
:::

门户栏目：带边框的 Tabs。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

## 基本用法

点「编辑 Schema」可切 JSON。

```schema
type: page
data:
  text: 这是一段描述信息
body:
  type: portlet
  description: ${text}
  tabs:
    - title: 标题
      tab: Content 1
    - title: 标题2
      tab: Content 2
```

## 隐藏头部

`hideHeader: true` 去掉标题栏，只展示第一项内容。

```schema: scope="body"
{
    "type": "portlet",
    "hideHeader": true,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1"
        }
    ]
}
```

## 设置 style

`style` 打在宿主 `div.vamis-node`。只有一项时标题没有选中态。

```schema: scope="body"
{
    "type": "portlet",
    "style": {
        "borderColor": "#333"
    },
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1 style"
        }
    ]
}
```

## 去掉分隔线

默认头部有底部分隔线。`"divider": false` 去掉。

```schema: scope="body"
{
    "type": "portlet",
    "divider": false,
    "tabs": [
        {
            "title": "标题",
            "tab": "Content 1 nodiv"
        }
    ]
}
```

## 配置工具栏

`toolbar` 在右侧，不随 tab 切换。每个 tab 也可以写自己的 `toolbar`。缺 `type` 时按 `button`，`level` 默认 `link`，`size` 默认 `sm`。对照不跑带 ajax / dialog 的活示例：

```yaml
type: portlet
toolbar:
  - label: 固定操作
    type: button
    actionType: ajax
    api: /api/mock2/form/saveForm
tabs:
  - title: Tab 1
    tab: Content 1
    toolbar:
      - label: ajax请求
        type: button
        actionType: ajax
        api: /api/mock2/form/saveForm
  - title: Tab 2
    tab: Content 2
```

无远程动作的工具栏可以活跑：

```schema: scope="body"
{
    "type": "portlet",
    "toolbar": [
        {
            "label": "固定操作"
        }
    ],
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1 tool",
            "toolbar": [
                {
                    "label": "本页操作"
                }
            ]
        },
        {
            "title": "Tab 2",
            "tab": "Content 2 tool"
        }
    ]
}
```

## source 动态数据

配置 `source`，按数组重复 tabs 模板，用法与 [Tabs](/components/tabs) 相同。

```schema
{
    "type": "page",
    "data": {
        "arr": [
            { "a": "收入", "b": 199 },
            { "a": "支出", "b": 299 }
        ]
    },
    "body": {
        "type": "portlet",
        "source": "${arr}",
        "tabs": [
            {
                "title": "${a}",
                "body": "金额：${b}元"
            }
        ]
    }
}
```

## 事件表

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| change | `value: number \| string` 栏目 hash 或索引 | 切换栏目时触发 |

对照不跑带 toast 的 `change` 活示例：

```yaml
type: portlet
onEvent:
  change:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: 切到了 ${event.data.value}
tabs:
  - title: Tab 1
    tab: Content 1
  - title: Tab 2
    tab: Content 2
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"portlet"` | 指定为 Portlet 渲染器 |
| className | `string` | | 外层 class，打在 `div.vamis-node` |
| tabsClassName | `string` | | Tabs 区域 class |
| contentClassName | `string` | | 内容区 class |
| tabs | `Array` | | 栏目列表 |
| source | `string` | | 关联数据后重复生成栏目 |
| toolbar | SchemaNode | | 右侧工具栏，不随 tab 切换 |
| style | `string` \| `Object` | | 自定义样式 |
| description | 模板 | | 标题右侧信息 |
| hideHeader | `boolean` | false | 隐藏头部 |
| divider | `boolean` | true | 头部分隔线 |
| tabs[x].title | `string` | | Tab 标题 |
| tabs[x].tab / body | SchemaNode | | 内容区，`body` 优先 |
| tabs[x].toolbar | SchemaNode | | 随 tab 切换的工具栏 |
| mountOnEnter | `boolean` | false | 点中才挂载 |
| unmountOnExit | `boolean` | false | 切走卸载 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接栏目拖拽、`scrollable` 溢出滚动、fontawesome 图标；URL 图标只在 `icon` 含 `/` 时当图片。
- `className` / `style` 落在 SchemaRenderer 宿主上。未接 `themeCss`。
