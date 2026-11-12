---
title: Card 卡片
outline: deep
---

# Card 卡片

::: info 实现进度 80% · 进行中
文档主路径已对齐：`header` 标题/副标题/描述/头像/`avatarText` 与背景色、`body` 字段或字符串、`useCardLabel` 默认 true、`actions`（含 `icon: fa fa-*`）、`href` 优先于 `itemAction`、`media` / `mediaPosition` 默认 left、`secondary` / `toolbar`。补标签 / 按钮 / 文本 / 单元格章节；缺勾选/拖拽、`themeCss`。
:::

单张卡片。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema: scope="body"
type: card
header:
  title: 标题
  subTitle: 副标题
  description: 这是一段描述
  avatar: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
body:
  - type: divider
  - type: tpl
    tpl: Trident
    inline: false
    label: Engine
  - name: static
    type: static
    label: Browser
    value: Internet Explorer 5.0
  - type: input-number
    name: version
    label: Version
    size: sm
actions:
  - type: button
    label: 编辑
    actionType: dialog
    icon: fa fa-pencil
    dialog:
      title: 编辑
      body: 你正在编辑该卡片
  - type: button
    label: 删除
    icon: fa fa-trash
    actionType: dialog
    dialog:
      title: 提示
      body: 你删掉了该卡片
```

## 打开链接

通过 `href` 设置点击卡片打开外部链接。默认 `blank: true` 新窗口。

```schema: scope="body"
type: card
href: https://github.com/baidu/amis
header:
  title: 标题
  subTitle: 副标题
  description: 这是一段描述
  avatar: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
useCardLabel: false
body:
  - type: divider
  - type: tpl
    tpl: Trident
    inline: false
    label: Engine
  - name: static
    type: static
    label: Browser
    value: Internet Explorer 5.0
actions:
  - type: button
    label: 编辑
    actionType: dialog
    icon: fa fa-pencil
    dialog:
      title: 编辑
      body: 你正在编辑该卡片
  - type: button
    label: 删除
    icon: fa fa-trash
    actionType: dialog
    dialog:
      title: 提示
      body: 你删掉了该卡片
```

## 设置头像文本

没有 `avatar` 时可以用 `avatarText`。再配 `avatarTextBackground` 会按文本 hash 取色（多和 [cards](./cards) 一起用）。

```schema: scope="body"
type: card
href: https://github.com/baidu/amis
header:
  title: 标题
  subTitle: 副标题
  description: 这是一段描述
  avatarText: AMIS
body: 这里是内容
```

## 点击卡片的行为

`itemAction` 设置整张卡片的点击。和 `href` 冲突：写了 `href` 则以链接为准。

```schema: scope="body"
type: card
itemAction:
  type: button
  actionType: dialog
  dialog:
    title: 详情
    body: 当前描述
header:
  title: 标题
  subTitle: 副标题
  description: 这是一段描述
  avatar: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
body: 这里是内容
```

## 设置多媒体卡片

`media` 配图/视频，`mediaPosition` 默认 `left`，也可 `right` / `top` / `bottom`。底部可写 `secondary` 与 `actions`，头上可写 `toolbar`。

```schema: scope="body"
type: card
header:
  title: 标题
media:
  type: image
  className: w-36 h-24
  url: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_216,l_1,f_jpg,q_80
  position: left
body: 这里是内容
secondary: 次要说明
actions:
  - type: button
    label: 操作
    actionType: dialog
    dialog:
      title: 操作
      body: 你正在编辑该卡片
  - type: button
    label: 操作
    actionType: dialog
    dialog:
      title: 操作
      body: 你正在编辑该卡片
toolbar:
  - type: tpl
    tpl: 标签
```

## 设置标签卡片

`toolbar` 可放标签、`secondary` 放次要说明：

```schema: scope="body"
type: card
header:
  title: 标题
body: 这里是卡片内容
secondary: 次要说明
toolbar:
  - type: tpl
    tpl: 标签
    className: label label-warning
```

## 设置按钮卡片

`itemAction` 让整张卡片可点击，常用于「创建 / 添加」入口：

```schema: scope="body"
type: card
body:
  type: wrapper
  className: h-32 flex items-center justify-center
  body:
    type: tpl
    tpl: 点击会有弹框
itemAction:
  type: button
  actionType: dialog
  dialog:
    title: 详情
    body: 当前描述
```

## 设置文本卡片

`body` 直接放文本或 tpl，适合纯说明卡片：

```schema: scope="body"
type: card
header:
  title: 文本卡片
body:
  type: tpl
  tpl: 这里是一段文本内容
```

## 设置单元格卡片

`body` 用 `list-item` / `hbox` 组合出单元格样式：

```schema: scope="body"
type: card
header:
  title: 单元格
body:
  type: hbox
  columns:
    - label: 名称
      name: name
    - label: 状态
      name: status
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `header.title` / `subTitle` / `description` | 头部文案，可写 `${}` |
| `header.avatar` | 头像图 |
| `header.avatarText` | 没图时的头像文字 |
| `header.avatarTextBackground` | 颜色数组，按文本 hash 取色 |
| `header.highlight` | 标题前绿点 |
| `body` | 字符串或字段数组；无 `type` 的 `{label, name}` 当静态字段 |
| `useCardLabel` | 是否在字段左侧出 label。默认 true |
| `actions` | 底栏按钮。默认 `level: link`、`size: sm`。`icon` 支持图片 URL 或 `fa fa-*`（Font Awesome） |
| `href` | 点击打开链接，优先于 `itemAction` |
| `blank` | 链接是否新窗口。默认 true |
| `itemAction` | 点击卡片触发的动作 |
| `media` / `mediaPosition` | 多媒体。位置默认 left |
| `secondary` | 底栏次要说明 |
| `toolbar` | 头部右侧 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 勾选、拖拽、卡片在 CRUD 里的批量点选未接。
