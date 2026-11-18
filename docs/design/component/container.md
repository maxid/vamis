# Container 容器 · `container` 设计

> 状态：**已完成 100%** · 复杂度：**L 重**
> 文档：[/components/container](/components/container) · Amis 文档：`/zh-CN/components/container`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**275** 行；Vamis 实现：**54** 行；依赖：**1** 个
- 集成面：数据域、子 Schema
- 判定依据：Vamis 54 行 + Amis 275 行 + 1 依赖 + data/schema

## 2. Amis 契约

- 入口 type：`container`
- Amis 源文件：`packages/amis/src/renderers/Container.tsx`
- 依赖：`tpl`
- 文档章节：`/zh-CN/components/container`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Container.vue`](../../../packages/vamis/src/renderers/Container.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径对齐：`wrapperBody` 默认包一层（flex 也包，同级子项换行）、`style` / `wrapperComponent` / `bodyClassName`、click/mouseenter/mouseleave。沿用父 Scope。`draggable` 非运行时主路径
- 状态：已完成，进度 100%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page container`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 已标记完成；后续回归时复核 Amis 6.13.0 对等章节与深色/窄屏。

---
返回 [组件设计索引](README.md)
