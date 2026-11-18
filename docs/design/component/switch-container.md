# switch-container 状态容器 · `switch-container` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[/components/switch-container](/components/switch-container) · Amis 文档：`/zh-CN/components/switch-container`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**200** 行；Vamis 实现：**25** 行；依赖：**1** 个
- 集成面：数据域、子 Schema
- 判定依据：Vamis 25 行 + Amis 200 行 + 1 依赖 + data/schema

## 2. Amis 契约

- 入口 type：`switch-container`
- Amis 源文件：`packages/amis/src/renderers/SwitchContainer.tsx`
- 依赖：`container`
- 文档章节：`/zh-CN/components/switch-container`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/layout/SwitchContainer.vue`](../../../packages/vamis/src/renderers/layout/SwitchContainer.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-switch-container`, `.vamis-switch-container__body`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径可交互（未逐章节两站核完，不进 80%）：`items[].body` / `visibleOn` 取首个命中、`style`、宿主 click/mouseenter/mouseleave。缺 `themeCss`、`switchTo` 动作。侧栏未收录，docs 有独立页
- 状态：进行中，进度 65%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page switch-container`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
