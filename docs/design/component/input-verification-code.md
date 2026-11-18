# InputVerificationCode 验证码 · `input-verification-code` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[/components/form/input-verification-code](/components/form/input-verification-code) · Amis 文档：`/zh-CN/components/form/input-verification-code`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取；边界优先结构已统一，人工设计取舍待补。

## 1. 边界与优先级（先读）

> 先过边界，再谈属性/样式。以下 P0 项任一被破坏，后面的功能都不算完成。

- **契约边界**：只消费 `schema` / `data` / `env`；字段名与 Amis 对齐，扩展只加新字段，不改写作者 schema。
- **包边界**：默认皮肤与 chrome 图标归 `@vamis/ui`；渲染器不带 `<style>`、不直接 `fetch`；作者 `className` 不能替代默认皮肤。
- **表单边界**：值走 `FormItem` / `formContext` 的路径值；校验、静态态、禁用、显隐由表单壳统一，组件不要自建提交或第二套 value。
- **表单项**：路径名（`a.b[0]`）、空值、默认值、`disabled` / `static` / `readOnly`、初始化顺序都按 FormItem 契约。
- **边界用例（至少覆盖）**：空值 / null / undefined 与默认值；`name` 路径、初始化与 reset；disabled / static / readonly / 隐藏；校验失败与 error 回填；远程 options 慢返回 / 空结果 / 竞态。

**施工顺序**：主路径 → 属性/事件 → 边界用例 → 对照/深色。复杂项（M 中）一次只做一个切片，不把样式修补和运行时语义混刀。

## 2. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**103** 行；Vamis 实现：**37** 行；依赖：**2** 个
- 集成面：表单/FormItem
- 判定依据：Vamis 37 行 + Amis 103 行 + 2 依赖 + form

## 3. Amis 契约

- 入口 type：`input-verification-code`
- Amis 源文件：`packages/amis/src/renderers/Form/InputVerificationCode.tsx`
- 依赖：`FormItem`, `input-text`
- 文档章节：`/zh-CN/components/form/input-verification-code`

## 4. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/InputVerificationCode.vue`](../../../packages/vamis/src/renderers/form/InputVerificationCode.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。

## 5. 样式与边界

- 无专属默认皮肤类；沿用 `@vamis/ui` 原语与标尺 token，或仅使用作者 `className`。
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 6. 当前状态与缺口

- TODO 记录：能分格输入
- 状态：进行中，进度 50%；如进度未到 100，按上条缺口补齐。

## 7. 验收计划与完成度

- 组件页对照：`pnpm compare --page input-verification-code`（桌面）；窄屏：`--mobile`。
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

- 先补第 6 节列出的缺口，再按第 7 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
