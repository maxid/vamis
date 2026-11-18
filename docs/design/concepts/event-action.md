# 事件动作设计

> 状态：**已完成** · 对应站点：`/concepts/event-action` · 源码：[website/src/concepts/event-action.md](../../../website/src/concepts/event-action.md)

## 0. 设计结论

事件动作是 Vamis 的**命令式交互总线**：`onEvent` 绑定事件→动作，动作按顺序执行，支持请求、弹窗、跳转、组件状态、数据、广播、JS、控制流。设计核心是执行顺序/中断/异步/上下文。

## 1. 边界与优先级

1. **顺序**：actions 数组串行；前一个失败/中止，后续不执行。
2. **确认**：`confirm`/`confirmText` 在后续动作前；取消即停。
3. **阻止**：事件对象 `preventDefault` 阻止默认/后续。
4. **异步**：请求/弹窗/等待必须 await；不能 fire-and-forget。
5. **上下文**：事件 data + 当前域 + 响应；`__rendererData` 只补当前 name。
6. **控制流**：条件/循环/并行/排他要有明确终止。
7. **安全**：自定义 JS 只在受控事件动作；模板 raw 不在此列。

## 2. 内容契约

- 首例必须是 click → toast；再给 confirm → ajax → reload 链。
- 必须给“取消/失败/中止”的后续动作不执行示例。
- 动作表按类别分组，标 P0/P1。
- 广播/监听器/去抖/埋点单独小节，不与基础动作混排。
- 与 Action 组件、API 类型页互链。

## 3. 实现

- [actions/run.ts](../../../packages/vamis-core/src/actions/run.ts)：动作执行/控制流。
- [actions/registry.ts](../../../packages/vamis-core/src/actions/registry.ts)：动作注册。
- [event.ts](../../../packages/vamis-core/src/actions/event.ts)：事件对象。

## 4. 缺口

- 动作日志/诊断与调试文档的可视化面板未接。
- 并行/排他/循环的失败恢复策略未统一。

## 5. 验收清单（文档核对：3 / 12）

- [x] 顺序/confirm/阻止/异步边界已盘点
- [x] actions 运行时与注册表已定位
- [ ] click→toast/confirm→ajax 链可运行
- [ ] 取消/失败中止示例可复现
- [ ] 动作表 P0/P1 对齐
- [ ] 广播/JS 边界示例可运行
- [ ] 与 Action/API 互链
- [ ] 深色/移动可读
