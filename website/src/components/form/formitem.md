---
title: FormItem 表单项通用
---

# FormItem 表单项通用

::: info 实现进度 90% · 进行中
路径值、`requiredOn`、`validateOnChange`、`clearValueOnHidden`、`static` / `staticOn` / `staticSchema`（含选择器 `limit`）、事件动作 `static` / `nonstatic`、`submitOnChange`、`validateApi`、提交接口 `errors`、`autoFill`（不含参照录入弹层）、`validations` / `validationErrors`（含默认 `validate.*` key）。未写 `label` 仍占标签列（`label: false` 才去掉）。窄屏 ≤767 默认 `normal` 也改成标签 28% 与控件同行（对齐 Amis Form-item）。缺 combo/table 路径级报错、`autoFill.showSuggestion`。
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

通过配置 `"mode": "inline"`，标识当前表单项使用内联模式。未写 `mode` 的项跟随表单默认 `normal`：标签在上、控件在下。`mode: inline` 的项并排，项内标签在左、控件在右。

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
      "label": "内联",
      "name": "text2",
      "mode": "inline"
    },
    {
      "type": "input-text",
      "label": "内联2",
      "name": "text2",
      "mode": "inline"
    },
    {
      "type": "group",
      "mode": "inline",
      "body": [
        {
          "type": "input-text",
          "label": "内联3",
          "name": "text2"
        },
        {
          "type": "input-text",
          "label": "内联4",
          "name": "text2"
        }
      ]
    }
  ]
}
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

展示方式见本节活示例。哪些 type 支持静态展示，见[支持静态展示的表单项](#支持静态展示的表单项)。

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

可以配置`validations`属性，指定校验当前表单项值的格式

可以通过对象形式配置

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "validations": {
        "isNumeric": true
      },
      "description": "请输入数字类型文本"
    }
  ]
}
```

同样也可以配置多个格式校验，按顺序进行校验，中途校验不通过就会终止

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "validations": {
        "isNumeric": true,
        "minimum": 10
      },
      "validateOnChange": true,
      "description": "请输入数字类型文本"
    }
  ]
}
```

### 字符串形式（不推荐）

也可以配置字符串形式来指定，如下例，输入不合法的值，点击提交会报错并显示报错信息。（注意日期时间类的校验规则不支持字符串形式）

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "validations": "isNumeric",
      "description": "请输入数字类型文本"
    }
  ]
}
```

也可以指定多个格式校验，中间用`逗号`分隔。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "validations": "isNumeric,minimum:10",
      "description": "请输入数字类型文本"
    }
  ]
}
```

如果需要配置参数，例如显示最大值或最小值，则在格式标识符后`:`和参数

### 自定义校验信息

默认会有报错信息，如果你想自定义校验信息，配置`validationErrors`属性

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "validations": {
        "isNumeric": true
      },
      "validationErrors": {
        "isNumeric": "同学，请输入数字哈"
      },
      "description": "请输入数字类型文本"
    }
  ]
}
```

如果需要获取当前格式校验配置的参数，可以使用`$1`

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "body": [
    {
      "type": "input-text",
      "label": "文本",
      "name": "text",
      "validations": {
        "isNumeric": true,
        "minimum": 10
      },
      "validationErrors": {
        "minimum": "同学，最少输入$1以上的数字哈"
      },
      "description": "请输入数字类型文本"
    }
  ]
}
```

默认的校验信息如下，可以直接配置文字，也可用多语言中的 key。key 对应的 zh-CN 文案在 `@vamis/core` 的 `validateLocaleZh`。

