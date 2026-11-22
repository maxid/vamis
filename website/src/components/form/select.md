---
title: Select 选择器
outline: deep
---

# Select 选择器

::: info 实现进度 100% · 已完成
主路径已对齐：分组检索框（Transfer InputBox 形态）、选项 hover / 小复选框、多选可见 tag 悬停 tooltip、按宽度收成 `+N`（hover 明细）、`autoComplete` mock、`menuTpl`、`searchable` / `filterOption` / `searchApi`、`overlay`（移动端高度默认 320，可写 `overlay.height`）、全选、focus/blur，以及 `addConfirm` / `editConfirm` / `deleteConfirm` 的 Amis 事件顺序。`creatable` 新增入口固定在 Popover 顶部，候选列表单独滚动，是 Vamis 的有意交互优化。`selectMode: tree` 已复用共享树状态与 `TreeBranch`，支持单选、多选、搜索、全选、`onlyChildren` 与节点 `deferApi`。`selectMode: table` 使用独立表格面板，支持列展示、单选、多选、禁用行、表头全选、移动草稿和窗口虚拟化。`selectMode: chained` 使用列路径面板，父节点只展开，`children: []` 仍是分支，叶子才写入值，支持 `subTitle` / 单列 `placeholder`、option 类名、多选叶子全选、deferred 父列 Spinner 和逐列窗口虚拟化。`selectMode: associated` 已接左右栏、`leftMode: tree/list`、`rightMode: table/tree/chained/list` 与人员点选；TransferDropDown 桌面选择内容区上限为 **350px**，搜索框另计；普通 Select 菜单仍是 **300px**。移动端从底部滑入（普通单选滚轮 / 普通多选列表 / 表格、级联、关联和树模式草稿确认；箭头朝右不翻转）。`searchResultMode` / `searchResultColumns` 已接。
:::

`select` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；JSON 同等有效。UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。共用字段见 [Options 选择器表单项](./options)。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

参考 [Options 选择器表单项](./options)。

## 自定义菜单

`menuTpl` 自定义下拉项。模板数据含 `label` / `value` / `checked`。

```schema: scope="body"
type: form
body:
  - label: 选项
    type: select
    name: select
    menuTpl: "<div>${label} 值：${value}, 当前是否选中: ${checked}</div>"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 展示模式

`selectMode` 可选 `group` / `table` / `tree` / `chained` / `associated`。当前接 **分组**、**表格**、**树形**、**级联** 与 **关联**；不写 `selectMode` 时，普通选择器遇到 `children` 仍按分组展示。关联见「关联选择模式」。

### 分组展示模式

_单选_

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 分组
    type: select
    name: a
    searchable: true
    selectMode: group
    options:
      - label: 法师
        children:
          - label: 诸葛亮
            value: zhugeliang
      - label: 战士
        children:
          - label: 曹操
            value: caocao
          - label: 钟无艳
            value: zhongwuyan
      - label: 打野
        children:
          - label: 李白
            value: libai
          - label: 韩信
            value: hanxin
          - label: 云中君
            value: yunzhongjun
```

_多选_

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 分组
    type: select
    name: a
    multiple: true
    searchable: true
    selectMode: group
    options:
      - label: 法师
        children:
          - label: 诸葛亮
            value: zhugeliang
      - label: 战士
        children:
          - label: 曹操
            value: caocao
          - label: 钟无艳
            value: zhongwuyan
      - label: 打野
        children:
          - label: 李白
            value: libai
          - label: 韩信
            value: hanxin
          - label: 云中君
            value: yunzhongjun
