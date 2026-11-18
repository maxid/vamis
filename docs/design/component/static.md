# Static 静态展示 · `static` 设计

> 状态：**进行中 85%** · 复杂度：**M 中**
> 文档：[/components/form/static](/components/form/static) · Amis 文档：`/zh-CN/components/form/static`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**236** 行；Vamis 实现：**139** 行；依赖：**3** 个
- 集成面：表单/FormItem、数据域、浮层、子 Schema
- 判定依据：Vamis 139 行 + Amis 236 行 + 3 依赖 + form/data/overlay/schema

## 2. Amis 契约

- 入口 type：`static`
- Amis 源文件：`packages/amis/src/renderers/Form/Static.tsx`
- 依赖：`FormItem`, `popOver`, `tpl`
- 文档章节：`/zh-CN/components/form/static`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/Static.vue`](../../../packages/vamis/src/renderers/form/Static.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。
  - 图标走 `resolveIcon` + `IconMark`，class 落 `<i>`、URL 落 `<img>`，不按组件各写一套判断。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-form-static`, `.vamis-form-static__placeholder`, `.vamis-static`, `.vamis-static--border-`, `.vamis-static__copy`, `.vamis-static__text`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径已对齐：`value` / `name` 数据域映射、`text` / `tpl`、`static-xxx` 泛型（`static-json` / `static-date` / `static-datetime` / `static-mapping` / `static-progress` / `static-images` 等经 test 兜底）、`copyable`（默认 `${name \
- 状态：进行中，进度 85%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page static`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
