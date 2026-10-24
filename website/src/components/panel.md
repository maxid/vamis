---
title: Panel 面板
outline: deep
---

# Panel 面板

::: info 实现进度 90% · 进行中
文档主路径已对齐：`title` / `header` / `body` / `footer` / `actions`、`affixFooter`、区域 `*ClassName`。缺 `themeCss`、`Panel--primary` 等色档、移动端 `Panel--form`。
:::

可以把相关信息以面板的形式展示到一块。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **布局**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。

## 基本用法

```schema: scope="body"
{
    "type": "panel",
    "title": "面板标题",
    "body": "面板内容"
}
```

同一段也可以写成 YAML：

```schema: scope="body"
type: panel
title: 面板标题
body: 面板内容 YAML
```

## 底部配置按钮

可以通过配置 `actions` 数组，渲染底部按钮栏。缺 `type` 时按 `button`。

```schema: scope="body"
{
  "type": "panel",
  "title": "面板标题",
  "body": "面板内容",
  "actions": [
    {
      "type": "button",
      "label": "按钮 1"
    },
    {
      "type": "button",
      "label": "按钮 2"
    }
  ]
}
```

和表格、表单联动时，按钮仍可写 `actionType: dialog`（与 Amis 文档同构）。对照不跑这份，避免 Action toast 探测把面板判失败：

```yaml
type: panel
title: 面板标题
body: 面板内容
actions:
  - type: button
    label: 按钮 1
    actionType: dialog
    dialog:
      title: 提示
      body: 对，你刚点击了！
  - type: button
    label: 按钮 2
    actionType: dialog
    dialog:
      title: 提示
      body: 对，你刚点击了！
```

## 固定底部

内容过长时，`"affixFooter": true` 把底部操作贴在容器底部（`position: sticky`）。

```schema: scope="body"
{
  "type": "panel",
  "title": "面板标题",
  "body": "面板内容，底部按钮会贴底。",
  "affixFooter": true,
  "actions": [
    {
      "type": "button",
      "label": "确定"
    },
    {
      "type": "button",
      "label": "取消"
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | `string` | `"panel"` | 指定为 Panel 渲染器 |
| className | `string` | | 外层 class，打在 `div.vamis-node` |
| headerClassName | `string` | | header 区域 class |
| footerClassName | `string` | | footer 区域 class |
| actionsClassName | `string` | | actions 区域 class |
| bodyClassName | `string` | | body 区域 class |
| title | SchemaNode | | 标题。`false` 隐藏；有 `header` 时不渲染 |
| header | SchemaNode | | 头部容器，优先于 `title` |
| body | SchemaNode | | 内容容器 |
| footer | SchemaNode | | 底部容器 |
| affixFooter | `boolean` \| `'always'` | | 是否固定底部容器 |
| actions | Array\<Action\> | | 按钮区域 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 不搬 `.cxd-Panel` 前缀；用 `data-vamis-panel` 转写 heading / body / footer 的 padding 与描边。圆角走 `--radius`（4px）。
- `themeCss`、`Panel--primary` 等色档、移动端表单面板（`Panel--form`）未接。`collapsible` 已接，Amis 文档未列。
