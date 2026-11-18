# InputTree 树形选择器 · `input-tree` 设计

> 状态：**进行中 78%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-tree) · Amis：`/zh-CN/components/form/input-tree`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputTree 是 `useTreeField` 组合式状态的一层薄壳：InputTree.vue 只有 64 行，真正逻辑在 `useTreeField.ts`（452 行）+ `TreeBranch` / `TreeSearchBox`，并与 TreeSelect 共用。设计时按**组合式状态**审，不要只改 InputTree.vue。

当前覆盖：多选/单选、父子勾选语义、搜索、懒加载、增加/编辑/删除、路径模式、自定义渲染、工具栏、虚拟列表。**change 事件与部分 CUD 事件仍未接**，文档事件表不能当已实现。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **父子勾选语义**：`autoCheckChildren`（默认 true）、`cascade`、`onlyLeaf`、`withChildren`、`onlyChildren`、`autoCancelParent` 组合决定写父还是写子；所有入口（节点点击/全选/搜索/API）必须走 `toggleTreeSelection`。
2. **值形态**：`multiple` + `joinValues` + `delimiter` 决定 string/array；单选写单值；`valueField` 决定节点值。
3. **树选项**：`options` / `source` 归一为树；懒加载节点用 `deferField`；本地 CUD 修改 `localOptions` 后要重新 seedExpanded，不能丢展开器。
4. **搜索**：本地搜索保留匹配分支；远程 `searchApi` 结果只放 `remoteFiltered`，清搜索后回到本地树；搜索不改变选中值。
5. **懒加载**：`deferLoad` 用节点 `deferApi` 或 schema `deferApi/source`；成功后合并子节点、展开，派发 `deferLoadFinished`；失败保留原树。
6. **值写回**：统一 `fieldApi.setValue(name, dumpJoined(...))`；无 name 不写；树 CUD 删除节点要同步剔除选中值。
7. **包边界**：无 `<style>`、无直接 fetch；`requestApi` 统一；树样式在 `@vamis/ui` token。

### 1.2 边界用例

- 单选/多选、`joinValues` / `delimiter` / `withChildren` / `onlyChildren`
- `autoCheckChildren` / `cascade` / `onlyLeaf` / `autoCancelParent` 组合
- 父节点 disabled、子节点部分选中、父节点无 value
- 多层树、`childrenColumnName` 自定义、空 children
- 搜索（本地/远程）、搜索后全选、清搜索
- `deferApi` 节点/整表、失败、重复展开、懒加载后 CUD
- 路径模式 `enableNodePath` / `pathSeparator` / `hideNodePathLabel`
- 增加/编辑/删除（内联 / `addControls` 弹层）、删除已选节点
- 工具栏、虚拟列表、`showOutline` / `showIcon` / `showRadio`
- disabled/static、窄屏、深色

### 1.3 优先级

1. 父子勾选语义与值形态
2. 树选项/搜索/懒加载
3. CUD / 路径模式 / 工具栏
4. 事件补齐（change / CUD）
5. 样式/虚拟/深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/InputTree.tsx` 744 行；Vamis `useTreeField` 452 + `TreeBranch` 316 + `TreeSearchBox` 95 + 薄壳）
- 依赖：`Options`、`FormItem`、`dialog`（addControls/editControls）、`checkbox`/`radio`
- 风险：父子勾选/值形态/懒加载/CUD 共享一套组合式状态，树组件与 TreeSelect 必须同步

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'input-tree'`
- Amis 渲染器：`packages/amis/src/renderers/Form/InputTree.tsx`
- 在线文档：[Vamis `/components/form/input-tree`](/components/form/input-tree)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `options` / `source` | 树选项 | `children` 递归；`source` 远程/变量 |
| `multiple` / `showRadio` | 多选/单选外观 | radio 是单选 UI；`multiple` 决定值数组 |
| `joinValues` / `delimiter` | 值形态 | 同 Options 族 |
| `autoCheckChildren` / `cascade` / `onlyLeaf` / `withChildren` / `onlyChildren` / `autoCancelParent` | 父子勾选 | 全部走 `toggleTreeSelection` |
| `searchable` / `searchConfig` / `searchApi` | 搜索 | sticky/immediately/placeholder；远程结果仅过滤 |
| `deferApi` / `deferField` | 懒加载 | 节点优先于 schema；成功后展开 |
| `creatable` / `editable` / `removable` / `rootCreatable` | CUD | 内联 CUD 与 `addControls`/`editControls` 弹层两条路 |
| `initiallyOpen` / `unfoldedLevel` | 展开 | 默认层级/全开 |
| `enableNodePath` / `pathSeparator` | 路径模式 | 值/标签是否带路径 |
| `showOutline` / `showIcon` | 视觉 | 展开线/图标 |
| `onlyLeaf` | 只选叶子 | 父节点不可选 |
| `disabled` / `static` | 状态 | FormItem 统一 |
| `virtualThreshold` / `itemHeight` | 虚拟列表 | 不要与懒加载混为一谈 |

