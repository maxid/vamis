---
title: 常见问题
---

# 常见问题

::: info 实现进度 90% · 已完成
已覆盖环境、作者态、渲染、请求、样式、主题、迁移与调试的常见排查；所有结论均链接到对应实现文档，不是运行时功能页。
:::

## 和 Amis 是什么关系？

对齐 **组件 type 与 schema 语义**（6.13.0）。不是 React/MST 的移植。不搬 `cxd-` 前缀；cxd 的盒子、密度、交互尽量像素级落到 shadcn-vue / Tailwind。

## 作者态必须用 YAML 吗？

不必。**YAML 与 JSON 都是一等作者态**，`parseSchemaText` / `VamisRoot` / `vamis.embed` 都收。YAML 注释和多行模板更舒服；JSON 更方便从 Amis 直接搬。写 YAML 时字面量按 **1.2 Core**：不要把 `yes` / `On` / `012` 当成布尔或八进制。

## 本地环境用什么版本？

Node.js 至少 **20**，仓库 `.nvmrc` 当前为 **24.14.1**；pnpm 按根目录 `packageManager` 使用 **10.33.3**。先执行 `pnpm install`，再执行 `pnpm dev`。不支持 IE。

## 示例只有文字、没有正常样式怎么办？

Vue 入口确认加载 `@vamis/ui/styles.css`；JS SDK 确认加载 `sdk.css`，并保留 `sdk.js` 同目录的 ESM chunks。仍异常时检查构建工具是否把 CSS 排除，以及浏览器控制台是否有资源 404。

## 页面出现未知组件或类型怎么办？

先确认 `type` 拼写和当前页面的实现进度。自定义组件要在渲染前调用 `registerRenderer`；SDK 使用 `vamis.registerRenderer`。需要定位原因时，用 [调试](/extend/debug) 的 `env.onDiagnostic` 接收带路径的诊断。

## initApi / form 请求失败怎么排查？

先看请求是否 404、跨域是否被浏览器拦截，再核对返回是否为 `{ status, msg, data }`。文档的 `/api/mock2/*` 只在 Playground 有本地 mock；搬到自己的页面时必须换成真实接口或注入 `env.fetcher`。字符串适配器还受 `env.trusted` 限制。

## YAML 编辑后预览没有更新怎么办？

先检查缩进、引号和 YAML 1.2 Core 字面量。编辑器解析失败时会保留上一份有效预览，不会把半棵错误树写进运行时；也可以切到 JSON Tab 对照结构。仍不生效时按 [配置与组件](/concepts/schema) 检查字段是否放在正确的容器层级。

## 已注册是不是就能当 Amis 用？

不是。`registerRenderer` 只说明 type 能 resolve。进度看每篇组件页的实现百分比，以及仓库根目录 `CONTEXT.md`。kernel D1–D8（数据域、表达式过滤器、API 管线、事件对象等）未落地前，大量组件停在「进行中」。

## 有没有 JS SDK？能像 Amis 那样 `embed` 吗？

有。任意 HTML 用 `vamis.embed(container, schema)`，对齐 `amis.embed`。产物：`pnpm --filter @vamis/sdk build` → `packages/vamis-sdk/dist/sdk.js`。见 [JS SDK](/start/sdk)。Vue 工程继续用 `VamisRoot`。两条入口同一内核，没有 `amisRequire`，也不单独引入 `cxd.css`（能力打进 `sdk.css`）。

## 为什么文档示例滚到可见才打 initApi？

文档 ` ```schema ` 外包了 [LazyComponent](/concepts/schema#lazycomponent)（对齐 Amis `MdRenderer`）。Page **没有**「可见才 initApi」开关；请求仍在组件挂载时发。自己嵌入要同样效果，用 Vue 包一层，或给 Form 写 `lazyLoad: true`（只延迟绘制）。

## 可以写 JavaScript 函数进 schema 吗？

不可以。函数只能以表达式字符串或已注册动作名进入，禁止隐式 `eval`。SDK 的 `env.fetcher` 等是宿主回调，允许。

## 表单控件要不要写 `size: full` 或 `w-full` 才能铺满？

不用。page / form / 表单控件**默认吃满布局槽**，跟 Amis 一样，这是降低心智负担的准则。`size: xs|sm|md|lg` 才是可选收窄；`className` 只在要覆盖时写。

## 主题能换成云舍 / 仿 AntD / ang 吗？

可以切色阶，不换 `.cxd-` 前缀。顶栏 6 色点写 `html[data-theme]`（云舍 / 仿 AntD / ang / 翠绿 / 琥珀 / 金色），悬停显示名称；浅色 / 深色是独立的明暗模式，不是第七个品牌色包。顶栏 / 链接 / 按钮跟当前 `--primary`（翠绿 `#007617`、琥珀 `#9b4500`、金色 `#8f6a00`），深浅实色按钮都保留 brand-5 和白字，暗底文字链接由 `--link-color` 单独提亮。画布不跟品牌色相染色。文档活示例预览井跟 `--card`，不要另刷 Page fill。`--success` / Tag 预设色都 alias `--colors-*`，组件不要自己再写一套 hex。`page.cssVars` 仍可覆盖单页。

## typecheck 过了吗？

过了。`pnpm typecheck`（playground `vue-tsc --noEmit`）必须保持 **0**，CI 按此门禁。`pnpm test` 应保持通过。
