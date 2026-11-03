---
title: Action 行为按钮
outline: deep
---

# Action 行为按钮

::: info 实现进度 94% · 进行中
文档主路径已对齐：`actionType`、`level` / `primary`、`size`、`icon`、`confirmText` / `confirmTitle`、dialog / drawer / ajax（含 `redirect` / `feedback`）/ toast / copy（含 `copyFormat`）/ link / url（含 `blank`）/ email / download / saveAs、`countDown` / `hotKey`、Action 当容器、`tooltip` / `disabledTip` / `tooltipPlacement`、`loading` / `loadingOn`、`active` / `activeLevel`、`clear` / `clear-and-submit` / `reset-and-submit`。按钮 `secondary` / `dark` / `light` 与尺寸阶梯已按 cxd 像素转写。缺控制流 `switch` / `loop` / `parallel`（D4 P1）、按名字关祖先浮层、`nextCondition`、input-table 增行。
:::

Action 是触发页面行为的主要方法。`type: action` 与别名 `button` / `submit` / `reset` 同一渲染器。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。按钮保持内容宽度，不要写成 `w-full` 才像按钮。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

点击按钮弹框：

```schema: scope="body"
label: 弹框
type: button
actionType: dialog
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

JSON 同等有效，切格式走「编辑 Schema」。

## 样式

### 尺寸

配置 `size`，显示不同尺寸。`xs` / `sm` / `md` / `lg` 高度对齐 cxd 22 / 30 / 32 / 38px；未写时是默认高度 32px。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 默认尺寸
  - type: button
    label: 极小
    size: xs
  - type: button
    label: 小
    size: sm
  - type: button
    label: 中等
    size: md
  - type: button
    label: 大
    size: lg
```

### 主题

可以配置 `level` 或者 `primary`，显示不同样式。`primary: true` 等价 `level: primary`。cxd 里 `info` 与 `primary` 同色（`#2468f2` / `--primary`）；`active` + `activeLevel: primary` 的「高亮」也是这一档。

```schema: scope="body"
type: button-toolbar
buttons:
  - type: button
    label: 默认
  - type: button
    label: 主要
    level: primary
  - type: button
    label: 次要
    level: secondary
  - type: button
    label: 信息
    level: info
  - type: button
    label: 成功
    level: success
  - type: button
    label: 警告
    level: warning
  - type: button
    label: 危险
    level: danger
  - type: button
    label: 浅色
    level: light
  - type: button
    label: 深色
    level: dark
  - type: button
    label: 链接
    level: link
```

`active: true` 时用 `activeLevel`（缺省仍走当前 `level`），并加上 `activeClassName`（默认 `is-active`）。

```schema: scope="body"
type: button
label: 高亮
active: true
activeLevel: primary
```

### 图标

可以配置 `icon`，实现按钮显示图标。`icon` 含 `.` 时当图片。`fa fa-*` 打在 `<i>` 上，字形走 Font Awesome（`sdk.css` 已带 v4-shims）。也可以写 SVG 字符串。未写 `label` 或 `label: ""` 都只显示图标，不会补「按钮」。

```schema: scope="body"
label: 弹框
type: button
actionType: dialog
icon: fa fa-plus
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

icon 也可以是 url 地址，比如

```schema: scope="body"
label: 弹框
type: button
actionType: dialog
icon: https://suda.cdn.bcebos.com/images%2F2021-01%2Fdiamond.svg
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

如果 `label` 配置为空字符串，可以只显示 `icon`：

```schema: scope="body"
label: ""
type: button
actionType: dialog
icon: fa fa-plus
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

## 操作前确认

可以通过配置 `confirmText`，实现在任意操作前弹出提示框确认是否进行该操作。同时可以通过配置 `confirmTitle` 来设置弹窗标题。Playground 走浏览器原生 `confirm`，标题会拼进文案（原生对话框没有独立标题栏）。

```schema: scope="body"
label: ajax请求
type: button
actionType: ajax
confirmText: 确认要发出这个请求？
confirmTitle: 炸弹
api: /api/mock2/form/saveForm
```

## ajax 请求

通过配置 `"actionType": "ajax"` 和 `api`，可以实现 ajax 请求。成功走 `env.notify`，可写 `messages.success` / `failed`，可用 `reload` 刷新目标。`reload: window` 会刷新当前页。

```schema: scope="body"
label: ajax请求
type: button
actionType: ajax
api: /api/mock2/form/saveForm
```

### 请求成功后，跳转至某个页面

配置相对路径，实现单页跳转：

```schema: scope="body"
label: ajax请求
type: button
actionType: ajax
api: /api/mock2/form/saveForm
redirect: /start/getting-started
```

配置完整路径会走 `env.jumpTo` 直接跳转（会离开当前文档页）：

```schema: scope="body"
label: ajax请求
type: button
actionType: ajax
api: /api/mock2/form/saveForm
redirect: https://www.baidu.com/
```

### 请求成功后，显示反馈弹框

```schema: scope="body"
type: button
label: ajax 反馈弹框
actionType: ajax
api: /api/mock2/form/saveForm
feedback:
  title: 操作成功
  body: ${id} 已操作成功
