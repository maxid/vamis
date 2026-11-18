# InputTable 表格输入 · `input-table` 设计

> 状态：**进行中 45%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-table) · Amis：`/zh-CN/components/form/input-table`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputTable 当前是**最小行内编辑表格**（68 行）：用 UI Table 手画列、NestedFormScope 行作用域、增删行；没有子 api、确认模式、分页、过滤/排序、拖拽、树、校验汇总、事件/动作。45% 是真实缺口，不是样式差异。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：字段值是对象数组；无 name 不写；空数组用 `[{}]` 占位；增删/编辑都走同一 persist。
2. **行作用域**：每行 `NestedFormScope` 提供行数据；列子项 `name` 是行内字段；表单路径/校验不能把行内字段写到顶层。
3. **列 schema**：`columns` / `items` 只取列定义，`label: false` 用于单元格；不要直接把完整 schema 塞给单元格。
4. **校验**：行内字段的 required/validations 归属 FormItem/表单；InputTable 不能只写值不触发校验。
5. **当前无 API/事件/动作**：`addApi/updateApi/deleteApi`、needConfirm、change/add/delete/edit 事件、addItem/deleteItem/setValue 动作均未接；不要按在线文档宣称可用。
6. **包边界**：无 `<style>`、无直接 fetch；表格/按钮样式走 `@vamis/ui` token。

### 1.2 边界用例

- 空值 / 空数组 / `[{}]` / 多行
- 无 name、路径 name、嵌套 Form
- 列 input-text/select/number/checkbox 等；列 disabled/static
- 增行/删行到只剩一行
- 行内校验失败
- 父级值外部 setValue/reset 后行同步
- 非对象行、重复主键（当前无主键概念）
- 窄屏横向滚动/深色
- 未接：needConfirm、子 api、分页、过滤排序、拖拽、树

### 1.3 优先级

1. 值/行作用域/增删
2. 行内校验
3. 子 api/确认模式
4. 分页/过滤/排序/拖拽/树
5. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis 2412 行；Vamis 68 行）
- 依赖：`form`、`table`、`action`、`input-text`、`select`、`checkbox`
- 风险：当前只有基座；Amis 文档大量能力未接

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'input-table'`
- Amis 渲染器：`packages/amis/src/renderers/Form/InputTable.tsx`
- 在线文档：[Vamis `/components/form/input-table`](/components/form/input-table)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `columns` / `items` | 列 | 已接基础 |
| `name` / `value` | 字段值 | 已接（对象数组） |
| `addable` / `removable` | 增删 | 基础按钮；文案/位置未完全接 |
| `needConfirm` | 编辑确认 | 未接 |
| `addApi` / `updateApi` / `deleteApi` | 行级 API | 未接 |
| `perPage` / 分页 | 分页 | 未接 |
| `filter` / 排序 | 前端过滤排序 | 未接 |
| `draggable` | 拖拽 | 未接 |
| `tree` / `childrenColumnName` | 树 | 未接 |
| `showIndex` / `showFooter` | 序号/底栏 | 未接 |
| `minLength` / `maxLength` | 行数限制 | 未接 |
| `copyable` / 复制行 | 复制 | 未接 |

### 3.3 事件/动作

目标事件：`add`、`addConfirm`、`addSuccess`、`addFail`、`edit*`、`delete*`、`change`、`orderChange`、`rowClick` 等；目标动作：`addItem`、`deleteItem`、`setValue`、`clear`、`reset`、`initDrag`、`cancelDrag`。

**当前均未接**（没有 createVamisEvent/runOnEvent/scoped API）。实现前先定 payload（index/indexPath/item/value）与 preventDefault。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputTable.vue`](../../../../packages/vamis/src/renderers/form/InputTable.vue) | 行数组/增删/表格渲染/行作用域 |
| [`NestedFormScope.vue`](../../../../packages/vamis/src/NestedFormScope.vue) | 行作用域/persist |
| [`input-table.ts`](https://github.com/baidu/amis) | Amis 目标工具；Vamis 目前无独立 helper |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | 表格/按钮 token |

### 4.2 状态

```text
field value ──> rows：array 或 [{}]
rows ──add/remove/persistCurrent──> fieldApi.setValue(name, next)
每行 NestedFormScope(row) → SchemaRenderer(cellSchema)
```

- 行用 index 作 key；没有业务主键/行 id。
- 单元格 schema 只 `{...col,label:false}`，不继承 quickEdit 等。
- 没有本地草稿/未保存状态；编辑即写值。

### 4.3 关键缺口设计

- **行身份**：子 api/选择/拖拽前必须先有稳定 key（id 或索引路径）。
- **needConfirm**：行编辑草稿 + 确认/取消；不能边输入边写正式值。
- **子 api**：行级 add/update/delete 的 loading/error/回滚；与表单整体提交分开。
- **分页/过滤/排序/拖拽/树**：应复用 Table 能力或抽取，不要在手写 Table 上继续堆。
- **事件/动作**：先定 payload 与 scoped API，再实现。

## 5. 样式与边界

- 当前使用 UI Table 基础网格；无专属 input-table 皮肤类。
- 增删按钮/表格 token；无 `<style>`。
- 窄屏横向滚动、深色、空态需专项。
- 作者 className 只落节点。

## 6. 当前状态与缺口

- 已接：行内编辑、增删行、FormItem 壳、行作用域、基础列。
- 未接：子 api/needConfirm/分页/过滤排序/拖拽/树/校验汇总/事件/动作/行身份。
- 对照：TODO 45% 记录“能行内编辑；子 api、增删校验未齐”；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputTable / NestedFormScope 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前未接）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputTable 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-table` 桌面
- [ ] `pnpm compare --page input-table --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 值/行作用域/增删
- 行内校验
- 空数组占位与外部 setValue
- 未接能力不要误标

## 8. 后续

1. 先定行身份（id/路径）与 needConfirm 草稿模型。
2. 再抽子 api 的 loading/error/回滚。
3. 分页/过滤/排序/拖拽/树优先复用 Table，不在 68 行基座上重写。
4. 最后补事件/动作与窄屏/深色。

---

返回 [组件设计索引](../README.md)
