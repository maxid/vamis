# DropDownButton 下拉按钮 · `dropdown-button` 设计

> 状态：**进行中 88%** · 复杂度：**L 重**
> 文档：[/components/dropdown-button](/components/dropdown-button) · Amis 文档：`/zh-CN/components/dropdown-button`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**608** 行；Vamis 实现：**251** 行；依赖：**4** 个
- 集成面：数据域、浮层、子 Schema
- 判定依据：Vamis 251 行 + Amis 608 行 + 4 依赖 + data/overlay/schema

## 2. Amis 契约

- 入口 type：`dropdown-button`
- Amis 源文件：`packages/amis/src/renderers/DropDownButton.tsx`
- 依赖：`action`, `button-group`, `icon`, `tooltip-wrapper`
- 文档章节：`/zh-CN/components/dropdown-button`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/rest/DropdownButton.vue`](../../../packages/vamis/src/renderers/rest/DropdownButton.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。
  - 图标走 `resolveIcon` + `IconMark`，class 落 `<i>`、URL 落 `<img>`，不按组件各写一套判断。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-dropdown-divider`, `.vamis-dropdown-group`, `.vamis-dropdown-group-title`, `.vamis-dropdown-item`, `.vamis-dropdown-menu`, `.vamis-dropdown-menu--nested`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：文档主路径已对齐：`buttons` 分组、`closeOnClick` / `closeOnOutside`、`trigger: hover`、`hideCaret`、`defaultIsOpened`、`tooltip` / `placement` / `disabledTip`。菜单 `ul>li` + Action `isMenuItem`（不是完整 Button），贴触发器 `VamisOverlay`。缺菜单进出动画
- 状态：进行中，进度 88%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page dropdown-button`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（L 重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
