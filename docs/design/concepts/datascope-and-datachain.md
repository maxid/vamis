# 数据域与数据链设计

> 状态：**进行中 90%** · 对应站点：`/concepts/datascope-and-datachain` · 源码：[website/src/concepts/datascope-and-datachain.md](../../../website/src/concepts/datascope-and-datachain.md)

## 0. 设计结论

本页定义**值从哪里来、写到哪里去**。核心边界是 Page/Form/Row 域的分层、`name` 路径读写、父子优先级与隔离；不是讲 Pinia 实现。

## 1. 边界与优先级

1. **域层级**：Page → Form → Row；每层独立 scope，子域读父域，父域不自动读子域。
2. **路径**：`a.b[0]` 统一按 path 读写；空 name 不写。
3. **优先级**：当前域优先，再向上；同层冲突按表单字段定义。
4. **隔离**：`isolateScope` 只影响渲染器，不改变作者数据链。
5. **响应**：值变化驱动模板/表达式/联动重算；避免循环写值。
6. **组件边界**：组件不得直接改父域；通过 fieldApi/scope。

## 2. 内容契约

- 三层域图必须配一个可运行表单，展示“父值可见、子值不冒泡”。
- `name` 路径示例覆盖数组/对象/点路径。
- `data` / `value` / 默认值优先级要表格化。
- 明确 `setValue` / `getValue` / `reload` 属于 scoped API，不是全局变量。
- 反例：直接改 props.data、跨域写值、无限 watch。

## 3. 实现

- [formContext.ts](../../../packages/vamis/src/formContext.ts)：useData/useFieldValue/scope。
- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：域创建/透传。
- [解析工具](../../../packages/vamis-core/src/utils)：路径读写。

## 4. 缺口

- 多级 Row 嵌套/表格行域的边界示例不足。
- `isolateScope` 与 combo 独立域的边界仍未收口。

## 5. 验收清单（文档核对：3 / 12）

- [x] 域层级/路径/优先级已盘点
- [x] formContext 与 SchemaRenderer 已定位
- [ ] 三层域示例可复现
- [ ] 路径读写/数组/点路径示例可复现
- [ ] 隔离/不冒泡反例可复现
- [ ] 与 linkage/event-action 的边界链接
- [ ] 桌面/移动/深色可读
