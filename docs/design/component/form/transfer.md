# Transfer 穿梭器 · `transfer` 设计

> 状态：**进行中 86%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/transfer) · Amis：`/zh-CN/components/form/transfer`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Transfer 是“左右两栏 + 多选值”的 Options 控件。当前实现已经覆盖 list/table/tree/chained/associated、搜索、远程 source、树展开、三模式虚拟窗口、`change` / `selectAll` 事件和五项 scoped 动作；尚未覆盖分页、排序、拖拽和移动端专用布局。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：Transfer 天然多选；`joinValues` 时写 `delimiter` 拼接字符串，否则写数组；`delimiter` / `valueField` / `labelField` 决定值与展示。
2. **左右栏派生**：`left = options - selected`，`right = options ∩ selected`；不要维护两份独立数组，否则值/选项变化会分叉。
3. **树模式**：`mode: tree` 由原始 `children` 建树；父节点只展开/收起，叶子才可选；右栏仍是扁平已选。
4. **级联 / 关联**：chained 复用 SelectChainedPane；associated 复用 SelectAssociatedPane。`selectMode` 是 Amis 主字段，`mode` 只作兼容别名。
5. **搜索**：左右搜索只过滤展示，不改变 selected；清空搜索是 UI 动作，不清值。
6. **远程 source**：变量或 API 结果归一为 `rawOptions`；失败保留空，不清空已选。source 信封 `options[0].leftOptions / children / leftDefaultValue` 要还原为 associated 输入。
7. **值写回**：统一 `fieldApi.setValue(name, dumpJoined(...))`；无 name 不写。
8. **包边界**：无 `<style>`、无直接 fetch（`requestApi` 除外）；默认皮肤走 token。

### 1.2 边界用例

- 空值 / 单选值（历史数据）/ 数组值
- `joinValues` / `delimiter` / `valueField` / `labelField`
- 选项重复 / 禁用项 / 无 value 的分组节点
- list / table / tree / chained / associated 五种 selectMode
- tree 多层 children、父节点不可选、展开/收起、搜索保留分支
- chained 父节点只展开、associated ref 左栏与 children 右栏、source 信封
- 左右搜索、`searchPlaceholder`、`leftTitle` / `rightTitle`
- 远程/变量 source、失败、data 变化重载
- disabled / static / FormItem 错误态
- 窄屏双栏换行、深色

### 1.3 优先级

1. 值形态与左右栏派生
2. 树模式与搜索
3. 远程 source / 重载
4. 事件/动作（已接，后续只跟 Amis 增量）
5. 级联 / 关联复用共享 pane
6. 样式/窄屏/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/Transfer.tsx` 773 行；Vamis 约 815 行）
- 依赖：`FormItem`、`Options`、`table`/`button` 样式
- 风险：实现行数少但与 Options 值/选项/树共享语义；事件/动作缺口比 UI 更明显

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'transfer'`
- Amis 渲染器：`packages/amis/src/renderers/Form/Transfer.tsx`
- 在线文档：[Vamis `/components/form/transfer`](/components/form/transfer)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `options` | 静态选项 | 支持 children；组节点无 value |
| `source` | 远程/变量选项 | `${...}` 或 API；失败保留空 |
| `joinValues` / `delimiter` | 值形态 | 字符串 vs 数组 |
| `valueField` / `labelField` | 映射 | 左右栏/值都用同一字段 |
| `selectMode` / `mode` | list / table / tree / chained / associated | Amis 主字段 `selectMode`，`mode` 兼容 |
| `leftOptions` / `leftDefaultValue` / `leftMode` / `rightMode` | associated | 左栏 list/tree，右栏 list/table/tree/chained；source 信封也支持 |
| `searchable` / `searchPlaceholder` | 搜索 | 左右独立 query |
| `leftTitle` / `rightTitle` | 栏标题 | 展示，不参与值 |
| `disabled` / `static` / `readOnly` | 状态 | 由 FormItem/控件统一 |
| `perPage` / 分页 | **文档有、实现无** | 不要按已支持写验收 |
| `resetValue` | reset 值 | 与 clear 区分 |
| `virtualThreshold` | 默认 100；list / table / tree 窗口阈值 | tree 同阈值，但行高规则不同 |
| `itemHeight` | 默认 38；list / table 虚拟行高 | Amis Transfer tree 不消费 `itemHeight`，tree 固定按 Tree 的 32px |

### 3.3 事件/动作

