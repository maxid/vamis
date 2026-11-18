# InputCity 城市选择器 · `input-city` 设计

> 状态：**进行中 25%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-city) · Amis：`/zh-CN/components/form/input-city`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputCity 当前是**内置 3 省示例**（50 行）：省/市两级 Select，值默认 `省,市` 字符串。它不是全国数据，也没有区县、搜索、远程数据、extractValue 对象模式完整支持；25% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值格式**：默认写 `province,city` 字符串；`extractValue: false` 写 `{province, city}`。改格式要迁移。
2. **城市数据**：当前 `CITIES` 硬编码 3 省；不能当全国数据源。区县/远程 source 未接。
3. **联动**：切换省必须清空市；市选项只来自当前省。
4. **包边界**：无 `<style>`、无 fetch；Select/token 由 UI 提供。

### 边界用例

- 空值 / 对象值 / 逗号字符串 / 非法省；切换省清市；extractValue 两种；disabled；窄屏/深色；全国数据/区县/远程（未接）。

### 优先级

1. 值格式/联动；2. 数据源；3. 区县/搜索；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 633 行；Vamis 50 行）；依赖 `FormItem`、`select`。
- 风险：硬编码示例容易被误当真实能力。

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 省市值 | 已接 |
| `extractValue` | 对象/字符串 | 部分接 |
| `provinceField` / `cityField` | 字段名 | 未接 |
| 全国数据/区县 | 数据 | 未接（3 省示例） |
| `source` / 远程 | 数据源 | 未接 |
| 搜索 | 搜索 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`InputCity.vue`](../../../packages/vamis/src/renderers/form/InputCity.vue)：CITIES 示例、province/city 计算属性、两级 Select。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。
- 全国数据应独立数据模块，不塞进 Vue 文件。

## 5. 缺口

全国数据/区县/远程/搜索/事件动作/深色窄屏；文档必须标“示例数据”。

## 6. 验收

- 值格式/切换省清市/extractValue；示例数据边界；窄屏深色。
- 不要用 3 省数据声称全国支持。

## 7. 后续

先抽城市数据源接口，再决定内置全国数据还是远程 source；区县/搜索后置。

---

返回 [组件设计索引](README.md)
