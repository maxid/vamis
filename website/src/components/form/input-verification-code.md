---
title: InputVerificationCode 验证码
outline: deep
---

# InputVerificationCode 验证码

::: warning 实现进度 50% · 进行中
能分格输入
:::

`input-verification-code` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

注意 InputVerificationCode, 可通过<b>粘贴</b>完成填充数据。

## 基本用法

基本用法。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-verification-code",
      "name": "verificationCode"
    }
  ]
}
```

## 密码模式

指定 masked = true，可开启密码模式。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-verification-code",
      "name": "verificationCode",
      "masked": true
    }
  ]
}
```

## 自定义分隔符

指定 separator 可以自定义渲染分隔符。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-verification-code",
      "name": "verificationCode",
      "length": 9,
      "separator": "${((index + 1) % 3 || index > 7 ) ? null : '-'}"
    }
  ]
}
```

## 状态

<p>指定 disabled = true，可开启禁用模式。</p>
指定 readOnly = true，可开启只读模式。

```schema: scope="body"
{
  "type": "form",
  "api": "/api/mock2/form/saveForm",
  "debug": true,
  "body": [
    {
      "type": "input-verification-code",
      "name": "verificationCodeDisabled",
      "value": "123456",
      "disabled": true
    },
    {
      "type": "input-verification-code",
      "name": "verificationCodeReadOnly",
      "value": "987654",
      "readOnly": true
    }
  ]
}
```

## 属性表

当做选择器表单项使用时，除了支持 [普通表单项属性表](./formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8) 中的配置以外，还支持下面一些配置

| 属性名    | 类型      | 默认值 | 说明                                                                           |
| --------- | --------- | ------ | ------------------------------------------------------------------------------ |
| length    | `number`  | 6      | 验证码的长度，根据长度渲染对应个数的输入框                                     |
| masked    | `boolean` | false  | 是否是密码模式                                                                 |
| separator | `string`  |        | 分隔符，支持表达式, 表达式`只`可以访问 index、character 变量, 参考自定义分隔符 |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件。

| 事件名称 | 事件参数 | 说明                       |
| -------- | -------- | -------------------------- |
| finish   | -        | 输入框都被填充后触发的回调 |
| change   | -        | 输入值改变时触发的回调     |

### 事件

finish 输入框都被填充。可以尝试通过`${event.data.value}`获取填写的数据。

```schema: scope="body"
{
  "type": "input-verification-code",
  "onEvent": {
    "finish": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "${event.data.value}"
          }
        }
      ]
    }
  }
}
```

change 输入值改变。可以尝试通过`${event.data.value}`获取填写的数据。

```schema: scope="body"
{
  "type": "input-verification-code",
  "onEvent": {
    "change": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msgType": "info",
            "msg": "${event.data.value}"
          }
        }
      ]
    }
  }
}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：能分格输入。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
