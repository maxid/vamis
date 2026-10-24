---
title: Tabs 选项卡
outline: deep
---

# Tabs 选项卡

::: info 实现进度 85% · 进行中
文档主路径已对齐：`tabs[].body` / `tab`、`source` 动态、`activeKey` / `hash`、`disabled`、`mountOnEnter`、`change`。缺 `addable` / `draggable` / `editable`、`tabsMode` 像素级、`themeCss`、`swipeable`。
:::

选项卡容器。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

## 基本用法

默认按 `tabs` 成员数生成选项卡。内容写在 `tab` 或 `body`。

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
            "tab": "Content 2"
        }
    ]
}
```

同一段也可以写成 YAML：

```schema: scope="body"
type: tabs
tabs:
  - title: Tab 1
    tab: Content 1 YAML
  - title: Tab 2
    tab: Content 2 YAML
```

根据数据动态生成时，再配 `source`：模板会按数组重复，`${a}` / `${b}` 取当前项。

```schema
{
    "type": "page",
    "data": {
        "arr": [
            { "a": "收入", "b": 199 },
            { "a": "支出", "b": 299 }
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
                        "tpl": "金额：${b}元"
                    }
                }
            ]
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

## 配置 hash 与默认激活

单个 tab 可写 `hash`。`activeKey` 可以是 hash 或索引（`0` 是第一项）。

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

按索引激活第二项：

```schema: scope="body"
{
    "type": "tabs",
    "activeKey": 1,
    "tabs": [
        {
            "title": "Tab 1",
            "tab": "Content 1 index"
        },
        {
            "title": "Tab 2",
            "tab": "Content 2 index"
        }
    ]
}
```

## 展示模式

`tabsMode` 默认 `line`。`vertical` 把标题栏放到左侧：

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

卡片模式：

```schema: scope="body"
{
    "type": "tabs",
    "tabsMode": "card",
    "tabs": [
        {
            "title": "选项卡1",
            "body": "卡片内容1"
        },
        {
            "title": "选项卡2",
            "body": "卡片内容2"
        }
    ]
}
```

还支持 `radio` / `chrome` / `simple` / `strong` / `tiled` / `sidebar`（像素级皮肤未齐）。

## 配置顶部工具栏

`toolbar` 渲染在标题栏右侧。和表格、表单联动时按钮仍可写 `actionType: dialog`。对照不跑这份，避免 Action toast 探测把选项卡判失败：

```yaml
type: tabs
toolbar:
  - type: button
    label: 按钮
    size: sm
    actionType: dialog
    dialog:
      title: 弹窗标题
      body: 你点击了
tabs:
  - title: Tab 1
    tab: Content 1
  - title: Tab 2
    tab: Content 2
```

## mountOnEnter

默认 `mountOnEnter: true`：只有点中的 tab 才挂载内容。`unmountOnExit: true` 会在切走时销毁隐藏项。

## 事件表

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| change | `value: number \| string` 选项卡 hash 或索引 | 切换选项卡时触发 |

对照不跑带 toast 的 `change` 活示例：

```yaml
type: tabs
onEvent:
  change:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: 切到了 ${event.data.value}
tabs:
  - title: 选项卡1
    body: 选项卡内容1
  - title: 选项卡2
    body: 选项卡内容2
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"tabs"` | 指定为 Tabs 渲染器 |
| defaultKey | `string` / `number` | | 初始化激活项，hash 或索引 |
| activeKey | `string` / `number` | | 激活项，hash 或索引，可跟数据变化 |
| className | `string` | | 外层 class，打在 `div.vamis-node` |
| linksClassName | `string` | | 标题区 class |
| contentClassName | `string` | | 内容区 class |
| tabsMode | `string` | `"line"` | `line` / `card` / `radio` / `vertical` / `chrome` / `simple` / `strong` / `tiled` / `sidebar` |
| tabs | `Array` | | 选项卡列表 |
| source | `string` | | 关联数据后重复生成选项卡 |
| toolbar | SchemaNode | | 顶部工具栏 |
| tabs[x].title | `string` \| SchemaNode | | 标题 |
| tabs[x].tab / body | SchemaNode | | 内容区，`body` 优先 |
| tabs[x].hash | `string` | | 激活 key；与 `activeKey` 对应 |
| tabs[x].disabled | `boolean` | false | 是否禁用 |
| mountOnEnter | `boolean` | true | 点中才挂载 |
| unmountOnExit | `boolean` | false | 切走卸载 |
| showTip | `boolean` | false | hover 显示 `tip` 或 title |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 `addable` / `closable` / `draggable` / `editable` / `swipeable`；`tabsMode` 非 line/card/vertical 只改布局方向，不追 cxd 像素皮肤。
- 地址栏 `#hash` 同步未接；`changeActiveKey` 动作未接。
