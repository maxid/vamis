# 联动设计

> 状态：**已完成 100%** · Amis 核对：主路径 + Vamis 源码 / 活示例 · 对应站点：`/concepts/linkage` · 源码：[website/src/concepts/linkage.md](../../../website/src/concepts/linkage.md)

## 0. 设计结论

联动页定义**声明式条件 → 组件状态/值**：`visibleOn`、`disabledOn`、`hiddenOn`、`value` 表达式等。它不执行动作；复杂交互升级到事件动作。核心风险是循环依赖与优先级。

## 1. 边界与优先级

1. **声明式**：条件只算当前节点状态，不发请求、不跳转。
2. **优先级**：显式 `hidden` / `visible` / `disabled` 与动作状态按源码顺序覆盖；普通 `value` 只初始化，持续写值归 Formula / 事件动作。
3. **循环**：A 改 B、B 改 A 必须能终止；依赖图/深度上限待定。
4. **作用域**：条件读当前域；不跨 Page 偷值。
5. **升级路径**：需要请求/弹窗/跳转时改用 onEvent。
6. **性能**：只在依赖变化时重算，不整树全量。

## 2. 内容契约

- 给显隐、禁用、值联动三类最小例。
- 必须给“循环依赖/冲突优先级”反例。
- 与表达式/事件动作的边界用对照表。
- 说明联动值不写回源字段（只影响消费端）。

## 3. 实现

- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：条件/值解析。
- [formula.ts](../../../packages/vamis-core/src/formula.ts)：表达式。
- [formContext.ts](../../../packages/vamis/src/formContext.ts)：域读写。

## 4. 边界余项

- 循环依赖不自动推导依赖图；正文要求改成单输入或显式动作链。
- 普通 `value` 表达式仅初始化求值；持续写值由 Formula / 事件动作负责。

## 5. 验收清单（文档核对：7 / 7）

- [x] 声明式边界/优先级已盘点
- [x] 条件与域实现已定位
- [x] 显隐/禁用/值联动示例可运行
- [x] 循环依赖反例可复现
- [x] 冲突优先级表格核对
- [x] 与事件动作升级边界互链
- [x] 移动/深色可读
