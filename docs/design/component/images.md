# Images 图片集 · `images` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[/components/images](/components/images) · Amis 文档：`/zh-CN/components/images`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**998** 行；Vamis 实现：**32** 行；依赖：**1** 个
- 集成面：无额外集成
- 判定依据：Vamis 32 行 + Amis 998 行 + 1 依赖 + 无额外集成；Amis 源码较大而 Vamis 仍精简，按重档；Amis 源码 >800 行，按超重档

## 2. Amis 契约

- 入口 type：`images`
- Amis 源文件：`packages/amis/src/renderers/Images.tsx`
- 依赖：`image`
- 文档章节：`/zh-CN/components/images`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Images.vue`](../../../packages/vamis/src/renderers/Images.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 纯展示/薄包装：只消费 schema/data/env，不持有业务状态。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-images__empty`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：能平铺
- 状态：进行中，进度 50%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page images`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
