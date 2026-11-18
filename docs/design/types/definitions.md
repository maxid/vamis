# Definitions 类型设计

> 状态：**已完成 100%** · Amis 核对：引用语义 + Vamis 源码 / 递归活示例 · 对应站点：`/types/definitions` · 源码：[website/src/types/definitions.md](../../../website/src/types/definitions.md)

## 0. 设计结论

Definitions 已按实际渲染节点浅解析 `$ref`：顶级 definitions 提供注册表，本地字段覆盖定义字段；递归引用只在实际展开时继续，未知引用进入诊断。

## 1. 边界与优先级

1. **顶级限定**：definitions 只在顶级；子节点写无效/报错。
2. **引用**：`$ref` 字符串；解析后是完整 SchemaNode；不允许函数。
3. **递归**：按实际节点的展开条件继续；无条件自引用不是可用配置，当前不做静态循环依赖图检测。
4. **覆盖**：本地字段覆盖定义字段；删除 `$ref` 后交给正常渲染器。
5. **作者态**：YAML/JSON 同等；不引入 `$defs` 第二套。
6. **诊断**：未知引用不渲染该节点，并通过 `env.onDiagnostic` 报告。

## 2. 内容契约

- 首段明确顶级注册、浅解析与本地覆盖。
- 最小引用和 Combo 递归示例均为活示例。
- 写明递归终止条件、非顶级无效与未知 ref 诊断。
- 与 schema/SchemaNode 页互链。
- 不复制 Amis 全量 definitions 文档。

## 3. 实现

- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：实际节点浅解析与诊断。
- [引用纯函数](../../../packages/vamis-core/src/utils/definitions.ts)：定义读取与本地覆盖。
- [Form](../../../packages/vamis/src/renderers/Form.vue) / [Combo](../../../packages/vamis/src/renderers/form/Combo.vue)：默认收集与行默认值。
- [schema 类型](../../../packages/vamis-core/src/types.ts)：SchemaObject。
- [站点页面](../../../website/src/types/definitions.md)：契约清单。

## 4. 边界余项

- 引用、递归展开、未知诊断与本地覆盖均已实现。
- 静态循环依赖图检测不在当前范围；递归示例必须有明确的停止条件。

## 5. 验收清单（已核对）

- [x] 引用/顶级/循环边界已盘点
- [x] 解析点与类型已定位
- [x] 基本 / 递归示例均在真实 SDK 与浏览器跑通
- [x] 递归边界 / 未知 ref 诊断已核
- [x] 本地覆盖策略已定稿并回归
- [x] 与 SchemaNode 互链
- [x] 文档与运行时同为已完成
