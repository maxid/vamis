# Control 表单项包裹 · `control` 设计

> 状态：**进行中 40%** · 复杂度：**S 轻**
> 文档：[/components/form/control](/components/form/control) · Amis 文档：`/zh-CN/components/form/control`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**S 轻**；Amis 源码 ≤120 行、无依赖或单依赖、无数据域/浮层/API 集成；多为纯展示叶子。
- Amis 源码：**53** 行；Vamis 实现：**14** 行；依赖：**1** 个
- 集成面：子 Schema
- 判定依据：Vamis 14 行 + Amis 53 行 + 1 依赖 + schema

## 2. Amis 契约

- 入口 type：`control`
- Amis 源文件：`packages/amis/src/renderers/Form/Control.tsx`
- 依赖：`FormItem`
- 文档章节：`/zh-CN/components/form/control`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/rest/Control.vue`](../../../packages/vamis/src/renderers/rest/Control.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：已注册；只做包裹
- 状态：进行中，进度 40%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page control`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（S 轻）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
