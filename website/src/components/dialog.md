---
title: Dialog 对话框
outline: deep
---

# Dialog 对话框

::: info 实现进度 100% · 已完成
`actionType: dialog` 打开 overlay、`title` / `body` / `data`、`size` xs / sm / md / lg / xl / full / custom、`showCloseButton` / `closeOnEsc` / `closeOnOutside` 默认值与文字一致、底部 actions、多级弹层同时可见并按 30px 错位、表单确认提交与 `close: false`、confirm / cancel 事件、feedback、`setValue`、draggable、loading / error 底栏信息和窄屏 44px 均分按钮均已接入。
:::

Dialog 主要由 [Action](./action) 的 `actionType: dialog` 触发。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

也可以把 `type: dialog` 写进树里当内嵌预览，真正的模态走 `OverlayHost`。`showCloseButton` 源码默认 **true**。`closeOnEsc` / `closeOnOutside` 源码默认 **false**。没写 `actions` 时底部是「取消」+「确认」；`actions: []` 隐藏底部按钮。

## 基本用法

```schema: scope="body"
label: 点击弹框
type: button
actionType: dialog
dialog:
  title: 弹框标题
  body: 这是一个弹框
```

## 配置尺寸

`size` 不是表单项宽度。空值 500px，`xs` 200px，`sm` 350px，`md` 800px，`lg` 1100px，`xl` 90%，`full` 尽量铺满；`custom` 使用 `width` / `height`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 较小的弹框
    actionType: dialog
    dialog:
      size: sm
      title: 提示
      body: 这是个简单的弹框
  - type: button
    label: 标准弹框
    actionType: dialog
    dialog:
      title: 提示
      body: 这是个简单的弹框
  - type: button
    label: 较大的弹框
    actionType: dialog
    dialog:
      size: lg
      title: 提示
      body: 这是个简单的弹框
  - type: button
    label: 很大的弹框
    actionType: dialog
    dialog:
      size: xl
      title: 提示
      body: 这是个简单的弹框
  - type: button
    label: 占满屏幕的弹框
    actionType: dialog
    dialog:
      size: full
      title: 全屏弹框
      body: 弹框尽可能占满，内容部分滚动。
