---
title: 常见问题
---

# 常见问题

## 和 Amis 是什么关系？

对齐 **组件 type 与 schema 语义**（6.13.0）。不是 React/MST 的移植，也不复刻 `cxd-` 皮肤。UI 原语是 shadcn-vue。

## 为什么用 YAML 而不是 JSON？

YAML 是作者态，注释和多行模板更舒服。运行时先解析成对象，再进 IR。JSON 仍然能导入。字面量按 **YAML 1.2 Core**：不要把 `yes` / `On` / `012` 当成布尔或八进制。

## 已注册是不是就能当 Amis 用？

不是。`registerRenderer` 只说明 type 能 resolve。进度看每篇组件页的实现百分比，以及仓库根目录 `CONTEXT.md`。kernel D1–D8（数据域、表达式过滤器、API 管线、事件对象等）未落地前，大量组件停在「进行中」。

## 可以写 JavaScript 函数进 schema 吗？

不可以。函数只能以表达式字符串或已注册动作名进入，禁止隐式 `eval`。

## 主题能换成云舍吗？

不能、也不会。皮肤是 shadcn token + `variant`。`level: primary` 映射到 `variant="default"`。页面级覆盖用 `page.cssVars`。

## typecheck 为什么还有错误？

`pnpm typecheck` 仍有既有 vue-tsc 问题，暂不作提交门禁。`pnpm test` 应保持通过。
