# FormItem 表单项通用 · `formitem` 设计

> 状态：**进行中 90%** · 复杂度：**XL 特重**
> 文档：[/components/form/formitem](/components/form/formitem) · Amis 文档：`/zh-CN/components/form/formitem`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**2438** 行；Vamis 实现：**196** 行；依赖：**0** 个
- 集成面：表单/FormItem、数据域、子 Schema
- 判定依据：Vamis 196 行 + Amis 2438 行 + 0 依赖 + form/data/schema

## 2. Amis 契约

- 入口：kernel 契约（不是 Amis 独立 type；由表单项复用）
- Amis 源文件：`packages/amis-core/src/renderers/Item.tsx`
- 依赖：—
- 文档章节：`/zh-CN/components/form/formitem`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)
- 注册形态：kernel 契约
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-control--fluid`, `.vamis-form-description`, `.vamis-form-item`, `.vamis-form-item--horizontal`, `.vamis-form-item--inline`, `.vamis-form-item--no-label`, `.vamis-form-item--normal`, `.vamis-form-item--row`, `.vamis-form-item__label`, `.vamis-form-item__label-inner`, `.vamis-form-item__star`, `.vamis-form-item__value`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：路径值 `a.b`、`requiredOn`、`validateOnChange`、`submitOnChange`、`clearValueOnHidden`、labelRemark、`static`/`staticOn`/`staticSchema`（选择器 `limit` → `tags`/`words`；脱离 Form 也读当前数据链）、事件动作 `static`/`nonstatic`（status-store 按 id/name）、禁用/显隐、默认间距 24px、`mode: inline`（项并排、项内左右）、默认 `normal` 标签在上（窄屏 ≤767 改 28% 同行）、未写 label 仍占标签列、`button-toolbar` 包 FormItem、`validateApi`、提交 `errors`、`autoFill`（映射/`api`+`fillMapping`，无弹层）、form `debug`、label HTML、description HTML、`validations`/`validationErrors`（对象/字符串/`$1`/`isUrl.schemes`/默认 `validate.*` key）。属性表四列 +「支持静态展示的表单项」。缺 combo/table 路径级报错、`autoFill.showSuggestion` 族、`autoFill.silent`、`staticClassName` 三件
- 状态：进行中，进度 90%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page formitem`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