```

## 弹框与数据映射

默认弹框内由于数据链的存在，会自动映射父级同名变量，例如下例：

```schema: scope="body"
{
  "type": "crud",
  "api": "/api/mock2/sample",
  "draggable": true,
  "columns": [
    { "name": "id", "label": "ID" },
    { "name": "engine", "label": "Rendering engine" },
    { "name": "browser", "label": "Browser" },
    { "name": "platform", "label": "Platform(s)" },
    { "name": "version", "label": "Engine version" },
    { "name": "grade", "label": "CSS grade" },
    {
      "type": "button",
      "label": "一个弹框",
      "actionType": "dialog",
      "dialog": {
        "title": "一个弹框",
        "body": [
          {
            "type": "form",
            "api": "/api/mock2/sample/$id",
            "body": [
              { "type": "input-text", "name": "engine", "label": "Engine" }
            ]
          }
        ]
      }
    }
  ]
}
```

上例弹框中的表单项 `Engine` 会自动映射到父级数据中的 `engine` 变量，如果想调整当前特性，如你想调整父级映射变量的字段，可以利用[数据映射](/concepts/data-mapping)，例如：

```schema: scope="body"
{
  "type": "crud",
  "api": "/api/mock2/sample",
  "draggable": true,
  "syncLocation": false,
  "filter": {
    "title": "过滤器",
    "body": [
      {
        "type": "select",
        "label": "状态",
        "name": "status",
        "options": [
          { "label": "运行中", "value": "running" },
          { "label": "创建中", "value": "creating" }
        ],
        "checkAll": true,
        "multiple": true,
        "joinValues": true,
        "defaultCheckAll": true,
        "checkAllLabel": "全选",
        "valuesNoWrap": false
      }
    ]
  },
  "headerToolbar": [
    {
      "label": "新增",
      "type": "button",
      "actionType": "dialog",
      "level": "primary",
      "dialog": {
        "type": "dialog",
        "title": "新增",
        "closeOnEsc": false,
        "closeOnOutside": false,
        "showCloseButton": true,
        "data": {
          "&": "$$",
          "status": "__undefined"
        },
        "body": [
          {
            "type": "form",
            "api": "/api/mock2/form/saveForm",
            "debug": true,
            "body": [
              {
                "type": "select",
                "name": "status",
                "label": "状态",
                "options": [
                  { "label": "运行中", "value": "running" },
                  { "label": "创建中", "value": "creating" }
                ],
                "disabled": false,
                "selectFirst": false
              }
            ]
          }
        ]
      }
    }
  ],
  "columns": [
    { "name": "id", "label": "ID" },
    { "name": "engine", "label": "Rendering engine" },
    { "name": "browser", "label": "Browser" },
    { "name": "platform", "label": "Platform(s)" },
    { "name": "version", "label": "Engine version" },
    { "name": "grade", "label": "CSS grade" },
    {
      "type": "button",
      "label": "一个弹框",
      "actionType": "dialog",
      "dialog": {
        "data": {
          "engine2": "${engine}"
        },
        "title": "一个弹框",
        "body": [
          {
            "type": "form",
            "api": "/api/mock2/sample/$id",
            "body": [
              { "type": "input-text", "name": "engine2", "label": "Engine" }
            ]
          }
        ]
      }
    }
  ]
}
```

上例给 `dialog` 中配置 `data` 属性，可以将上层的 `engine` 变量映射为 `engine2`。点击「新增」后 dialog 内 form 会继承 CRUD 所在的数据域；如果 CRUD 过滤器与 dialog 表单存在同名字段，需要用 `{"&": "$$", "status": "__undefined"}` 删除外部查询字段。

## 多级弹框

再开一层会压栈，下面各层仍保留可见，每层向下错位 30px；关当前层回到上一层。

```schema: scope="body"
{
  "type": "button",
  "label": "多级弹框",
  "actionType": "dialog",
  "dialog": {
    "title": "提示",
    "body": "这是个简单的弹框",
    "actions": [
      {
        "type": "button",
        "actionType": "confirm",
        "label": "确认",
        "primary": true
      },
      {
        "type": "button",
        "actionType": "dialog",
        "label": "再弹一个",
        "dialog": {
          "title": "弹框中的弹框",
          "body": "如果你想，可以无限弹下去",
          "actions": [
            {
              "type": "button",
              "actionType": "dialog",
              "label": "来吧",
              "level": "info",
              "dialog": {
                "title": "弹框中的弹框",
                "body": "如果你想，可以无限弹下去",
                "actions": [
                  {
                    "type": "button",
                    "actionType": "confirm",
                    "label": "不弹了",
                    "primary": true
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

## 动作后关闭弹框

在弹框中配置行为按钮，可以在按钮上配置 `"close": true`，在行为完成后关闭当前弹框。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个框",
  "actionType": "dialog",
  "dialog": {
    "title": "弹框",
    "body": [
      {
        "type": "button",
        "label": "默认的 ajax 请求",
        "actionType": "ajax",
        "api": "/api/mock2/form/saveForm?waitSeconds=1"
      },
      {
        "type": "button",
        "label": "ajax 请求成功后关闭弹框",
        "actionType": "ajax",
        "api": "/api/mock2/form/saveForm?waitSeconds=1",
        "close": true
      }
    ]
  }
}
```

以上例子是关闭当前弹窗，如果希望关闭上层弹窗，则需要给目标弹窗设置 `name` 属性，然后配置按钮 `close` 属性为目标 `name` 属性，例如：

```schema: scope="body"
{
  "type": "button",
  "label": "多级弹框",
  "actionType": "dialog",
  "dialog": {
    "title": "提示",
    "body": "这是个简单的弹框",
    "name": "dialog_1",
    "actions": [
      {
        "type": "button",
        "actionType": "confirm",
        "label": "确认",
        "primary": true
      },
      {
        "type": "button",
        "actionType": "dialog",
        "label": "再弹一个",
        "dialog": {
          "title": "弹框中的弹框",
          "body": "关闭当前弹窗的时候把外层的弹窗一起关了",
          "actions": [
            {
              "type": "button",
              "label": "关闭所有",
              "level": "info",
              "close": "dialog_1"
            }
          ]
        }
      }
    ]
  }
}
```

## 配置弹窗的按钮

默认弹窗会自动生成两个按钮，一个取消，一个确认。如果通过 `actions` 来自定义配置，则以配置的为准。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "无按钮",
      "actionType": "dialog",
      "dialog": {
        "title": "提示",
        "actions": [],
        "body": "无按钮的弹框"
      }
    },
    {
      "type": "button",
      "label": "只有一个确认按钮",
      "actionType": "dialog",
      "dialog": {
        "title": "提示",
        "actions": [
          {
            "type": "button",
            "actionType": "confirm",
            "label": "OK",
            "primary": true
          }
        ],
        "body": "只有一个 OK 的弹框"
      }
    }
  ]
}
```

## 弹框中配置表单

### 基本使用

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "username",
          "required": true,
          "placeholder": "请输入用户名",
          "label": "用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "required": true,
          "placeholder": "请输入密码"
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    }
  }
}
```

### 提交表单 或 ajax 请求

弹框中通过配置 `form` 或 `ajax` 行为按钮，可以实现 `form` 提交和 `ajax` 请求操作。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "actions": [
      {
        "label": "提交表单",
        "actionType": "submit",
        "primary": true,
        "type": "button"
      },
      {
        "label": "ajax请求",
        "actionType": "ajax",
        "primary": true,
        "type": "button",
        "api": "/api/mock2/form/saveForm?waitSeconds=2"
      }
    ],
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "text",
          "required": true,
          "label": "用户名",
          "placeholder": "请输入用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "placeholder": "请输入密码",
          "required": true
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    }
  }
}
```

### 提交表单 或 ajax 请求后不关闭弹框

默认情况下，当弹框中配置了 form 并进行了**提交表单操作（confirm）**或进行了 **`ajax` 请求**，请求成功后会自动关闭当前弹框；可以通过按钮 `"close": false` 禁止该默认特性。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "actions": [
      {
        "label": "提交表单后不关闭",
        "actionType": "submit",
        "close": false,
        "primary": true,
        "type": "button"
      },
      {
        "label": "ajax请求后不关闭",
        "actionType": "ajax",
        "primary": true,
        "type": "button",
        "api": "/api/mock2/form/saveForm?waitSeconds=2"
      }
    ],
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "text",
          "required": true,
          "label": "用户名",
          "placeholder": "请输入用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "required": true,
          "placeholder": "请输入密码"
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    }
  }
}
```

## feedback 反馈弹框

AJAX 成功后可以用 `feedback` 打开第二层弹框。Vamis 会等待 feedback 关闭，再继续执行后续动作。

### feedback 基本使用

```schema: scope="body"
{
  "type": "button",
  "label": "Feedback",
  "actionType": "ajax",
  "api": "/api/mock2/form/initData?waitSeconds=2",
  "tooltip": "点击我后会发送一个请求，请求回来后，弹出一个框。",
  "feedback": {
    "title": "操作成功",
    "body": "xxx 已操作成功"
  }
}
```

### 弹框中配置 feedback

#### 关闭 feedback 弹框时，同时关闭上层弹框

feedback 可以叠加在 Dialog 内。`actions` 中使用 `actionType: close` 只关闭 feedback；触发按钮写 `close: true` 时再关闭上层 Dialog。

##### 1. 不请求接口，直接关闭

```schema: scope="body"
{
  "type": "button",
  "label": "弹一个框",
  "actionType": "dialog",
  "dialog": {
    "title": "提示",
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "text",
          "required": true,
          "label": "用户名",
          "placeholder": "请输入用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "required": true,
          "placeholder": "请输入密码"
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    },
    "actions": [
      {
        "type": "button",
        "label": "提交表单 Feedback",
        "actionType": "confirm",
        "feedback": {
          "body": "feedback弹框中，不请求接口了，直接点击按钮关闭",
          "actions": [
            {
              "type": "button",
              "actionType": "close",
              "label": "关闭"
            }
          ]
        }
      },
      {
        "type": "button",
        "label": "ajax请求 Feedback",
        "actionType": "ajax",
        "close": true,
        "api": "/api/mock2/form/initData?waitSeconds=1",
        "feedback": {
          "body": "feedback弹框中，不请求接口了，直接点击按钮关闭",
          "actions": [
            {
              "type": "button",
              "actionType": "close",
              "label": "关闭"
            }
          ]
        }
      }
    ]
  }
}
```

##### 2. 请求接口，请求成功后，关闭所有弹框

feedback 的 `body` 使用 Form 并把确认按钮设为 `actionType: confirm` 时，feedback 表单提交成功后会关闭 feedback，再按上层触发按钮的 `close` 配置关闭 Dialog。

```schema: scope="body"
{
  "type": "button",
  "label": "弹一个框",
  "actionType": "dialog",
  "dialog": {
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "text",
          "required": true,
          "label": "用户名",
          "placeholder": "请输入用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "required": true,
          "placeholder": "请输入密码"
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    },
    "actions": [
      {
        "type": "button",
        "label": "confirm Feedback",
        "actionType": "confirm",
        "feedback": {
          "body": {
            "type": "form",
            "api": "/api/mock2/form/saveForm?waitSeconds=1",
            "body": [
              {
                "type": "tpl",
                "tpl": "点击确认，请求接口，接口请求成功后，关闭弹框"
              }
            ]
          },
          "actions": [
            {
              "type": "button",
              "actionType": "confirm",
              "label": "确认",
              "primary": true
            }
          ]
        }
      },
      {
        "type": "button",
        "label": "ajax Feedback",
        "actionType": "ajax",
        "close": true,
        "api": "/api/mock2/form/saveForm?waitSeconds=1",
        "feedback": {
          "body": {
            "type": "form",
            "api": "/api/mock2/form/saveForm?waitSeconds=1",
            "body": [
              {
                "type": "tpl",
                "tpl": "点击确认，请求接口，接口请求成功后，关闭弹框"
              }
            ]
          },
          "actions": [
            {
              "type": "button",
              "actionType": "confirm",
              "label": "确认",
              "primary": true
            }
          ]
        }
      }
    ]
  }
}
```

#### 取消 feedback 弹框时，不同时关闭上层弹框

feedback 写 `skipRestOnCancel: true`，取消反馈时中断原按钮后续动作，保留上层 Dialog。

```schema: scope="body"
{
  "type": "button",
  "label": "弹一个框",
  "actionType": "dialog",
  "dialog": {
    "title": "提示",
    "body": {
      "type": "form",
      "api": "/api/mock2/form/initData?waitSeconds=1",
      "body": [
        {
          "type": "tpl",
          "tpl": "这是一个简单的弹框"
        }
      ]
    },
    "actions": [
      {
        "type": "button",
        "actionType": "confirm",
        "label": "Feedback",
        "feedback": {
          "body": "这是一个feedback弹框",
          "skipRestOnCancel": true,
          "actions": [
            {
              "type": "button",
              "actionType": "close",
              "label": "关闭"
            }
          ]
        }
      }
    ]
  }
}
```

#### 确认 feedback 弹框时，不同时关闭上层弹框

feedback 写 `skipRestOnConfirm: true`，确认反馈时中断原按钮后续动作，需要重新提交。

### 根据条件显示 feedback

feedback 支持 `visibleOn`，条件不成立时不会打开。

```schema: scope="body"
{
  "type": "button",
  "label": "条件feedback",
  "actionType": "ajax",
  "api": "/api/mock2/form/initData?waitSeconds=1",
  "feedback": {
    "visibleOn": "!(this.date % 2)",
    "title": "操作成功",
    "body": "当前时间戳: <code>${date}</code>"
  }
}
```

## 配置 Esc 键和点击外部关闭弹框

可以通过配置 `closeOnEsc` 和 `closeOnOutside` 支持用 esc 键和点击其它区域关闭弹框。

```schema: scope="body"
{
  "label": "点击弹框",
  "type": "button",
  "actionType": "dialog",
  "dialog": {
    "closeOnEsc": true,
    "closeOnOutside": true,
    "title": "弹框标题",
    "body": [
      {
        "type": "input-text",
        "label": "更复杂的标签提示",
        "labelRemark": {
          "trigger": [
            "click"
          ],
          "type": "remark",
          "title": "提示",
          "content": "<pre>first \nsecond\n${text1}</pre>"
        },
        "name": "text3"
      },
      {
        "label": "点击弹框2",
        "type": "button",
        "actionType": "dialog",
        "dialog": {
          "closeOnEsc": true,
          "closeOnOutside": true,
          "title": "弹框标题2",
          "body": "内容"
        }
      }
    ]
  }
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | | 内嵌预览才写 `"dialog"`。弹层用 Action 的 `actionType: dialog` |
| `title` | `SchemaNode` | | 标题，可模板 |
| `body` | `SchemaNode` | | 内容 |
| `bodyClassName` | `string` | `modal-body` | 内容区 class |
| `size` | `string` | | `xs` / `sm` / `md` / `lg` / `xl` / `full` / `custom`。空值 500px |
| `width` | `number \| string` | | `size: custom` 时的宽度 |
| `height` | `number \| string` | | `size: custom` 时的高度 |
| `showCloseButton` | `boolean` | `true` | 右上角关闭 |
| `closeOnEsc` | `boolean` | `false` | Esc 关闭 |
| `closeOnOutside` | `boolean` | `false` | 点遮罩关闭 |
| `showErrorMsg` | `boolean` | `true` | 在底栏左侧显示表单提交错误 |
| `showLoading` | `boolean` | `true` | 在底栏左侧显示提交 loading |
| `disabled` | `boolean` | `false` | 禁用内容和底部动作 |
| `draggable` | `boolean` | `false` | 允许拖动标题栏移动弹层；移动端关闭 |
| `actions` | `Array<Action>` | 取消 + 确认 | `[]` 隐藏底部 |
| `data` | `object` | | 弹层数据域，会并进 overlay |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，在`actions`中可以通过`${事件参数名}`或`${event.data.[事件参数名]}`来获取事件产生的数据，详细请查看[事件动作](/concepts/event-action)。

> `[name]`为当前数据域中的字段名，例如：当前数据域为 {username: 'amis'}，则可以通过${username}获取对应的值。

| 事件名称 | 事件参数                                                                 | 说明               |
| -------- | ------------------------------------------------------------------------ | ------------------ |
| confirm  | `event.data: object` 弹窗数据<br/>`[name]: any` 当前数据域中指定字段的值 | 点击确认提交时触发 |
| cancel   | `event.data: object` 弹窗数据<br/>`[name]: any` 当前数据域中指定字段的值 | 取消、关闭 X、Esc 或点遮罩时触发 |

### confirm

```schema: scope="body"
[
  {
    "label": "弹个框",
    "type": "button",
    "onEvent": {
      "click": {
        "actions": [
          {
            "actionType": "dialog",
            "dialog": {
              "title": "一个弹框",
              "body": [
                {
                  "type": "alert",
                  "body": "试试点击确认按钮",
                  "level": "info",
                  "className": "mb-1"
                },
                {
                  "type": "form",
                  "title": "表单",
                  "debug": true,
                  "body": [
                    {
                      "label": "你的名字",
                      "type": "input-text",
                      "name": "name",
                      "id": "u:00ef9e3fe9db",
                      "mode": "horizontal",
                      "size": "md",
                      "value": "Amis"
                    }
                  ],
                  "id": "u:f4b2a90b685b"
                }
              ],
              "onEvent": {
                "confirm": {
                  "actions": [
                    {
                      "actionType": "toast",
                      "args": {
                        "msg": "你的名字是${name}"
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  }
]
```

### cancel

```schema: scope="body"
[
  {
    "label": "弹个框",
    "type": "button",
    "onEvent": {
      "click": {
        "actions": [
          {
            "actionType": "dialog",
            "dialog": {
              "title": "一个弹窗",
              "body": "试试点击取消按钮或者右上角的关闭",
              "onEvent": {
                "cancel": {
                  "actions": [
                    {
                      "actionType": "toast",
                      "args": {
                        "msg": "cancel"
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  }
]
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定`actionType: 动作名称`、`componentId: 该组件id`来触发这些动作，动作配置可以通过`args: {动作配置项名称: xxx}`来配置具体的参数，详细请查看[事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置                   | 说明         |
| -------- | -------------------------- | ------------ |
| confirm  | -                          | 确认；有表单时先提交，失败不关闭 |
| cancel   | -                          | 取消并关闭当前层 |
| setValue | `value: object` 更新的数据 | 按 `componentId` 更新弹层数据；`dataMergeMode: override` 覆盖 |

### confirm 动作

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "id": "dialog_confirm",
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "username",
          "required": true,
          "placeholder": "请输入用户名",
          "label": "用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "required": true,
          "placeholder": "请输入密码"
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    },
    "actions": [
      {
        "type": "button",
        "label": "触发确认",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "confirm",
                "componentId": "dialog_confirm"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### cancel 动作

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "id": "dialog_cancel",
    "body": {
      "type": "form",
      "api": "/api/mock2/form/saveForm?waitSeconds=2",
      "body": [
        {
          "type": "input-text",
          "name": "username",
          "required": true,
          "placeholder": "请输入用户名",
          "label": "用户名"
        },
        {
          "type": "input-password",
          "name": "password",
          "label": "密码",
          "required": true,
          "placeholder": "请输入密码"
        },
        {
          "type": "checkbox",
          "name": "rememberMe",
          "label": "记住登录"
        }
      ]
    },
    "actions": [
      {
        "type": "button",
        "label": "触发取消",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "cancel",
                "componentId": "dialog_cancel"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### setValue 动作

通过`setValue`更新指定弹窗的数据。

#### 合并数据

默认`setValue`会将新数据与目标组件数据进行合并。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "id": "dialog_setvalue",
    "data": {
      "username": "amis",
      "password": "amis@baidu.com"
    },
    "body": [
      {
        "type": "alert",
        "body": "初始化时，弹窗的数据data为{username: 'amis', password: 'fex'}，表单内或者表单外都可以读取这些数据，当点击【更新弹窗数据】按钮后，弹窗的数据被更新为{username: 'aisuda', password: 'aisuda@baidu.com'}"
      },
      {
        "type": "input-text",
        "label": "表单外的密码",
        "name": "password"
      },
      {
        "type": "form",
        "debug": true,
        "api": "/api/mock2/form/saveForm?waitSeconds=2",
        "body": [
          {
            "type": "input-text",
            "name": "username",
            "required": true,
            "placeholder": "请输入用户名",
            "label": "用户名"
          },
          {
            "type": "input-password",
            "name": "password",
            "label": "密码",
            "required": true,
            "placeholder": "请输入密码"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "button",
        "label": "更新弹窗数据",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "setValue",
                "componentId": "dialog_setvalue",
                "args": {
                  "value": {
                    "username": "aisuda",
                    "password": "aisuda@baidu.com"
                  }
                }
              }
            ]
          }
        }
      }
    ]
  }
}
```

#### 覆盖数据

可以通过`"dataMergeMode": "override"`来覆盖目标组件数据。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "dialog",
  "dialog": {
    "title": "在弹框中的表单",
    "id": "dialog_setvalue2",
    "data": {
      "username": "amis",
      "password": "amis@baidu.com"
    },
    "body": [
      {
        "type": "alert",
        "body": "初始化时，弹窗的数据data为{username: 'amis', password: 'fex'}，表单内或者表单外都可以读取这些数据，当点击【更新弹窗数据】按钮后，弹窗的数据被更新为{username: 'aisuda'}，即password将被删除"
      },
      {
        "type": "input-text",
        "label": "表单外的密码",
        "name": "password"
      },
      {
        "type": "form",
        "debug": true,
        "api": "/api/mock2/form/saveForm?waitSeconds=2",
        "body": [
          {
            "type": "input-text",
            "name": "username",
            "required": true,
            "placeholder": "请输入用户名",
            "label": "用户名"
          },
          {
            "type": "input-password",
            "name": "password",
            "label": "密码",
            "required": true,
            "placeholder": "请输入密码"
          }
        ]
      }
    ],
    "actions": [
      {
        "type": "button",
        "label": "更新弹窗数据",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "setValue",
                "componentId": "dialog_setvalue2",
                "args": {
                  "value": {
                    "username": "aisuda"
                  }
                },
                "dataMergeMode": "override"
              }
            ]
          }
        }
      }
    ]
  }
}
```

## 和 Amis 文档的差异
- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 多级弹层同时保留可见层，并按 Amis `Modal--Nth` 的 30px 步进错位；关闭当前层恢复上一层。
- 输入控件保留 Vamis 的 3px focus glow。Dialog body 增加 3px 内呼吸位并用 margin 相抵，视觉起点仍对齐 Amis 的 16px / 24px 间距。
- UI 用 shadcn-vue / reka-ui + token 实现，不搬 `cxd-` class；Modal 的 flex column、24px 横向 padding、6px 圆角、标题 14/21、正文 14/21 和底栏高度跟 Amis 实测。
