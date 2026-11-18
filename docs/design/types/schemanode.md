# SchemaNode 类型设计

> 状态：**已完成 92%** · 对应站点：`/types/schemanode` · 源码：[website/src/types/schemanode.md](../../../website/src/types/schemanode.md)

## 0. 设计结论

SchemaNode 定义节点四态：模板字符串 / Schema 对象 / SchemaArray / false。字符串按 `tpl`，对象必须有 `type`，数组由容器展开，false 不渲染。

## 1. 边界与优先级

1. **四态**：string→tpl、object→renderer、array→展开、false→null。
2. **type**：对象至少要有 type；缺 type 进诊断。
3. **数组**：容器决定展开位置；空数组不占位。
4. **模板**：字符串默认转义；raw 只在可信内容。
5. **类型宽**：TS `SchemaObject` 宽松；不承诺穷尽联合。
6. **与 definitions**：`$ref` 是目标扩展，当前未接。

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
- `$ref` 未接。

## 5. 验收清单（文档核对：3 / 12）

- [x] 四态/容器分派已盘点
- [x] SchemaRenderer/types 已定位
- [ ] 四态示例可运行
- [ ] 缺 type/false/空数组失败态可复现
- [ ] 与 schema/template 互链
- [ ] 桌面/移动可读
- [ ] 不承诺未实现类型
