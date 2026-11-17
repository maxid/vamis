---
title: Wizard 向导
outline: deep
---

# Wizard 向导

::: warning 实现进度 50% · 进行中
主路径可交互（未逐章节两站核完，不进 80%）：`steps` 的 title/body、默认「上一步 / 下一步 / 完成」、最后一步改完成、`startStep` 从 1 计、`mode` 默认 horizontal、步骤表单 `wrapWithPanel: false`。缺 `initApi` / `api` 提交、自定义 `actions` 接到 prev/next、`jumpableOn` 像素级步骤条。
:::

表单向导。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

第一步不画「上一步」。最后一步按钮是「完成」。没写 `api` 时下一步只切步，不发请求。

## 基本使用

```schema: scope="body"
type: wizard
steps:
  - title: 第一步
    body: 这是第一步
  - title: Step 2
    body: 这是第二步
  - title: Step 3
    body: 这是最后一步了
```

## 从某一步开始

`startStep` 从 1 计，且必须是字符串（数字会被忽略）。下面从第二步起，能看到「上一步」和「下一步」。

```schema: scope="body"
type: wizard
startStep: "2"
steps:
  - title: 第一步
    body: 这是第一步
  - title: Step 2
    body: 这是第二步
  - title: Step 3
    body: 这是最后一步了
```

## 按钮文案

```schema: scope="body"
type: wizard
actionPrevLabel: 上一步
actionNextLabel: 下一步
actionFinishLabel: 完成
steps:
  - title: 第一步
    body: 这是第一步
  - title: Step 2
    body: 这是第二步
  - title: Step 3
    body: 这是最后一步了
```

## 竖排

`mode` 默认 `horizontal`。

```schema: scope="body"
type: wizard
mode: vertical
steps:
  - title: 第一步
    body: 这是第一步
  - title: Step 2
    body: 这是第二步
  - title: Step 3
    body: 这是最后一步了
```

## 自定义按钮

可以在每个 `step` 中配置 `actions` 来自定义按钮。按钮所在数据域查看`WizardActionData`定义（`3.5.0`及以上版本支持）

```typescript
interface WizardActionData {
  /* 当前步骤数值，从1开始 */
  currentStep: number;
}
```

```schema: scope="body"
{
  "type": "wizard",
  "steps": [
    {
      "title": "第一步",
      "body": [
        {
          "name": "website",
          "label": "网址",
          "type": "input-url"
        },
        {
          "name": "email",
          "label": "邮箱",
          "type": "input-email"
        }
      ],
      "actions": [
        {
          "label": "Prev",
          "type": "button",
          "actionType": "prev",
          "disabledOn": "${currentStep === 1}"
        },
        {
          "label": "Next",
          "type": "button",
          "actionType": "next"
        }
      ]
    },
    {
      "title": "Step 2",
      "body": [
        {
          "name": "email2",
          "label": "邮箱",
          "type": "input-email"
        }
      ],
      "actions": [
        {
          "label": "Prev",
          "type": "button",
          "actionType": "prev"
        },
        {
          "label": "Submit",
          "type": "button",
          "actionType": "next"
        }
      ]
    },
    {
      "title": "Step 3",
      "body": [
        "这是最后一步了, 没有按钮"
      ],
      "actions": []
    }
  ]
}
```

## 初始化到某一步

`initApi` 接口返回 `step` 字段即可，注意得是数字类型。`1` 表示第一步，`2` 表示第二步，以此类推

```schema: scope="body"
{
  "type": "wizard",
  "initApi": "/api/mock2/initWizard",
  "steps": [
    {
      "title": "第一步",
      "body": [
        {
          "name": "website",
          "label": "网址",
          "type": "input-url",
          "required": true
        },
        {
          "name": "email",
          "label": "邮箱",
          "type": "input-email",
          "required": true
        }
      ]
    },
    {
      "title": "Step 2",
      "body": [
        {
          "name": "email2",
          "label": "邮箱",
          "type": "input-email",
          "required": true
        }
      ]
    },
    {
      "title": "Step 3",
      "body": [
        "这是最后一步了"
      ]
    }
  ]
}
```

## 限制跳转

