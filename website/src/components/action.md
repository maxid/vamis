---
title: Action 行为按钮
outline: deep
---

# Action 行为按钮

::: info 实现进度 85% · 进行中
文档主路径已对齐：`actionType`、`level` / `primary`、`size`、URL `icon`、`confirmText` / `confirmTitle`、dialog / drawer / ajax / toast / copy / link / url / email。缺倒计时、快捷键、fontawesome 图标、Action 当容器、`download` / `saveAs`、控制流。
:::

Action 是触发页面行为的主要方法。`type: action` 与别名 `button` / `submit` / `reset` 同一渲染器。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。按钮保持内容宽度，不要写成 `w-full` 才像按钮。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

对照不跑 dialog 活示例（点击探测会和 Amis 树结点对不齐）：

```yaml
label: 弹框
type: button
actionType: dialog
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

JSON 同等有效：

```json
{
  "label": "弹框",
  "type": "button",
  "actionType": "dialog",
  "dialog": {
    "title": "弹框",
    "body": "这是个简单的弹框。"
  }
}
```

## 样式

### 尺寸

`size`：`xs` / `sm` / `md` / `lg`。未写时是默认高度。

```schema: scope="body"
{
  "type": "tpl",
  "tpl": "下面是不同尺寸的按钮。"
}
```

尺寸用活示例各画一颗按钮：

```schema: scope="body"
{ "type": "button", "label": "默认档" }
```

```schema: scope="body"
{ "type": "button", "label": "极小", "size": "xs" }
```

```schema: scope="body"
{ "type": "button", "label": "小", "size": "sm" }
```

```schema: scope="body"
{ "type": "button", "label": "中等", "size": "md" }
```

```schema: scope="body"
{ "type": "button", "label": "大", "size": "lg" }
```

### 主题

`level` 或 `primary: true`（等价 `level: primary`）。

```schema: scope="body"
{ "type": "button", "label": "默认" }
```

```schema: scope="body"
{ "type": "button", "label": "主要 YAML", "level": "primary" }
```

```schema: scope="body"
{ "type": "button", "label": "次要", "level": "secondary" }
```

```schema: scope="body"
{ "type": "button", "label": "信息", "level": "info" }
```

```schema: scope="body"
{ "type": "button", "label": "成功", "level": "success" }
```

```schema: scope="body"
{ "type": "button", "label": "警告", "level": "warning" }
```

```schema: scope="body"
{ "type": "button", "label": "危险", "level": "danger" }
```

```schema: scope="body"
{ "type": "button", "label": "浅色", "level": "light" }
```

```schema: scope="body"
{ "type": "button", "label": "深色", "level": "dark" }
```

```schema: scope="body"
{ "type": "button", "label": "链接", "level": "link" }
```

### 图标

`icon` 含 `/` 或 `http` 时当图片。fontawesome 类名（`fa fa-plus`）未接图标字体，只保留 class。`label: ""` 可以只显示图标。

```schema: scope="body"
{
  "label": "带图标",
  "type": "button",
  "icon": "https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg"
}
```

```schema: scope="body"
label: 带图标 YAML
type: button
icon: https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg
```

## 操作前确认

`confirmText` 会先 `env.confirm`；`confirmTitle` 传给确认框标题（浏览器原生 `confirm` 没有标题栏）。对照不跑这条活示例：

```yaml
label: ajax请求
type: button
actionType: ajax
confirmText: 确认要发出这个请求？
confirmTitle: 炸弹
api: /api/mock2/form/saveForm
```

## ajax 请求

`actionType: ajax` + `api`。成功走 `env.notify`，可写 `messages.success` / `failed`，可用 `reload` 刷新目标。对照不跑 ajax 活示例：

```yaml
label: ajax请求
type: button
actionType: ajax
api: /api/mock2/form/saveForm
```

`redirect`、`feedback` 弹框、`download` / `saveAs` 尚未对齐主路径。

## 跳转链接

`link` 单页跳转、`url` 直接跳转，都走 `env.jumpTo`。`blank: true` 未接。对照不跑跳转活示例：

```yaml
label: 进入介绍页
type: button
level: info
actionType: link
link: /start/getting-started
```

## 发送邮件

`actionType: email` 拼 `mailto:`。对照不跑这条活示例：

```yaml
label: 发送邮件
type: button
actionType: email
to: amis@baidu.com
cc: baidu@baidu.com
subject: 这是邮件主题
body: 这是邮件正文
```

## 弹框

对照不跑 dialog 活示例：

```yaml
label: Dialog Form
type: button
level: primary
actionType: dialog
dialog:
  title: 表单设置
  body: 这是个简单的弹框。
```

## 抽屉

```schema: scope="body"
{
  "label": "Drawer Form",
  "type": "button",
  "actionType": "drawer",
  "drawer": {
    "title": "表单设置",
    "body": "抽屉内容"
  }
}
```

```schema: scope="body"
label: Drawer Form YAML
type: button
actionType: drawer
drawer:
  title: 表单设置 YAML
  body: 抽屉内容 YAML
```

## 复制文本

```schema: scope="body"
{
  "label": "复制一段文本",
  "type": "button",
  "actionType": "copy",
  "content": "http://www.baidu.com"
}
```

```schema: scope="body"
label: 复制一段文本 YAML
type: button
actionType: copy
content: https://example.com/vamis
```

`copyFormat` 富文本未接。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"action"` | 指定为 action 渲染器；`button` / `submit` / `reset` 是别名 |
| actionType | `string` | | ajax / dialog / drawer / toast / copy / link / url / email / submit / reset / reload / setValue … |
| label | `string` | `"按钮"` | 按钮文本。空字符串则只显示图标 |
| level | `string` | `default` | primary / secondary / info / success / warning / danger / light / dark / link |
| primary | `boolean` | | `true` 等价 `level: primary`；已写 `level` 时以 level 为准 |
| size | `string` | | xs / sm / md / lg |
| icon / rightIcon | `string` | | 含 `/` 当图片；fa 类名未接字体 |
| block | `boolean` | | `true` 时按钮拉满一行 |
| confirmText | 模板 | | 操作前确认 |
| confirmTitle | 模板 | | 确认框标题 |
| tooltip | `string` / 对象 | | 目前落到原生 `title` |
| api | Api | | ajax 接口 |
| dialog / drawer | Schema | | 弹框 / 抽屉内容 |
| link / url | `string` | | 跳转 |
| content / copy | `string` | | 复制文本 |
| reload | `string` | | 动作结束后刷新目标 `name` |
| onEvent | `object` | | 见事件表 |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| click | `event.context.nativeEvent.type` | 点击时触发。按钮自己处理 click，宿主不再派一次 |
| mouseenter | 同上 | 鼠标移入（宿主） |
| mouseleave | 同上 | 鼠标移出（宿主） |

对照不跑带 toast 的指针事件活示例：

```yaml
type: button
label: Button
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: ${event.context.nativeEvent.type}
```

## 动作表

文档未列对外组件动作。按钮自己通过 `actionType` 执行行为。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 未接 `countDown`、全局快捷键、Action 当容器、`download` / `saveAs`、`copyFormat`、`blank`、fontawesome。
- `tooltip` 目前是原生 `title`，不是 TooltipWrapper。
- ajax `redirect` / `feedback` 未接。控制流 `switch` / `loop` / `parallel` 仍是 D4 P1。
