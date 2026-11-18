# Action 行为按钮 · `action` 设计

> 状态：**进行中 95%** · 复杂度：**XL 特重**
> 文档：[/components/action](/components/action) · Amis 文档：`/zh-CN/components/action`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**781** 行；Vamis 实现：**391** 行；依赖：**5** 个
- 集成面：数据域、浮层、事件/动作、子 Schema
- 判定依据：Vamis 391 行 + Amis 781 行 + 5 依赖 + data/overlay/action/schema

## 2. Amis 契约

- 入口 type：`action`
- Amis 源文件：`packages/amis/src/renderers/Action.tsx`
- 依赖：`badge`, `icon`, `toast`, `tooltip-wrapper`, `tpl`
- 文档章节：`/zh-CN/components/action`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Action.vue`](../../../packages/vamis/src/renderers/Action.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。
  - 事件经 `createVamisEvent` / `runOnEvent` 走 D4 事件动作链，动作由 `Action` 注册表统一执行。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。
  - 图标走 `resolveIcon` + `IconMark`，class 落 `<i>`、URL 落 `<img>`，不按组件各写一套判断。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-card-action`, `.vamis-dropdown-action`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：文档主路径已对齐：`actionType`、`level` / `primary`、`size`、`icon` / 空 label 正方形 `iconOnly`（默认 32×32，xs/sm/md/lg 跟档位，`level: link` 除外；`level: link` 无下划线、`--link-color`）、`confirmText` / `confirmTitle`（Amis `Alert.confirm` Modal：默认标题「系统消息」、无 X、Esc/点遮罩不关、确认 danger）、dialog / drawer / ajax（`redirect` / `feedback`）/ toast / copy（`copyFormat`）/ link / url（`blank`）/ email / download / saveAs、`countDown` / `hotKey`、Action 当容器（`tooltip` 走 `VamisOverlay` `--z-tooltip` 1600，不裁切）、`tooltip` / `disabledTip`（字符串或 TooltipObject：title/content/theme/arrow/delay/trigger/offset，不含 type/body/wrapperComponent/className/inline）/ `tooltipPlacement`、click / mouseenter / mouseleave 事件活示例、`loading` / `loadingOn`、`active` / `activeLevel`、`clear` / `clear-and-submit` / `reset-and-submit`。`secondary` 实心中灰白字、`dark` 实心炭灰、`light` 浅底深字；尺寸 xs/sm/md/lg = 22/30/32/38px（cxd）。主题/尺寸活示例并排。控制流 `switch` / `loop` / `parallel` 已接；仍缺按名字关祖先浮层、`nextCondition`、input-table 增行
- 状态：进行中，进度 95%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page action`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