### 3.3 事件

- 文档目标：`change`、`addConfirm`、`editConfirm`、`deleteConfirm`、`deferLoadFinished`、`itemClick`、`staticItemClick` 等。
- **当前实现**：`deferLoadFinished`；自定义 `addControls` / `editControls` 弹层路径可派发 `addConfirm` / `editConfirm`；**内联 CUD 和节点选择未派发 `change`/`deleteConfirm`**。
- 不能按在线事件表声称全部已支持；补事件前先定 payload/preventDefault。

### 3.4 动作

文档目标：`expand` / `collapse` / `add` / `edit` / `delete` / `reload` / `clear` / `reset` / `setValue` / `search`。

当前 `useTreeField` 未注册 scoped API/动作处理；TreeSelect 同。不要把动作表当已实现。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputTree.vue`](../../../packages/vamis/src/renderers/form/InputTree.vue) | FormItem 壳 + TreeSearchBox + TreeBranch；仅 64 行 |
| [`useTreeField.ts`](../../../packages/vamis/src/renderers/form/useTreeField.ts) | 值/树/搜索/懒加载/CUD/展开/勾选语义 |
| [`TreeBranch.vue`](../../../packages/vamis/src/renderers/form/TreeBranch.vue) | 递归节点、checkbox/radio、增删改内联 UI、缩进/展开线 |
| [`TreeSelect.vue`](../../../packages/vamis/src/renderers/form/TreeSelect.vue) | 复用 useTreeField 的弹层树 |
| [`tree.ts`](../../../packages/vamis-core/src/utils/tree.ts) | `toggleTreeSelection` / `isTreeItemChecked` / defer 合并等纯函数 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | tree 节点/缩进/展开线/搜索框 token |

### 4.2 状态

```text
options/source ──normalize──> options/tree
        │                         │
        ├─ query / searchApi ───> filteredOptions
        ├─ expanded Map ────────> isExpanded
        ├─ deferring Set ──────> isDeferring / deferLoad
        └─ selected ───────────> checked/partial/checkDisabled

selected: parseJoined(fieldApi.getValue(name)) ↔ dumpJoined(values)
```

- `selected` 是唯一值入口；`toggle` / `applyToggle` 都走 `toggleTreeSelection`。
- `localOptions` 覆盖 options（本地 CUD）；`remoteFiltered` 只覆盖展示，不改本地树。
- `expanded` 以 OptionItem 对象为 key；`seedExpanded` 在 options/CUD 后重建。
- `deferring` 防止重复请求；懒加载失败不写入。

### 4.3 勾选语义

`toggleTreeSelection(current, item, opts)` 负责：

- `onlyLeaf`：父节点不可选；
- `autoCheckChildren`：切父节点是否带上子；
- `cascade`：是否父子联动；
- `withChildren` / `onlyChildren`：写值是否含父/只写子；
- `autoCancelParent`：全选后再取消子节点是否清父。

任何新入口（如搜索全选、工具栏全选、动作）都必须复用这一函数，不能手写数组过滤。

## 5. 样式与边界

- 默认类：`.vamis-input-tree__control`、tree 节点/缩进/展开线/搜索框等，位于 `@vamis/ui/styles.css`。
- 渲染器无 `<style>`；缩进/图标/展开线/选中态走 token。
- 窄屏、深色、虚拟列表、搜索 sticky 需单独核。
- 作者 className 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已对齐：多选/单选、父子勾选（含 cascade/with/only/autoCancel）、搜索、懒加载、内联 CUD、`addControls`/`editControls` 弹层、路径模式、自定义渲染、工具栏、虚拟列表、TreeSelect 复用。
- 未接/风险：
  - `change` 事件未派发；内联 CUD 的 add/edit/delete 事件不一致；
  - scoped 动作（expand/collapse/add/edit/delete/reload/clear/reset/setValue/search）未注册；
  - 树级全选/搜索全选的 `change` 语义未定；
  - 深色/窄屏/虚拟列表组合未专项核。
- 对照：TODO 记录 input-tree 桌面/移动；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis useTreeField / TreeBranch / tree.ts 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前明确不完整）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（tree 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-tree` 桌面
- [ ] `pnpm compare --page input-tree --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 勾选矩阵：autoCheckChildren × cascade × onlyLeaf × with/only × autoCancelParent
- 懒加载/CUD 后展开与选择不丢
- 搜索后全选范围
- 事件/动作缺口不要误标
- TreeSelect 同步

## 8. 后续

1. 先补 `change` 与内联 CUD 的 `addConfirm`/`editConfirm`/`deleteConfirm`，统一 payload/preventDefault。
2. 再注册 scoped 动作（expand/collapse/reload/clear/setValue/search），add/edit/delete 另定边界。
3. 虚拟列表 + 懒加载 + 深色组合单独立项。
4. TreeSelect 与本组件共用测试矩阵，避免两套勾选语义。

---

返回 [组件设计索引](README.md)
