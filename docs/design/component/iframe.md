# iFrame · `iframe` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[/components/iframe](/components/iframe) · Amis 文档：`/zh-CN/components/iframe`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**329** 行；Vamis 实现：**40** 行；依赖：**1** 个
- 集成面：无额外集成
- 判定依据：Vamis 40 行 + Amis 329 行 + 1 依赖 + 无额外集成；Amis 源码较大而 Vamis 仍精简，按重档

## 2. Amis 契约

- 入口 type：`iframe`
- Amis 源文件：`packages/amis/src/renderers/IFrame.tsx`
- 依赖：`—`
- 文档章节：`/zh-CN/components/iframe`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/display/IFrame.vue`](../../../packages/vamis/src/renderers/display/IFrame.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 纯展示/薄包装：只消费 schema/data/env，不持有业务状态。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-iframe`, `.vamis-iframe__empty`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：能嵌页
- 状态：进行中，进度 55%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page iframe`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
