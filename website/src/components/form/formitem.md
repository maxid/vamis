---
title: FormItem 表单项通用
---

# FormItem 表单项通用

::: info 实现进度 90% · 进行中
路径值、`requiredOn`、`validateOnChange`、`clearValueOnHidden`、`static` / `staticOn` / `staticSchema`（含选择器 `limit`）、事件动作 `static` / `nonstatic`、`submitOnChange`、`validateApi`、提交接口 `errors`、`autoFill`（不含参照录入弹层）。缺 combo/table 路径级报错、`autoFill.showSuggestion`。
:::

> 所有派生自 FormItem 的组件，都具有 FormItem 的特性。FormItem 不是独立 `type`，字段仍然用各自的 `type`（`input-text`、`select`…）。

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀。

## 基本用法

- `name`：必填，标识表单数据域中当前表单项值的 key，可以是深层结构，比如 `aa.bb`
- `type`：必填，标识表单项类型
- `label`：表单项标签

所有表单项都只可以配置在 `form` 的 `body` 里。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-text",
      "label": "文本框",
      "name": "text"
    },
    {
      "type": "input-password",
      "label": "<a href='./password'>密码</a>",
      "name": "password"
    }
  ]
}
```

## 表单项展示

### 内联模式

配置 `"mode": "inline"`（或 `inline: true`），当前表单项使用内联模式。

```schema: scope="form-item"
- type: input-text
  label: 常规
  name: text1
- type: input-text
  label: 内联
  name: text2
  mode: inline
- type: input-text
  label: 内联2
  name: text3
  mode: inline
```

### 表单项尺寸

`size` 支持 `xs` / `sm` / `md` / `lg` / `full`。默认不写 `size`：控件铺满值列。`xs`–`lg` 对应 80 / 160 / 240 / 320px，只在 ≥576px 钉死。`full` 与默认铺满同效果。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-text",
      "label": "极小",
      "name": "text-xs",
      "size": "xs"
    },
    {
      "type": "input-text",
      "label": "小",
      "name": "text-sm",
      "size": "sm"
    },
    {
      "type": "input-text",
      "label": "中",
      "name": "text-md",
      "size": "md"
    },
    {
      "type": "input-text",
      "label": "大",
      "name": "text-lg",
      "size": "lg"
    },
    {
      "type": "input-text",
      "label": "占满",
      "name": "text-full",
      "size": "full"
    }
  ]
}
```

### 表单项标签

水平布局时，左边即便不设置 `label` 为了保持对齐也会留空；想去掉空白，请设置成 `false`。

```schema: scope="body"
type: form
mode: horizontal
body:
  - type: input-text
    label: 常规
    name: text1
    placeholder: 常规标签
  - type: input-text
    label: ""
    name: text2
    placeholder: 不显示标签
  - type: input-text
    label: false
    name: text3
    placeholder: 不显示标签且清除空间
```

### 表单项标签提示

配置 `labelRemark` 可以实现标签描述提示。

```schema: scope="body"
type: form
mode: horizontal
body:
  - type: input-text
    label: 无标签提示
    name: text1
  - type: input-text
    label: 有标签提示
    labelRemark: 这是一段提示
    name: text2
  - type: input-text
    label: 更复杂的标签提示
    labelRemark:
      type: remark
      title: 提示
      content: "<pre>first \nsecond\n${text1}</pre>"
    name: text3
```

### 配置禁用

##### 静态配置

通过配置 `"disabled": true` 来禁用表单项。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-text",
      "label": "常规",
      "name": "text1"
    },
    {
      "type": "input-text",
      "label": "禁用",
      "name": "text2",
      "disabled": true
    },
    {
      "type": "grid",
      "columns": [
        {
          "body": [
            {
              "type": "input-text",
              "label": "姓名",
              "name": "name",
              "value": "amis",
              "disabled": true
            }
          ]
        },
        {
          "body": [
            {
              "type": "input-email",
              "label": "邮箱",
              "name": "email",
              "disabled": true
            }
          ]
        }
      ]
    }
  ]
}
```

##### 通过条件配置是否禁用

也可以用表达式 `disabledOn`，在某个条件下禁用当前表单项。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-number",
      "label": "数量",
      "name": "number",
      "value": 0,
      "description": "调整数量大小查看效果吧！"
    },
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "disabledOn": "this.number > 1",
      "description": "当数量大于1的时候，该文本框会被禁用"
    }
  ]
}
```

