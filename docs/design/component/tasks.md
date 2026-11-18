# Tasks 任务操作 · `tasks` 设计

> 状态：**进行中 45%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/tasks) · Amis：`/zh-CN/components/tasks`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Tasks 当前是**任务表格展示**（179 行）：items status 0–5、列名、就绪/重试按钮、状态 Badge；没有 checkApi 轮询、submitApi、按钮动作/loading；45% 是真实缺口。

## 1. 边界与优先级（先读）

1. **items**：taskItems；status 0–5 映射文案/Badge；空不崩。
2. **按钮**：canRetry → 重试；status≠2 → 上线/操作；canOperate 控制 disabled；当前按钮无 onClick/API。
3. **列名**：name/status/remark/operation 可配置。
4. **无轮询/提交**：checkApi 轮询/submitApi 未接；不要按自动推进验收。
5. **包边界**：无 `<style>`、无 fetch；tasks table/badge token。

### 边界用例

- 空/多任务/status 0–5/未知
- canRetry/canOperate/disabled
- 列名/remark/窄屏/深色
- checkApi/submitApi（未接）

### 优先级

1. items/status；2. 按钮/列；3. 轮询/提交；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 480 行；Vamis 179 行）；依赖 action/progress/status。
- 风险：当前仅展示，操作/轮询未接。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| items/status | 任务 | 已接 |
| 列名/按钮文案 | 展示 | 已接 |
| canRetry/canOperate | 状态 | 已接 |
| checkApi/submitApi | 轮询/提交 | 未接 |
| 按钮动作/loading | 交互 | 未接 |

## 4. 架构

- [`rest/Tasks.vue`](../../../packages/vamis/src/renderers/rest/Tasks.vue)：items/status/columns/buttons。
- [`tasks.ts`](../../../packages/vamis-core/src/utils/tasks.ts)：items/status/labels/can*。

## 5. 样式

- tasks 表格/badge/按钮 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

checkApi 轮询/submitApi/按钮动作/loading/深色。

## 7. 验收

- items/status/按钮 disabled/列名/空/窄屏；未接不误标。

## 8. 后续

先接按钮动作/loading，再做 checkApi/submitApi；不要假装实时任务。

---

返回 [组件设计索引](README.md)
