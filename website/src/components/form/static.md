---
title: Static 静态展示
outline: deep
---

# Static 静态展示

::: info 实现进度 85% · 进行中
主路径已对齐：`value` / `name` 数据域映射、`text` / `tpl`、`static-xxx` 泛型（`static-json` / `static-date` / `static-datetime` / `static-mapping` / `static-progress` / `static-images` 等）、`copyable`、`popOver`（右侧）、`borderMode`、空值占位 `-`。缺 `quickEdit`（快速编辑）。
:::

用来在表单中展示静态数据。属于普通表单项，通用属性见 [FormItem](./formitem)；Vamis 用 YAML 或 JSON 书写，字段名不改写。JSON 同等有效。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
body:
  - type: static
    name: static
    label: 静态展示
    value: aaa
```

## 数据域变量映射

除了显式配置 `value`，也支持 `name` 自动映射数据域里的变量：

```schema: scope="body"
type: form
body:
  - type: select
    name: select
    label: select
    options:
      - label: A
        value: a
      - label: B
        value: b
      - label: C
        value: c
  - type: static
    name: select
    label: 选中的值是
```

## 展示其他组件

配置 `type: static-xxx` 可以借用其他**非表单项**组件的展示能力，配置项随对应组件：

```schema: scope="body"
type: form
body:
  - type: static-json
    name: json
    label: 静态展示 JSON
    value:
      a: aaa
      b: bbb
```

```schema: scope="body"
type: form
mode: horizontal
data:
  id: 1
  image: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg"
  images:
    - image: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_216,l_1,f_jpg,q_80"
      src: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
    - image: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg@s_0,w_216,l_1,f_jpg,q_80"
      src: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
body:
  - type: static
    label: 文本
    value: 文本
  - type: divider
  - type: static-tpl
    label: 模板
    tpl: '自己拼接 HTML 取变量 \${id}: ${id}'
  - type: divider
  - type: static-date
    label: 日期
    value: 1593327764
  - type: divider
  - type: static-datetime
    label: 日期时间
    value: 1593327764
  - type: divider
  - type: static-mapping
    label: 映射
    value: 2
    map:
      "0": "<span class='label label-info'>一</span>"
      "1": "<span class='label label-success'>二</span>"
      "2": "<span class='label label-danger'>三</span>"
      "*": "<span class='label label-default'>-</span>"
  - type: divider
  - type: static-progress
    label: 进度
    value: 66.66
  - type: divider
  - type: static-image
    label: 图片
    name: image
    thumbMode: cover
    thumbRatio: "4:3"
    title: "233"
    imageCaption: 图片说明
    popOver:
      title: 查看大图
      body: '<div class="w-xxl"><img class="w-full" src="${image}"/></div>'
  - type: divider
  - type: static-images
    label: 图片集
    name: images
    thumbMode: cover
    thumbRatio: "4:3"
    enlargeAble: true
    originalSrc: "${src}"
  - type: divider
  - type: static-json
    label: JSON
    value:
      a: 1
      b: 2
      c:
        d: 3
  - type: divider
  - type: static
    label: 可复制
    value: 文本
    copyable:
      content: "内容，支持变量 ${id}"
```

## 快速编辑（未接）

Amis 通过 `quickEdit` 在静态值旁提供就地编辑（inline / popOver / dialog，可接 `saveImmediately.api`）。Vamis 暂未接，`quickEdit` 不生效，已列入 TODO；需要编辑请直接用对应表单项或在详情页编辑。

## 弹出框（popOver）

通过 `popOver` 配置详情弹层，表单 static 默认 `position: right`（贴放大镜/右侧）：

```schema: scope="body"
type: form
body:
  - type: static
    name: static
    label: 静态展示
    value: aaa
    popOver:
      body:
        type: tpl
        tpl: 弹出内容
```

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `tpl` | `string` | | 内容模板，支持 HTML |
| `text` | `string` | | 内容模板，纯文本 |
| `popOver` | `PopOver` | | 详情弹层，表单 static 默认右侧 |
| `copyable` | `boolean \| {content?, tooltip?, icon?}` | | 点击复制；默认复制 `${name \| raw}` |
| `quickEdit` | `boolean \| object` | | **未接**（Vamis 暂无快速编辑） |
| `borderMode` | `"full" \| "half" \| "none"` | `none` | 边框模式 |
| `placeholder` | `string` | `-` | 空值占位 |

## 事件表

`static` 不派发组件事件；`copyable` / `popOver` 只是展示增强。

## 动作表

`static` 没有专属动作。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 与 Amis 一致：`name` 数据域映射、`text` / `tpl`、`static-xxx` 泛型、`copyable`（默认 `${name | raw}`）、`popOver` 右侧、`borderMode`、空值 `-`。
- **未接**：`quickEdit` 快速编辑（含 `saveImmediately` / `mode` / `reload`）；文档保留章节说明，不给不可用的活示例。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