### 配置显隐

`"hidden": true` 或 `"visible": false` 静态隐藏；也可用 `hiddenOn` / `visibleOn`。判断逻辑相反，没有别的区别。

```schema: scope="body"
type: form
body:
  - type: input-text
    label: 常规
    name: text1
  - type: input-text
    label: 隐藏
    name: text2
    hidden: true
  - type: input-number
    label: 数量
    name: number
    value: 0
    description: 调整数量大小查看效果
  - type: input-text
    label: 文本
    name: text
    hiddenOn: this.number > 1
    description: 数量大于 1 时隐藏
```

### 配置静态展示

`"static": true` 把表单项改成只读展示；`staticOn` 用表达式切换。空值默认显示 `-`，可用 `staticPlaceholder` 覆盖。`staticSchema` 可自定义展示（字符串、tpl 或数组）。

```schema: scope="body"
type: form
mode: horizontal
labelWidth: 220
body:
  - type: input-text
    label: 静态
    name: text1
    value: text1的值
    static: true
  - type: input-text
    label: 输入态
    name: text2
    value: text2的值
```

```schema: scope="body"
type: form
mode: horizontal
labelWidth: 220
body:
  - type: input-number
    label: 数量
    name: number
    value: 0
    description: 调整数量大小查看效果
  - type: input-text
    label: 文本
    name: text
    staticOn: this.number > 1
    value: text value
    description: 数量大于 1 时变成静态
```

```schema: scope="body"
type: form
mode: horizontal
labelWidth: 220
body:
  - type: input-text
    name: var3
    label: 自定义展示态schema
    value: 表单项value
    static: true
    staticSchema:
      - "自定义前缀 | "
      - type: tpl
        tpl: "${var3}"
      - " | 自定义后缀"
```

##### 限制选择器类组件的展示数量

下拉选择器、多选框等组件，当选项过多静态展示时，若全部展示会占用页面很多空间，所以默认进行了限制（10 个）。可以通过配置 `staticSchema.limit`，自定义静态展示时的数量。

```schema: scope="body"
{
  "type": "form",
  "mode": "horizontal",
  "labelWidth": 220,
  "body": [
    {
      "type": "input-tag",
      "name": "tags",
      "label": "自定义展示数量",
      "value": "1,2,3,4,5,6,7,8",
      "options": [
        {"label": "选项1", "value": "选项1"},
        {"label": "选项2", "value": "选项2"},
        {"label": "选项3", "value": "选项3"},
        {"label": "选项4", "value": "选项4"},
        {"label": "选项5", "value": "选项5"},
        {"label": "选项6", "value": "选项6"},
        {"label": "选项7", "value": "选项7"},
        {"label": "选项8", "value": "选项8"}
      ],
      "static": true,
      "staticSchema": {
        "limit": 3
      }
    }
  ]
}
```

##### 通过事件动作切换表单项状态

`actionType: static` / `nonstatic`，用 `componentId` 点到表单项或整个表单。动作覆盖优先级最高，无视 schema 里的 `static`。

```schema: scope="body"
{
  "type": "form",
  "title": "单个表单项状态切换",
  "mode": "horizontal",
  "labelWidth": 220,
  "body": [
    {
      "type": "input-text",
      "id": "formItemSwitch",
      "name": "var1",
      "label": "使用事件动作状态切换",
      "value": "text"
    },
    {
      "type": "button-toolbar",
      "name": "button-toolbar",
      "buttons": [
        {
          "type": "button",
          "label": "输入态",
          "level": "primary",
          "onEvent": {
            "click": {
              "actions": [
                {
                  "actionType": "nonstatic",
                  "componentId": "formItemSwitch"
                }
              ]
            }
          }
        },
        {
          "type": "button",
          "label": "展示态",
          "level": "primary",
          "onEvent": {
            "click": {
              "actions": [
                {
                  "actionType": "static",
                  "componentId": "formItemSwitch"
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "actions": []
}
```

##### 表单项静态展示优先级

1. 表单项 `static: true` 始终静态；`static: false` 或不配则跟随父表单。事件动作覆盖最高。

