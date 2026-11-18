# Tag 标签 · `tag` 设计

> 状态：**进行中 90%** · 复杂度：**M 中**
> 文档：[/components/tag](/components/tag) · Amis 文档：`/zh-CN/components/tag`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**205** 行；Vamis 实现：**152** 行；依赖：**1** 个
- 集成面：事件/动作
- 判定依据：Vamis 152 行 + Amis 205 行 + 1 依赖 + action

## 2. Amis 契约

- 入口 type：`tag`
- Amis 源文件：`packages/amis/src/renderers/Tag.tsx`
- 依赖：`—`
- 文档章节：`/zh-CN/components/tag`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/rest/Tag.vue`](../../../packages/vamis/src/renderers/rest/Tag.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 图标走 `resolveIcon` + `IconMark`，class 落 `<i>`、URL 落 `<img>`，不按组件各写一套判断。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-tag`, `.vamis-tag--has-color`, `.vamis-tag-default-icon`, `.vamis-tag__close`, `.vamis-tag__prev`, `.vamis-tag__text`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：文档主路径已对齐：三种 `displayMode`、预设 / 自定义 `color`、`icon` / `closeIcon`、`closable`、click / mouseenter / mouseleave / close。status 默认圆点 SVG；关闭不隐藏。预设色 alias `--colors-*`（云舍 / 仿 AntD / ang / dark）。对照桌面 **8/8**、移动 **8/8**（P0 0）。余项：Amis 源码有 `checkable` 但文档与 UI 未接（Vamis 保留为增强）；`themeCss`
- 状态：进行中，进度 90%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page tag`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
