# 站点设计 vs Amis 6.13.0 源码核对

> 日期：2026-11-18。范围：`docs/design/{concepts,style,extend,start,types}` 共 84 篇逐页设计。
> 结论先行：**84 篇站点设计尚未全部逐篇核对 Amis 源码实现**。Concepts 本轮 5 篇已做主路径、Vamis 源码与活示例核对；其余页面仍按表中的审计等级理解，不能统称为“已按 Amis 实现逐条核对”。

## 1. 核对到什么程度

| 域 | 页面映射 | 源码抽样 | 逐条核对 | 结论 |
|---|---|---|---|---|
| concepts | 9/9 与 `../amis/docs/zh-CN/concepts` 同名 | 9 篇主路径均已核对；本轮 linkage / template / datascope / action / style 另核 Vamis 源码与活示例 | 本轮 5 篇逐条，其余为主路径 | 9 篇概念正文 100%；设计审计仍区分逐条与主路径 |
| style | 59/59 helper 页对应 `../amis/packages/amis-ui/scss/helper/*`；另 4 篇 start 对应 Amis style 根页 | display 18 个类名与 Amis helper 表一致；margin 展开数不同 | 未做 | 类族对齐；生成展开未 diff |
| extend | Vamis 4 篇是 Amis 11 篇的子集 | custom/editor/i18n/debug 主路径 | 未做 | 范围是子集，缺 7 篇 |
| start | Vamis 4 篇（含 intro/sdk） | 入口/构建契约 | 未做 | 与 Amis start 结构不同 |
| types | 4/4 同名 | api / definitions 抽样 | 未做 | 同名；实现差异已标 |

## 2. 已确认的 Amis 源码事实

- **API**：Amis `../amis/packages/amis-core/src/utils/api.ts` 有 `addApiRequestAdaptor` 全局适配器；Vamis 设计把它标为 P1 缺口，方向正确。
- **Definitions**：Amis 通过 `resolveDefinitions` 在 DialogAction/table store 等位置解析 `$ref`；Vamis 设计标注“运行时未解析”，这是 Vamis 缺口，不是 Amis 行为缺失。
- **事件动作**：Amis `actions/` 下有 21 个 action 文件（ajax/break/broadcast/cmpt/continue/copy/custom/dialog/drawer/email/event/link/loop/page/parallel/print/status/switch/toast/wait 等）；当前 `concepts/action.md` 只给 actionType 分类，没有逐项对照清单。
- **扩展**：Amis extend 有 11 篇（addon/contribute/custom-react/custom-sdk/debug/editor/i18n/internal/mobile/tracker/ui-library）；Vamis 只覆盖 custom/editor/i18n/debug，缺 7 篇是有意收口，但设计文档应标“子集”。
- **样式**：Amis helper 用 SCSS 生成；Vamis 用 `website/scripts/gen-style-helper-pages.mjs` 展开为 Tailwind/helper。`display` 类名 18/18 对齐；`margin` 在 Amis 源表是 262 行，站点点表是 525 个展开类名，二者不是一对一，尚未逐项 diff。

## 3. 高风险未核对项

1. Concepts 其余 4 篇尚未达到本轮 5 篇的逐条审计强度；五篇已完成页也要随运行时变更复核。
2. Style 59 个 helper 页的完整类名、值、响应式/状态前缀是否与 Amis SCSS 逐项一致。
3. Extend 4 篇的 API 形态是否与 Amis registerRenderer / editor / i18n 契约一致。
4. Start 的构建/入口承诺是否与 Amis 用法一致，以及 Vamis 自身差异。
5. Types 的 API 管线、ClassName 解析、Definitions 解析、SchemaNode 分派是否逐条对照 Amis core。

## 4. 下一步（按风险）

1. **Types/Concepts**：逐页建立 Amis 源码对照表（Amis 文件/函数 → Vamis 设计声明 → 结论）。
2. **Style**：用脚本 diff 59 个 helper 页的类名/值/前缀，输出缺失/多余清单。
3. **Extend/Start**：标注“对应 Amis 页 / Vamis 差异 / 未覆盖页”，不把子集写成全集。
4. 每篇设计增加 `Amis 核对` 状态：`未核对 / 抽样 / 逐条`，完成前不写“已对齐”。

## 5. 诚实状态

- 这 84 篇起初是**基于 website 正文 + Vamis 运行时**写的页面级设计；除已标明本轮逐条 / 主路径核对的页面外，其余不是 Amis 源码逐条核对结果。
- 组件设计文档此前做过部分 Amis 入口源码盘点；站点五域没有同等强度的核对。
- 在完成第 4 节前，不应对外声称“站点设计已按 Amis 源码核对”。