```json
{
  "isEmail": "validate.isEmail",
  "isRequired": "validate.isRequired",
  "isUrl": "validate.isUrl",
  "isInt": "validate.isInt",
  "isAlpha": "validate.isAlpha",
  "isNumeric": "validate.isNumeric",
  "isAlphanumeric": "validate.isAlphanumeric",
  "isFloat": "validate.isFloat",
  "isWords": "validate.isWords",
  "isUrlPath": "validate.isUrlPath",
  "matchRegexp": "validate.matchRegexp",
  "minLength": "validate.minLength",
  "maxLength": "validate.maxLength",
  "maximum": "validate.maximum",
  "lt": "validate.lt",
  "minimum": "validate.minimum",
  "gt": "validate.gt",
  "isJson": "validate.isJson",
  "isLength": "validate.isLength",
  "notEmptyString": "validate.notEmptyString",
  "equalsField": "validate.equalsField",
  "equals": "validate.equals",
  "isPhoneNumber": "validate.isPhoneNumber",
  "isTelNumber": "validate.isTelNumber",
  "isZipcode": "validate.isZipcode",
  "isId": "validate.isId",
  "isDateTimeSame": "validate.isDateTimeSame",
  "isDateTimeBefore": "validate.isDateTimeBefore",
  "isDateTimeAfter": "validate.isDateTimeAfter",
  "isDateTimeSameOrBefore": "validate.isDateTimeSameOrBefore",
  "isDateTimeSameOrAfter": "validate.isDateTimeSameOrAfter",
  "isDateTimeBetween": "validate.isDateTimeBetween",
  "isTimeSame": "validate.isTimeSame",
  "isTimeBefore": "validate.isTimeBefore",
  "isTimeAfter": "validate.isTimeAfter",
  "isTimeSameOrBefore": "validate.isTimeSameOrBefore",
  "isTimeSameOrAfter": "validate.isTimeSameOrAfter",
  "isTimeBetween": "validate.isTimeBetween",
  "isVariableName": "validate.isVariableName"
}
```

### 表单项值发生变化即校验

默认校验是当进行行为操作时，对表单项进行校验，如果你想每次表单项的值发生变化的时候就校验，请配置`"validateOnChange": true`

### 支持的格式校验

