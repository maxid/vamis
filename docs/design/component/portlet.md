# Portlet 门户栏目 · `portlet` 设计

> 状态：**进行中 65%** · 复杂度：**L 重**
> 文档：[/components/portlet](/components/portlet) · Amis 文档：`/zh-CN/components/portlet`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**424** 行；Vamis 实现：**180** 行；依赖：**3** 个
- 集成面：数据域、浮层、事件/动作、子 Schema
- 判定依据：Vamis 180 行 + Amis 424 行 + 3 依赖 + data/overlay/action/schema

## 2. Amis 契约

- 入口 type：`portlet`
- Amis 源文件：`packages/amis/src/renderers/Portlet.tsx`
- 依赖：`action`, `container`, `tabs`
- 文档章节：`/zh-CN/components/portlet`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/layout/Portlet.vue`](../../../packages/vamis/src/renderers/layout/Portlet.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径可交互（未逐章节两站核完，不进 80%）：`tabs[].body` / `tab`、`source`、`description`、`hideHeader`、默认分隔线 / `divider: false`、全局与 tab 级 `toolbar`、`mountOnEnter` 默认 false、`change`。缺 `themeCss`、icon 像素、`scrollable`
- 状态：进行中，进度 65%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page portlet`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（L 重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
