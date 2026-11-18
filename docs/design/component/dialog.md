# Dialog 对话框 · `dialog` 设计

> 状态：**进行中 88%** · 复杂度：**XL 特重**
> 文档：[/components/dialog](/components/dialog) · Amis 文档：`/zh-CN/components/dialog`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**1226** 行；Vamis 实现：**34** 行；依赖：**5** 个
- 集成面：浮层、子 Schema
- 判定依据：Vamis 34 行 + Amis 1226 行 + 5 依赖 + overlay/schema；Amis 源码 >800 行，按超重档

## 2. Amis 契约

- 入口 type：`dialog`
- Amis 源文件：`packages/amis/src/renderers/Dialog.tsx`
- 依赖：`action`, `container`, `form`, `spinner`, `tpl`
- 文档章节：`/zh-CN/components/dialog`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Dialog.vue`](../../../packages/vamis/src/renderers/Dialog.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：文档主路径已对齐：`actionType: dialog` 打开 overlay、`size` xs–full（默认 500px，仅 ≥576）、`showCloseButton` 默认 true、`closeOnEsc` / `closeOnOutside` 默认 false、未写 `actions` 则取消+确认、嵌套压栈。body 是 form 时默认 `mode: horizontal`、`wrapWithPanel: false`、无默认「提交」。窄屏 &lt;576 弹层拉满、底栏横排均分（对照「移动」/ `m:`；均分要打穿 Action 的 `span.inline-block`，不能只给 `.vamis-node` 设 flex:1）。浮层 data 按层压栈。默认弹层 `top: 60px`。关闭按钮 hover「关闭」提示。补数据映射 / close / 弹层表单章节；缺拖拽、`feedback`、弹层内表单提交回写、多级同时错位可见、像素级 cxd Modal
- 状态：进行中，进度 88%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page dialog`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