| 规则名称                 | 说明                                                                                                                                     | 定义                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `isEmail`                | 必须是 Email。                                                                                                                           | `(value: any) => boolean`                                                                                       |
| `isUrl`                  | 必须是 Url。                                                                                                                             | `(value: any) => boolean`                                                                                       |
| `isNumeric`              | 必须是 数值。                                                                                                                            | `(value: any) => boolean`                                                                                       |
| `isAlpha`                | 必须是 字母。                                                                                                                            | `(value: any) => boolean`                                                                                       |
| `isAlphanumeric`         | 必须是 字母或者数字。                                                                                                                    | `(value: any) => boolean`                                                                                       |
| `isInt`                  | 必须是 整形。                                                                                                                            | `(value: any) => boolean`                                                                                       |
| `isFloat`                | 必须是 浮点形。                                                                                                                          | `(value: any) => boolean`                                                                                       |
| `isLength:length`        | 是否长度正好等于设定值。                                                                                                                 | `(value: any) => boolean`                                                                                       |
| `minLength:length`       | 最小长度。                                                                                                                               | `(value: any, length: number) => boolean`                                                                       |
| `maxLength:length`       | 最大长度。                                                                                                                               | `(value: any, length: number) => boolean`                                                                       |
| `maximum:number`         | 最大值。                                                                                                                                 | `(value: any, maximum: number) => boolean`                                                                      |
| `minimum:number`         | 最小值。                                                                                                                                 | `(value: any, minimum:number) => boolean`                                                                       |
| `equals:xxx`             | 当前值必须完全等于 xxx。                                                                                                                 | `(value: any, targetValue: any) => boolean`                                                                     |
| `equalsField:xxx`        | 当前值必须与 xxx 变量值一致。                                                                                                            | `(value: any, field: string) => boolean`                                                                        |
| `isJson`                 | 是否是合法的 Json 字符串。                                                                                                               | `(value: any) => boolean`                                                                                       |
| `isUrlPath`              | 是 url 路径。                                                                                                                            | `(value: any) => boolean`                                                                                       |
| `isPhoneNumber`          | 是否为合法的手机号码                                                                                                                     | `(value: any) => boolean`                                                                                       |
| `isTelNumber`            | 是否为合法的电话号码                                                                                                                     | `(value: any) => boolean`                                                                                       |
| `isZipcode`              | 是否为邮编号码                                                                                                                           | `(value: any) => boolean`                                                                                       |
| `isId`                   | 是否为身份证号码，支持 18 位和 15 位验证，单个验证请使用 `isId18` / `isId15`                                                             | `(value: any) => boolean`                                                                                       |
| `matchRegexp:/foo/`      | 必须命中某个正则。                                                                                                                       | `(value: any, regexp: string \| RegExp) => boolean`                                                             |
| `matchRegexp${n}:/foo/`  | 必须命中某个正则。 设置正则表达式时属性名需以 `matchRegexp` 开头，`n`支持`1-9`，且 `validations` 及 `validationsErrors` 中属性名需匹配。 | `(value: any, regexp: string \| RegExp) => boolean`                                                             |
| `isDateTimeSame`         | 日期和目标日期相同，支持指定粒度，默认到毫秒 `millisecond`                                                                               | `(value: any, targetDate: any, granularity?: string) => boolean`                                                |
| `isDateTimeBefore`       | 日期早于目标日期，支持指定粒度，默认到毫秒 `millisecond`                                                                                 | `(value: any, targetDate: any, granularity?: string) => boolean`                                                |
| `isDateTimeAfter`        | 日期晚于目标日期，支持指定粒度，默认到毫秒 `millisecond`                                                                                 | `(value: any, targetDate: any, granularity?: string) => boolean`                                                |
| `isDateTimeSameOrBefore` | 日期早于目标日期或和目标日期相同，支持指定粒度，默认到毫秒 `millisecond`                                                                 | `(value: any, targetDate: any, granularity?: string) => boolean`                                                |
| `isDateTimeSameOrAfter`  | 日期晚于目标日期或和目标日期相同，支持指定粒度，默认到毫秒 `millisecond`                                                                 | `(value: any, targetDate: any, granularity?: string) => boolean`                                                |
| `isDateTimeBetween`      | 日期处于目标日期范围，支持指定粒度和区间的开闭形式，默认到毫秒 `millisecond`，左右开区间`'()'`                                           | `(value: any, lhs: any, rhs: any, granularity?: string, inclusivity?: '()' \| '[)' \| '(]' \| '[]') => boolean` |
| `isTimeSame`             | 时间和目标时间相同，支持指定粒度，默认到毫秒 `millisecond`                                                                               | `(value: any, targetTime: any, granularity?: string) => boolean`                                                |
| `isTimeBefore`           | 时间早于目标时间，支持指定粒度，默认到毫秒 `millisecond`                                                                                 | `(value: any, targetTime: any, granularity?: string) => boolean`                                                |
| `isTimeAfter`            | 时间晚于目标时间，支持指定粒度，默认到毫秒 `millisecond`                                                                                 | `(value: any, targetTime: any, granularity?: string) => boolean`                                                |
| `isTimeSameOrBefore`     | 时间早于目标时间或和目标时间相同，支持指定粒度，默认到毫秒 `millisecond`                                                                 | `(value: any, targetTime: any, granularity?: string) => boolean`                                                |
| `isTimeSameOrAfter`      | 时间晚于目标时间或和目标时间相同，支持指定粒度，默认到毫秒 `millisecond`                                                                 | `(value: any, targetTime: any, granularity?: string) => boolean`                                                |
| `isTimeBetween`          | 时间处于目标时间范围，支持指定粒度和区间的开闭形式，默认到毫秒 `millisecond`，左右开区间`'()'`                                           | `(value: any, lhs: any, rhs: any, granularity?: string, inclusivity?: '()' \| '[)' \| '(]' \| '[]') => boolean` |
| `isVariableName`         | 是否为合法的变量名，默认规则为 `/^[a-zA-Z_]+[a-zA-Z0-9]*$/` 可以自己指定如 `{isVariableName: /^a.*$/}`                                   | `(value: any) => boolean`                                                                                       |

#### 验证只允许 http 协议的 url 地址

isUrl 可以配置如下参数