```

### 自定义 toast 文字

可以通过配置 `messages`，自定义接口返回 toast 信息。接口返回了 `msg` 时优先用接口文案。

```schema: scope="body"
type: button
label: ajax 请求
actionType: ajax
api: /api/mapping
messages:
  success: 成功了！欧耶
  failed: 失败了呢。。
```

## 下载请求

`actionType: download` 是 ajax 特例，自动给 api 加上 `responseType: blob`。可用 `downloadFileName` 覆盖文件名；接口仍建议返回 `Content-Disposition`。

```schema: scope="body"
label: 下载
type: action
actionType: download
api: /api/download
downloadFileName: download.pdf
```

## 保存到本地

`actionType: saveAs` 不走 `env.fetcher`，按 url 拉文件并触发下载，不支持 POST。默认取 url 里的文件名，也可用 `fileName`。

```schema: scope="body"
label: 保存
type: action
actionType: saveAs
fileName: 下载的文件名
api: /api/download
```

## 倒计时

`countDown` 单位秒。点过之后禁用，并用 `countDownTpl` 显示剩余时间（`${timeLeft}`）。多个倒计时请写全局唯一的 `name` 或 `id`，结束时间会记到 `localStorage`。

```schema: scope="body"
type: button
name: countdown1
label: 发送验证码
countDown: 60
countDownTpl: ${timeLeft} 秒后重发
```

## 跳转链接

### 单页跳转

`actionType: link` + `link`。会走 `env.jumpTo`，离开当前文档页。

```schema: scope="body"
label: 进入介绍页
type: button
level: info
actionType: link
link: /start/getting-started
```

### 直接跳转

`actionType: url` + `url`。`blank: true` 时新窗口打开。

```schema: scope="body"
label: 打开 Baidu
type: button
level: success
actionType: url
url: https://www.baidu.com
blank: true
```

## 发送邮件

`actionType: email` 拼 `mailto:`，会唤起系统邮件客户端。

```schema: scope="body"
label: 发送邮件
type: button
actionType: email
to: amis@baidu.com
cc: baidu@baidu.com
subject: 这是邮件主题
body: 这是邮件正文
```

## 弹框

```schema: scope="body"
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
label: Drawer Form
type: button
actionType: drawer
drawer:
  title: 表单设置
  body: 抽屉内容
```

## 复制文本

```schema: scope="body"
label: 复制一段文本
type: button
actionType: copy
content: https://example.com/vamis
```

`copyFormat: text/html` 走富文本剪贴板：

```schema: scope="body"
label: 复制一段富文本
type: button
actionType: copy
copyFormat: text/html
content: <a href='https://example.com/vamis'>link</a> <b>bold</b>
```

## 刷新其他组件

`actionType: reload` + `target`（组件 `name`，逗号分隔）。ajax 成功后也可以写 `reload`。`reload: window` 会刷新当前页，文档里不放这条活示例以免整页重载。

## 组件特有的行为类型

### 重置 / 清空表单

`type: reset` 还原初始值。`actionType: clear` 清空字段（不一定等于初始值）。`reset-and-submit` / `clear-and-submit` 先还原或清空再提交。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: username
    label: 用户名
    value: rick
  - type: input-text
    name: password
    label: 密码
actions:
  - type: button
    actionType: clear
    label: 清空
  - type: reset
    label: 重置
  - type: submit
    label: 提交
    level: primary
```

`required: ['b']` 写在提交按钮上时，会先把这些字段当必填再跑表单固有校验。

## 自定义点击事件

`onClick` 字符串只在 `env.trusted`（Playground 文档预览默认开）时编译成函数，参数是 `event` 和 `props`。返回 `false` 会阻止后续 `actionType`。可用 `props.formStore.setValues()` 改表单。

```schema: scope="body"
type: form
wrapWithPanel: false
body:
  - type: input-text
    name: name
    label: 姓名
  - type: input-text
    name: email
    label: 邮箱
  - type: button
    label: 修改姓名
    onClick: "props.formStore.setValues({name: 'amis', email: 'amis@baidu.com'});"
```

## 全局键盘快捷键触发

