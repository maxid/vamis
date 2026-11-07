---
title: InputText 输入框
outline: deep
---

# InputText 输入框

::: info 实现进度 92% · 进行中
主路径已对齐 Amis：`addOn`、`clearable` / 计数 / 边框 / 前缀后缀 / 事件动作。选择器走 `VamisOverlay`，本地检索按 CONTAINS 排序并高亮匹配，多选可「新增：」；`autoComplete` 不再本地过滤。`input-password` 默认 `revealPassword` 显隐钮（`review` / `encrypt`）。缺 `themeCss`。
:::

`input-text` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。同渲染器别名：`input-email` / `input-url` / `input-password` / `text` / `native-date` / `native-time` / `native-number`。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text
    type: input-text
    label: text
```

## 不同边框风格

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text-half-border
    type: input-text
    label: 半边框
    borderMode: half
    inputControlClassName: bg-muted
  - name: text-no-border
    type: input-text
    label: 无边框
    borderMode: none
    nativeInputClassName: focus:text-primary
```

## 不同类型

配置 `type` 可以支持不同格式的文本输入框。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text
    type: input-text
    label: text
  - type: divider
  - type: input-url
    name: url
    label: 链接
  - type: divider
  - type: input-email
    name: email
    label: 邮箱
  - type: divider
  - type: input-password
    name: password
    label: 密码
```

## 附加组件

可以配置 `addOn`，附带附加组件，比如 button，还能设置 icon。`position` 默认 `right`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text
    type: input-text
    label: text
    addOn:
      type: button
      icon: https://suda.cdn.bcebos.com/images%2F2021-01%2Fsearch.svg
      label: 搜索
```

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: keyword
    type: input-text
    label: 左侧
    addOn:
      type: text
      label: https://
      position: left
```

## 可清除

通过 `clearable: true` 可以设置文本可清除。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text
    type: input-text
    label: text
    clearable: true
```

## 选择器模式

配置 `options` 即可支持选择器模式。`source` 和 `autoComplete` 同样会进入该模式。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text
    type: input-text
    label: text
    options:
      - label: aa
        value: aa
      - label: bb
        value: bb
      - label: cc
        value: cc
      - label: dd
        value: dd
```

## 限制只能选择预设

配置 options 并且配置 `creatable: false`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - name: text
    type: input-text
    label: text
    creatable: false
    options:
      - label: OptionA
        value: a
      - label: OptionB
        value: b
      - label: OptionC
        value: c
      - label: OptionD
        value: d
```

## 多选模式

配置 `multiple: true`。长 label 会省略。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - name: text
    type: input-text
    label: text
    multiple: true
    options:
      - label: OptionA
        value: a
      - label: OptionB (with long suffix for testing ellipsis)
        value: b
      - label: OptionC
        value: c
      - label: OptionD
        value: d
```

## 前缀和后缀

`prefix` 和 `suffix` 属性支持数据映射。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
data:
  unit: MB
body:
  - name: text
    type: input-text
    label: text
    prefix: ￥
    suffix: RMB
  - name: prefix
    type: input-text
    label: text
    prefix: ￥
  - name: suffix
    type: input-text
    label: text
    suffix: ${unit}
```

## 显示计数器

配置 `showCounter: true` 后输入框将显示计数器，一般会配合 `maxLength` 限制输入长度；不设 `maxLength` 则只展示计数、不限制。

```schema: scope="body"
type: form
body:
  - name: a
    type: input-text
    label: A
    showCounter: true
    placeholder: 请输入
    options:
      - label: aa
        value: aa
      - label: bb
        value: bb
      - label: cc
        value: cc
      - label: dd
        value: dd
  - name: b
    type: input-text
    label: B
    showCounter: true
    maxLength: 20
    placeholder: 请输入
```

## 自动转换值

可以配置 `transform`，来自动转换值，支持转小写或大写。

> 只有键入的内容才会触发 transform，下拉框选中的值不转换。

```schema: scope="body"
type: form
debug: true
body:
  - name: lower
    type: input-text
    label: 转换小写
    placeholder: 输入的英文自动转为小写
    transform:
      lowerCase: true
    multiple: true
    options:
      - APPLE
      - ORANGE
      - WATERMELON
  - name: upper
    type: input-text
    label: 转换大写
    placeholder: 输入的英文自动转为大写
    transform:
      upperCase: true
```

## 文本内容为空时去掉这个值

如果设置了 `clearValueOnEmpty: true`，当输入框的值清空时，提交的表单项里就不会有这个值。

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    type: input-text
    label: 内容为空时清理这个表单项
    value: v
    clearValueOnEmpty: true
```

## 自动补全

```schema: scope="body"
type: form
debug: true
body:
  - name: name
    type: input-text
    label: 自动补全
    autoComplete: /api/mock2/options/autoComplete?term=$term
    placeholder: 请输入
    multiple: true
