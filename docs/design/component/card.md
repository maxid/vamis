# Card 卡片 · `card` 设计

> 状态：**进行中 70%** · 复杂度：**XL 特重**
> 文档：[/components/card](/components/card) · Amis 文档：`/zh-CN/components/card`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**940** 行；Vamis 实现：**319** 行；依赖：**5** 个
- 集成面：浮层、子 Schema
- 判定依据：Vamis 319 行 + Amis 940 行 + 5 依赖 + overlay/schema

## 2. Amis 契约

- 入口 type：`card`
- Amis 源文件：`packages/amis/src/renderers/Card.tsx`
- 依赖：`action`, `avatar`, `image`, `tag`, `tpl`
- 文档章节：`/zh-CN/components/card`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Card.vue`](../../../packages/vamis/src/renderers/Card.vue)
- 注册形态：独立 Scope
- 项目模式：
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-card`, `.vamis-card-actions`, `.vamis-card-actions-wrap`, `.vamis-card-avatar`, `.vamis-card-avatar-text`, `.vamis-card-body`, `.vamis-card-checkbox`, `.vamis-card-desc`, `.vamis-card-drag`, `.vamis-card-field`, `.vamis-card-fieldLabel`, `.vamis-card-fieldValue`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径可交互（未逐章节两站核完，不进 80%）：header/body/actions、href 优先于 itemAction、media、toolbar、标签/按钮/文本/单元格、配置工具栏、属性表四列。actions 走 Card-action `<a>`，dropdown 跟 `--primary`；副标题 text-6。缺 `themeCss`、Cards 拖拽排序
- 状态：进行中，进度 70%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page card`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
