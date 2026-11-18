# Page 页面 · `page` 设计

> 状态：**进行中 95%** · 复杂度：**XL 特重**
> 文档：[/components/page](/components/page) · Amis 文档：`/zh-CN/components/page`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**1329** 行；Vamis 实现：**355** 行；依赖：**14** 个
- 集成面：数据域、浮层、API、事件/动作、子 Schema
- 判定依据：Vamis 355 行 + Amis 1329 行 + 14 依赖 + data/overlay/api/action/schema

## 2. Amis 契约

- 入口 type：`page`
- Amis 源文件：`packages/amis/src/renderers/Page.tsx`
- 依赖：`action`, `container`, `crud`, `dialog`, `drawer`, `flex`, `form`, `grid`, `panel`, `remark`, `service`, `spinner`, `tabs`, `tpl`
- 文档章节：`/zh-CN/components/page`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Page.vue`](../../../packages/vamis/src/renderers/Page.vue)
- 注册形态：独立 Scope
- 项目模式：
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 网络只走 `requestApi(env)`，`api` / `initApi` 由 env fetcher 注入；禁止渲染器内直接 `fetch`。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-page`, `.vamis-page--aside-sticky`, `.vamis-page--right-aside`, `.vamis-page--with-sidebar`, `.vamis-page__aside`, `.vamis-page__aside--with-width`, `.vamis-page__aside-tpl`, `.vamis-page__body`, `.vamis-page__content`, `.vamis-page__header`, `.vamis-page__header-row`, `.vamis-page__main`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径对齐：独立 Scope、URL 查询种子、initApi overlay（GET 不把数据域拼进 query）、`silentPolling` 只隐藏轮询遮罩（首次/手动 reload 仍显示）、reload/setValue、完整事件对象；无标题时 toolbar 吃满上级；根/header/aside 用 div 组装。按实现标准：`pullRefresh` 未接（移动端），未达 100%
- 状态：进行中，进度 95%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page page`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
