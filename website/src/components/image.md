---
title: Image 图片
outline: deep
---

# Image 图片

::: info 实现进度 75% · 进行中
主路径：`src` / `name`、默认 110px 缩略图、`height` / `width` 模板插值、`thumbMode` contain/cover/w-full/h-full/`h-stretch`（按高度拉伸）。`thumbMode` 支持表达式。缺放大镜、图集、`imageMode: original`。
:::

`image` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema
type: page
title: image
body:
  - type: image
```

## 配置缩略图

`thumbMode` 决定预览图怎么铺进缩略框。Amis 原有 `contain` / `cover` / `w-full` / `h-full`；Vamis 另加 `h-stretch`：按 `height` 拉伸、宽度吃满父级。也可以写成表达式，例如 `${index % 2 === 0 ? 'h-stretch' : 'cover'}`。

```schema
type: page
body:
  - type: image
    src: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_216,l_1,f_jpg,q_80
    thumbMode: cover
    title: cover
  - type: image
    src: https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg@s_0,w_216,l_1,f_jpg,q_80
    thumbMode: h-stretch
    height: 160px
    title: h-stretch
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `type` | 组件种类，与 Amis 同名 |
| `src` / `name` | 图片地址；`name` 从数据域取 |
| `height` / `width` | 缩略图尺寸，支持 `${imageHeight}` |
| `thumbMode` | `contain`（默认）/ `cover` / `w-full` / `h-full` / `h-stretch`（按高度拉伸、宽度吃满父级）。支持 `${}` 表达式 |
| `className` | 附加 class；Vamis 走 Tailwind，暂不解析 `m:` / `pc:` |
| `visibleOn` / `hiddenOn` | 显隐表达式 |
| `onEvent` | 事件到动作（D4 精简，尚未事件对象） |
| `data` | 静态数据，当前多与父级浅合并 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）和事件对象（D4）尚未落地，高级示例可能与 Amis 官网行为不一致。
