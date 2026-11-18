# JsonSchema 表单 · `json-schema` 设计

> 状态：**进行中 30%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/json-schema) · Amis：`/zh-CN/components/form/json-schema`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

JsonSchema 当前是**顶层属性精简渲染**（43 行）：只读 `schema.properties` 的 string/number/boolean，值写对象。没有嵌套/object/array/required/enum/oneOf/format、校验、事件/动作；30% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：对象；每个字段写回整个对象；无 name 不写。
2. **schema 来源**：`schema` / `jsonSchema` 二选一；properties 缺失显示空，不崩。
3. **类型**：当前 string/number/boolean；object/array/enum/format 未接。
4. **校验**：required/type 校验未接；不要声称自动。
5. **包边界**：无 `<style>`、无 fetch；Input/Switch token。

### 边界用例

- 空 properties/string/number/boolean/对象/数组
- 外部 setValue/reset/字段缺省
- required/enum/format（未接）
- disabled/static、FormItem 错误
- 窄屏/深色

### 优先级

1. 值/顶层属性；2. 类型覆盖；3. 嵌套/校验；4. 事件动作/样式。

## 2. 复杂度

- 等级：**L 重**（Amis 77 行 + JSON Schema 语义；Vamis 43 行）；依赖 `FormItem`、input/switch/select。
- 风险：JSON Schema 语义远大于当前实现。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `schema` / `jsonSchema` | JSON Schema | 已接 properties |
| `name` / `value` | 对象值 | 已接 |
| string/number/boolean | 基础类型 | 已接 |
| object/array/enum/format | 类型 | 未接 |
| required/校验 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/JsonSchema.vue`](../../../packages/vamis/src/renderers/form/JsonSchema.vue)：fields + Input/Switch。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。
- 无 scoped API。

### 数据流

```text
jsonSchema.properties → fields[{name,label,kind}]
字段输入 → {...currentObject,[name]:value} → setValue
```

## 5. 样式

- label + 控件；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

object/array/enum/format、required/校验、嵌套、事件动作、深色。

## 7. 验收

- 顶层 string/number/boolean/空 schema/disabled；未接不误标。

## 8. 后续

先抽 JSON Schema 类型映射，再补 object/array/required；完整支持前保持“精简”标注。

---

返回 [组件设计索引](README.md)
