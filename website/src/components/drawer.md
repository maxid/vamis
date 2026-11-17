---
title: Drawer 抽屉
outline: deep
---

# Drawer 抽屉

::: info 实现进度 88% · 进行中
文档主路径已对齐：`actionType: drawer` 打开 overlay、`title` / `body`、`position` 默认 right、`size` xs–xl（空值 400px）、`width` / `height`、`showCloseButton` / `overlay` 默认 true、`closeOnEsc` / `closeOnOutside` 默认 false、未写 `actions` 则取消+确认、嵌套按栈弹出。body 是 form 时默认横排、无面板、无默认「提交」。关闭按钮 hover 出「关闭」提示。缺拖拽改尺寸、多级错位递减、像素级 cxd Drawer。
:::

Drawer 主要由 [Action](./action) 的 `actionType: drawer` 触发。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **反馈**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

也可以把 `type: drawer` 写进树里当内嵌预览，真正的侧栏走 `OverlayHost`。`position` 默认 **right**。`showCloseButton` / `overlay` 源码默认 **true**。没写 `actions` 时底部是「取消」（`actionType: close`）+「确认」。

## 基本用法

```schema: scope="body"
label: 弹出
type: button
actionType: drawer
drawer:
  title: 抽屉标题
  body: 这是一个抽屉
```

## 指定弹出方向

`position` 可选 `left` / `right` / `top` / `bottom`，默认 `right`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 左侧
    actionType: drawer
    drawer:
      position: left
      title: 提示
      body: 从左侧弹出
  - type: button
    label: 右侧
    actionType: drawer
    drawer:
      position: right
      title: 提示
      body: 从右侧弹出
  - type: button
    label: 顶部
    actionType: drawer
    drawer:
      position: top
      title: 提示
      body: 从顶部弹出
  - type: button
    label: 底部
    actionType: drawer
    drawer:
      position: bottom
      title: 提示
      body: 从底部弹出
```

## 抽屉尺寸

`size` 可选 `xs` / `sm` / `md` / `lg` / `xl`。空值 400px。左右弹是宽度，上下弹是高度。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 极小
    actionType: drawer
    drawer:
      size: xs
      title: 提示
      body: 这是个简单的抽屉
  - type: button
    label: 较大
    actionType: drawer
    drawer:
      size: lg
      title: 提示
      body: 这是个简单的抽屉
```

## 自定义宽高

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 自定义宽度
    actionType: drawer
    drawer:
      position: right
      width: 300
      title: 提示
      body: 自定义宽度
  - type: button
    label: 自定义高度
    actionType: drawer
    drawer:
      position: bottom
      height: 240
      title: 提示
      body: 自定义高度
```

## 多级抽屉

再开一层会压栈，关当前层回到上一层。

```schema: scope="body"
type: button
label: 多级抽屉
actionType: drawer
drawer:
  title: 提示
  body: 这是个简单的抽屉
  actions:
    - type: button
      actionType: confirm
      label: 关上提示
      primary: true
    - type: button
      actionType: drawer
      label: 再弹一个
      drawer:
        title: 抽屉中的抽屉
        body: 如果你想，可以继续弹下去
        actions:
          - type: button
            actionType: confirm
            label: 关闭
            primary: true
```

## 关闭与蒙层

`showCloseButton: false` 隐藏右上角。`overlay: false` 不画遮罩。`closeOnEsc` / `closeOnOutside` 要显式 `true`。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 无右上关闭
    actionType: drawer
    drawer:
      title: 无右上抽屉标题
      body: 没有右上角关闭
      showCloseButton: false
  - type: button
    label: 无蒙层
    actionType: drawer
    drawer:
      title: 提示
      body: 没有蒙层
      overlay: false
```

## 动作后关闭抽屉

抽屉内按钮配 `actionType: close` 关闭当前层：

```schema: scope="body"
type: button
label: 打开并关闭
actionType: drawer
drawer:
  title: 提示
  body:
    type: button
    label: 关闭
    actionType: close
```

## 配置抽屉的按钮

`actions` 覆盖默认「取消 + 确认」，弹层内表单默认无提交钮：