- 已接：`change`（写值前派发，可 `preventDefault`）与 `selectAll`（用户全选前派发，`items` 为全部 options）。
- 已接 scoped 动作：`clear`、`reset`、`clearSearch`、`selectAll`、`setValue`，并补 `reload`。
- `clear` / `reset` / `setValue` 的动作路径复用 change 提交链；组件级内置 `setValue` 经 `setData` 直接写值。`clearSearch` 支持 `{left,right}` 独立清空，`selectAll` 动作只写值，不伪造 UI 的 `selectAll` 事件。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Transfer.vue`](../../../../packages/vamis/src/renderers/form/Transfer.vue) | 左右栏、五种模式分派、搜索、远程 source、值序列化、事件/动作 |
| [`SelectChainedPane.vue`](../../../../packages/vamis/src/renderers/form/select/SelectChainedPane.vue) | chained / associated rightMode=chained 共用级联 pane |
| [`SelectAssociatedPane.vue`](../../../../packages/vamis/src/renderers/form/select/SelectAssociatedPane.vue) | associated 左栏 / 右栏与 source 信封复用 |
| [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts) | option 归一/相等判断/selected 派生 |
| [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | transfer 栏/列表/表格/树 token |

### 4.2 状态

```text
rawOptions ── normalize/flatten ──> options
        │                            │
        ├─ selected（派生，只读） ──┤
        ├─ displayRawOptions（associated 解信封） │
        ├─ left = options - selected │
        ├─ right = options ∩ selected│
        └─ leftShown/rightShown（query 过滤）

treeRows: 原始 children 建树；expandedTree 控制显隐
```

- `selected` 只从 `currentValue()` 派生；add/remove/addAll/clear 统一走 `commitSelected` / `commitRaw`。
- 每次写值前先派发 `change`，`preventDefault` 后不落值；pristine 在挂载时快照，供 `reset` 使用。
- `left/right` 每次都从 options+selected 派生，不要缓存两份数组。
- 树节点 key 用索引路径；父节点无 value 只展开。
- chained / associated 的选择状态由共享 pane 维护；父层只接 `pick` / `toggle` / `update:nodes` 并写回统一 `selected`。

### 4.3 交互

- 点击左项 → `add`；右项 → `remove`；全选 → `addAll`（仅叶子/有 value 的选项）。
- 用户全选先派发 `selectAll`，再走 `change`；组件动作 `selectAll` 直接提交 change，对齐 Amis `Transfer.selectAll()`。
- tree：父节点 toggle 展开，叶子 add；搜索时保留匹配分支。
- chained：父节点只展开，叶子 add；全选只收叶子。
- associated：左栏只决定 ref 分支，右栏叶子写入值；source 信封解出 leftOptions / children / leftDefaultValue。
- chained / associated 使用 Amis 双栏等宽布局：不渲染中间移动按钮列，左栏标题带“全选”，右栏标题带“清空”。
- source 变化：`loadSource` 重载 remoteOptions；data 变化按 isApiOutdated 重载。
- 当前没有确认/取消态，所有操作立即写值。

## 5. 样式与边界

- 默认类：`.vamis-transfer__list`、`__search` 等（以 `styles.css` 为准）；无 `<style>`。
- 搜索框/双栏/表格/树缩进走 token；深色只替换 token。
- 窄屏双栏可能换行；不做移动端专用弹层（当前未实现）。
- 作者 className 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已对齐：list/table/tree/chained/associated、搜索、remote/变量 source、left/right title、tree 展开、值序列化、三模式虚拟窗口、`change` / `selectAll`、五项 scoped 动作。
- tree 行高按 Amis Tree 实测 32px，虚拟窗口与上下 spacer 不再使用 list/table 的 38px `itemHeight`。
- chained 与 associated 已接共享 Select pane；source 信封和 leftDefaultValue 已按 Amis 还原。
- paired 模式不再被中间按钮列压窄，选择面与结果面等宽；全选 / 清空落在各自标题行。
- 未接：分页、排序、拖拽、移动端专用布局。
- 对照：桌面 / 移动 **8/11**（P0 0，余 3 条均为 Amis 侧 `rendered:false` 探针）。

## 7. 验收计划与完成度

### 验收清单（文档核对：8 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Transfer / options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [x] selectMode 五种模式分派与 source 信封
- [x] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [x] `pnpm test`（Transfer 相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page transfer` 桌面
- [x] `pnpm compare --page transfer --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- joinValues/delimiter 值形态
- 左右栏派生与全选
- tree 父节点只展开
- source 重载不丢选择
- 事件/动作已接，后续不要退回直接写值
- chained / associated 不复制 pane，不维护第二套选择状态

## 8. 后续

1. 分页、排序、拖拽单独立项，先按 Amis 源码确认哪些 mode 实际消费。
2. 移动端专用布局与深色 / 375px 回归。
3. Picker 的 pickerSchema / CRUD 链路单独审。

---

返回 [组件设计索引](../README.md)
