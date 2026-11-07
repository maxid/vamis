---
title: Select 下拉框
outline: deep
---

# Select 下拉框

::: info 实现进度 90% · 进行中
主路径已对齐：分组检索框（Transfer InputBox 形态）、选项 hover / 小复选框、多选可见 tag 悬停 tooltip、按宽度收成 `+N`（hover 明细）、`autoComplete` mock、`menuTpl`、`searchable` / `filterOption` / `searchApi`、`overlay`、全选、focus/blur。`selectMode` 的 table / tree / chained / associated、`deferApi`、人员点选未接。
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

`selectMode` 可选 `group` / `table` / `tree` / `chained` / `associated`。当前只接 **分组**（选项带 `children` 即按组渲染，不必写 `selectMode: group`）。表格 / 树 / 级联 / 关联见文末差异表。

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

### 表格 / 树 / 级联 / 关联

`selectMode: table`（配 `columns`）、`tree`、`chained`、`associated`（配 `leftOptions` / `leftMode` / `rightMode`）**未接**。需要这些形态请用独立组件：`tree-select`、`chained-select`、`nested-select`。

## 支持搜索

`searchable: true` 在下拉里出检索框，按 `label` / `value` 过滤；分组会保留组头。

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

选项上标 `defer: true`，配合组件层 `deferApi`。**未接**。

## 关联选择 / 人员点选

`selectMode: associated` 以及人员点选（`source` + `deferApi` + `searchApi` 懒加载部门/人员）**未接**。

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

`overlay.width` 可用数字（单位 px）或带单位的字符串：`%` / `px` / `rem` / `em` / `vw`。`overlay.align` 为 `left` / `center` / `right`。

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
| selectMode | `string` | | `group` 已接。`table` / `tree` / `chained` / `associated` **未接** |
| searchResultMode | `string` | | **未接**。不设时跟 `selectMode` |
| columns | `Array` | | `selectMode: table` 时的列。**未接** |
| leftOptions | `Array` | | `associated` 左侧选项。**未接** |
| leftMode / rightMode | `string` | | `associated` 左右形态。**未接** |
| maxTagCount | `number` | | 多选标签最多展示几个。须大于 0 才按宽度收成 `+ N ...`；未写则折行铺开 |
| overflowTagPopover | [TooltipObject](/components/tooltip) | | 悬停 `+ N ...` 的溢出浮层。剩余项按标签表格渲染（可关），可配 `title` / `placement` / `tooltipClassName` |
| optionClassName | [ClassName](/types/classname) | | 选项 CSS 类名 |
| popOverContainerSelector | `string` | | 弹层挂载选择器 |
| overlay | `{ width, align }` | | 弹层宽度与对齐：`align` 为 `left` / `center` / `right` |
| showInvalidMatch | `boolean` | `false` | 值对不上选项时飘红。**未接** |
| noResultsText | `string` | `"未找到任何结果"` | 无结果文案 |
| mobileClassName | `string` | | 移动端浮层类名。**未接** |
| valuesNoWrap | `boolean` | `false` | 多选值不折行 |
| selectFirst | `boolean` | `false` | 无值时选第一项 |
| clearValueOnSourceChange | `boolean` | | 数据域 source 变化后是否清空 |
| searchPlaceholder | `string` | | 检索框占位。普通检索默认「搜索」，分组默认「请输入关键字」 |

## 事件表

通过 `onEvent` 监听。`[name]` 是当前组件的 `name`；没写 `name` 时用 `value`。

| 事件名称 | 事件参数 | 说明 |
|------|------|------|
| change | `[name]` 当前值；`selectedItems` 选中项；`items` 选项集合 | 值变化 |
| focus | `[name]` 当前值；`items` 选项集合 | 打开下拉 |
| blur | `[name]` 当前值；`items` 选项集合 | 关闭下拉 |
| addConfirm | `[name]`；`item` 新增项；`items` | 新增提交。**未接** |
| editConfirm | `[name]`；`item` 编辑项；`items` | 编辑提交。**未接** |
| deleteConfirm | `[name]`；`item` 删除项；`items` | 删除提交。**未接** |

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

### reload

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
- `selectMode` 只接分组；table / tree / chained / associated、`deferApi`、人员点选未接。
- `filterOption` 只在 `env.trusted` 编译，SDK 默认关。
- 分组下拉检索对齐 Transfer `InputBox`（「请输入关键字」+ 右侧搜索图标）；普通 `searchable` 仍是底边检索条（「搜索」+ 左侧图标）。
- 多选只有写了 `maxTagCount`（> 0）才按宽度收成 `+ N ...`；未写则折行铺开。可见标签悬停显示 label tooltip；溢出 Popover 是可关闭的标签表格。`selectMode: table` 仍未接。
- `addConfirm` / `editConfirm` / `deleteConfirm` 未接。
- 下拉加载指示器复用 `Spinner`（菱形循环标），不另画一套圆环。
