# Schema 配置与组件设计

> 状态：**已完成** · 对应站点：`/concepts/schema` · 源码：[website/src/concepts/schema.md](../../../website/src/concepts/schema.md)
> 盘点日期：2026-11-18。

## 0. 设计结论

Schema 页负责建立**节点树模型**：`type` 选渲染器，其余字段是组件属性，`page` 是唯一顶级节点。设计重点不是罗列属性，而是让作者理解“字符串→tpl、对象→type、数组→容器展开”的分派规则，以及 JSON/YAML/IR 共用一条运行时。

## 1. 边界与优先级

1. **type 分派**：未知 type 走诊断/占位，不白屏；`page` 只能顶级。
2. **属性语义**：字段名与 Amis 一致；`body` 字符串按 tpl，对象按 schema，数组展开。
3. **作者态**：JSON / YAML / IR 信封同管线；不教 YAML 专属能力。
4. **懒加载**：`LazyComponent` 是运行时机制，不另造 schema 字段。
5. **错误边界**：渲染异常进诊断，不炸整页。

## 2. 内容契约

- 首例必须是 `page` + `body` 字符串，再给 `type` 树。
- 必须解释 `body` 的三态；HTML 字符串不是默认安全通道。
- 至少给一份 YAML 对照；IR 只给最小信封，不展开全部字段。
- “组件树/布局”图与代码一致；不把 `page` 写成普通容器。
- 未知 type、缺 page、循环引用要有失败态说明。

## 3. 实现

- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：type 解析、属性透传、错误边界。
- [register.ts](../../../packages/vamis/src/register.ts)：type 注册表。
- [pages.ts](../../../playground/src/docs/pages.ts)：站点 Markdown 加载。

## 4. 缺口

- TS `SchemaObject` 仍宽松，文档只能给主路径形状。
- 未知 type 的视觉占位与诊断文案未统一成设计 token。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面与运行时入口已定位
- [x] 节点三态/唯一 page 边界已盘点
- [ ] 示例 JSON/YAML/IR 三态一致
- [ ] 未知 type/缺 page 失败态可复现
- [ ] LazyComponent 示例可运行
- [ ] 桌面/移动/深色可读
- [ ] 相关组件/类型链接补齐