`hotKey` 支持 `ctrl` / `command` / `shift` / `alt` 以及 enter、esc、方向键等。这是页面级快捷键，不要用 `enter` 冒充回车提交。

```schema: scope="body"
label: 使用 ⌘+o 或 ctrl+o 来弹框
type: button
hotKey: command+o,ctrl+o
actionType: dialog
dialog:
  title: 弹框
  body: 这是个简单的弹框。
```

## Action 作为容器组件

写了 `body` 且 `actionType` 不是 `email` 时，不再画按钮外观，只让子组件可点。

```schema: scope="body"
type: action
tooltip: 点击会有提示
actionType: toast
toast:
  items:
    - body: 点了容器
body:
  type: tpl
  tpl: 点我打开提示
```

## 按钮提示

`tooltip` / `disabledTip` 走浮层，不再只用原生 `title`。`tooltipPlacement` 默认 `top`。

```schema: scope="body"
type: button
label: 提示
actionType: toast
tooltip: 点击链接跳转
tooltipPlacement: right
toast:
  items:
    - body: 点了提示按钮
```

```schema: scope="body"
type: button
label: 禁用提示
disabled: true
disabledTip: 禁用了
```

## 通用属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"action"` | 指定为 action 渲染器；`button` / `submit` / `reset` 是别名 |
| actionType | `string` | | ajax / download / saveAs / dialog / drawer / toast / copy / link / url / email / submit / reset / clear / clear-and-submit / reset-and-submit / reload / setValue … |
| label | `string` | | 按钮文本。未写或空字符串则只显示图标，不补「按钮」 |
| level | `string` | `default` | primary / secondary / info / success / warning / danger / light / dark / link |
| primary | `boolean` | | `true` 等价 `level: primary`；已写 `level` 时以 level 为准 |
| size | `string` | | xs / sm / md / lg |
| icon / rightIcon | `string` | | 含 `.` 当图片；否则 class（`fa fa-*` 走 Font Awesome） |
| block | `boolean` | | `true` 时按钮拉满一行 |
| active | `boolean` | | 是否高亮 |
| activeLevel | `string` | | 高亮时的样式，配置同 `level` |
| activeClassName | `string` | `is-active` | 高亮 class |
| countDown | `number` | | 点击后禁用秒数 |
| countDownTpl | `string` | `${timeLeft} 秒` | 倒计时文案 |
| hotKey | `string` | | 全局快捷键 |
| loading / loadingOn | `boolean` / 表达式 | | 显示 loading |
| body | Schema | | 非 email 时当容器 |
| confirmText | 模板 | | 操作前确认 |
| confirmTitle | 模板 | | 确认框标题 |
| tooltip | `string` / 对象 | | 悬停提示 |
| disabledTip | `string` / 对象 | | 禁用时的悬停提示 |
| tooltipPlacement | `string` | `top` | top / right / bottom / left |
| api | Api | | ajax / download / saveAs 接口 |
| redirect | 模板 | | ajax 成功后跳转 |
| feedback | Dialog | | ajax 成功后弹框 |
| downloadFileName | `string` | | download 覆盖文件名 |
| fileName | `string` | | saveAs 文件名 |
| blank | `boolean` | `false` | link / url 是否新窗口 |
| copyFormat | `string` | `text/plain` | 复制格式 |
| dialog / drawer | Schema | | 弹框 / 抽屉内容 |
| link / url | `string` | | 跳转 |
| content / copy | `string` | | 复制文本 |
| reload | `string` | | 动作结束后刷新目标 `name`；`window` 刷新当前页 |
| close | `boolean` | | 在浮层 actions 里为 true 时结束后关当前层 |
| required | `string[]` | | 提交前先校验这些字段 |
| onClick | `string` | | 仅 `env.trusted` 下编译 |
| onEvent | `object` | | 见事件表 |
| badge | `number` / 对象 | | 角标。活示例见 [Badge 角标](./badge) |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| click | `event.context.nativeEvent.type` | 点击时触发。按钮自己处理 click，宿主不再派一次 |
| mouseenter | 同上 | 鼠标移入（宿主） |
| mouseleave | 同上 | 鼠标移出（宿主） |

```schema: scope="body"
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
- `onClick` 字符串只在 `env.trusted` 下执行，SDK 默认关。
- `close` 目前只认 `true` 关当前 dialog / drawer，不按祖先名字关。
- 控制流 `switch` / `loop` / `parallel` 仍是 D4 P1。
- `nextCondition`、input-table 增行尚未接。
- `confirmTitle` 走原生 `confirm`，标题拼进文案，没有独立标题栏。
- `reload: window` 会整页刷新，文档不放活示例。
