# Progress 进度条 · `progress` 设计

> 状态：**进行中 85%** · 复杂度：**L 重**
> 文档：[/components/progress](/components/progress) · Amis 文档：`/zh-CN/components/progress`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取；边界优先结构已统一，人工设计取舍待补。

## 1. 边界与优先级（先读）

> 先过边界，再谈属性/样式。以下 P0 项任一被破坏，后面的功能都不算完成。

- **契约边界**：只消费 `schema` / `data` / `env`；字段名与 Amis 对齐，扩展只加新字段，不改写作者 schema。
- **包边界**：默认皮肤与 chrome 图标归 `@vamis/ui`；渲染器不带 `<style>`、不直接 `fetch`；作者 `className` 不能替代默认皮肤。
- **数据域**：用 `useData` / `useScoped` 读取/提供数据；离开数据域时不能残留旧值或旧 scope。
- **事件/动作**：事件先 `dispatch` 再提交本地状态；可阻止事件必须检查 `prevented`；组件动作通过 scoped API 暴露。
- **展示**：空值/空数组、`source` 未就绪、长文本、模板转义、`tpl` 与 `html` 的信任边界。
- **边界用例（至少覆盖）**：source 未就绪、空数组、null 行；tpl 转义与 raw 信任边界；超长文本 / 窄屏 / 深色；错误数据不白屏。

**施工顺序**：主路径 → 属性/事件 → 边界用例 → 对照/深色。复杂项（L 重）一次只做一个切片，不把样式修补和运行时语义混刀。

## 2. 复杂度

- 等级：**L 重**；Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- Amis 源码：**263** 行；Vamis 实现：**135** 行；依赖：**1** 个
- 集成面：数据域、事件/动作
- 判定依据：Vamis 135 行 + Amis 263 行 + 1 依赖 + data/action

## 3. Amis 契约

- 入口 type：`progress`
- Amis 源文件：`packages/amis/src/renderers/Progress.tsx`
- 依赖：`—`
- 文档章节：`/zh-CN/components/progress`

## 4. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Progress.vue`](../../../../packages/vamis/src/renderers/Progress.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 通过 `useScoped` / `provideScoped` 注册组件 API，供 `componentId` 动作与父级联动调用。

## 5. 样式与边界

- 相关默认皮肤类：`.vamis-progress`, `.vamis-progress__animate`, `.vamis-progress__bar`, `.vamis-progress__circle-label`, `.vamis-progress__inter`, `.vamis-progress__line`, `.vamis-progress__stripe`, `.vamis-progress__text`, `.vamis-progress__threshold`, `.vamis-progress__threshold-text`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 6. 当前状态与缺口

- TODO 记录：`mode` line/circle/dashboard、`value`、`map`（单色/数组/阈值对象，档位对齐 Amis `getLevelColor`；line `bg-*` 走 helper `$colors`）、`strokeWidth`、`gapDegree`、`showLabel`/`valueTpl`、`stripe`/`animate`、`reset`/`setValue`。Form `static-progress` 包装层拉满才画得出条。对照桌面 **10/11**（P0 0；#8 static-progress 探针）。补 line 模式 `threshold` / `showThresholdText`；缺圆/仪表盘刻度线与 gapPosition 精确弧线
- 状态：进行中，进度 85%；如进度未到 100，按上条缺口补齐。

## 7. 验收计划与完成度

- 组件页对照：`pnpm compare --page progress`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

### 验收清单（文档核对：3 / 12）

> 只勾“本轮文档核对已具备”的项；功能、测试、对照必须由实现刀逐项勾，未勾不等于未实现。

- [x] Amis 入口源码 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

> 未勾项按“当前状态与缺口”逐条处理；完成后再把本清单改成实现刀的实际结果。

## 8. 后续

- 先补第 6 节列出的缺口，再按第 7 节对照到通过；复杂项（L 重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](../README.md)
