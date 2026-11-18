# 行为设计

> 状态：**已完成 100%** · Amis 核对：主路径 + Vamis 源码 / 活示例 · 对应站点：`/concepts/action` · 源码：[website/src/concepts/action.md](../../../website/src/concepts/action.md)

## 0. 设计结论

行为页解释 `actionType` 分派：按钮/链接/菜单点击后做什么。它是事件动作的“单动作入口”，但完整链路（confirm/onEvent/后续动作）仍归事件动作。

## 1. 边界与优先级

1. **actionType**：dialog/drawer/ajax/url/link/toast/copy/close/refresh 等；未知类型诊断。
2. **执行顺序**：confirmText/confirm 先于动作；onEvent 可拦截。
3. **参数**：`api`/`dialog`/`drawer`/`link`/`args` 与 Amis 同形；不发明平行字段。
4. **组件动作**：submit/reset/clear 等由目标组件实现，行为页只分派。
5. **按钮复用**：Button 是 Action 别名，外观不改变行为。
6. **失败态**：请求失败/目标不存在要提示，不静默。

## 2. 内容契约

- 按 actionType 给最小配置表；每个类型一个可运行例。
- confirm 与 onEvent 的优先级要画时序。
- 区分“行为（单动作）”与“事件动作（动作链）”。
- 与 Action/Button 组件设计互链。

## 3. 实现

- [Action.vue](../../../packages/vamis/src/renderers/Action.vue)：按钮/行为分派。
- [run.ts](../../../packages/vamis-core/src/actions/run.ts)：动作执行。
- [types.ts](../../../packages/vamis-core/src/types.ts)：ActionSchema。

## 4. 边界余项

- 组件专有动作仍在各组件文档维护；本页只列通用动作并链接事件动作。
- 未知 actionType 通过 `env.onDiagnostic` 报告；失败默认停止后续动作。

## 5. 验收清单（文档核对：7 / 7）

- [x] actionType/confirm/参数边界已盘点
- [x] Action/run/types 已定位
- [x] 各 actionType 最小例可运行
- [x] confirm/onEvent 时序示例可复现
- [x] 未知类型/失败态可复现
- [x] 与事件动作/Button 互链
- [x] 深色/移动可读