```schema: scope="body"
{
  "type": "form",
  "static": true,
  "title": "父表单为静态 static: true",
  "mode": "horizontal",
  "id": "myForm",
  "labelWidth": 220,
  "body": [
    {
      "type": "input-text",
      "label": "text1",
      "static": true,
      "value": "value",
      "name": "text1",
      "id": "text1",
      "description": "初始配置了static: true, 但是后续可以使用动作切换状态"
    },
    {
      "type": "button-toolbar",
      "name": "button-toolbar1",
      "label": "text1 切换状态",
      "buttons": [
        {
          "type": "button",
          "label": "静态",
          "level": "primary",
          "onEvent": {
            "click": {
              "actions": [
                {
                  "actionType": "static",
                  "componentId": "text1"
                }
              ]
            }
          }
        },
        {
          "type": "button",
          "label": "输入态",
          "level": "primary",
          "onEvent": {
            "click": {
              "actions": [
                {
                  "actionType": "nonstatic",
                  "componentId": "text1"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "type": "input-text",
      "label": "text3",
      "value": "value",
      "name": "text3",
      "description": "无配置，跟随父表单变化"
    },
    {
      "type": "divider"
    },
    {
      "type": "button-toolbar",
      "name": "button-toolbar0",
      "label": "父表单 切换状态",
      "buttons": [
        {
          "type": "button",
          "label": "静态",
          "level": "primary",
          "onEvent": {
            "click": {
              "actions": [
                {
                  "actionType": "static",
                  "componentId": "myForm"
                }
              ]
            }
          }
        },
        {
          "type": "button",
          "label": "输入态",
          "level": "primary",
          "onEvent": {
            "click": {
              "actions": [
                {
                  "actionType": "nonstatic",
                  "componentId": "myForm"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## 表单项值

更改表单项值，会更新表单数据域中同 `name` 的变量。也支持链式 `name`，例如 `person.name`。

```schema: scope="body"
type: form
body:
  - type: input-text
    label: 姓名
    name: person.name
  - type: tpl
    tpl: "数据域 person.name = ${person.name}"
```

## 配置默认值

通过 `value` 设置默认值。`value` 支持表达式 `${xxx}`；与 `name` 同时存在时，表达式优先，普通字符串则优先用 `name` 映射数据域。

```schema: scope="body"
type: form
data:
  item1: hello world!
  item2: hello amis!
  item3: hello amis-editor!
body:
  - type: input-text
    label: test1
    name: test1
    value: "123"
    description: 普通 value 默认值
  - type: input-text
    label: test2
    name: item1
    description: 关联数据域中的 item1
  - type: input-text
    label: test3
    name: item2
    value: "345"
    description: 非 value 表达式，优先使用 name 映射
  - type: input-text
    label: test4
    name: test4
    value: "${item3}"
    description: value 表达式优先级最高
```

## 隐藏时删除表单项值

默认 `hiddenOn` / `visibleOn` 隐藏后仍保留值。配置 `clearValueOnHidden: true` 才从数据域删除。

```schema: scope="body"
type: form
body:
  - type: input-number
    label: 数量
    name: number
    value: 0
    description: 调整数量大小查看效果
  - type: input-text
    label: 文本
    name: text
    value: 这是一段文本
    hiddenOn: this.number > 1
    clearValueOnHidden: true
    description: 数量大于 1 时隐藏，并从数据域删除 text
  - type: tpl
    tpl: "text = ${text}"
```

## 表单项必填

静态 `"required": true`，或用表达式 `requiredOn`。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-number
    label: 数量
    name: number
    value: 0
    description: 调整数量大小查看效果
  - type: input-text
    label: 文本
    name: text
    requiredOn: this.number > 1
    description: 数量大于 1 时必填
```

## 格式校验

`validations` 可对象或逗号分隔字符串；`validateOnChange: true` 时改值即校验。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-text
    label: 文本
    name: text
    validations: "minLength:2,isAlphanumeric"
    validationErrors:
      minLength: 请至少输入两个字符
      isAlphanumeric: 只能包含字母或数字
    validateOnChange: true
```

横向 `mode: horizontal` 时：桌面（≥576px）标签右对齐、宽 `--form-label-width`（98px）；窄屏标签约 28%、控件吃剩下的。

## 服务端校验

### 通过表单提交接口

提交接口返回非 0 `status` 时，可在 `errors` 里按表单项 `name` 带报文案。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveFormFailed?waitSeconds=1
body:
  - name: test2
    type: input-text
    label: 服务端验证
```

接口返回示例：

```json
{
  "status": 422,
  "msg": "",
  "errors": {
    "test2": "服务器端说，这个有错误。"
  },
  "data": null
}
```

