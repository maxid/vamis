---
title: PopOver 弹出提示
outline: deep
---

# PopOver 弹出提示

::: info 实现进度 80% · 进行中
文档主路径已对齐：不是独立 type，挂在 `static` / `table` 列 / `tpl` / list·cards 字段；字符串精简写法、`true` 展开 `${name}`、对象 `body` / `title`；`trigger` 默认 click；`showIcon` 默认 true（放大镜）；`position` 默认 center；`popOverEnableOn`；`mode` dialog / drawer 走 overlay。缺 crud 远程列、像素级浮层、`textOverflow` 省略自动弹出。
:::

popover 不是独立组件，是嵌进其它组件的属性。目前挂在：

- table 的 column
- list 的 column
- static
- cards 里的字段

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

字符串精简写法等于 `{ body: "…" }`。`popOver: true` 时弹出 `${name}` 全文。默认点放大镜打开；`showIcon: false` 时点整列。`trigger` 默认 `click`，可改 `hover`（移出 500ms 关）。

## 在其它组件里

表单 `static` 即可，不必先写 CRUD。

```schema: scope="body"
{
  "type": "form",
  "wrapWithPanel": false,
  "actions": [],
  "body": [
    {
      "name": "static",
      "type": "static",
      "label": "静态甲",
      "value": "值甲",
      "popOver": "弹出甲"
    }
  ]
}
```

```schema: scope="body"
type: form
wrapWithPanel: false
actions: []
body:
  - name: static
    type: static
    label: 静态乙
    value: 值乙
    popOver: 弹出乙
```

表格用页面数据，不打接口。

```schema
{
  "type": "page",
  "data": {
    "items": [
      { "engine": "引擎甲", "id": 1 }
    ]
  },
  "body": {
    "type": "table",
    "source": "${items}",
    "columns": [
      {
        "name": "engine",
        "label": "列甲",
        "popOver": "列弹出甲"
      }
    ]
  }
}
```

```schema
type: page
data:
  items:
    - engine: 引擎乙
      id: 1
body:
  type: table
  source: ${items}
  columns:
    - name: engine
      label: 列乙
      popOver: 列弹出乙
```

## 更多配置

`trigger` / `showIcon` / `title` / `body` / `position`。

```schema: scope="body"
{
  "type": "form",
  "wrapWithPanel": false,
  "actions": [],
  "body": [
    {
      "type": "static",
      "name": "hover",
      "label": "悬停甲",
      "value": "截断甲",
      "popOver": {
        "trigger": "hover",
        "position": "left-top",
        "showIcon": false,
        "title": "标题甲",
        "body": "全文甲"
      }
    }
  ]
}
```

```schema: scope="body"
type: form
wrapWithPanel: false
actions: []
body:
  - type: static
    name: hover
    label: 悬停乙
    value: 截断乙
    popOver:
      trigger: hover
      position: left-top
      showIcon: false
      title: 标题乙
      body: 全文乙
```

## popOverEnableOn

列上的表达式决定这一行要不要弹出。`this.id == 1` 只开第一行。

```schema
{
  "type": "page",
  "data": {
    "items": [
      { "id": 1, "engine": "启用甲" },
      { "id": 2, "engine": "关闭甲" }
    ]
  },
  "body": {
    "type": "table",
    "source": "${items}",
    "columns": [
      {
        "name": "engine",
        "label": "条件甲",
        "popOver": { "body": "${engine}" },
        "popOverEnableOn": "this.id == 1"
      }
    ]
  }
}
```

```schema
type: page
data:
  items:
    - id: 1
      engine: 启用乙
    - id: 2
      engine: 关闭乙
body:
  type: table
  source: ${items}
  columns:
    - name: engine
      label: 条件乙
      popOver:
        body: ${engine}
      popOverEnableOn: this.id == 1
```

## 属性列表

- `mode` 可配 `popOver`、`dialog`、`drawer`，默认 `popOver`。后两种走 overlay，带关闭按钮。
- `size` 在 dialog / drawer 时有用。
- `position` 只对 `popOver` 模式：`center`（默认）、`left-top` / `right-top` / `left-bottom` / `right-bottom`，以及 `left-top-right-bottom` 这类对齐串、`fixed-center` 等固定位。
- `offset` 默认 `{ top: 0, left: 0 }`。
- `trigger`：`click`（默认）或 `hover`。
- `showIcon` 默认 true，列旁放大镜；`false` 时点整列。
- `title` 弹出标题。
- `body` 弹出内容，字符串或 schema。
- `popOverEnableOn` 表达式，当前行是否启用。
- `popOverEnable` / `popOverEnabled` 为 false 时关掉。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 对照页不收割 crud / service 的 ajax 示例；本地 `data` + `source` 足够演示列弹出。
- `textOverflow` 省略自动弹出、浮层像素级、fa 放大镜未接。
