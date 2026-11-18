# NestedSelect 级联选择 · `nested-select` 设计

> 状态：**进行中 45%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/nested-select) · Amis：`/zh-CN/components/form/nested-select`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

NestedSelect 当前是**多列级联菜单**（71 行）：tree options → 逐列推进，叶子写值、父节点展开。它与 `cascader-select` 目标语义接近，但当前没有搜索/远程 source/多选/路径值/点击外部关闭/键盘，弹层也没有复用 VamisOverlay。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：当前只写叶子 value（string，joinValues true）；父路径不写入；多选/onlyChildren 未接。
2. **列状态**：`stack` 与 `path` 必须同步；选父节点只推列、不写值；选叶子关闭并写值。
3. **标签**：有 path 显示 path 拼接，否则显示 value/placeholder；不要用 label 反查值（options 可能异步）。
4. **弹层**：当前是自身 menu，不是 VamisOverlay；点击外部/滚动/窄屏/层级未统一。
5. **选项**：`normalizeOptions`；children 递归；空 children/重复 value 要兜底。
6. **包边界**：无 `<style>`、无 fetch；菜单/按钮走 token。

### 1.2 边界用例

- 单层 options / 多层 children / 空 children
- 空值 / 父节点值 / 叶子值 / 重复 value
- 点击父节点推进/回退；选叶子关闭
- 点击外部关闭（当前未接）
- 多选/路径/onlyChildren（未接）
- 远程/变量 options、失败
- 弹层层级/窄屏/深色

### 1.3 优先级

1. 值/列状态/标签
2. 弹层打开关闭
3. 远程/多选/路径
4. 键盘/可访问性
5. 样式/窄屏/深色

## 2. 复杂度

- 等级：**L 重**（Amis `Form/NestedSelect.tsx` 1120 行；Vamis 71 行）
- 依赖：`FormItem`、`Options`、`popover`/`button`
- 风险：当前是精简级联；Amis 能力多未接

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'nested-select'`
- Amis 渲染器：`packages/amis/src/renderers/Form/NestedSelect.tsx`
- 在线文档：[Vamis `/components/form/nested-select`](/components/form/nested-select)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `options` / `source` | 选项 | options 已接；source 未接 |
| `name` / `value` | 值 | 已接叶子值 |
| `multiple` / `joinValues` / `delimiter` | 多选 | 未接（当前单选） |
| `onlyChildren` / `withChildren` | 父值 | 未接 |
| `labelField` / `valueField` | 映射 | normalizeOptions 默认 |
| `searchable` / `searchApi` | 搜索 | 未接 |
| `autoClose` / 外部点击 | 关闭 | 未接 |
| `cascaderSelect` 别名 | 注册 | 未注册 |
| 事件/动作 | 目标 | 未接 |

### 3.3 事件/动作

当前无独立事件/动作；不要按 Select 的事件表套用。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`NestedSelect.vue`](../../../packages/vamis/src/renderers/form/NestedSelect.vue) | 级联列/选择/标签/打开关闭 |
| [`options.ts`](../../../packages/vamis-core/src/utils/options.ts) | normalizeOptions/parse/dump |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | nested-select menu/column/option token |

### 4.2 状态

```text
options tree ──> columns = [tree, ...stack]
path：当前已展开的父节点
selected：叶子值数组（当前单选）
pick(parent) → push children
pick(leaf) → selected=[value] + close
```

- `isActive` 用 path[depth] 或 selected[0] 比较 value。
- 无滚动/键盘/外部点击；关闭只靠再点按钮或选叶子。
- 无数据域缓存/远程；options 重算即重渲染。

## 5. 样式与边界

- 默认类：`.vamis-nested-select__menu`、`__col`、`__option`、`__hint`。
- 列宽/菜单层级/激活态走 token；无 `<style>`。
- 窄屏多列横向溢出；深色菜单/激活态单独核。

## 6. 当前状态与缺口

- 已接：options 树、逐列推进、叶子写值、label/path、打开关闭按钮。
- 未接：source/搜索、多选/onlyChildren/withChildren、外部点击关闭、cascader-select 别名、事件/动作、键盘/无障碍。
- 对照：TODO 45%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis NestedSelect / options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（NestedSelect 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page nested-select` 桌面
- [ ] `pnpm compare --page nested-select --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 先补外部点击关闭与键盘导航（不改值模型）。
2. 再补多选/onlyChildren/withChildren（需定值格式）。
3. source/搜索/cascader-select 别名最后评估。

---

返回 [组件设计索引](README.md)
