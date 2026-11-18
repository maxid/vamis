# Toast 轻提示 · `toast` 设计

> 状态：**已完成 100%** · 复杂度：**L 重**
> 文档：[/components/toast](/components/toast) · Amis 文档：`/zh-CN/components/toast`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**433** 行；Vamis 实现：**133** 行；依赖：**2** 个
- 集成面：无额外集成
- 判定依据：Vamis 133 行 + Amis 433 行 + 2 依赖 + 无额外集成

## 2. Amis 契约

- 入口 type：`toast`
- Amis 源文件：`packages/amis-ui/src/components/Toast.tsx`
- 依赖：`icon`, `tpl`
- 文档章节：`/zh-CN/components/toast`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/ToastHost.vue`](../../../packages/vamis/src/ToastHost.vue)<br>[`packages/vamis-core/src/toast-store.ts`](../../../packages/vamis-core/src/toast-store.ts)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 纯展示/薄包装：只消费 schema/data/env，不持有业务状态。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-toast`, `.vamis-toast-wrap`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：文档主路径已对齐：`toast.items` / `body` / `title`（字符串或 SchemaNode）、`level`、`position`（含 `center`）、`timeout`、`closeButton` / `showIcon`、`allowHtml`。桌面 400px 白底 bounce、状态色图标、可叠多条、点击关闭、hover 暂停。`isMobile()` = `max-width: 768px` 暗底居中、40px 图标、一次一条、3000ms。有 `type` 的 `title`/`body` 走 `SchemaRenderer`，点击当时 data 快照
- 状态：已完成，进度 100%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page toast`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 已标记完成；后续回归时复核 Amis 6.13.0 对等章节与深色/窄屏。

---
返回 [组件设计索引](README.md)
