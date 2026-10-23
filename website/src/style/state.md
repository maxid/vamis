---
title: 辅助类-状态样式
---

# 辅助类-状态样式

::: info 实现进度 60% · 进行中
Tailwind 状态前缀 `hover:` / `focus:` / `active:` / `disabled:` / `group-hover:` 在 Playground 文档示例里可用。`--success` / `--warning` / `--info` / `--destructive` 与按钮 `level` 已对照。组件级 `status` type 仍走各自渲染器进度。
:::

除了默认态，还可以给悬停、按下、聚焦、禁用写不同的 class。前缀加在类名前面：`hover:bg-primary`。

```schema
type: page
body:
  - type: tpl
    className: inline-block rounded-xl px-3 py-1.5 bg-pink-400 text-white hover:bg-pink-500 active:bg-pink-600
    tpl: 悬停 / 按下会变深
  - type: button
    className: m-l-sm
    label: 禁用
    disabled: true
    level: primary
```

## Hover

`hover:` 在鼠标悬停时启用。

```schema
type: page
body:
  - type: tpl
    className: text-blue-500 hover:text-red-500
    tpl: 默认蓝，悬停红
```

## Group-Hover

容器加 `group`，子节点用 `group-hover:`：

```schema
type: page
body:
  - type: tpl
    className: group p-4 border border-solid border-border hover:bg-muted
    tpl: '<span class="group-hover:text-destructive">整体悬停变红</span>　<span class="group-hover:text-success">整体悬停变绿</span>'
```

## Focus / Active / Disabled

- `focus:`：聚焦（输入框、按钮）
- `active:`：按下
- `disabled:`：元素带 `disabled` 时。表单项优先写 schema `disabled`，不要只靠 class

```schema
type: page
body:
  - type: input-text
    name: focusDemo
    label: 聚焦
    className: focus:border-primary
  - type: button
    label: 不可用
    disabled: true
    className: disabled:opacity-50
```

按钮语义色仍走 `level`，不必用状态前缀去模拟：

| 语义 | 按钮 level | token |
|------|------------|--------|
| 主操作 | `primary` | `--primary` |
| 危险 | `danger` | `--destructive` |
| 成功 | `success` | `--success` |
| 警告 | `warning` | `--warning` |
| 信息 | `info` | `--info` |
