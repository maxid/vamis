# InputGroup 输入框组合 · `input-group` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-group) · Amis：`/zh-CN/components/form/input-group`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputGroup 当前是**横向并排 schema 容器**（30 行）：body/controls 子项 flex 均分、圆角外框，非 action 子项强制 `label:false`。没有分组边框模式、按钮拼接、响应式换行、校验聚合、事件/动作。

## 1. 边界与优先级（先读）

1. **子 schema**：body/controls；字符串节点转 tpl；action/button/submit/reset 保留 label，其他强制 label:false。
2. **布局**：flex 均分、右侧分隔线、外框圆角；子项 min-w-0。
3. **宽度**：默认吃满；不要给 InputGroup 写死 width。
4. **校验**：子项仍走各自 FormItem/校验；InputGroup 不另建错误。
5. **包边界**：无 `<style>`、无 fetch；边框/圆角 token。

### 边界用例

- 空 body/单子项/多子项/字符串节点/action 子项
- 子项可见性/禁用/校验错误
- 窄屏是否换行（当前 flex 不换行）
- 深色/边框/圆角

### 优先级

1. 子 schema/布局；2. 校验/禁用；3. 响应式/拼接模式；4. 事件动作。

## 2. 复杂度

- 等级：**M 中**（Amis 297 行；Vamis 30 行）；依赖 `container`、`input-text`。
- 风险：窄屏 flex 溢出、子项 label 处理。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `body` / `controls` | 子项 | 已接 |
| 均分/边框/圆角 | 布局 | 已接 |
| 响应式换行 | 目标 | 未接 |
| 分组拼接模式 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/InputGroup.vue`](../../../packages/vamis/src/renderers/form/InputGroup.vue)：body 映射 + flex 容器。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验外壳。

### 数据流

```text
schema.body → 映射(label:false/字符串 tpl) → flex 子项
子项 SchemaRenderer 各自读写字段
```

## 5. 样式

- flex + border + rounded；无专属类、无 `<style>`。
- 窄屏不换行会挤压；深色边框单独核。

## 6. 缺口

响应式换行/拼接模式/校验聚合/事件动作/窄屏深色。

## 7. 验收

- 子项/布局/禁用/校验错误/窄屏；未接不误标。

## 8. 后续

先做窄屏换行/宽度策略，再评估拼接模式；校验仍归子项。

---

返回 [组件设计索引](README.md)
