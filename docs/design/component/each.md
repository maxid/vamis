# Each 循环渲染 · `each` 设计

> 状态：**进行中 90%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/each) · Amis：`/zh-CN/components/each`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Each 是**数组循环渲染**：value > source > name 取列表，items 拆开渲染，每项 extra-data，空数组占位。主路径成熟；缺口 themeCss。

## 1. 边界与优先级（先读）

1. **列表来源**：value > source > name；空/非数组兜底。
2. **items**：数组拆开；单个 schema 渲染一次；每项 `eachItemNodes`/`eachRowData`。
3. **占位**：空数组显示 placeholder（默认“暂无数据”）。
4. **嵌套**：Each 可嵌套；extra-data 是当前项，不污染父域。
5. **包边界**：无 `<style>`、无 fetch；each token。

### 边界用例

- 空/单/多/非数组/value-source-name 优先级
- items 单/多、对象项/标量项、嵌套 each
- 占位/窄屏/深色

### 优先级

1. 来源/items；2. 行数据/占位；3. 嵌套/响应式；4. themeCss。

## 2. 复杂度

- 等级：**M 中**（Amis 193 行；Vamis 43 行）；依赖 tpl/container。
- 风险：来源优先级/items 拆开。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/source/name | 列表 | 已接 |
| items | 子 schema | 已接 |
| placeholder | 空态 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`Each.vue`](../../../packages/vamis/src/renderers/Each.vue)：list/items/rowData。
- [`each.ts`](../../../packages/vamis-core/src/utils/each.ts)：list/item nodes/row data。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：子项。

## 5. 样式

- each/占位 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss/深色；其余主路径已对齐。

## 7. 验收

- 来源/items/空/嵌套/优先级/窄屏；未接不误标。

## 8. 后续

themeCss 随主题批次补；不扩循环语义。

---

返回 [组件设计索引](README.md)
