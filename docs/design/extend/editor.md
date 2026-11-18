# 编辑器设计

> 状态：**进行中 35%** · 对应站点：`/extend/editor` · 源码：[website/src/extend/editor.md](../../../website/src/extend/editor.md)

## 0. 设计结论

编辑器当前是**可视化骨架**：组件树、画布点选/拖拽、属性面板、YAML/JSON 视图。设计边界是“只写 schema 字段名，不创造平行配置”；不按 amis-editor/插件市场验收。

## 1. 边界与优先级

1. **真源**：schema 是唯一真源；编辑器面板只读写 schema 字段。
2. **字段名**：与 Amis 一致；不发明 `editorProps` 之类的平行配置。
3. **点选/拖拽**：画布选中同步树/属性；拖拽改层级，不破坏节点身份。
4. **YAML/JSON**：两视图同源；格式错误不写回。
5. **未实现**：插件市场、协作、完整撤销栈、代码生成。
6. **包边界**：`@vamis/editor` 依赖 core/ui，不另造渲染器。

## 2. 内容契约

- 先给本地打开方式与最小 schema，再讲四象限布局。
- 属性面板字段必须能对应 schema 路径。
- 给“非法 YAML/未知 type/拖拽到非法位置”的失败态。
- 明确当前是骨架，不承诺 amis-editor 全功能。

## 3. 实现

- [VamisEditor.vue](../../../packages/vamis-editor/src/VamisEditor.vue)：布局/状态。
- [PropertyPanel.vue](../../../packages/vamis-editor/src/PropertyPanel.vue)：属性读写。
- [SchemaTreeNav.vue](../../../packages/vamis-editor/src/SchemaTreeNav.vue)：树/选中。

## 4. 缺口

- 插件市场/撤销栈/协作未接。
- 拖拽非法位置与未知 type 的恢复策略未定。

## 5. 验收清单（文档核对：3 / 12）

- [x] 骨架范围/字段真源已盘点
- [x] editor 源码入口已定位
- [ ] 最小 schema 打开/编辑/回写跑通
- [ ] 树/画布/属性选中同步
- [ ] YAML/JSON 同源与错误态可复现
- [ ] 拖拽非法位置失败态可复现
- [ ] 明确未实现清单