```

### 表格模式

需要额外配置 `columns`，参考 [Table](/components/table) 中的说明。

_单选_

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "表格形式",
      "type": "select",
      "name": "a",
      "searchable": true,
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

_多选_

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "表格形式",
      "type": "select",
      "name": "a",
      "searchable": true,
      "selectMode": "table",
      "multiple": true,
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

_单选_

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 树型展示
    type: select
    name: a
    searchable: true
    selectMode: tree
    options:
      - label: 法师
        children:
          - label: 诸葛亮
            value: zhugeliang
      - label: 战士
        children:
          - label: 曹操
            value: caocao
          - label: 钟无艳
            value: zhongwuyan
      - label: 打野
        children:
          - label: 李白
            value: libai
          - label: 韩信
            value: hanxin
          - label: 云中君
            value: yunzhongjun
```

_多选_

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 树型展示
    type: select
    name: a
    searchable: true
    multiple: true
    selectMode: tree
    options:
      - label: 法师
        children:
          - label: 诸葛亮
            value: zhugeliang
      - label: 战士
        children:
          - label: 曹操
            value: caocao
          - label: 钟无艳
            value: zhongwuyan
      - label: 打野
        children:
          - label: 李白
            value: libai
          - label: 韩信
            value: hanxin
          - label: 云中君
            value: yunzhongjun
```

### 级联选择

按列来点选。

_单选_

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "级联选择",
      "type": "select",
      "name": "a",
      "searchable": true,
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

_多选_

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "级联选择",
      "type": "select",
      "name": "a",
      "searchable": true,
      "selectMode": "chained",
      "multiple": true,
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

级联选项可用 `subTitle` 给下一列加说明，用 `placeholder` 定义该列无子项时的空态；`children: []` 仍是可展开分支，不会写入表单值。`defer: true` 的父项只在该节点点击时通过 `deferApi` / 表单 `deferApi` 加载，节点内显示 Spinner。选项自身的 `className` 与 Select 的 `optionClassName` 都会落到级联 item。

## 支持搜索

`searchable: true` 在下拉里出检索框，按 `label` / `value` 过滤；分组会保留组头。

`searchable: true` 或配置了 `autoComplete` 的 Select 会在下拉打开后约 500ms 自动将焦点移入检索框；普通、分组、表格、树形、级联和移动端统一。下拉仍打开时，检索框失焦后会恢复聚焦；点击外部关闭下拉后不抢焦点。只有 `searchApi` 时仍不自动聚焦。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 带搜索
    type: select
    name: a
    searchable: true
    multiple: true
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

### 自定义搜索函数

默认按 `label` / `value` 包含匹配。`filterOption` 可写函数体，参数是 `options`、`inputValue`、`option`（`{ keys: ['label', 'value'] }`）。**只在 `env.trusted` 时编译**（文档预览与对照页已开）。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 带搜索
    type: select
    name: a
    searchable: true
    multiple: true
    filterOption: "return options.filter(({value, label, weapon}) => value?.includes(inputValue) || label?.includes(inputValue) || weapon?.includes(inputValue));"
    options:
      - label: 诸葛亮
        value: zhugeliang
        weapon: 翡翠仙扇
      - label: 曹操
        value: caocao
        weapon: 幻影双刃
      - label: 钟无艳
        value: zhongwuyan
        weapon: 破岳震天锤
      - label: 李白
        value: libai
        weapon: 青丝缠月剑
      - label: 韩信
        value: hanxin
        weapon: 龙吟穿云枪
      - label: 云中君
        value: yunzhongjun
        weapon: 飘渺云影剑
```

### searchApi

检索时按 `term` 拉选项。默认 GET。

**响应**

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "options": [
      { "label": "描述", "value": "值" },
      { "label": "描述2", "value": "值2" }
    ],
    "value": "值"
  }
}
```

```schema: scope="body"
type: form
body:
  - label: 远程检索
    type: select
    name: select
    searchable: true
    searchApi: /api/mock2/options/autoComplete?term=${term}
    placeholder: 请输入
    clearable: true
