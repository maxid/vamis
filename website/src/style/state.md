---
title: 辅助类-状态样式
---

# 辅助类-状态样式

::: tip 实现进度 90% · 已完成
活示例对标 Amis `/style/state`：`hover:` / `active:`（含 `.is-active`）/ `focus:` / `disabled:` / `group-hover:`，以及 `pc:hover:` / `m:hover:`。色值走 Amis helper 色阶（`text-light` `#f8f9fa`、`bg-pink-400` `#f472b6`）。HTML 岛内 `<button class="Button">` 还原 UA 边框，不搬 `cxd-Button`。
:::

除了默认态，还可以给悬停、选中、聚焦、禁用写不同的 class。前缀加在类名前面，例如 `hover:bg-pink-500`。

```schema
type: tpl
inline: false
tpl: |
  <button class="Button rounded-xl text-light bg-pink-400 border-pink-600 hover:bg-pink-500 hover:border-pink-800 active:bg-pink-600 active:border-pink-900">按钮示例</button>
  <button class="Button m-l-16 rounded-xl text-light bg-pink-500 border-pink-800 hover:bg-pink-500 hover:border-pink-800">悬停态</button>
  <button class="Button m-l-xs rounded-xl text-light bg-pink-600 border-pink-900 hover:bg-pink-600 hover:border-pink-900">按下态</button>
  <button class="Button m-l-xs rounded-xl text-light disabled:text-dark disabled:bg-pink-200 disabled:border-pink-400" disabled>禁用态</button>
```

## Hover

在类名前面加 `hover:`，鼠标悬停时启用。

```schema
type: tpl
inline: false
tpl: |
  <button class="Button text-blue-500 hover:text-red-500">蓝色按钮，hover 红色</button>
```

## Group-Hover

悬停容器时改子节点，分两步：

1. 容器加 `group`。
2. 子节点加 `group-hover:` 前缀。

```schema
type: tpl
inline: false
tpl: |
  <div class="group p-4 border border-solid border-dark hover:bg-dark">
    <p class="group-hover:text-red-500">整体hover 红色</p>
    <p class="group-hover:text-green-500">整体hover 绿色</p>
  </div>
```

## Focus

聚焦时用 `focus:`。

```schema
type: tpl
inline: false
tpl: |
  <button class="Button text-blue-500 focus:border-dark focus:text-red-500">蓝色按钮，focus 红色</button>
```

## Active

选中态用 `active:`。Amis 会同时认 `:active` 和 class `is-active`。

```schema
type: tpl
inline: false
tpl: |
  <button class="Button text-blue-500 active:border-dark active:text-red-500 is-active">蓝色按钮，active 红色</button>
```

## Disabled

禁用态用 `disabled:`。同时认 `:disabled` 和 class `is-disabled`。表单项优先写 schema `disabled`。

```schema
type: tpl
inline: false
tpl: |
  <button disabled class="Button text-blue-500 disabled:border-dark disabled:text-red-500">蓝色按钮，disabled 红色</button>
```

## 结合响应式设计一起？

先加设备前缀，再加状态前缀。如 `pc:hover:bg-pink-500`、`m:hover:bg-blue-500`。把窗口缩到 &lt;768px 再看手机档。

```schema
type: tpl
inline: false
tpl: |
  <button class="Button rounded-xl text-light pc:bg-pink-400 pc:border-pink-600 pc:hover:bg-pink-500 pc:hover:border-pink-800 m:bg-blue-400 m:border-blue-600 m:hover:bg-blue-500 m:hover:border-blue-800">按钮示例</button>
```
