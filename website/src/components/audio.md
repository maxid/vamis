---
title: Audio 音频
outline: deep
---

# Audio 音频

::: info 实现进度 80% · 进行中
文档主路径已对齐：`inline` 默认 true、`loop` / `autoPlay` 默认 false、`controls` 默认 rates/play/time/process/volume、`rates` 显示 `x1.0`。缺原生皮肤像素、直播流 duration Infinity。
:::

音频播放器。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

没写 `src` 时仍画出控制条，时间是 `0:00 / 0:00`。`autoPlay` 默认不开。

## 基本使用

```schema: scope="body"
type: audio
```

## 倍速

`rates` 有值才画出倍速。默认显示当前 `x1.0`。

```schema: scope="body"
type: audio
rates:
  - 1.5
  - 2
```

## 只要时间

`controls` 可裁模块。

```schema: scope="body"
type: audio
controls:
  - time
```

## 块级

`inline` 默认 true。设成 false 时拉成一行吃满槽。

```schema: scope="body"
type: audio
inline: false
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"audio"` | 指定为音频 |
| `src` | `string` | | 音频地址，可模板 |
| `inline` | `boolean` | `true` | 是否行内 |
| `loop` | `boolean` | `false` | 循环 |
| `autoPlay` | `boolean` | `false` | 自动播放 |
| `rates` | `number[]` | `[]` | 倍速，如 `[1, 1.5, 2]` |
| `controls` | `string[]` | `rates` / `play` / `time` / `process` / `volume` | 内部模块 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 控制条走 lucide 图标与 token，不是 cxd Audio 皮肤。
