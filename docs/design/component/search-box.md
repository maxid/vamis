# SearchBox 搜索框 · `search-box` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[/components/search-box](/components/search-box) · Amis 文档：`/zh-CN/components/search-box`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**255** 行；Vamis 实现：**47** 行；依赖：**2** 个
- 集成面：无额外集成
- 判定依据：Vamis 47 行 + Amis 255 行 + 2 依赖 + 无额外集成

## 2. Amis 契约

- 入口 type：`search-box`
- Amis 源文件：`packages/amis/src/renderers/SearchBox.tsx`
- 依赖：`action`, `icon`
- 文档章节：`/zh-CN/components/search-box`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/SearchBox.vue`](../../../packages/vamis/src/renderers/SearchBox.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：能输入搜索；历史/增强未齐
- 状态：进行中，进度 50%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page search-box`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
