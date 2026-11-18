# InputFormula 公式编辑器 · `input-formula` 设计

> 状态：**进行中 30%** · 复杂度：**L 重**
> 文档：[/components/form/input-formula](/components/form/input-formula) · Amis 文档：`/zh-CN/components/form/input-formula`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**257** 行；Vamis 实现：**79** 行；依赖：**2** 个
- 集成面：表单/FormItem、数据域、事件/动作
- 判定依据：Vamis 79 行 + Amis 257 行 + 2 依赖 + form/data/action

## 2. Amis 契约

- 入口 type：`input-formula`
- Amis 源文件：`packages/amis/src/renderers/Form/InputFormula.tsx`
- 依赖：`FormItem`, `formula`
- 文档章节：`/zh-CN/components/form/input-formula`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/Formula.vue`](../../../packages/vamis/src/renderers/form/Formula.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：**精简**：复用 Formula，无公式编辑器 UI
- 状态：进行中，进度 30%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page input-formula`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（L 重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
