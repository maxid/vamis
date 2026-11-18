# 表达式设计

> 状态：**进行中 95%** · 错误定位 / 展示余项未齐 · 对应站点：`/concepts/expression` · 源码：[website/src/concepts/expression.md](../../../website/src/concepts/expression.md)

## 0. 设计结论

表达式页定义**只读求值**：变量、运算、函数、过滤器。它不写值、不发请求；需要副作用时用联动/事件动作。设计要把“能算什么”和“不能做什么”分开。

## 1. 边界与优先级

1. **只读**：求值不产生写值/请求副作用。
2. **上下文**：当前数据域；函数/过滤器来自 `@vamis/formula`。
3. **错误**：缺变量/类型错误要可诊断；不能静默当 false/0。
4. **与模板分工**：表达式返回任意值；模板只返回字符串。
5. **与联动分工**：表达式用于条件；写值/请求归动作。
6. **安全**：不执行任意 JS；JS 脚本是事件动作的受控能力。

## 2. 内容契约

- 先给最小布尔表达式，再给对象/数组/空值。
- 函数/过滤器表标 P0/P1 与返回类型。
- 必须给“缺变量/类型错误”的失败态。
- 与 `visibleOn` / `disabledOn` / `onEvent` 的示例互链。

## 3. 实现

- [@vamis/formula](../../../packages/vamis-formula)：evalExpression/filter。
- [formula.ts](../../../packages/vamis-core/src/formula.ts)：运行时封装。
- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：条件求值。

## 4. 缺口

- 错误诊断的字段/位置未统一展示。
- 表达式与 JS 脚本的权限边界未文档化。

## 5. 验收清单（文档核对：3 / 12）

- [x] 只读/上下文/错误边界已盘点
- [x] formula 包与运行时封装已定位
- [ ] 布尔/对象/空值示例可运行
- [ ] 缺变量/类型错误可复现
- [ ] P0/P1 函数表对齐
- [ ] 与联动/事件动作互链
- [ ] 深色/移动可读
