# Picker 列表选择器 · `picker` 设计

> 状态：**进行中 65%** · 复杂度：**XL 特重**
> 文档：[/components/form/picker](/components/form/picker) · Amis 文档：`/zh-CN/components/form/picker`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**911** 行；Vamis 实现：**280** 行；依赖：**2** 个
- 集成面：表单/FormItem、数据域、浮层、API、子 Schema
- 判定依据：Vamis 280 行 + Amis 911 行 + 2 依赖 + form/data/overlay/api/schema

## 2. Amis 契约

- 入口 type：`picker`
- Amis 源文件：`packages/amis/src/renderers/Form/Picker.tsx`
- 依赖：`list`, `select`
- 文档章节：`/zh-CN/components/form/picker`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/Picker.vue`](../../../packages/vamis/src/renderers/form/Picker.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 网络只走 `requestApi(env)`，`api` / `initApi` 由 env fetcher 注入；禁止渲染器内直接 `fetch`。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-picker`, `.vamis-picker__empty`, `.vamis-picker__group`, `.vamis-picker__item`, `.vamis-picker__pager`, `.vamis-picker__placeholder`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：基本用法对标 Amis：`saveForm` + label `picker` + A/B/C。对照桌面 **1/1**（P0 0）。补远程 source / 分页 / pickerSchema 文档活示例；缺树选择
- 状态：进行中，进度 65%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page picker`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
