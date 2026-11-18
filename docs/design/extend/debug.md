# 调试设计

> 状态：**已完成 90%** · 对应站点：`/extend/debug` · 源码：[website/src/extend/debug.md](../../../website/src/extend/debug.md)

## 0. 设计结论

调试页定义**诊断入口**：env/window/URL 三种开关，控制台日志与 `env.onDiagnostic` 结构化诊断；`schema.debug` 只显示表单域，不开启动作日志。

## 1. 边界与优先级

1. **开关优先级**：env > window > URL；生产默认关闭。
2. **日志分组**：动作/API/表达式/渲染器错误；包含求值后数据与结束标记。
3. **结构化诊断**：`onDiagnostic` 接收对象，不依赖 console。
4. **schema.debug**：只显示表单数据域，不等于全局调试。
5. **品牌**：`enableVamisDebug` / `vamisDebug=1`。
6. **安全**：日志不得输出密钥/完整请求头。

## 2. 内容契约

- 三种开启方式各一个例子，并给优先级。
- 日志字段表：动作、API、表达式、错误。
- `onDiagnostic` 最小订阅示例。
- 生产环境建议与敏感信息注意。
- 可视化 Debug 面板/数据链检查器标未接。

## 3. 实现

- [env.ts](../../../packages/vamis-core/src/env.ts)：debug/onDiagnostic。
- [actions/run.ts](../../../packages/vamis-core/src/actions/run.ts)：动作日志。
- [api.ts](../../../packages/vamis-core/src/utils/api.ts)：请求日志。

## 4. 缺口

- 可视化 Debug 面板/数据链检查器未接。
- 日志脱敏策略未成文。

## 5. 验收清单（文档核对：3 / 12）

- [x] 三开关/诊断边界已盘点
- [x] env/actions/api 已定位
- [ ] 三种开关示例可运行
- [ ] 优先级/生产关闭写清
- [ ] 日志字段表与诊断对象核对
- [ ] 脱敏/敏感信息说明
- [ ] 与 concepts/event-action 互链
