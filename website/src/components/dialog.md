---
title: Dialog 对话框
outline: deep
---

# Dialog 对话框

::: info 实现进度 88% · 进行中
文档主路径已对齐：`actionType: dialog` 打开 overlay、`title` / `body`、`size` xs–full（默认 500px，仅 ≥576）、`showCloseButton`（默认 true）、`closeOnEsc` / `closeOnOutside`（默认 false）、未写 `actions` 则取消+确认、嵌套弹层按栈弹出。body 是 form 时默认横排、无面板、无默认「提交」。窄屏（&lt;576 / 对照「移动」）弹层拉满、底栏取消+确认横排均分。关闭按钮 hover 出「关闭」提示。缺拖拽、`feedback`、弹层内表单提交回写、多级同时错位可见、像素级 cxd Modal。
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

`size` 不是表单项宽度。空值 500px，`xs` 200px，`sm` 350px，`md` 800px，`lg` 1100px，`xl` 90%，`full` 尽量铺满。也可用 `width` / `height`。

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
    label: 占满屏幕的弹框
    actionType: dialog
    dialog:
      size: full
      title: 全屏弹框
      body: 弹框尽可能占满，内容部分滚动。
```

## 多级弹框

再开一层会压栈，关当前层回到上一层。多层不会同时错位叠出。

```schema: scope="body"
type: button
label: 多级弹框
actionType: dialog
dialog:
  title: 提示
  body: 这是个简单的弹框
  actions:
    - type: button
      actionType: confirm
      label: 确认
      primary: true
    - type: button
      actionType: dialog
      label: 再弹一个
      dialog:
        title: 弹框中的弹框
        body: 如果你想，可以继续弹下去
        actions:
          - type: button
            actionType: confirm
            label: 关闭
            primary: true
```

## 配置弹窗的按钮

默认底部「取消」+「确认」。写了 `actions` 就用配置的；`[]` 不要底部按钮。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无底部按钮
    actionType: dialog
    dialog:
      title: 提示
      actions: []
      body: 没有底部按钮
  - type: button
    label: 只有确认
    actionType: dialog
    dialog:
      title: 提示
      actions:
        - type: button
          actionType: confirm
          label: 确认
          primary: true
      body: 只有一个确认按钮
```

## 关闭方式

`showCloseButton: false` 隐藏右上角关闭，底部按钮仍在。`closeOnEsc` / `closeOnOutside` 要显式 `true`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无右上关闭
    actionType: dialog
    dialog:
      title: 提示
      body: 没有右上角关闭
      showCloseButton: false
  - type: button
    label: Esc 与点遮罩
    actionType: dialog
    dialog:
      title: 提示
      body: Esc 或点遮罩可关闭
      closeOnEsc: true
      closeOnOutside: true
```

## 弹框与数据映射

弹层共享当前数据域，`body` 里可直接用变量：

```schema: scope="body"
type: page
data:
  name: amis
body:
  - type: button
    label: 查看详情
    actionType: dialog
    dialog:
      title: 详情
      body: "当前名称：${name}"
```

## 动作后关闭弹框

弹层内按钮配 `actionType: close` 关闭当前层：

```schema: scope="body"
type: button
label: 打开并关闭
actionType: dialog
dialog:
  title: 提示
  body:
    type: container
    body:
      type: button
      label: 关闭
      actionType: close
```

## 弹框中配置表单

`body` 用 `form` 时默认横向、无面板、无默认提交按钮；按钮由弹层 `actions` 提供：

```schema: scope="body"
type: button
label: 编辑
actionType: dialog
dialog:
  title: 编辑
  body:
    type: form
    body:
      - type: input-text
        name: name
        label: 名称
  actions:
    - type: button
      label: 取消
      actionType: close
    - type: button
      label: 保存
      level: primary
      actionType: close
```

## feedback 反馈弹框

Amis 的 `feedback`（提交后把返回数据渲染成弹层）暂未接；可用 `submitSucc` 事件 + `dialog` 动作组合。

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
| `size` | `string` | | `xs` / `sm` / `md` / `lg` / `xl` / `full`。空值 500px |
| `width` | `number \| string` | | 自定义宽度 |
| `height` | `number \| string` | | 自定义高度 |
| `showCloseButton` | `boolean` | `true` | 右上角关闭 |
| `closeOnEsc` | `boolean` | `false` | Esc 关闭 |
| `closeOnOutside` | `boolean` | `false` | 点遮罩关闭 |
| `actions` | `Array<Action>` | 取消 + 确认 | `[]` 隐藏底部 |
| `data` | `object` | | 弹层数据域，会并进 overlay |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，在`actions`中可以通过`${事件参数名}`或`${event.data.[事件参数名]}`来获取事件产生的数据，详细请查看[事件动作](/concepts/event-action)。

> `[name]`为当前数据域中的字段名，例如：当前数据域为 {username: 'amis'}，则可以通过${username}获取对应的值。

| 事件名称 | 事件参数                                                                 | 说明               |
| -------- | ------------------------------------------------------------------------ | ------------------ |
| confirm  | `event.data: object` 弹窗数据<br/>`[name]: any` 当前数据域中指定字段的值 | 点击确认提交时触发 |
| cancel   | `event.data: object` 弹窗数据<br/>`[name]: any` 当前数据域中指定字段的值 | 点击取消时触发     |

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
| confirm  | -                          | 确认（提交） |
| cancel   | -                          | 取消（关闭） |
| setValue | `value: object` 更新的数据 | 更新数据     |

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
- 嵌套弹层按栈替换顶层，不像素级错位叠出。
- 补数据映射 / 动作后关闭 / 弹层表单章节；不接 `draggable`、`feedback`、弹层内表单提交、`close:name` 关指定层。
- 视觉走 shadcn Dialog token，不是 cxd Modal 皮肤。
