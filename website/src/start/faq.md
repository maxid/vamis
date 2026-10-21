---
title: 常见问题
---

# 常见问题

## 和 Amis 是什么关系？

对齐 **组件 type 与 schema 语义**（6.13.0）。不是 React/MST 的移植，也不复刻 `cxd-` 皮肤。UI 原语是 shadcn-vue。

## 作者态必须用 YAML 吗？

不必。**YAML 与 JSON 都是一等作者态**，`parseSchemaText` / `VamisRoot` / `vamis.embed` 都收。YAML 注释和多行模板更舒服；JSON 更方便从 Amis 直接搬。写 YAML 时字面量按 **1.2 Core**：不要把 `yes` / `On` / `012` 当成布尔或八进制。

## 已注册是不是就能当 Amis 用？

不是。`registerRenderer` 只说明 type 能 resolve。进度看每篇组件页的实现百分比，以及仓库根目录 `CONTEXT.md`。kernel D1–D8（数据域、表达式过滤器、API 管线、事件对象等）未落地前，大量组件停在「进行中」。

## 有没有 JS SDK？能像 Amis 那样 `embed` 吗？

有。任意 HTML 用 `vamis.embed(container, schema)`，对齐 `amis.embed`。产物：`pnpm --filter @vamis/sdk build` → `packages/vamis-sdk/dist/sdk.js`。见 [JS SDK](/start/sdk)。Vue 工程继续用 `VamisRoot`。两条入口同一内核，没有 `amisRequire`，也不搬 `cxd.css`。

## 可以写 JavaScript 函数进 schema 吗？

不可以。函数只能以表达式字符串或已注册动作名进入，禁止隐式 `eval`。SDK 的 `env.fetcher` 等是宿主回调，允许。

## 表单控件要不要写 `size: full` 或 `w-full` 才能铺满？

不用。page / form / 表单控件**默认吃满布局槽**，跟 Amis 一样，这是降低心智负担的准则。`size: xs|sm|md|lg` 才是可选收窄；`className` 只在要覆盖时写。

## 主题能换成云舍吗？

不能、也不会。皮肤是 shadcn token + `variant`。`level: primary` 映射到 `variant="default"`。页面级覆盖用 `page.cssVars`。

## typecheck 为什么还有错误？

`pnpm typecheck` 仍有既有 vue-tsc 问题，暂不作提交门禁。`pnpm test` 应保持通过。
