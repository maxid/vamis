# JsonSchema Editor · `json-schema-editor` 设计

> 状态：**进行中 30%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/json-schema-editor) · Amis：`/zh-CN/components/form/json-schema-editor`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

JsonSchemaEditor **没有独立渲染器**：`extras/rest.ts` 把 `json-schema-editor` 作为 `json-schema` 的别名。它不提供 schema 结构化编辑器/JSON 编辑器，只是 JsonSchema 顶层字段渲染；30% 是“别名 + 精简”。

## 1. 边界与优先级（先读）

1. **别名**：json-schema-editor → JsonSchema；改行为只改 JsonSchema。
2. **值/类型**：与 JsonSchema 相同，仅顶层 string/number/boolean。
3. **无 schema 编辑**：不要按属性增删/嵌套/oneOf 验收。
4. **事件/动作**：未接。
5. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空 schema/顶层属性/对象/数组/嵌套
- 外部 setValue/disabled
- schema 编辑能力（非目标）
- 窄屏/深色

## 2. 复杂度

- 等级：**M 中**（Amis 156 行；Vamis 复用 JsonSchema 43 行）；依赖 JsonSchema、form、action。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| schema/jsonSchema | 输入 schema | 继承 |
| properties 顶层字段 | 渲染 | 继承 |
| schema 编辑器 | 目标 | 非目标 |
| 事件动作 | 目标 | 未接 |

## 4. 架构

- [`extras/rest.ts`](../../../packages/vamis/src/extras/rest.ts)：alias 注册。
- [`json-schema`](json-schema.md)：全部行为。

## 5. 缺口

与 JsonSchema 相同：object/array/enum/format/required/嵌套/事件动作；无 schema 编辑 UI。

## 6. 验收

- 确认走 JsonSchema；顶层字段/disabled/窄屏；不要测 schema 编辑。

## 7. 后续

随 JsonSchema 补类型/校验；若需要 schema 编辑器，单独立项。

---

返回 [组件设计索引](README.md)