```

## 延时加载

选项上标 `defer: true`，配合组件层 `deferApi`。节点展开时按 `{...data, ...option}` 请求子选项；加载期间箭头位置显示 Spinner，成功后合并子树并触发 `deferLoadFinished`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 延时加载
    type: select
    name: a
    multiple: true
    selectMode: tree
    deferApi: /api/mock2/form/deferOptions?label=${label}&waitSeconds=2
    options:
      - label: 法师
        children:
          - label: 诸葛亮
            value: zhugeliang
      - label: 战士
        defer: true
      - label: 打野
        children:
          - label: 李白
            value: libai
          - label: 韩信
            value: hanxin
          - label: 云中君
            value: yunzhongjun
```

## 关联选择模式

分为左右两部分，左边点选后关联出现右边。左右都可以配置展示模式。

`selectMode: associated` 已接左栏本地选择、`leftMode: tree/list`、`leftDefaultValue`、`options[].ref` 匹配、左右树 deferred 回写、人员 source + 右栏列表 deferred 以及 `rightMode: table/tree/chained/list`。关闭后再次打开会像 Amis 重建关联面板一样恢复 `leftDefaultValue`；没有默认值时右栏回到“请选择左侧数据”，树展开也回到默认层级但保留已加载数据。总公司、部门与子部门的 `dep/ref` 懒加载都会落到对应右侧人员；右根树结果会回写父层选项，保证 multiple 标签使用真实 label。左右栏保持 Amis 的 200px 最小高度；未选左侧显示“请选择左侧数据”，ref 对不上选项时显示配置错误。以下保留 Amis 契约与示例。

_单选_

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "关联选择模式",
      "type": "select",
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
          "defer": true
        },
        {
          "ref": "hanxin",
          "defer": true
        },
        {
          "ref": "yunzhongjun",
          "defer": true
        }
      ]
    }
  ]
}
```

_多选_

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "关联选择模式",
      "type": "select",
      "name": "b",
      "multiple": true,
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
          "defer": true
        },
        {
          "ref": "hanxin",
          "defer": true
        },
        {
          "ref": "yunzhongjun",
          "defer": true
        }
      ]
    }
  ]
}
```

leftOptions 动态加载，默认 source 接口是返回 options 部分，而 leftOptions 是没有对应的接口可以动态返回了。为了方便，目前如果 source 接口返回的选项中，第一个 option 是以下这种格式则也会把 options[0].leftOptions 当成 leftOptions, options[0].children 当 options。同时 options[0].leftDefaultValue 可以用来配置左侧选项的默认值。

```
{
    status: 0,
    msg: '',
    data: {
        options: [
            {
                leftOptions: [],
                children: [],
                leftDefaultValue: ''
            }
        ]
    }
}
```

### 人员点选

> 请通过网络面板查看接口请求返回。

