---
title: 行为
---

# 行为

::: tip 实现进度 100% · 已完成
已对齐并核完 Amis「行为」主路径：动作配置、常用 `actionType`、确认与动作链顺序、失败 / 未知动作诊断、Chart `clickAction` 均有说明或活示例；复杂流程链接到事件动作。JSON 与 YAML 同等有效。
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
| `ajax` | 发请求，走 `requestApi` | 已接；`qsOptions` 支持常用数组格式与编码控制 |
| `dialog` / `drawer` | 打开弹窗 / 抽屉 | OverlayHost 已接 |
| `closeDialog` / `closeDrawer` / `close` / `cancel` | 关掉当前浮层 | 已接 |
| `toast` | 轻提示 | `msg` / `args.msg` / `args.msgType` / `toast.items` 已接 |
| `alert` / `confirm` | 提示 / 确认 | `confirm` 走 Amis `Alert.confirm` Modal（`env.confirm`）；`alert` 仍是 `env.alert` |
| `link` / `url` | 跳转 | 走 `env.jumpTo` |
| `copy` | 复制到剪贴板 | 已接 |
| `reload` | 刷新指定组件 | `target` / `componentId` 已接 |
| `setValue` / `setData` | 改目标组件数据域 | 已接 |
| `submit` / `reset` | 提交 / 重置当前表单 | 已接 |
| `wait` | 等待毫秒再继续 | 已接 |
| `email` | 拼 `mailto:` | 已接 |
| `goBack` / `goPage` / `refresh` / `print` | 浏览器历史、刷新与组件打印 | 已接 |
| 控制流 `switch` / `loop` / `parallel` | 逻辑编排 | 已接，含 `break` / `continue` / `outputVar` |

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

按钮自身的 `confirmText` 和动作链中某一步的 `confirmText` 使用同一规则：取消后不执行该动作。按钮级确认先发生，通过后才进入 `onEvent.click`；事件上下文会在后续动作间继续传递。

```schema: scope="body"
type: action
label: 确认并提示
confirmText: 要继续吗？
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: success
          msg: 已确认，开始执行动作链
      - actionType: wait
        args:
          time: 300
      - actionType: toast
        args:
          msg: 等待结束后继续
```

需要条件分支、并行、循环、广播或多个动作时，直接使用 [事件动作](/concepts/event-action)，不要把多步流程拆成互不相关的按钮。各动作的最小配置、失败后的中断规则和 `ignoreError` 也在该页。

未注册的 `actionType` 不会静默冒充成功：可以通过 `env.onDiagnostic` 收到 `type: action` 的诊断；请求或组件动作失败会停止后续动作，除非显式配置 `ignoreError`。开发调试见 [调试](/extend/debug)。

### 组件所支持的行为

部分组件可以直接配行为对象，例如 Chart 的 `clickAction`。图表点击会先派发 `onEvent.click`；未被 `preventDefault` 阻止时，再执行 `clickAction`。两种写法共用同一动作注册表，见 [事件动作](/concepts/event-action)。