```

## 属性表

当做选择器表单项使用时，除了支持 [普通表单项属性](./formitem) 以外，还支持下面这些配置。

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| options | `Array` | | 静态选项组 |
| source | `string` 或 API | | 动态选项组 |
| autoComplete | `string` 或 API | | 输入时按 `$term` 拉补全 |
| multiple | `boolean` | | 是否多选 |
| delimiter | `string` | `,` | 拼接符 |
| labelField | `string` | `label` | 选项标签字段 |
| valueField | `string` | `value` | 选项值字段 |
| joinValues | `boolean` | `true` | 多选是否拼成字符串 |
| extractValue | `boolean` | `false` | 只取 value |
| addOn | `addOn` | | 附加 text / button / submit |
| addOn.type | `string` | | `text`、`button` 或 `submit` |
| addOn.label | `string` | | 文字说明 |
| addOn.position | `left` / `right` | `right` | 附加位置 |
| trimContents | `boolean` | `true` | 是否去除首尾空白 |
| clearValueOnEmpty | `boolean` | | 空串时去掉这个字段 |
| creatable | `boolean` | | `false` 时只能选预设 |
| clearable | `boolean` | | 是否可清除 |
| resetValue | `string` | `""` | 清除后设定的值 |
| prefix | `string` | | 前缀，支持 `${}` |
| suffix | `string` | | 后缀，支持 `${}` |
| showCounter | `boolean` | | 是否显示计数器 |
| minLength | `number` | | 最短字数（校验） |
| maxLength | `number` | | 最长字数 |
| transform | `object` | | `{ lowerCase, upperCase }` |
| borderMode | `full` / `half` / `none` | `full` | 边框模式 |
| inputControlClassName | `string` | | 输入框容器 class |
| nativeInputClassName | `string` | | 原生 input class |
| nativeAutoComplete | `string` | `off` | 原生 autocomplete |
| revealPassword | `boolean` | `true` | 仅 `input-password`：是否展示显/隐按钮 |

## 事件表

可通过 `onEvent` 监听。动作里用 `${事件参数名}` 或 `${event.data.[事件参数名]}` 取值。`[name]` 表示当前组件绑定的字段名。

| 事件 | 参数 | 说明 |
|------|------|------|
| click | `[name]` / `value` | 点击输入框，只针对选择器模式 |
| enter | `[name]` / `value` | 回车，只针对选择器模式 |
| focus | `[name]` / `value` | 获焦 |
| blur | `[name]` / `value` | 失焦 |
| change | `[name]` / `value` | 值变化 |
| clear | `[name]` / `value` | 点清除 |
| review | `[name]` / `value` | 密码切到明文（`input-password`） |
| encrypt | `[name]` / `value` | 密码切回密文（`input-password`） |

### enter

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    type: input-text
    label: text
    options:
      - label: aa
        value: aa
      - label: bb
        value: bb
    onEvent:
      enter:
        actions:
          - actionType: toast
            args:
              msg: ${event.data.value|json}
```

### focus

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    type: input-text
    label: text
    onEvent:
      focus:
        actions:
          - actionType: toast
            args:
              msg: ${event.data.value|json}
```

### blur

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    type: input-text
    label: text
    onEvent:
      blur:
        actions:
          - actionType: toast
            args:
              msg: ${event.data.value|json}
```

### change

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    type: input-text
    label: text
    onEvent:
      change:
        actions:
          - actionType: toast
            args:
              msg: ${event.data.value|json}
```

### clear

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    type: input-text
    label: text
    clearable: true
    onEvent:
      clear:
        actions:
          - actionType: toast
            args:
              msg: ${event.data.value|json}
```

## 动作表

其他组件可通过 `actionType` + `componentId` 触发。

| 动作 | 配置 | 说明 |
|------|------|------|
| clear | — | 清空；`clearValueOnEmpty` 时置 `undefined` |
| reset | — | 恢复初始值，或 `resetValue` |
| focus | — | 获取焦点 |
| reload | — | 重拉 `source` |
| setValue | `value` | 更新值；多选用 `,` 分隔 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    id: clear_text
    type: input-text
    label: text
    value: 清空我
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_text
```

### reset

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    id: reset_text
    type: input-text
    label: text
    value: 重置我
  - type: button
    label: 重置
    onEvent:
      click:
        actions:
          - actionType: reset
            componentId: reset_text
```

### focus

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    id: focus_text
    type: input-text
    label: text
    value: 聚焦我
  - type: button
    label: 聚焦
    onEvent:
      click:
        actions:
          - actionType: focus
            componentId: focus_text
```

### reload

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    id: reload_text
    type: input-text
    label: text
    value: a
    source: /api/mock2/form/getOptions?waitSeconds=1
  - type: button
    label: 重新加载
    onEvent:
      click:
        actions:
          - actionType: reload
            componentId: reload_text
```

### setValue

```schema: scope="body"
type: form
debug: true
body:
  - name: text
    id: setvalue_text
    type: input-text
    label: text
    value: amis
  - type: button
    label: 赋值
    onEvent:
      click:
        actions:
          - actionType: setValue
            componentId: setvalue_text
            args:
              value: amis go go go!
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 选择器下拉 Teleport 到 `env.getModalContainer()`，本地检索按 CONTAINS 档排序（精确 / 前缀优先于包含）并高亮匹配；配了 `autoComplete` 时不下本地过滤，去抖 250ms 按 `$term` 拉选项。
- `input-password` 默认画出显隐钮；`revealPassword: false` 关掉。点开会派发 `review` / `encrypt`（Amis 源码有，文档页未列）。
- 焦点环走 token `box-shadow`，不搬 `.cxd-TextControl`。
- 「不同边框风格」半边框示例 `inputControlClassName` 用 `bg-muted`（浅/深都跟主题），不用 Amis 的 `bg-gray-100`（固定 `#f3f4f6`，深色会变成白底）。无边框 `nativeInputClassName` 用 `focus:text-primary`，不用 Amis 的 `focus:text-indigo-700`（写死靛色，不跟 5 色）。