实际上就是采用的[「关联选择模式」](#关联选择模式)的 select，注意要看那一部分文档，需要知道怎么动态加载 leftOptions。左侧部分和人员都是通过 source 接口返回。需要懒加载的项通过设置 `defer` 为 true 来标记。左右两部分都支持懒加载。
都是通过 deferApi 来实现，后端根据传过来的参数决定是懒加载树，还是栏加载人员。

- 有 dep 值则是懒加载部门树
- 有 ref 值则是懒加载人员

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "label": "人员选择",
      "type": "select",
      "name": "b",
      "multiple": true,
      "sortable": true,
      "searchable": true,
      "selectMode": "associated",
      "leftMode": "tree",
      "source": "/api/mock2/form/departUser",
      "searchApi": "/api/mock2/form/departUserSearch?term=${term}",
      "deferApi": "/api/mock2/form/departUser?ref=${ref}&dep=${value}"
    }
  ]
}
```

## 限制标签最大展示数量

`maxTagCount` 限制标签最多展示几个，超出的收到 Popover 里。会按剩余宽度尽量多摆，但不会超过这个上限，所以文档示例把上限设大一点。可见标签悬停显示其 `label`。悬停 `+ N ...` 弹出剩余标签（可点 × 移除），`overflowTagPopover` 配标题等 Tooltip 属性。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - label: 水果
    type: select
    name: select
    multiple: true
    maxTagCount: 100
    checkAll: true
    defaultCheckAll: true
    overflowTagPopover:
      title: 水果
    options:
      - label: 苹果
        value: Apple
      - label: 香蕉
        value: Banana
      - label: 黑莓
        value: Blackberry
      - label: 蓝莓
        value: Blueberry
      - label: 樱桃
        value: Cherry
      - label: 杨桃
        value: Carambola
      - label: 椰子
        value: Coconut
      - label: 猕猴桃
        value: Kiwifruit
      - label: 柠檬
        value: Lemon
      - label: 菠萝
        value: Pineapple
      - label: 葡萄
        value: Grape
      - label: 石榴
        value: Pomegranate
      - label: 芒果
        value: Mango
      - label: 木瓜
        value: Papaya
      - label: 山竹
        value: Mangosteen
      - label: 榴莲
        value: Durian
      - label: 龙眼
        value: Longan
      - label: 荔枝
        value: Litchi
      - label: 枇杷
        value: Loquat
      - label: 柿子
        value: Persimmon
      - label: 柚子
        value: Pomelo
      - label: 橙子
        value: Orange
      - label: 橘子
        value: Tangerine
      - label: 金桔
        value: Kumquat
      - label: 李子
        value: Plum
      - label: 杏子
        value: Apricot
      - label: 桃子
        value: Peach
      - label: 梨子
        value: Pear
      - label: 草莓
        value: Strawberry
```

## 自定义下拉区域宽度与对齐方式

`overlay.width` 可用数字（单位 px）或带单位的字符串：`%` / `px` / `rem` / `em` / `vw`。`overlay.align` 为 `left` / `center` / `right`。移动端底栏高度默认 **320px**（对齐 Amis `.Select-popup`；通用 PopUp 默认 400）；可用 `overlay.height` 覆盖。

相对值如 `-100px` 相当于触发器宽度减 100px（`calc(${trigger}px - 100px)`）；`+10vw` 同理。

```schema: scope="body"
type: form
body:
  - label: 80% 宽度靠右对齐
    type: select
    name: select-right
    menuTpl: "<div>${label} 值：${value}, 当前是否选中: ${checked}</div>"
    overlay:
      width: 80%
      align: right
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
  - label: 300px 宽度中间对齐
    type: select
    name: select-center
    menuTpl: "<div>${label} 值：${value}, 当前是否选中: ${checked}</div>"
    overlay:
      width: 300
      align: center
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

```schema: scope="body"
type: form
body:
  - label: 相对窄 100px 向左对齐
    type: select
    name: select
    overlay:
      width: "-100px"
      align: left
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 多选全选

开启 `checkAll` 后，默认 `checkAllBySearch: true`：检索时全选只作用于当前过滤结果。设成 `false` 则无论是否在检索，全选都针对全部数据源。

```schema: scope="body"
type: form
body:
  - label: 多选
    type: select
    name: select2
    searchable: true
    checkAll: true
    multiple: true
    clearable: true
    source: /api/mock2/form/getOptions
```

## 自动补全 autoComplete

`autoComplete` 里用数据映射取变量 `term`，即当前输入的关键字。

```schema: scope="body"
type: form
body:
  - name: select1
    type: select
    label: 选项自动补全（单选）
    autoComplete: /api/mock2/options/autoComplete3?delay=true&term=${term}&waitSeconds=2
    placeholder: 请输入
    clearable: true
  - name: select2
    type: select
    label: 选项自动补全（多选）
    autoComplete: /api/mock2/options/autoComplete?labelField=name&valueField=id&term=${term}
    placeholder: 请输入
    labelField: name
    valueField: id
    clearable: true
    multiple: true
    maxTagCount: 2
```

## 属性表