```schema: scope="body"
type: button
label: 编辑
actionType: drawer
drawer:
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

## 可拖拽抽屉大小

Amis 的 `resizable` 暂未接；需要固定尺寸请用 `width` / `height`。

## 多级弹框

可以嵌套使用。

```schema: scope="body"
{
  "type": "button",
  "label": "多级抽屉",
  "actionType": "drawer",
  "drawer": {
    "title": "提示",
    "body": "这是个简单的抽屉",
    "actions": [
      {
        "type": "button",
        "actionType": "confirm",
        "label": "确认",
        "primary": true
      },
      {
        "type": "button",
        "actionType": "drawer",
        "label": "再弹一个",
        "drawer": {
          "title": "抽屉中的抽屉",
          "body": "如果你想，可以继续弹下去",
          "actions": [
            {
              "type": "button",
              "actionType": "drawer",
              "label": "来吧",
              "level": "info",
              "drawer": {
                "title": "抽屉中的抽屉",
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

## 自定义抽屉尺寸

通过设置 `width`（`position` 为 `left` 或 `right` 时生效）和 `height`（`position` 为 `top` 或 `bottom` 时生效）来控制抽屉的尺寸。

值如果是数字类型，单位默认使用 `px`, 如果是字符串类型，可以使用自定义 css 宽度变量，如：`%`、`vw`、`px` 等。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "自定义宽度",
      "actionType": "drawer",
      "drawer": {
        "position": "right",
        "width": 300,
        "title": "提示",
        "body": "这是一个自定义 300px 宽度的抽屉"
      }
    },
    {
      "type": "button",
      "label": "自定义高度",
      "actionType": "drawer",
      "drawer": {
        "position": "bottom",
        "height": 300,
        "title": "提示",
        "body": "这是一个自定义 300px 高度的抽屉"
      }
    }
  ]
}
```

## 是否展示关闭按钮

配置 `"showCloseButton": false`，可以隐藏关闭按钮。

```schema: scope="body"
{
  "type": "button",
  "label": "无关闭按钮",
  "actionType": "drawer",
  "drawer": {
    "title": "提示",
    "body": "这是一个没有关闭按钮的抽屉",
    "showCloseButton": false
  }
}
```

## 蒙层显示

通过配置 `overlay`，来控制是否显示蒙层。默认为 `true`。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "默认",
      "actionType": "drawer",
      "drawer": {
        "overlay": true,
        "title": "提示",
        "body": "这是一个有蒙层的抽屉"
      }
    },
    {
      "type": "button",
      "label": "不显示",
      "actionType": "drawer",
      "drawer": {
        "overlay": false,
        "title": "提示",
        "body": "这是一个没有蒙层的抽屉"
      }
    }
  ]
}
```

## 关闭方式

通过配置 `closeOnOutside`，即可在点击抽屉外部时，直接关闭抽屉。

同时可以配置 `closeOnEsc`，让抽屉支持 <kbd>Esc</kbd> 键关闭。

```schema: scope="body"
{
  "type": "button-toolbar",
  "buttons": [
    {
      "type": "button",
      "label": "点击抽屉外自动关闭（有蒙层）",
      "actionType": "drawer",
      "drawer": {
        "closeOnOutside": true,
        "title": "提示",
        "body": "这是一个简单的抽屉"
      }
    },
    {
      "type": "button",
      "label": "点击抽屉外自动关闭（无蒙层）",
      "actionType": "drawer",
      "drawer": {
        "overlay": false,
        "closeOnOutside": true,
        "title": "提示",
        "body": "这是一个简单的抽屉"
      }
    },
    {
      "type": "button",
      "label": "按键关闭",
      "actionType": "drawer",
      "drawer": {
        "closeOnEsc": true,
        "title": "提示",
        "body": "试试按下 Esc"
      }
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | | 内嵌预览才写 `"drawer"`。侧栏用 Action 的 `actionType: drawer` |
| `title` | `SchemaNode` | | 标题，可模板 |
| `body` | `SchemaNode` | | 内容 |
| `position` | `string` | `right` | `left` / `right` / `top` / `bottom` |
| `size` | `string` | | `xs` / `sm` / `md` / `lg` / `xl`。空值 400px |
| `width` | `number \| string` | | 自定义宽度 |
| `height` | `number \| string` | | 自定义高度 |
| `overlay` | `boolean` | `true` | 是否显示遮罩 |
| `showCloseButton` | `boolean` | `true` | 右上角关闭 |
| `closeOnEsc` | `boolean` | `false` | Esc 关闭 |
| `closeOnOutside` | `boolean` | `false` | 点外面关闭 |
| `actions` | `Array<Action>` | 取消 + 确认 | `[]` 隐藏底部 |
| `data` | `object` | | 抽屉数据域 |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听这些事件，并通过 `actions` 来配置执行的动作，在 `actions` 中可以通过 `${事件参数名}` 或 `${event.data.[事件参数名]}` 来获取事件产生的数据，详细请查看[事件动作](/concepts/event-action)。

| 事件名称 | 事件参数                                                                 | 说明               |
| -------- | ------------------------------------------------------------------------ | ------------------ |
| confirm  | `event.data: object` 抽屉数据<br/>`[name]: any` 当前数据域中指定字段的值 | 点击确认提交时触发 |
| cancel   | `event.data: object` 抽屉数据<br/>`[name]: any` 当前数据域中指定字段的值 | 点击取消时触发     |

### confirm

```schema: scope="body"
[
  {
    "label": "打开",
    "type": "button",
    "onEvent": {
      "click": {
        "actions": [
          {
            "actionType": "drawer",
            "drawer": {
              "title": "标题",
              "body": "这是一个抽屉",
              "onEvent": {
                "confirm": {
                  "actions": [
                    {
                      "actionType": "toast",
                      "args": {
                        "msg": "confirm"
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
    "label": "打开",
    "type": "button",
    "onEvent": {
      "click": {
        "actions": [
          {
            "actionType": "drawer",
            "drawer": {
              "title": "标题",
              "body": "这是一个抽屉",
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

当前组件对外暴露以下特性动作，其他组件可以通过指定 `actionType: 动作名称`、`componentId: 该组件id` 来触发这些动作，动作配置可以通过 `args: {动作配置项名称: xxx}` 来配置具体的参数，详细请查看[事件动作](/concepts/event-action#触发其他组件的动作)。

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
  "actionType": "drawer",
  "drawer": {
    "title": "在抽屉中的表单",
    "id": "drawer_confirm",
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
                "componentId": "drawer_confirm"
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
  "actionType": "drawer",
  "drawer": {
    "title": "在抽屉中的表单",
    "id": "drawer_cancel",
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
                "componentId": "drawer_cancel"
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

通过 `setValue` 更新指定抽屉的数据。

#### 合并数据

默认 `setValue` 会将新数据与目标组件数据进行合并。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "drawer",
  "drawer": {
    "title": "在抽屉中的表单",
    "id": "drawer_setvalue",
    "data": {
      "username": "amis",
      "password": "amis@baidu.com"
    },
    "body": [
      {
        "type": "alert",
        "body": "初始化时，抽屉的数据 data 为 {username: 'amis', password: 'fex'}，表单内或者表单外都可以读取这些数据，当点击【更新抽屉数据】按钮后，抽屉的数据被更新为 {username: 'aisuda', password: 'aisuda@baidu.com'}"
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
        "label": "更新抽屉数据",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "setValue",
                "componentId": "drawer_setvalue",
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

可以通过 `"dataMergeMode": "override"` 来覆盖目标组件数据。

```schema: scope="body"
{
  "type": "button",
  "label": "弹个表单",
  "actionType": "drawer",
  "drawer": {
    "title": "在抽屉中的表单",
    "id": "drawer_setvalue2",
    "data": {
      "username": "amis",
      "password": "amis@baidu.com"
    },
    "body": [
      {
        "type": "alert",
        "body": "初始化时，抽屉的数据 data 为 {username: 'amis', password: 'fex'}，表单内或者表单外都可以读取这些数据，当点击【更新抽屉数据】按钮后，抽屉的数据被更新为 {username: 'aisuda'}，即 password 将被删除"
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
        "label": "更新抽屉数据",
        "onEvent": {
          "click": {
            "actions": [
              {
                "actionType": "setValue",
                "componentId": "drawer_setvalue2",
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
- 嵌套抽屉按栈替换顶层，不按层递减宽度。
- 补动作后关闭 / 配置按钮 / resizable 未接说明；不接弹层内表单提交。
- 视觉走 shadcn Sheet token，不是 cxd Drawer 皮肤。
