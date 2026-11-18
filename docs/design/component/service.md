# Service 功能型容器 · `service` 设计

> 状态：**进行中 70%** · 复杂度：**XL 特重**
> 文档：[/components/service](/components/service) · Amis 文档：`/zh-CN/components/service`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**932** 行；Vamis 实现：**303** 行；依赖：**4** 个
- 集成面：数据域、浮层、API、事件/动作、子 Schema
- 判定依据：Vamis 303 行 + Amis 932 行 + 4 依赖 + data/overlay/api/action/schema

## 2. Amis 契约

- 入口 type：`service`
- Amis 源文件：`packages/amis/src/renderers/Service.tsx`
- 依赖：`action`, `container`, `spinner`, `tpl`
- 文档章节：`/zh-CN/components/service`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Service.vue`](../../../packages/vamis/src/renderers/Service.vue)
- 注册形态：独立 Scope
- 项目模式：
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 网络只走 `requestApi(env)`，`api` / `initApi` 由 env fetcher 注入；禁止渲染器内直接 `fetch`。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径已对齐：独立 Scope、静态 `data`、`api` 拉数、`schemaApi` 子 schema（含 `controls` 表单项）、`initFetch` / `initFetchSchema`、`reload` / `rebuild` / `setValue`、接口联动（`isApiOutdated` 只比父域，请求 `{ ...store, ...props.data }` 父域后写）、`interval` 轮询 / `silentPolling` / `stopAutoRefreshWhen`、顶部错误 Alert、`init` / `fetchInited` / `fetchSchemaInited`。Spinner overlay 绝对定位，不改已渲染盒模型。文档章节对标 Amis（jsonp / js / ws / dataProvider 未接占位）。对照桌面 **8/14**、移动 **8/14**（P0 0）。缺 `dataProvider` / `ws` / jsonp / `js:` schemaApi
- 状态：进行中，进度 70%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page service`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
