# TreeSelect 树选择 · `treeselect` 设计

> 状态：**进行中 82%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/treeselect) · Amis：`/zh-CN/components/form/treeselect`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

TreeSelect 复用 `useTreeField`，额外提供**触发框 + 弹层树 + 标签/清除 + 移动草稿确认**。`searchable` 输入属于触发器，Popover 只承载树；`source` / `autoComplete` 与 `menuTpl` / `iconField` 已接，change 事件/scoped 动作/虚拟列表仍是缺口。

## 1. 边界与优先级（先读）

1. **值与勾选**：继承 useTreeField（autoCheckChildren/cascade/onlyLeaf/joinValues/enableNodePath）；不在弹层另写。
2. **弹层/移动**：桌面 VamisOverlay；移动 VamisPopUp + draft，确认才写。Trigger/Overlay 与 Select 一样按根控件宽度同步，定位 gap 4px。
3. **标签/清除**：selectedItems 标签、removeTag/clearAll；多选/单选。
4. **搜索**：`searchable` / `searchApi` 输入放在触发器内，类似 Amis ResultBox；Popover 内不重复画 SearchBox。
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
| `enableNodePath` / `pathSeparator` | 值按父链回写；触发器祖先标签固定 `" / "` 连接 | 已接 |
| `searchable` | 触发输入过滤；桌面自动聚焦，单选取值后显示结果文本 | 已接 |
| `source` / `autoComplete` | 初始加载树；输入 `term` 后远程替换，清空恢复 source | 已接 |
| `menuTpl` / `iconField` | 自定义节点内容与 Font Awesome / URL / SVG 图标 | 已接 |
| change/动作 | 目标 | 未接（同 InputTree） |

## 4. 架构

- `form/TreeSelect.vue`：trigger/overlay/mobile draft/tags；searchable 输入、根宽度 ResizeObserver 与浮层宽度同步。
- `form/useTreeField.ts`：值/树/勾选/搜索。
- `TreeBranch`：树 UI、`menuTpl` / `iconField`；`TreeSearchBox` 只属于 InputTree，不挂 TreeSelect Popover。

## 5. 样式

- trigger/弹层/树/标签 token；无 `<style>`。桌面 Popover 外层透明，内层 Tree 承担 `1px` 边框、`4px 10px` padding、`-1px` 上移与 `400px` 最大高度；深色继续走 `--card` / `--select-menu-*`。

## 6. 缺口

change/scoped 动作、虚拟列表；与 InputTree 同步。`itemActions`、节点路径模式、searchable 输入位置、source/autoComplete、menuTpl/iconField 与深色浮层已对齐，不再是缺口。

## 7. 验收

- 值/勾选/弹层/移动确认/标签/搜索/窄屏；未接不误标。

### 验收清单（文档核对：9 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [x] 组件页活示例运行、无 console error
- [x] `pnpm test`（组件相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page treeselect` 桌面
- [x] `pnpm compare --page treeselect --mobile`
- [x] 深色 / 375px 窄屏核对

## 8. 后续

随 InputTree 补事件/动作；移动草稿确认单独测试。

---

返回 [组件设计索引](../README.md)