除了 [普通表单项属性表](./formitem#属性表) 以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| options | `Array` | | [选项组](./options#选项组格式) |
| source | [API](/types/api) 或数据映射 | | [动态选项组](./options#动态选项组-source) |
| autoComplete | [API](/types/api) | | 输入关键字按 `$term` 补全 |
| delimiter | `string` | `,` | [拼接符](./options#拼接符-delimiter) |
| labelField | `string` | `"label"` | 选项文案字段 |
| valueField | `string` | `"value"` | 选项值字段 |
| joinValues | `boolean` | `true` | 是否把选中值拼成字符串 |
| extractValue | `boolean` | `false` | `joinValues` 为 false 时只抽 value |
| checkAll | `boolean` | `false` | 多选全选 |
| checkAllLabel | `string` | `全选` | 全选文案 |
| checkAllBySearch | `boolean` | `true` | 检索时全选只作用于过滤结果 |
| defaultCheckAll | `boolean` | `false` | 无值时默认全选 |
| creatable | `boolean` | `false` | [新增选项](./options#前端新增-creatable) |
| multiple | `boolean` | `false` | 多选 |
| searchable | `boolean` | `false` | 下拉内前端过滤 |
| filterOption | `string` | | 自定义过滤函数体，参数 `options` / `inputValue` / `option`。需 `env.trusted` |
| searchApi | [API](/types/api) | | 检索时按 `term` 拉选项 |
| createBtnLabel | `string` | `"新增选项"` | 新增按钮文案 |
| addControls | Array<[表单项](./formitem)> | | 自定义新增表单项 |
| addApi | [API](/types/api) | | 新增保存接口 |
| editable | `boolean` | `false` | [编辑选项](./options#前端编辑-editable) |
| editControls | Array<[表单项](./formitem)> | | 自定义编辑表单项 |
| editApi | [API](/types/api) | | 编辑保存接口 |
| removable | `boolean` | `false` | [删除选项](./options#删除选项) |
| deleteApi | [API](/types/api) | | 删除接口 |
| autoFill | `object` | | [自动填充](./options#自动填充-autofill) |
| menuTpl | `string` 或 [SchemaNode](/types/schemanode) | | 自定义菜单项模板，数据含 `label` / `value` / `checked` |
| clearable | `boolean` | `false` | 显示清除 |
| hideSelected | `boolean` | `false` | 下拉里隐藏已选项 |
| selectMode | `string` | | `group` / `table` / `tree` / `chained` / `associated` 已接；人员点选复用 `associated` |
| onlyChildren | `boolean` | 树模式按 defer 自动决定 | 树多选是否只提交叶子；未设置时无 defer 为 true，有 defer 节点为 false |
| autoCheckChildren | `boolean` | `true` | 树模式勾父节点时是否联动子节点 |
| initiallyOpen | `boolean` | `true` | 树模式初始是否展开全部节点 |
| deferApi | [API](/types/api) | | 树节点懒加载接口；节点可用自身 `deferApi` 覆盖 |
| deferField | `string` | `"defer"` | 标记节点需要懒加载的字段名 |
| searchResultMode | `string` | | 搜索结果面板；支持 `list` / `group` / `table` / `tree` / `chained`，不设时跟 `selectMode` |
| searchResultColumns | `Array` | | `searchResultMode: table` 时的搜索结果列；未写时回落 `columns` |
| columns | `Array` | | `selectMode: table` 时的展示列；空配置回落 `label` 列 |
| leftOptions | `Array` | | `associated` 左侧选项 |
| leftMode / rightMode | `string` | | `associated` 左右形态 |
| maxTagCount | `number` | | 多选标签最多展示几个。须大于 0 才按宽度收成 `+ N ...`；未写则折行铺开 |
| overflowTagPopover | [TooltipObject](/components/tooltip) | | 悬停 `+ N ...` 的溢出浮层。剩余项按标签表格渲染（可关），可配 `title` / `placement` / `tooltipClassName` |
| optionClassName | [ClassName](/types/classname) | | 选项 CSS 类名 |
| popOverContainerSelector | `string` | | 弹层挂载选择器 |
| overlay | `{ width, align, height }` | | 桌面：弹层宽度与对齐（`align` 为 `left` / `center` / `right`）。移动端：`height` 覆盖底栏高度，默认 320（Amis `.Select-popup`；未写 `overlay.height` 时走这档，通用 PopUp 默认 400） |
| showInvalidMatch | `boolean` | `false` | 值对不上选项时结果标签 / 单值使用 error 级文字色 |
| noResultsText | `string` | `"未找到任何结果"` | 无结果文案 |
| mobileClassName | `string` | | 移动端 PopUp 根类名 |
| valuesNoWrap | `boolean` | `false` | 多选值不折行 |
| selectFirst | `boolean` | `false` | 无值时选第一项 |
| clearValueOnSourceChange | `boolean` | | 数据域 source 变化后是否清空 |
| searchPlaceholder | `string` | | 检索框占位。普通检索默认「搜索」，分组默认沿用 Select 的「请选择」 |

## 事件表

通过 `onEvent` 监听。`[name]` 是当前组件的 `name`；没写 `name` 时用 `value`。

| 事件名称 | 事件参数 | 说明 |
|------|------|------|
| change | `[name]` 当前值；`selectedItems` 选中项；`items` 选项集合 | 值变化 |
| focus | `[name]` 当前值；`items` 选项集合 | 打开下拉 |
| blur | `[name]` 当前值；`items` 选项集合 | 关闭下拉 |
| addConfirm | `[name]`；`item` 新增项；`items` | 新增提交；在本地写入与 `addApi` 前触发 |
| editConfirm | `[name]`；`item` 编辑项（仅本次 label/value）；`items` | 编辑提交；在本地更新与 `editApi` 前触发 |
| deleteConfirm | `[name]`；`item` 删除项；`items` | 删除提交；在本地移除与 `deleteApi` 前触发 |
| deferLoadFinished | `[name]` 当前值；`result` 接口响应；`items` 合并后的选项树 | 树节点懒加载成功并合并 children 后触发 |

### change

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: select
    name: tree
    label: Tree
    onEvent:
      change:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.tree|json}"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### focus

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: select
    name: tree
    label: Tree
    onEvent:
      focus:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.tree|json}"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### blur

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: select
    name: tree
    label: Tree
    onEvent:
      blur:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.tree|json}"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### addConfirm

配置 `creatable` 后，点击“新增选项”会先打开 Dialog，提交时触发 `addConfirm`。调用 `preventDefault()` 会阻止本地写入与 `addApi`。Vamis 将新增入口固定在 Popover 顶部；只有选项列表滚动，入口不会跟随列表滚走。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: select
    name: tree
    label: Tree
    creatable: true
    editable: true
    removable: true
    onEvent:
      addConfirm:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.item|json}"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### editConfirm

配置 `editable` 后，编辑选项提交时触发。调用 `preventDefault()` 会阻止本地更新与 `editApi`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: select
    name: tree
    label: Tree
    creatable: true
    editable: true
    removable: true
    onEvent:
      editConfirm:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.item|json}"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

### deleteConfirm

配置 `removable` 后，删除选项提交时触发。`deleteConfirmText` 先确认；随后 `deleteConfirm` 可决定是否继续删除与调用 `deleteApi`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: select
    name: tree
    label: Tree
    creatable: true
    editable: true
    removable: true
    deleteConfirmText: 确认删除？
    onEvent:
      deleteConfirm:
        actions:
          - actionType: toast
            args:
              msg: "${event.data.item|json}"
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
```

## 动作表

| 动作名称 | 动作配置 | 说明 |
|------|------|------|
| clear | — | 清空为 `resetValue`，默认空串 |
| reset | — | 恢复初始值 |
| reload | — | 重拉 `source` |
| setValue | `{ value }` | 写入 value |

### clear

```schema: scope="body"
type: form
body:
  - type: select
    name: select
    label: 选项
    id: clear-select
    value: a
    options:
      - label: A
        value: a
      - label: B
        value: b
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear-select
```

### reset

```schema: scope="body"
type: form
body:
  - type: select
    name: select
    label: 选项
    id: reset-select
    value: a
    options:
      - label: A
        value: a
      - label: B
        value: b
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset-select
```

### 刷新数据源 reload

```schema: scope="body"
type: form
body:
  - type: select
    name: select
    label: 选项
    id: reload-select
    source: /api/mock2/form/getOptions
  - type: button
    label: 刷新
    onEvent:
      click:
        actions:
          - actionType: reload
            componentId: reload-select
```

### setValue

```schema: scope="body"
type: form
body:
  - type: select
    name: select
    label: 选项
    id: set-select
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
  - type: button
    label: 设为 B
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: set-select
            args:
              value: b
```

## 与 Amis 的差异

- 作者态 YAML 与 JSON 并列。
- `selectMode` 已接分组、表格、树形、级联、关联与人员点选；`searchResultMode` / `searchResultColumns` 已接。
- 桌面普通 Select 菜单上限 **300px**；`group` / `list` / `table` / `tree` / `chained` / `associated` 走 TransferDropDown，选择内容区上限 **350px**，搜索框高度另计。
- 关联左右栏最小高度 **200px**；右侧未选择、配置错误有独立空态。
- `creatable` 的“新增选项”改为固定在 Popover 顶部，候选列表单独滚动。这是 Vamis 相对 Amis 的有意交互优化；Amis 的 `Select-addBtn` 位于菜单滚动内容内。
- `multiple` 复选框在普通、分组、表格、树形、级联、关联模式共用 Amis `Checkbox--sm` 盒模型：**14×14 / 图标 12 / 2px 圆角 / #e8e9eb 边框**。checkbox 到 label 的间距统一以级联多选为基准，固定为 **8px**；Amis 各结构原值并不一致，这里是 Vamis 的显式一致性优化；全选在半选时显示横线，表格按 TableSelection 使用独立的 12px 排版。
- 树模式复用共享 `useTreeState` / `TreeBranch`，不挂载完整 `tree-select`；多选无 defer 时 `onlyChildren` 默认 true，存在 defer 节点时默认 false，对齐 Amis `onlyChildren ?? !isTreeDeferLoad`。
- `filterOption` 只在 `env.trusted` 编译，SDK 默认关。
- 分组下拉检索对齐 Transfer `InputBox`（「请选择」+ 右侧搜索图标）；普通 `searchable` 仍是底边检索条（「搜索」+ 左侧图标）。
- 多选只有写了 `maxTagCount`（> 0）才按宽度收成 `+ N ...`；未写则折行铺开。可见标签悬停显示 label tooltip；溢出 Popover 是可关闭的标签表格。
- 值序列化矩阵已覆盖单选 / 多选 × `joinValues` × `extractValue` × `delimiter` × 自定义 `valueField`；不匹配值保留 `__unmatched`，仅在 `showInvalidMatch` 开启时使用 error 色。
- 移动端 PopUp 根支持 `mobileClassName`；多选连续点击的写入通过队列串行，异步 `change` 事件不会覆盖后一次选择。
- Select 新增 / 编辑按 Amis 打开 Dialog。`addConfirm` / `editConfirm` / `deleteConfirm` 在本地写入和 CUD API 之前触发；`preventDefault()` 会同时阻止本地变更与请求。新增 / 编辑弹层的 `item` 只带本次 label/value；`deleteConfirmText` 未配置时不弹默认确认框。
- 下拉加载指示器复用 `Spinner`（菱形循环标），不另画一套圆环。
