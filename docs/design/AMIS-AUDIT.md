# 站点设计 vs Amis 6.13.0 源码核对

> 日期：2026-11-18。范围：`docs/design/{concepts,style,extend,start,types}` 共 84 篇逐页设计。
> 结论先行：**84 篇站点设计尚未全部逐篇核对 Amis 源码实现**。Concepts 本轮 5 篇已做主路径、Vamis 源码与活示例核对；其余页面仍按表中的审计等级理解，不能统称为“已按 Amis 实现逐条核对”。

## 1. 核对到什么程度

| 域 | 页面映射 | 源码抽样 | 逐条核对 | 结论 |
|---|---|---|---|---|
| concepts | 9/9 与 `../amis/docs/zh-CN/concepts` 同名 | 9 篇主路径均已核对；本轮 linkage / template / datascope / action / style 另核 Vamis 源码与活示例 | 主路径 + 缺口复核 | 9 篇按剩余实现缺口为 90–95%；文档核对不计入功能完成度 |
| style | 59/59 helper 页对应 `../amis/packages/amis-ui/scss/helper/*`；另 4 篇 start 对应 Amis style 根页 | display 18 个类名与 Amis helper 表一致；margin 展开数不同 | 未做 | 类族对齐；生成展开未 diff |
| extend | Vamis 4 篇是 Amis 11 篇的子集 | custom-sdk / editor / i18n / debug 主路径 + Vamis 源码 / 实际页面 | 4 篇主路径 | 文档主路径完成；缺 7 篇仍是有意收口 |
| start | Vamis 4 篇（含 intro/sdk） | 入口 / 构建 / env / SDK 导出与真实页面 | 4 篇主路径 | Vamis 双入口与 Amis 结构不同，差异已写清 |
| types | 4/4 同名 | API / ClassName / Definitions / SchemaNode + Vamis 源码与活示例 | 4 篇主路径 | Definitions 100%；其余保持 70–92%，API P1 与 TS 宽松仍单列 |

## 2. 已确认的 Amis 源码事实

- **API**：Amis `../amis/packages/amis-core/src/utils/api.ts` 有 `addApiRequestAdaptor` 全局适配器；Vamis 设计把它标为 P1 缺口，方向正确。
- **Definitions**：Amis 通过 `resolveDefinitions` 在 DialogAction/table store 等位置解析 `$ref`；Vamis 现按实际 SchemaRenderer 节点浅解析，本地覆盖，并在 Form 默认值收集与 Combo 行默认值中复用，递归活示例已核。
- **事件动作**：Amis `actions/` 下有 21 个 action 文件（ajax/break/broadcast/cmpt/continue/copy/custom/dialog/drawer/email/event/link/loop/page/parallel/print/status/switch/toast/wait 等）；当前 `concepts/action.md` 只给 actionType 分类，没有逐项对照清单。
- **扩展**：Amis extend 有 11 篇（addon/contribute/custom-react/custom-sdk/debug/editor/i18n/internal/mobile/tracker/ui-library）；Vamis 只覆盖 custom/editor/i18n/debug，缺 7 篇是有意收口，但设计文档应标“子集”。
- **样式**：Amis helper 用 SCSS 生成；Vamis 用 `website/scripts/gen-style-helper-pages.mjs` 展开为 Tailwind/helper。`display` 类名 18/18 对齐；`margin` 在 Amis 源表是 262 行，站点点表是 525 个展开类名，二者不是一对一，尚未逐项 diff。

## 3. 高风险未核对项

1. Concepts 其余 4 篇尚未达到本轮 5 篇的逐条审计强度；五篇已完成页也要随运行时变更复核。
2. Style 59 个 helper 页的完整类名、值、响应式/状态前缀是否与 Amis SCSS 逐项一致。
3. Extend 已核 4 篇主路径，但仍是 Amis 11 篇的子集；React / amisRequire 不属于 Vamis 目标。
4. Start 已核双入口和构建；npm / CDN 尚未发布，不能新增未验证的下载承诺。
5. Types 已核 4 篇；Definitions 不做静态循环图检测，API 全局适配器与 TS 穷尽校验仍是余项。

## 4. 下一步（按风险）

1. **Types/Concepts**：本轮已建立主路径与 Vamis 源码 / 活示例核对；后续变更继续增量复核。
2. **Style**：用脚本 diff 59 个 helper 页的类名/值/前缀，输出缺失/多余清单。
3. **Extend/Start**：本轮已标对应页与差异；Extend 仍只覆盖 Amis 11 篇中的 4 篇。
4. 每篇设计增加 `Amis 核对` 状态：`未核对 / 抽样 / 逐条`，完成前不写“已对齐”。

## 5. 诚实状态

- 这 84 篇起初是**基于 website 正文 + Vamis 运行时**写的页面级设计；除已标明本轮逐条 / 主路径核对的页面外，其余不是 Amis 源码逐条核对结果。
- 组件设计文档此前做过部分 Amis 入口源码盘点；站点五域没有同等强度的核对。
- 在完成第 4 节前，不应对外声称“站点设计已按 Amis 源码核对”。
