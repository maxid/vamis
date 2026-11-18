# Pagination 分页 · `pagination` 设计

> 状态：**进行中 92%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/pagination) · Amis：`/zh-CN/components/pagination`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Pagination 是**分页状态/事件**组件：page/perPage/lastPage/total/hasNext、layout/mode/size、省略号/跳页/每页条数、change 事件与 ValueHost 写值。主路径已较完整；缺口是 `themeCss` 与移动端 `mobileUI`。

## 1. 边界与优先级（先读）

1. **页码/每页**：page ≥1；perPage 正数；total/lastPage/hasNext 决定 lastPage；越界回 1。
2. **写值**：有 name 时经 `useFieldValue` 写当前数据域；change 事件可 preventDefault，阻止后不写 page/值。
3. **模式**：simple/normal；layout 决定左右区块（total/pager/go/perPage 等）；不要各模式各写状态。
4. **省略号/跳页**：maxButtons/ellipsisPageGap 计算 pagerItems；跳页非法数忽略，Enter 触发。
5. **每页条数**：perPageAvailable；切换 perPage 回到 page=1。
6. **禁用**：isDisabled(schema,data)；禁用时所有操作 no-op。
7. **包边界**：无 `<style>`、无 fetch；分页 token。

### 边界用例

- total=0/1/lastPage=1/多页；hasNext。
- page 越界/0/负数；perPage 0/非法。
- 省略号/跳页 Enter/非法输入；perPage 切换回第一页。
- 有 name/无 name；change 阻止；disabled。
- simple/normal、layout 组合。
- 窄屏/深色/mobileUI（未接）。

### 优先级

1. 页码/写值/事件；2. 模式/layout/省略号；3. perPage/跳页/禁用；4. 移动/样式。

## 2. 复杂度

- 等级：**M 中**（Amis 143 行；Vamis 235 行）；依赖 `action`。
- 风险：多 layout/模式组合。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `total` / `lastPage` / `hasNext` | 总页 | 已接 |
| `activePage` / `value` / `name` | 当前页 | 已接 |
| `perPage` / `perPageAvailable` | 每页 | 已接 |
| `layout` / `mode` / `size` / `maxButtons` | 外观 | 已接 |
| `showPageInput` / 跳页 | 交互 | 已接 |
| `change` | 事件 | 已接，可阻止 |
| `themeCss` / `mobileUI` | 皮肤/移动 | 未接 |

## 4. 架构

- [`Pagination.vue`](../../../packages/vamis/src/renderers/Pagination.vue)：page/perPage/pagerItems/change/事件。
- [`pagination.ts`](../../../packages/vamis-core/src/utils/pagination.ts)：lastPage/pager/layout/perPage。
- [`FormItem`/FieldValue]：name 写当前数据域。

### 数据流

```text
schema/data → syncFromSchema → page/perPage
prev/next/go/perPage → emitChange → change 事件 → prevented? stop → page/值/emit
```

## 5. 样式

- data-mode/data-size/layout；分页 token；无 `<style>`。
- 窄屏/深色/mobileUI 单独核。

## 6. 缺口

themeCss、mobileUI、深色/窄屏逐项。

## 7. 验收

- total/page/perPage/省略号/跳页/change/禁用/窄屏；未接不误标。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

补 themeCss/mobileUI；不要和 PaginationWrapper 的客户端切片混用。

---

返回 [组件设计索引](README.md)