- schemes 协议，默认是为： `['http', 'https', 'ftp', 'sftp']`
- allowLocal 是否允许填写本地地址
- allowDataUrl 是否允许 dataUrl

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
        "name": "url",
        "type": "input-text",
        "label": "只允许 https 打头的 url",
        "validations": {
          "isUrl": {
            "schemes": ["https"]
          }
        }
    }
  ]
}
```

### 自定义校验函数

可以自己写代码扩展表单验证，请参考 [这里](/extend/custom#扩展表单验证)

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

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | | 指定表单项类型 |
| className | [ClassName](/types/classname) | | 表单项最外层类名 |
| inputClassName | [ClassName](/types/classname) | | 表单控制器类名 |
| labelClassName | [ClassName](/types/classname) | | label 的类名 |
| descriptionClassName | [ClassName](/types/classname) | | 说明文字类名 |
| name | `string` | | 字段名，指定该表单项提交时的 key，支持 `a.b` / `a.b[0].c` |
| value | `any` | | 表单默认值；含 `${}` 时优先于 name 映射 |
| label | [模板](/concepts/template) 或 `false` | | 表单项标签。`false` 去掉占位；未写仍占水平表单标签列 |
| labelAlign | `"right" \| "left"` | `"right"` | 标签对齐，仅 `mode` 为 `horizontal` 时生效。**未接**；当前水平标签固定左对齐，不是 Amis 默认右对齐 |
| labelRemark | [Remark](/components/remark) | | 表单项标签描述 |
| description | [模板](/concepts/template) | | 表单项描述。也认 `desc` |
| placeholder | `string` | | 占位符 |
| mode | `"normal" \| "horizontal" \| "inline"` | | 该项布局。不写跟随表单，默认 `normal` |
| inline | `boolean` | | `true` 时该项为内联模式（等同 `mode: inline`） |
| size | `"xs" \| "sm" \| "md" \| "lg" \| "full"` | | 控件档位。不写则铺满 |
| strictMode | `boolean` | | Amis 配 `false` 才能及时读其他字段。Vamis 默认及时读，无需设 false |
| submitOnChange | `boolean` | | 该表单项值变化时提交当前表单 |
| disabled | `boolean` | | 当前表单项是否禁用 |
| disabledOn | [表达式](/concepts/expression) | | 当前表单项是否禁用的条件 |
| visible | `boolean` | | 当前表单项是否显示 |
| visibleOn | [表达式](/concepts/expression) | | 当前表单项是否显示的条件 |
| hidden | `boolean` | | 当前表单项是否隐藏 |
| hiddenOn | [表达式](/concepts/expression) | | 当前表单项是否隐藏的条件 |
| required | `boolean` | | 是否为必填 |
| requiredOn | [表达式](/concepts/expression) | | 当前表单项是否为必填的条件 |
| validations | `object` \| `string` | | 表单项值格式验证，支持设置多个，多个规则用英文逗号隔开 |
| validationErrors | `object` | | 自定义校验文案，可用 `$1` 或 `validate.*` key |
| validateOnChange | `boolean` | | 改值即校验；表单级也可开 |
| validateApi | [API](/types/api) | | 表单项校验接口 |
| autoFill | `object` | | 数据录入配置，自动填充或者参照录入 |
| autoFill.showSuggestion | `boolean` | | `true` 为参照录入，`false` 自动填充。**未接** |
| autoFill.api | [API](/types/api) | | 自动填充接口 / 参照录入筛选 CRUD 请求配置 |
| autoFill.silent | `boolean` | `true` | 是否展示数据格式错误提示。**未接**（填充失败时既不 toast 也不看这个开关） |
| autoFill.fillMapping | `object` | | 自动填充数据映射，键值对，值支持变量与表达式 |
| autoFill.trigger | `string` | | 参照录入触发方式：`change` / `focus`。**未接**（随 `showSuggestion`） |
| autoFill.mode | `string` | | 参照弹出方式 `dialog` / `drawer` / `popOver`。**未接** |
| autoFill.labelField | `string` | | 参照录入 picker 的 `labelField`。**未接** |
| autoFill.position | `string` | | 参照录入 `mode` 为 `popOver` 时的弹出位置。**未接** |
| autoFill.size | `string` | | 参照录入 `mode` 为 `dialog` 时的大小。**未接** |
| autoFill.columns | `Array` | | 参照录入数据展示列。**未接** |
| autoFill.filter | [SchemaNode](/types/schemanode) | | 参照录入查询过滤条件。**未接** |
| static | `boolean` | | 当前表单项是否静态展示，见[支持静态展示的表单项](#支持静态展示的表单项)。动作 `static` / `nonstatic` 优先级更高 |
| staticOn | [表达式](/concepts/expression) | | 当前表单项是否静态展示的条件 |
| staticClassName | [ClassName](/types/classname) | | 静态展示时的类名。**未接** |
| staticLabelClassName | [ClassName](/types/classname) | | 静态展示时 Label 的类名。**未接** |
| staticInputClassName | [ClassName](/types/classname) | | 静态展示时 value 的类名。**未接** |
| staticSchema | [SchemaNode](/types/schemanode) | | 自定义静态展示方式。无 `type` 的对象（如 `{ limit }`）不当自定义节点 |
| staticSchema.limit | `number` | `10` | 选择器类组件多选时展示态展示的数量 |
| staticPlaceholder | `string` | `"-"` | 静态展示空值占位 |
| clearValueOnHidden | `boolean` | | 隐藏时从数据域删除该字段 |
| id | `string` | | 给事件动作 `static` / `nonstatic` 按 id 定位 |

## 支持静态展示的表单项

展示方式见上文[配置静态展示](#配置静态展示)。

- form 表单
- button-group-select 按钮点选
- chained-select 链式下拉框
- chart-radios 图表单选框
- checkbox 勾选框
- checkboxes 复选框
- combo 组合
- input-kv 键值对
- input-array 数组输入框
- input-city 城市选择器
- input-color 颜色选择器
- input-date 日期选择器
- input-date-range 日期范围选择器
- input-datetime-range 日期时间范围选择器
- input-time-range 时间范围选择器
- input-group 输入框组合
- input-month-range 月份范围
- input-number 数字输入
- input-quarter-range 季度范围
- input-range 滑块
- input-rating 评分
- input-tag 标签选择器
- input-text 输入框
- input-password 密码输入框
- input-email 邮箱输入框
- input-url url 输入框
- native-date native 日期选择器
- native-time native 时间选择器
- native-number native 数字输入
- input-tree 树形选择器
- input-year-range 年份范围
- list-select 列表选择器
- location-picker 地理位置
- matrix-checkboxes 矩阵勾选
- nested-select 级联选择器
- radios 单选框
- select 下拉框
- multi-select 多选下拉框
- switch 开关
- tabs-transfer 组合穿梭器
- tabs-transfer-picker 组合穿梭选择器
- textarea 多行输入框
- transfer 穿梭器
- transfer-picker 穿梭选择器
- tree-select 树形选择器

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 已接路径值、`requiredOn`、`validateOnChange`、`submitOnChange`、`clearValueOnHidden`、`static` / `staticOn` / `staticSchema`（选择器 `limit` → `tags` / `words`）、事件动作 `static` / `nonstatic`、`disabled` / `hidden`、`validateApi`、提交 `errors`、`autoFill`（无弹层）、`debug`、`validations` / `validationErrors`（对象与逗号字符串、`$1`、默认 `validate.*` key、中文文案、`isUrl.schemes`）。未写 `label` 仍占水平表单标签列；`button-toolbar` 是表单项，`button` / `action` 不是。默认 `mode: normal` 标签在上；`mode: inline` 项并排且项内左右；`type: group` 把 `mode` 传给子项。链接走 `--link-color` `#2468f2`、无下划线。属性表四列对齐 Amis（类型链到 `/types/`、`/concepts/`），并保留 Vamis 字段（`mode` / `size` / `staticOn` / `hidden` / `validationErrors` 等）。没有 Amis 版本列，也不链到 Amis 示例页。
- 未接：`autoFill.showSuggestion` 参照录入（含 `trigger` / `mode` / `labelField` / `position` / `size` / `columns` / `filter`）、`autoFill.silent`、Combo/Table 路径级服务端报错、`staticClassName` / `staticLabelClassName` / `staticInputClassName`、`labelAlign`（水平标签现固定左对齐）。
