# List 列表 · `list` 设计

> 状态：**进行中 90%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/list) · Amis：`/zh-CN/components/list`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

List 是“行数据 → listItem schema”的列表容器，和 Cards 类似但单列、带字母索引条、行拖拽和本地行值。主路径已较完整；真正容易回归的是**选择/点击优先级、字母索引滚动、拖拽重排、行内表单项写回、itemClick 与 itemAction 互斥**。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **数据层**：`source` / `items` → `rows`；行内修改/拖拽用 `localRows` 覆盖；`rowData` 给行加 `index`，不要改源行。
2. **点击优先级**：内部控件（button/a/input/select/toolbar/actions）不触发行点击；有 `onEvent` / clickAction 时 **itemClick 优先并覆盖 itemAction**；否则 itemAction；最后才是 checkOnItemClick。
3. **选择**：`selectable` + `multiple`；selected 是行索引数组，拖拽/排序后索引要同步；`selectedItems` 从 rows 派生。
4. **字母索引条**：`showIndexBar` 时用 IntersectionObserver + 滚动监听；点击字母 smooth scroll 到首行；用户点击期间暂停滚动同步；卸载清理 observer/listener。
5. **拖拽**：`draggable` 才启用；pointer 拖拽生成 ghost；重排 localRows 并同步 selection 索引；cancel/reset 回 snapshot；saveOrder 清拖拽态。
6. **行内表单项**：`onRowChange` 写 localRows，不直接改源；`init` 值不触发 dirty。
7. **包边界**：无 `<style>`、无 fetch；列表/索引条/ghost 走 token。

### 1.2 边界用例

- 空 source / 空数组 / 单行 / 非对象行
- `listItem` 空 / 只有 body / 自定义 item 类型
- header/footer / title / empty
- `selectable` + `multiple` + `checkOnItemClick` + 内部按钮
- itemClick vs itemAction vs clickAction 互斥
- 字母索引：无字母字段 / 中文 / 滚动同步 / 点击跳转 / 卸载
- draggable：拖拽中选中、取消、保存、越过边界
- 行内 input/select 写回；外部 setValue/reset
- 窄屏/深色/长列表

### 1.3 优先级

1. 数据/点击优先级/选择
2. 字母索引生命周期
3. 拖拽/本地行
4. 行内表单项/API
5. 样式/窄屏/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `List.tsx` 1882 行；Vamis 504 行）
- 依赖：`list-item`、`action`、`each`、`service` 等
- 风险：点击/选择/拖拽/索引条四套交互叠加

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'list'`
- Amis 渲染器：`packages/amis/src/renderers/List.tsx`
- 在线文档：[Vamis `/components/list`](/components/list)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `source` / `items` | 行数据 | 默认 `${items}` |
| `listItem` | 行 schema | 每行 SchemaRenderer；无 item 时默认 list-item |
| `selectable` / `multiple` | 选择 | 索引数组；跨刷新需同步 |
| `checkOnItemClick` | 点行勾选 | 与 itemAction/itemClick 互斥 |
| `itemAction` | 行动作 | 有 itemClick 监听时被覆盖 |
| `showIndexBar` / `indexField` | 字母索引 | IntersectionObserver；图标/字母 |
| `draggable` | 拖拽 | ghost + localRows + selection 索引 |
| `header` / `footer` | 头尾 | SchemaNode |
| `size` / `bordered` | 外观 | token |
| `itemClassName` | 行 class | 作者覆盖 |
| `empty` / placeholder | 空态 | 文本/SchemaNode |

### 3.3 事件/动作

已接：`itemClick`（item.data/index；可 preventDefault）、`selectedChange`（如选择路径已接）。

动作：`select` / `selectAll` / `clearAll` / `initDrag` / `cancelDrag` / `setValue`（含 index/condition）；`submitQuickEdit` 未接。

组件 API：`getData()`（items/rows/selectedItems）、`setData(values, replace, index, condition)`。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`List.vue`](../../../packages/vamis/src/renderers/List.vue) | 数据/选择/点击/索引条/拖拽/本地行/API |
| [`list.ts`](../../../packages/vamis-core/src/utils/list.ts) | letter/matchListRows/row helpers |
| [`NestedFormScope`](../../../packages/vamis/src/NestedFormScope.vue) | 行内表单项作用域 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | list/索引条/ghost token |

### 4.2 状态

```text
source/items ──> rows（localRows 优先）
      ├─ selected: number[]
      ├─ itemEls + IntersectionObserver → currentLetter
      ├─ dragging + ghost + snapshot
      └─ onRowChange → localRows
```

- `ensureLocal` 在首次修改/拖拽时复制 rows。
- 拖拽移动后 selection 索引按 from/to 调整。
- `saveOrder` 只清 moved/dragging，不自动写远端；外部 API 由动作/服务承担。
- 索引条滚动监听元素 + window，卸载必须清。

### 4.3 点击链

```text
click → dragging/control? return
      → has itemClick? emit itemClick → return
      → itemAction? runAction
      → selectable + checkOnItemClick? toggle
```

## 5. 样式与边界

- 默认类：`.vamis-list`、`.vamis-list__item`、`.vamis-list__item-float`、索引条相关。
- 行间距/索引条/ghost 走 token；无 `<style>`。
- 窄屏/深色/长列表/空态单独核；ghost 的 z-index 2000 不要与浮层冲突。

## 6. 当前状态与缺口

- 已对齐：source/listItem、选择/点击、itemClick、字母索引条、拖拽、header/footer、行内表单项、setData/动作主路径。
- 缺口：`submitQuickEdit` 未接；itemClassName 像素级；深色/窄屏未逐章；拖拽与滚动/索引条组合需实测。
- 对照：TODO 90%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis List / list 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（List 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page list` 桌面
- [ ] `pnpm compare --page list --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- itemClick/itemAction/checkOnItemClick 互斥
- 字母索引 observer 清理
- 拖拽 selection 索引
- 行内表单项写回
- 空态/窄屏

## 8. 后续

1. 补 submitQuickEdit（列表行内编辑）或明确不做。
2. 字母索引 + 拖拽/滚动组合专项。
3. 深色/窄屏/长列表性能。

---

返回 [组件设计索引](README.md)
