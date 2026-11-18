# Collapse 折叠器 · `collapse`, `collapse-group` 设计

> 状态：**进行中 70%** · 复杂度：**L 重**
> 文档：[/components/collapse](/components/collapse) · Amis 文档：`/zh-CN/components/collapse`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**537** 行；Vamis 实现：**264** 行；依赖：**2** 个
- 集成面：数据域、浮层、事件/动作、子 Schema
- 判定依据：Vamis 264 行 + Amis 537 行 + 2 依赖 + data/overlay/action/schema

## 2. Amis 契约

- 入口 type：`collapse`, `collapse-group`
- Amis 源文件：`packages/amis/src/renderers/Collapse.tsx`<br>`packages/amis/src/renderers/CollapseGroup.tsx`
- 依赖：`container`, `tpl`
- 文档章节：`/zh-CN/components/collapse`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Collapse.vue`](../../../packages/vamis/src/renderers/Collapse.vue)<br>[`packages/vamis/src/renderers/CollapseGroup.vue`](../../../packages/vamis/src/renderers/CollapseGroup.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-collapse`, `.vamis-collapse-group`, `.vamis-collapse__arrow`, `.vamis-collapse__body`, `.vamis-collapse__header`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径可交互（未逐章节两站核完，不进 80%）：`activeKey` / 手风琴 / 禁用 / `showArrow` / 图标位置 / `change` 事件。窄屏 &lt;768 去边框、底部分割线、箭头靠右（Amis `is-mobile` / `media-breakpoint-down(sm)`），默认箭头走 `VamisCaret` tree。缺 `mountOnEnter`、`expand`·`collapse` 动作、FieldSet 像素级
- 状态：进行中，进度 70%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page collapse`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（L 重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
