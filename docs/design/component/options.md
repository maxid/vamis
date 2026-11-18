# Options 选择器表单项 · `options` 设计

> 状态：**进行中 88%** · 复杂度：**XL 特重**
> 文档：[/components/form/options](/components/form/options) · Amis 文档：`/zh-CN/components/form/options`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**1487** 行；Vamis 实现：**791** 行；依赖：**0** 个
- 集成面：表单/FormItem、数据域、浮层、API、事件/动作、子 Schema
- 判定依据：Vamis 791 行 + Amis 1487 行 + 0 依赖 + form/data/overlay/api/action/schema

## 2. Amis 契约

- 入口：kernel 契约（不是 Amis 独立 type；由表单项复用）
- Amis 源文件：`packages/amis-core/src/renderers/Options.tsx`
- 依赖：—
- 文档章节：`/zh-CN/components/form/options`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/optionsControl.ts`](../../../packages/vamis/src/optionsControl.ts)<br>[`packages/vamis/src/options.ts`](../../../packages/vamis/src/options.ts)<br>[`packages/vamis/src/renderers/FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)
- 注册形态：kernel 契约
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 网络只走 `requestApi(env)`，`api` / `initApi` 由 env fetcher 注入；禁止渲染器内直接 `fetch`。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-control--fluid`, `.vamis-form-description`, `.vamis-form-item`, `.vamis-form-item--horizontal`, `.vamis-form-item--inline`, `.vamis-form-item--no-label`, `.vamis-form-item--normal`, `.vamis-form-item--row`, `.vamis-form-item__label`, `.vamis-form-item__label-inner`, `.vamis-form-item__star`, `.vamis-form-item__value`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：统一 Options 契约：规范化、source 数据域/远程、joinValues/extractValue/delimiter、multiple/checkAll/selectFirst、labelField/valueField、clearable/searchable/creatable、editable/editControls/editApi/editDialog、removable/deleteApi/deleteConfirmText、选项 autoFill。InputTree 已接 deferApi/deferField 懒加载、子树合并与 deferLoadFinished；其他树/穿梭器待复用。缺虚拟列表。select 已接入
- 状态：进行中，进度 88%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page options`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
