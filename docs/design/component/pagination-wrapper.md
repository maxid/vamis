# PaginationWrapper 分页容器 · `pagination-wrapper` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/pagination-wrapper) · Amis：`/zh-CN/components/pagination-wrapper`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

PaginationWrapper 是**客户端分页容器**：从 inputName 取数组、按 page/perPage 切片，把 items/page/lastPage 通过 outputName 注入子 body，并复用 Pagination。没有远程请求/URL 同步/深色专项；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **数据源**：inputName 从数据域取数组；空/非数组兜底 `[]`。
2. **切片**：page/perPage → sliced；lastPage 变化时 page 越界回退；perPage 变化 page 不重置（与 Pagination 不同，需确认）。
3. **输出**：outputName 写入 items/page/lastPage；body 的 SchemaRenderer 用 extraData。
4. **位置**：position top/bottom；body 空显示“请配置内容”。
5. **包边界**：无 `<style>`、无 fetch；Pagination/body token。

### 边界用例

- 空数组/单页/多页/越界 page
- perPage 切换/position top/bottom
- inputName/outputName 缺省/冲突
- body 空/多节点
- 窄屏/深色

### 优先级

1. 切片/越界；2. 输出/位置；3. 空态/窄屏；4. 深色/远程（非目标）。

## 2. 复杂度

- 等级：**M 中**（Amis 143 行；Vamis 78 行）；依赖 Pagination、container。
- 风险：page/perPage 切片与输出字段。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `inputName` | 源数组 | 已接 |
| `outputName` | 输出对象 | 已接 |
| `perPage` / `position` | 分页 | 已接 |
| `body` | 内容 | 已接 |
| 远程/URL 同步 | 目标 | 非目标/未接 |

## 4. 架构

- [`layout/PaginationWrapper.vue`](../../../packages/vamis/src/renderers/layout/PaginationWrapper.vue)：source/sliced/extraData/pager。
- [`pagination.ts`](../../../packages/vamis-core/src/utils/pagination.ts)：wrapper 工具。
- [`Pagination.vue`](../../../packages/vamis/src/renderers/Pagination.vue)：分页 UI/事件。

### 数据流

```text
data[inputName] → sliced(page,perPage) → output{items,page,lastPage}
Pagination pageChange → page/perPage → 重新切片
```

## 5. 样式

- 上下分页+body；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

深色/窄屏；远程/URL 同步非目标；perPage 变化 page 重置策略需确认。

## 7. 验收

- 切片/越界/输出/位置/空态/窄屏；未接不误标。

## 8. 后续

确认 perPage 变化 page 策略；补深色/窄屏；不做远程分页（交给 CRUD/Service）。

---

返回 [组件设计索引](README.md)
