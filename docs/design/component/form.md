# Form 表单 · `form` 设计

> 状态：**进行中 75%** · 复杂度：**XL 特重**
> 文档：[/components/form](/components/form) · Amis 文档：`/zh-CN/components/form`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**2657** 行；Vamis 实现：**761** 行；依赖：**18** 个
- 集成面：数据域、浮层、API、事件/动作、子 Schema
- 判定依据：Vamis 761 行 + Amis 2657 行 + 18 依赖 + data/overlay/api/action/schema

## 2. Amis 契约

- 入口 type：`form`
- Amis 源文件：`packages/amis-core/src/renderers/Form.tsx`
- 依赖：`FormItem`, `Options`, `action`, `checkbox`, `container`, `hidden`, `input-date`, `input-file`, `input-image`, `input-number`, `input-text`, `panel`, `radio`, `select`, `spinner`, `static`, `switch`, `textarea`
- 文档章节：`/zh-CN/components/form`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Form.vue`](../../../packages/vamis/src/renderers/Form.vue)
- 注册形态：独立 Scope、注册 scoped API
- 项目模式：
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 网络只走 `requestApi(env)`，`api` / `initApi` 由 env fetcher 注入；禁止渲染器内直接 `fetch`。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。
  - 校验复用 core 的 `validateValue` / `validations` 约定，错误回填表单 `errors`。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-form`, `.vamis-form--inline`, `.vamis-form-actions`, `.vamis-form-debug`, `.vamis-form-footer-wrap`, `.vamis-form-panel`, `.vamis-form-panel__header`, `.vamis-form__error`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：主路径已对齐：`initApi` / 提交 API / 校验 / 重置 / 调试、`initApiFinished` / `inited` / `change` / `validateSucc` / `validateError` / `submit` / `submitSucc` / `submitFail` / `formItemValidate*` 事件、`rules` 组合校验（`data.x` 表达式 + `name` 高亮）、`submitOnInit` / `submitOnChange`、`resetAfterSubmit`、`redirect`、`messages`、`trimValues`、`persistData` / `persistDataKeys` / `clearPersistDataAfterSubmit`、`preventEnterSubmit`、`autoFocus`、`static` 切换、`target` / `reload`、`debug`、`canAccessSuperData`（默认 true，只映射同名表单项，父域其它字段不进本域）、`horizontal` 比例 / `leftFixed` / `justify` / `labelAlign` / 表单项 `labelWidth`。文档按 Amis `form/index` 全章节改写。`submitText: ""` 去默认提交；body 已有 `submit`/`button`/`reset`/`toolbar` 也不注入底栏；`type: submit` 无 `primary` 是描边。`wrapWithPanel: false` 时 title/actions 失效。桌面 heading **35px**（12/400/1.5 + 8×12 / text-3）/ footerWrap > toolbar 8×12 右对齐，对齐 Amis Panel。水平必填星贴文案（内层 relative span）。对照桌面 **41/58**、移动 **41/58**（P0 0）。缺 `interval` / `silentPolling` / `asyncApi` / `initAsyncApi`、`promptPageLeave`、`columnCount`、`inheritData`、`validate` / `validateFormItem` / `clearError` 动作、combo 独立域
- 状态：进行中，进度 75%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page form`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
