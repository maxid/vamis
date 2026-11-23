# Options 选择器契约 · `options`（契约）设计

> 状态：**进行中 92%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/options) · Amis：`/zh-CN/components/form/options`
> 盘点日期：2026-11-18；虚拟列表核对：2026-11-23。本文是研发设计文档；options 是选择器基类契约，不是独立业务 type。

## 0. 一页结论

Options 是 Select/Picker/Checkboxes/Transfer 等共享的**值/选项/搜索/远程 source 状态机**（optionsControl.ts + options.ts）。改 Options 会影响整个选择器族；必须用统一 API，不在控件里各写。

## 1. 边界与优先级（先读）

1. **值**：name 写入/读取统一 useFieldValue；multiple/joinValues/extractValue/delimiter 序列化。
2. **选项**：本地 options / source 变量/API；labelField/valueField；children 递归。
3. **搜索**：filterOption/searchApi/autoComplete；远程竞态/空结果。
4. **选择**：selected/toggle/toggleAll/commit；只叶子可选；disabled。
5. **创建/编辑**：addControls/editControls/create 选项；与 select 的 allowCreate 区分。
6. **包边界**：无 `<style>`、无 fetch；requestApi 统一。

### 边界用例

- 空/本地/远程/变量 source/失败
- multiple/joinValues/extractValue/delimiter
- 搜索/自动补全/竞态/全选
- disabled/只叶子/新增/编辑
- 窄屏/深色

### 优先级

1. 值序列化；2. options/source；3. 搜索/选择；4. 创建/编辑/样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis Options 1487 行；Vamis optionsControl 570 + options 805）；依赖全部选择器。
- 风险：全族共享，改一处影响多控件。
- 2026-11-19：Select 桌面平铺选项接入虚拟列表（`virtualThreshold` 默认 100 / `itemHeight` 默认 32）；分组菜单与其他消费方仍整表渲染。
- 2026-11-23：InputTree / TreeSelect 通过共享 `TreeBranch` 接入树窗口；行高首行实测、实际视口优先、上下 spacer 补总高，检索缩表回顶部。分组菜单、Picker / Transfer 仍待复用。
- 2026-11-23：删除确认对齐 OptionsControl 默认 `deleteConfirm`；未配置也弹「确认要删除？」，显式 `false` / 空串才关闭，Select / InputTree / TreeSelect 共用。

## 3. 契约

| 能力 | 现状 |
|---|---|
| 值序列化 | 已接 |
| 本地/远程 options | 已接 |
| 搜索/filterOption/searchApi | 已接 |
| selected/toggle/toggleAll | 已接 |
| add/edit controls | 已接（部分控件） |
| addConfirm / editConfirm / deleteConfirm | 已接；先于本地变更与 CUD API |
| itemActions | 已接 InputTree / TreeSelect / Select tree；节点作为 extraData，操作点击不选行 |
| enableNodePath / pathSeparator | 已由共享树值工具接入 InputTree / TreeSelect；输入拆叶子、输出去重父链 |
| 分组/树 | 部分（由控件决定） |
| 虚拟列表 | Select 桌面平铺、InputTree、TreeSelect 已接；分组菜单 / Picker / Transfer 待复用 |

## 4. 架构

- [`optionsControl.ts`](../../../../packages/vamis/src/optionsControl.ts)：useOptionsControl 状态机。
- [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts)：normalize/selected/toggle/serialize。
- 消费方：[Select](select.md)、[Picker](picker.md)、[Transfer](transfer.md)、[Checkboxes](checkboxes.md)、[InputTree](input-tree.md)。

## 5. 样式

- 选择器皮肤由消费控件提供；Options 无独立 `<style>`。

## 6. 缺口

- 分组菜单（`selectMode: group` / group options）仍整表渲染；Picker / Transfer 未接虚拟列表。
- 远程缓存未接；各控件 selectMode/树/分页差异仍由消费控件负责。
- 深色由控件负责；虚拟列表滚动条与分组行高仍要按控件核。
- 剩余 CUD 缺口是各消费控件是否完整暴露对应 UI；共享事件与 API 顺序已收口。
- `itemActions`、节点路径模式与树虚拟窗口都已由共享树状态接入；后续 Picker / Transfer 仍按消费控件逐个复用，不把单选控件私有实现抬成 Options 契约。

## 7. 验收

- 序列化矩阵/远程/搜索/选择/全选/创建；至少覆盖 Select/Picker/Transfer 三消费方。
- 虚拟列表：桌面平铺选项超过阈值切虚拟、滚动切片、搜索后回到顶部；Amis `Select--longlist` 实测视口 266 / 行高 32 / 200 项滚动高 6400。树控件按 Amis Tree 实测首行高度，TreeSelect 6.13 未透传 `itemHeight`；分组模式与 Picker / Transfer 待验。

### 验收清单（文档核对：5 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [x] `pnpm test`（组件相关）
- [x] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

Options 改动必须跑选择器族回归；不要为单控件加私有状态。

---

返回 [组件设计索引](../README.md)
