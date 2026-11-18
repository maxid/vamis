# Switch 开关 · `switch` 设计

> 状态：**进行中 88%** · 复杂度：**M 中**
> 文档：[/components/form/switch](/components/form/switch) · Amis 文档：`/zh-CN/components/form/switch`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**207** 行；Vamis 实现：**260** 行；依赖：**1** 个
- 集成面：表单/FormItem、数据域、浮层、事件/动作、子 Schema
- 判定依据：Vamis 260 行 + Amis 207 行 + 1 依赖 + form/data/overlay/action/schema

## 2. Amis 契约

- 入口 type：`switch`
- Amis 源文件：`packages/amis/src/renderers/Form/Switch.tsx`
- 依赖：`FormItem`
- 文档章节：`/zh-CN/components/form/switch`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/Switch.vue`](../../../packages/vamis/src/renderers/form/Switch.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-switch`, `.vamis-switch--sm`, `.vamis-switch-control`, `.vamis-switch-option`, `.vamis-switch__input`, `.vamis-switch__slider`, `.vamis-switch__spinner`, `.vamis-switch__spinner-icon`, `.vamis-switch__text`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径已对齐：`trueValue` / `falseValue`（宽松相等，默认 true/false）、`option` 右侧说明、`onText` / `offText`（字符串 / IconSchema / SchemaCollection）、`size` sm/md（44×20 / 28×16，滑块 16/12 + 2px 边、30 圆角，`--switch-*`）、`loading` / `loadingOn`（不可操作，转圈画在滑块位）、`change`、`clear` / `reset` / `setValue`（`componentId` 按 id 跨数据域，form 外按钮可点 form 内；`componentName` 沿父链）、静态态。文档按 Amis 章节改写（含 `id` + `componentId` 动作示例、`loadingOn` + ajax 异步链），属性 / 事件 / 动作表齐全。对照桌面 **14/14**、移动 **14/14**（P0 0）。缺 `themeCss`
- 状态：进行中，进度 88%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page switch`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
