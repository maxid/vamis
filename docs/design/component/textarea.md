# Textarea 多行输入框 · `textarea` 设计

> 状态：**进行中 85%** · 复杂度：**L 重**
> 文档：[/components/form/textarea](/components/form/textarea) · Amis 文档：`/zh-CN/components/form/textarea`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**258** 行；Vamis 实现：**320** 行；依赖：**1** 个
- 集成面：表单/FormItem、数据域、浮层、事件/动作
- 判定依据：Vamis 320 行 + Amis 258 行 + 1 依赖 + form/data/overlay/action

## 2. Amis 契约

- 入口 type：`textarea`
- Amis 源文件：`packages/amis/src/renderers/Form/Textarea.tsx`
- 依赖：`FormItem`
- 文档章节：`/zh-CN/components/form/textarea`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/Textarea.vue`](../../../packages/vamis/src/renderers/form/Textarea.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-select__clear`, `.vamis-textarea-control`, `.vamis-textarea-control__clear`, `.vamis-textarea-control__counter`, `.vamis-textarea-control__native`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径已对齐：`minRows` / `maxRows` 自适应高度（默认 3/20）、`trimContents` 失焦裁剪、`readOnly`、`showCounter` / `maxLength` 计数器、`clearable` / `resetValue`（清除钮回填 resetValue；动作 clear 写空串）、`borderMode`、静态 `multiline-text`；`change` / `focus` / `blur`、`clear` / `reset` / `focus` / `setValue`；清空时高度 0.2s 过渡，清空后 **Ctrl/⌘+Z** 撤销（Vamis 增强）。文档按 Amis 章节改写。对照桌面 **8/8**、移动 **8/8**（P0 0）。缺 `themeCss`
- 状态：进行中，进度 85%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page textarea`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（L 重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
