# Timeline 时间轴 · `timeline` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[/components/timeline](/components/timeline) · Amis 文档：`/zh-CN/components/timeline`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**312** 行；Vamis 实现：**68** 行；依赖：**3** 个
- 集成面：子 Schema
- 判定依据：Vamis 68 行 + Amis 312 行 + 3 依赖 + schema

## 2. Amis 契约

- 入口 type：`timeline`
- Amis 源文件：`packages/amis/src/renderers/Timeline.tsx`
- 依赖：`card`, `icon`, `tpl`
- 文档章节：`/zh-CN/components/timeline`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/layout/Timeline.vue`](../../../packages/vamis/src/renderers/layout/Timeline.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-timeline`, `.vamis-timeline--vertical`, `.vamis-timeline__detail`, `.vamis-timeline__dot`, `.vamis-timeline__dot--danger`, `.vamis-timeline__dot--info`, `.vamis-timeline__dot--success`, `.vamis-timeline__dot--warning`, `.vamis-timeline__item--horizontal`, `.vamis-timeline__time`, `.vamis-timeline__title`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：能列节点
- 状态：进行中，进度 50%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page timeline`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
