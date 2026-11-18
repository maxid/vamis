# Definitions 类型设计

> 状态：**进行中 20%** · 对应站点：`/types/definitions` · 源码：[website/src/types/definitions.md](../../../website/src/types/definitions.md)

## 0. 设计结论

Definitions 当前**运行时未解析 `$ref`**：只能在顶级写 definitions，其它节点引用。设计必须先定引用解析/循环/覆盖规则，再提升文档进度；在此之前所有示例标“未实现”。

## 1. 边界与优先级

1. **顶级限定**：definitions 只在顶级；子节点写无效/报错。
2. **引用**：`$ref` 字符串；解析后是完整 SchemaNode；不允许函数。
3. **循环**：自引用/互引用必须检测并报诊断。
4. **覆盖**：引用节点与本地字段的合并策略需固定（本地覆盖/禁止覆盖）。
5. **作者态**：YAML/JSON 同等；不引入 `$defs` 第二套。
6. **诚实**：当前未实现，不能按可用功能验收。

## 2. 内容契约

- 首段明确“运行时未解析”。
- 给最小 definitions + $ref 例，并标不会生效。
- 给循环/非顶级/未知 ref 的失败态设计。
- 与 schema/SchemaNode 页互链。
- 不复制 Amis 全量 definitions 文档。

## 3. 实现

- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：目标解析点（未接）。
- [schema 类型](../../../packages/vamis-core/src/types.ts)：SchemaObject。
- [站点页面](../../../website/src/types/definitions.md)：契约清单。

## 4. 缺口

- `$ref` 解析/循环检测/合并策略均未实现。
- 文档进度 20% 与运行时一致，不能虚高。

## 5. 验收清单（文档核对：3 / 12）

- [x] 引用/顶级/循环边界已盘点
- [x] 解析点与类型已定位
- [ ] 所有示例标注未实现
- [ ] 循环/未知 ref 失败态设计
- [ ] 合并策略定稿
- [ ] 与 SchemaNode 互链
- [ ] 进度不虚高
