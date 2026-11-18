# SearchBox 搜索框 · `search-box` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/search-box) · Amis：`/zh-CN/components/search-box`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

SearchBox 当前是**输入 + 搜索按钮**（47 行）：有 Form 时写表单并 submit；否则 target reload 或 CRUD host reload；最后兜底 notify。没有历史/下拉建议/增强模式/快捷键；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：有 name+form 走 fieldApi；否则本地 local；controlInputValue 收标量。
2. **搜索目标**：form 存在 → form.submit；否则 target → scoped.reload；否则 crudHost.reload；最后 notify。
3. **无历史/建议**：不要按 Amis 搜索历史/联想验收。
4. **Enter**：当前只按钮 click；Enter 提交未接（Input 未监听）。
5. **包边界**：无 `<style>`、无 fetch；input/button token。

### 边界用例

- 空值/有 form/无 form/target/crud host/兜底 notify
- disabled/回车/历史/建议（未接）
- 窄屏/深色

### 优先级

1. 值/搜索目标；2. Enter/disabled；3. 历史/建议/增强；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 255 行；Vamis 47 行）；依赖 action/icon。
- 风险：搜索目标分支。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| name/value/placeholder | 输入 | 已接 |
| target | reload 目标 | 已接 |
| form/crud host | 搜索 | 已接 |
| 历史/建议/Enter | 目标 | 未接 |

## 4. 架构

- [`SearchBox.vue`](../../../packages/vamis/src/renderers/SearchBox.vue)：value/search 分支。
- [`crudHost.ts`](../../../packages/vamis/src/renderers/data/crudHost.ts)：host reload。

## 5. 样式

- input+button flex；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

Enter/历史/建议/增强/深色。

## 7. 验收

- 值/form/target/crud/兜底/disabled/窄屏；未接不误标。

## 8. 后续

先补 Enter/disabled，再做历史/建议；不要复制 CRUD 查询表单。

---

返回 [组件设计索引](README.md)
