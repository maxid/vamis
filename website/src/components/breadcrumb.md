---
title: Breadcrumb 面包屑
outline: deep
---

# Breadcrumb 面包屑

::: info 实现进度 85% · 进行中
文档主路径已对齐：`items` / `source`、默认分隔符 `>`、`separatorClassName`、`dropdown`、中间项 `labelMaxLength`（默认 16）。缺 tooltip 浮层位置、fontawesome。
:::

展示当前位置路径。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

对照不跑外链 `href` 活示例：

```yaml
type: breadcrumb
items:
  - label: 首页
    href: https://baidu.gitee.com/
    icon: fa fa-home
  - label: 上级页面
  - label: 当前页面
```

活示例不配外链：

```schema: scope="body"
{
  "type": "breadcrumb",
  "items": [
    { "label": "首页" },
    { "label": "上级页面" },
    { "label": "当前页面" }
  ]
}
```

```schema: scope="body"
type: breadcrumb
items:
  - label: 首页 YAML
  - label: 上级页面 YAML
  - label: 当前页面 YAML
```

## 动态数据

配置 `source` 取上下文，可结合 [Service](/components/service)。

```schema
{
  "type": "page",
  "data": {
    "breadcrumb": [
      { "label": "首页" },
      { "label": "上级页面" },
      { "label": "当前页面动态" }
    ]
  },
  "body": {
    "type": "breadcrumb",
    "source": "${breadcrumb}"
  }
}
```

## 分隔符

默认分隔符是 `>`。

```schema: scope="body"
{
  "type": "breadcrumb",
  "separator": "/",
  "separatorClassName": "text-black",
  "items": [
    { "label": "首页" },
    { "label": "上级页面" },
    { "label": "当前页面斜杠" }
  ]
}
```

## 下拉菜单

`items[].dropdown` 展开更多项。对照不跑外链：

```schema: scope="body"
{
  "type": "breadcrumb",
  "items": [
    { "label": "首页" },
    {
      "label": "上级页面",
      "dropdown": [
        { "label": "选项一" },
        { "label": "选项二" }
      ]
    },
    { "label": "当前页面下拉" }
  ]
}
```

## 最大展示长度

只有**中间项**超过 `labelMaxLength`（默认 16）会省略，首尾不裁。完整文案放在 `title`。

```schema: scope="body"
{
  "type": "breadcrumb",
  "labelMaxLength": 16,
  "items": [
    { "label": "首页" },
    { "label": "上级页面上级页面上级页面上级页面上级页面" },
    { "label": "当前页面截断" }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| className | `string` | | 外层类名，打在宿主 |
| itemClassName | `string` | | 导航项类名 |
| separatorClassName | `string` | | 分隔符类名 |
| dropdownClassName | `string` | | 下拉菜单类名 |
| dropdownItemClassName | `string` | | 下拉菜单项类名 |
| separator | `string` | `>` | 分隔符 |
| labelMaxLength | `number` | `16` | 中间项最大展示长度 |
| tooltipPosition | `top \| bottom \| left \| right` | `top` | 浮窗位置，目前用原生 `title` |
| source | `string` | | 动态数据 |
| items[].label | `string` | | 文本 |
| items[].href | `string` | | 链接 |
| items[].icon | `string` | | 含 `/` 当图片；fa 字体未接 |
| items[].dropdown | `dropdown[]` | | 每项含 label / href / icon |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `tooltip` 目前是原生 `title`，不是 TooltipWrapper。fontawesome 图标未接字体。