表单配 `debug: true` 会在表单下显示当前数据域 JSON。Combo / Table 的路径 key（`a[0].b`）报错还没接到子项。

### 通过表单项校验接口

表单项上配 `validateApi`。提交时（以及 `validateOnChange: true` 改值时）会请求；`status: 0` 通过，`422` 时 `errors` 字符串作为该项报错。

```schema: scope="body"
type: form
mode: horizontal
api: /api/mock2/form/saveForm
body:
  - label: name
    type: input-text
    name: name
    required: true
    validateApi: /api/mock2/form/formitemFailed
  - label: email
    type: input-text
    name: email
    validateApi: /api/mock2/form/formitemSuccess
    required: true
```

## 配置自动填充

`autoFill.api` 拉数据，`fillMapping` 写到其他字段。只处理返回 `rows` / `items` **恰好一项**，或直接是对象。`showSuggestion: true` 的参照录入弹层未接。

```schema: scope="body"
type: form
body:
  - type: input-text
    label: 浏览器
    name: browser
    autoFill:
      showSuggestion: false
      fillMapping:
        browser: "${browser}"
        version: "${version}"
        platform: "${platform1}"
      api:
        url: /api/mock2/form/autoUpdate?browser=${browser}
        responseData:
          browser: "${browser}"
          version: "${version}"
          platform1: "${platform}"
        silent: false
  - type: input-text
    label: 版本
    name: version
  - type: input-text
    label: 平台
    name: platform
```

也可以直接写映射（无 `api`），用当前表单数据域做 `${}`：

```schema: scope="body"
type: form
body:
  - type: input-text
    label: 姓名
    name: name
    autoFill:
      greet: "你好，${name}"
  - type: input-text
    label: 问候
    name: greet
```

## 及时获取其他表单项的值

Amis 默认给表单项的数据不是最新，要配 `strictMode: false` 才能在 description 里读到其他字段。Vamis 表单项直接吃表单数据域，改其他字段会立刻反映到 `${}`。

```schema: scope="body"
type: form
body:
  - type: select
    label: 类型
    name: type
    options:
      - A
      - B
      - C
  - type: textarea
    name: version
    disabled: true
    description: "Type is ${type}"
```

## 属性表

| 属性 | 说明 |
|------|------|
| `type` | 表单项类型 |
| `name` | 字段路径，支持 `a.b` / `a.b[0].c` |
| `value` | 默认值；`${}` 表达式优先于 name 映射 |
| `label` | 标签，模板或 `false`（去掉占位） |
| `labelRemark` | 标签旁 Remark |
| `description` / `desc` | 说明 |
| `placeholder` | 占位 |
| `mode` / `inline` | `normal` / `horizontal` / `inline` |
| `size` | `xs` / `sm` / `md` / `lg` / `full`；不写则铺满 |
| `className` / `labelClassName` / `inputClassName` / `descriptionClassName` | class，走 `resolveClassName` |
| `required` / `requiredOn` | 必填 / 条件必填 |
| `validations` / `validationErrors` | 格式校验与文案 |
| `validateOnChange` | 改值即校验；表单级也可开 |
| `submitOnChange` | 该表单项值变化时提交当前表单 |
| `clearValueOnHidden` | 隐藏时从数据域删除该字段 |
| `visibleOn` / `hiddenOn` / `disabled` / `disabledOn` | 显隐与禁用 |
| `static` / `staticOn` | 静态展示；动作 `static` / `nonstatic` 优先级更高 |
| `staticSchema` | 自定义静态节点；无 type 的对象（如 `{ limit }`）不当自定义 schema，选择器类读 `limit`（默认 10） |
| `staticPlaceholder` | 空值占位，默认 `-` |
| `validateApi` | 单项后端校验；`422` + `errors` 字符串 |
| `autoFill` | 映射或 `api` + `fillMapping`；`showSuggestion` 未接 |
| `strictMode` | Vamis 默认及时读其他字段，无需设 false |
| form `debug` | 表单下展示当前数据域 JSON |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 已接路径值、`requiredOn`、`validateOnChange`、`submitOnChange`、`clearValueOnHidden`、`static` / `staticOn` / `staticSchema`（选择器 `limit` → `tags` / `words`）、事件动作 `static` / `nonstatic`、`disabled` / `hidden`、`validateApi`、提交 `errors`、`autoFill`（无弹层）、`debug`。
- 未接：`autoFill.showSuggestion` 参照录入、Combo/Table 路径级服务端报错。
