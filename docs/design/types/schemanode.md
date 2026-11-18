# SchemaNode 类型设计

> 状态：**已完成 92%** · Amis 核对：类型主路径 + Vamis 源码 / 活示例 · 对应站点：`/types/schemanode` · 源码：[website/src/types/schemanode.md](../../../website/src/types/schemanode.md)

## 0. 设计结论

SchemaNode 定义节点四态：模板字符串 / Schema 对象 / SchemaArray / false。字符串按 `tpl`，对象必须有 `type`，数组由容器展开，false 不渲染。

## 1. 边界与优先级

1. **四态**：string→tpl、object→renderer、array→展开、false→null。
2. **type**：对象至少要有 type；缺 type 进诊断。
3. **数组**：容器决定展开位置；空数组不占位。
4. **模板**：字符串默认转义；raw 只在可信内容。
5. **类型宽**：TS `SchemaObject` 宽松；不承诺穷尽联合。
6. **与 definitions**：顶级 `$ref` 已接；本地覆盖、未知引用诊断与递归按需展开见 Definitions。

## 2. 内容契约

- 四态各一个最小例，并给组合例。
- 明确 `body`/`items` 等容器如何展开数组。
- 失败态：缺 type、false、空数组、非对象。
- 与 schema/template 页互链。

## 3. 实现

- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：分派。
- [types.ts](../../../packages/vamis-core/src/types.ts)：SchemaNode/SchemaObject。
- [SchemaRenderer tests](../../../packages/vamis-core/__tests__)：分派用例。

## 4. 缺口

- TS 类型宽松，无法编译期穷尽。
- `$ref` 已接；Definitions 的静态循环图检测不在当前范围。

## 5. 验收清单（已核对）

- [x] 四态/容器分派已盘点
- [x] SchemaRenderer/types 已定位
- [x] 四态示例可运行
- [x] 缺 type/false/空数组失败态可复现
- [x] 与 schema/template 互链
- [x] 桌面/移动可读
- [x] 不承诺未实现类型
