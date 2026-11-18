# MatrixCheckboxes 矩阵勾选 · `matrix-checkboxes` 设计

> 状态：**进行中 40%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/matrix-checkboxes) · Amis：`/zh-CN/components/form/matrix-checkboxes`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

MatrixCheckboxes 当前是**二维勾选表格**（54 行）：rows × columns，每格 Checkbox，值写成 `rowValue-colValue` 字符串数组。它是精简实现：没有行/列选择、全选、单列/单行互斥、禁用表达式、远程 rows/columns、事件/动作。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值格式**：值是 `["row-col", ...]` 字符串数组；`key(row,col)` 是唯一约定，不能改成对象数组而不迁移。
2. **行列来源**：`schema.rows` / `schema.columns` 经 normalizeOptions；label/value 缺省要兜底，空行列不崩。
3. **勾选写回**：`selected` getter 只接受数组并 String 化；toggle 增删同一 key；无 name 不写。
4. **禁用**：当前仅整体 disabled；单格 `disabled` 表达式/行禁用未接。
5. **校验**：矩阵必选/最值校验未接；不要假设 FormItem 会自动处理。
6. **包边界**：无 `<style>`、无 fetch；表格/勾选走 token。

### 1.2 边界用例

- 空 rows / 空 columns / 单行单列
- value 非数组 / number key / 重复 key
- 全选/清空（未接）
- 单行/单列互斥（未接）
- 禁用行/列（未接）
- 行/列 label 模板、空 label
- 窄屏横向滚动、深色

### 1.3 优先级

1. 值格式/行列映射
2. toggle/空数据
3. 禁用/校验
4. 全选/互斥/远程
5. 事件/动作/样式

## 2. 复杂度

- 等级：**L 重**（Amis `Form/MatrixCheckboxes.tsx` 587 行；Vamis 54 行）
- 依赖：`FormItem`、`Options`、`checkbox`
- 风险：Amis 功能多，当前仅基础勾选

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'matrix-checkboxes'`
- Amis 渲染器：`packages/amis/src/renderers/Form/MatrixCheckboxes.tsx`
- 在线文档：[Vamis `/components/form/matrix-checkboxes`](/components/form/matrix-checkboxes)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `rows` / `columns` | 行列 | 已接基础 |
| `name` / `value` | 值 | 已接 `row-col` 数组 |
| `multiple` / 单选 | 行列选择 | 未接 |
| `selectAll` / 全选 | 全选 | 未接 |
| `disabled` / `disabledOn` | 禁用 | 仅整体 |
| `labelField` / `valueField` | 映射 | normalizeOptions 默认 |
| 行/列必选校验 | 校验 | 未接 |
| 事件/动作 | 目标 | 未接 |

### 3.3 事件/动作

当前无事件/动作；不要按 Checkboxes 的 change 事件套用。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`MatrixCheckboxes.vue`](../../../packages/vamis/src/renderers/form/MatrixCheckboxes.vue) | 行列表格、勾选、值写回 |
| [`options.ts`](../../../packages/vamis-core/src/utils/options.ts) | normalizeOptions |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | matrix/checkbox token |

### 4.2 状态

```text
rows/columns ──normalizeOptions──> options
selected: string[]（row-col）
toggle → selected setValue
```

- 无本地草稿；勾选即写值。
- 无行/列全选/互斥；扩展前先定值格式（是否保留 row-col）。
- 当前没有 scoped API。

## 5. 样式与边界

- 默认类：`.vamis-matrix`；表格边框/单元格 padding 走 token。
- 窄屏横向滚动；深色勾选/表头单独核。
- 无 `<style>`。

## 6. 当前状态与缺口

- 已接：rows/columns、二维 Checkbox、`row-col` 值、整体 disabled。
- 未接：全选/单行单列/单选、disabledOn、远程行列、校验、事件/动作、窄屏深色。
- 对照：TODO 40%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Matrix / options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Matrix 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page matrix-checkboxes` 桌面
- [ ] `pnpm compare --page matrix-checkboxes --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 先补全选/单行单列/单选与 disabledOn。
2. 再定校验与事件/动作。
3. 远程行列/深色窄屏后置。

---

返回 [组件设计索引](README.md)
