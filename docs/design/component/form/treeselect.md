# TreeSelect 树选择 · `treeselect` 设计

> 状态：**进行中 78%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/treesect) · Amis：`/zh-CN/components/form/treeselect`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

TreeSelect 复用 `useTreeField`，额外提供**触发框 + 弹层树 + 标签/清除 + 移动草稿确认**。主路径较完整；change 事件/scoped 动作/深色窄屏与 InputTree 同缺口。

## 1. 边界与优先级（先读）

1. **值与勾选**：继承 useTreeField（autoCheckChildren/cascade/onlyLeaf/joinValues）；不在弹层另写。
2. **弹层/移动**：桌面 VamisOverlay；移动 VamisPopUp + draft，确认才写。
3. **标签/清除**：selectedItems 标签、removeTag/clearAll；多选/单选。
4. **搜索**：TreeSearchBox；搜索不改变值。
5. **事件/动作**：与 InputTree 同缺口；不要声称 change/scoped 动作完整。
6. **包边界**：无 `<style>`、无 fetch；tree/overlay token。

### 边界用例

- 空/单选/多选/树层级/onlyLeaf
- 桌面弹层/移动草稿确认/关闭
- 标签移除/清除/搜索
- change/动作缺口
- 窄屏/深色

### 优先级

1. 值/勾选；2. 弹层/移动；3. 标签/搜索；4. 事件/样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 970 行；Vamis 260 行 + useTreeField 452 行）；依赖 tree/overlay。
- 风险：桌面/移动双路径、draft 确认。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| options/multiple | 树/值 | 已接 |
| 勾选语义 | 继承 | 已接 |
| 弹层/移动 draft | 交互 | 已接 |
| 标签/清除/搜索 | 交互 | 已接 |
| change/动作 | 目标 | 未接（同 InputTree） |

## 4. 架构

- `form/TreeSelect.vue`：trigger/overlay/mobile draft/tags。
- `form/useTreeField.ts`：值/树/勾选/搜索。
- `TreeBranch/TreeSearchBox`：树 UI。

## 5. 样式

- trigger/弹层/树/标签 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

change/scoped 动作、深色/窄屏逐项；与 InputTree 同步。

## 7. 验收

- 值/勾选/弹层/移动确认/标签/搜索/窄屏；未接不误标。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

随 InputTree 补事件/动作；移动草稿确认单独测试。

---

返回 [组件设计索引](../README.md)
