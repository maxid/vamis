---
title: 行为
---

# 行为

::: info 实现进度 80% · 进行中
文档主路径已对齐 Amis「行为」：`type: action` 配 `actionType` 后 ajax / dialog / drawer / toast / link / confirm / copy 可跑。JSON 与 YAML 同等有效。Chart `clickAction`、`toast.items`、浏览器前进后退刷新、控制流仍缺。
:::

页面上的交互——提交表单、弹出对话框、跳转、复制一段文字——都可以看成一种**行为**。作者态 **JSON 与 YAML 并列**。

在 Vamis 里，大部分行为绑在 **行为按钮**（`type: action`，别名 `button`）上。配置三步：

1. 加一个行为按钮；
2. 写 `actionType`；
3. 按动作种类补属性（`api` / `dialog` / `msg` …）。

更复杂的「事件 → 一串动作」见 [事件动作](/concepts/event-action)。组件属性表见 [Action 行为按钮](/components/action)。

## 如何配置行为？

### 通过行为按钮

```schema: scope="body"
type: action
label: 发出一个请求
actionType: ajax
api: /api/mock2/form/saveForm
```

同一份 JSON 也有效：

```schema: scope="body"
{
  "type": "action",
  "label": "发出一个请求",
  "actionType": "ajax",
  "api": "/api/mock2/form/saveForm"
}
```

1. 在 `page` 内容区放一个 `action`
2. `actionType` 写成 `ajax`
3. `api` 写成接口地址（也可以是对象，见 [API](/types/api)）

点下去，浏览器会发出这次请求。成功时走 `env.notify`。

再来一个弹窗：

```schema: scope="body"
type: action
label: 弹个框
actionType: dialog
dialog:
  title: 弹框
  body: Hello World!
```

`actionType: dialog` 会打开模态框。`dialog` 是容器，`body` 里可以继续放别的组件。

### 常用动作

| actionType | 作用 | 现状 |
|------------|------|------|
| `ajax` | 发请求，走 `requestApi` | 已接；`qsOptions` 仍 P1 |
| `dialog` / `drawer` | 打开弹窗 / 抽屉 | OverlayHost 已接 |
| `closeDialog` / `closeDrawer` / `close` / `cancel` | 关掉当前浮层 | 已接 |
| `toast` | 轻提示 | `msg` / `args.msg` / `args.msgType` 已接；`toast.items` 未齐 |
| `alert` / `confirm` | 浏览器提示 / 确认 | 走 `env.alert` / `env.confirm` |
| `link` / `url` | 跳转 | 走 `env.jumpTo` |
| `copy` | 复制到剪贴板 | 已接 |
| `reload` | 刷新指定组件 | `target` / `componentId` 已接 |
| `setValue` / `setData` | 改目标组件数据域 | 已接 |
| `submit` / `reset` | 提交 / 重置当前表单 | 已接 |
| `wait` | 等待毫秒再继续 | 已接 |
| `email` | 拼 `mailto:` | 已接 |
| `goBack` / `refresh` / `print` | 浏览器其它能力 | 未接 |
| 控制流 `switch` / `loop` / `parallel` | 逻辑编排 | 未接 |

```schema: scope="body"
- type: action
  label: 轻提示
  level: primary
  actionType: toast
  args:
    msgType: success
    msg: 已点击
- type: action
  className: m-l
  label: 打开抽屉
  actionType: drawer
  drawer:
    title: 抽屉
    body: 抽屉内容
- type: action
  className: m-l
  label: 复制
  actionType: copy
  content: 从行为按钮复制的文字
```

`level` 映射到 shadcn `variant`：`primary` → `default`，`danger` → `destructive`。不要为了对齐 Amis 再写一套 `.cxd-Button`。

也可以在按钮上写 `confirmText`：先确认再执行动作。

```schema: scope="body"
type: action
label: 带确认的请求
level: danger
actionType: ajax
confirmText: 确认要发出这个请求？
api: /api/mock2/form/saveForm
```

### 组件所支持的行为

Amis 里部分组件可以直接配行为对象，例如 Chart 的 `clickAction`。Vamis **还没接到**这条；图表点击不会弹出动作。请改用该组件的 `onEvent`，见 [事件动作](/concepts/event-action)。
