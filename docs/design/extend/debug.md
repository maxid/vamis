# 调试设计

> 状态：**已完成 90%** · Amis 核对：调试入口 + Vamis 源码 / 实际日志 · 对应站点：`/extend/debug` · 源码：[website/src/extend/debug.md](../../../website/src/extend/debug.md)

## 0. 设计结论

调试页定义**诊断入口**：env/window/URL 三种开关，控制台日志与 `env.onDiagnostic` 结构化诊断；`schema.debug` 只显示表单域，不开启动作日志。

## 1. 边界与优先级

1. **开关**：env / window / URL 任一为真即开启，没有覆盖优先级；生产默认关闭。
2. **日志分组**：动作/API/表达式/渲染器错误；包含求值后数据与结束标记。
3. **结构化诊断**：`onDiagnostic` 接收对象，不依赖 console。
4. **schema.debug**：只显示表单数据域，不等于全局调试；按 Amis 在 Form body 顶部渲染 `type: json`，支持 `debugConfig`，走轻量 JSON 树而不是 Monaco。
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
- Form `schema.debug`：通过 `SchemaRenderer` → `json` → `JsonNode` 在表单顶部渲染轻量语法树；`debugConfig` 直接覆盖 JSON schema，不引入 Monaco。

## 4. 缺口

- 可视化 Debug 面板/数据链检查器未接。
- 日志 / 诊断的敏感信息与宿主脱敏责任已写入正文。

## 5. 验收清单（已核对）

- [x] 三开关/诊断边界已盘点
- [x] env/actions/api 已定位
- [x] 三种开关示例可运行
- [x] 优先级/生产关闭写清
- [x] 日志字段表与诊断对象核对
- [x] 脱敏/敏感信息说明
- [x] 与 concepts/event-action 互链