可以通过在 step 上配置 `jumpableOn` 来限制跳转，可以基于整体 wizard 数据，或者基于 `currentStep` 来判断。

比如：`"jumpableOn": "${!website}",` 当设置完成了 website 后不可以回去跳转

```schema: scope="body"
{
  "type": "wizard",
  "initApi": "/api/mock2/initWizard",
  "steps": [
    {
      "title": "第一步",
      "jumpableOn": "${!website}",
      "body": [
        {
          "name": "website",
          "label": "网址",
          "type": "input-url",
          "required": true
        },
        {
          "name": "email",
          "label": "邮箱",
          "type": "input-email",
          "required": true
        }
      ]
    },
    {
      "title": "Step 2",
      "body": [
        {
          "name": "email2",
          "label": "邮箱",
          "type": "input-email",
          "required": true
        }
      ]
    },
    {
      "title": "Step 3",
      "body": [
        "这是最后一步了"
      ]
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"wizard"` | 指定为向导 |
| `mode` | `string` | `horizontal` | `horizontal` / `vertical` |
| `steps` | `Array` | | `title` / `body` / `api` / `actions` |
| `startStep` | `string` | `"1"` | 起始步，从 1 计。源码只认字符串 |
| `actionPrevLabel` | `string` | `上一步` | 上一步 |
| `actionNextLabel` | `string` | `下一步` | 下一步 |
| `actionNextSaveLabel` | `string` | `保存并下一步` | 当前步有 `api` 时 |
| `actionFinishLabel` | `string` | `完成` | 最后一步 |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，在`actions`中可以通过`${事件参数名}`或`${event.data.[事件参数名]}`来获取事件产生的数据，详细请查看[事件动作](/concepts/event-action)。

> `[name]`为当前数据域中的字段名，例如：当前数据域为 {username: 'amis'}，则可以通过${username}获取对应的值。

| 事件名称       | 事件参数                                                                                                                                                                                   | 说明                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| inited         | `responseData: any` 请求的响应数据</br>`responseStatus: number` 响应状态，0 表示成功</br>`responseMsg: string`响应消息, `error`表示接口是否成功<br/>`[name]: any` 当前数据域中指定字段的值 | initApi 接口请求完成时触发 |
| stepChange     | `step: number` 步骤索引                                                                                                                                                                    | 切换步骤时触发             |
| change         | `event.data: object` 当前表单数据<br/>`[name]: any` 当前数据域中指定字段的值                                                                                                               | 表单值变化时触发           |
| stepSubmitSucc | -                                                                                                                                                                                          | 单个步骤提交成功           |
| stepSubmitFail | `error: object` 单个步骤 api 远程请求失败后返回的错误信息                                                                                                                                  | 单个步骤提交失败           |
| finished       | `event.data: object` 即将提交的表单数据<br/>`[name]: any` 当前数据域中指定字段的值                                                                                                         | 最终提交时触发             |
| submitSucc     | `result: object` api 远程请求成功后返回的结果数据                                                                                                                                          | 最终提交成功时触发         |
| submitFail     | `error: object` api 远程请求失败后返回的错误信息                                                                                                                                           | 最终提交失败时触发         |

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定`actionType: 动作名称`、`componentId: 该组件id`来触发这些动作，动作配置可以通过`args: {动作配置项名称: xxx}`来配置具体的参数，详细请查看[事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称    | 动作配置                   | 说明                                     |
| ----------- | -------------------------- | ---------------------------------------- |
| submit      | -                          | 全部提交                                 |
| step-submit | -                          | 分步提交                                 |
| next        | -                          | 下一步                                   |
| prev        | -                          | 上一步                                   |
| goto-step   | `step: number` 目标步骤    | 定位步骤                                 |
| reload      | -                          | 重新加载，调用 `intiApi`，刷新数据域数据 |
| setValue    | `value: object` 更新的数据 | 更新数据                                 |

## 和 Amis 文档的差异
- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不接 `initApi` / 最后 `api` 提交；自定义 `actions` 只画出，不接 prev/next 组件动作。
- 视觉走 token 步骤条，不是 cxd Wizard 皮肤。
