# Grid 水平分栏 · `grid` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/grid) · Amis：`/zh-CN/components/grid`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Grid 当前是**响应式列容器**（58 行）：columns/body、列宽档位 1–12/auto、gap、align/valign、列 class/style。没有 themeCss、列 mode/horizontal、列内工具栏；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **列数据**：`columns` 或 `body`；每列 body 可以是节点/数组；空列不崩。
2. **档位**：xs/sm/md/lg 1–12/auto；class 由 gridColumnClass 生成；不要写死宽度。
3. **gap/align/valign**：data-gap/data-align/data-valign 驱动 token；query 不对。
4. **列覆盖**：columnClassName/style 只作用列，不作用内部节点。
5. **响应式**：窄屏档位/换行；没有 JS 测量。
6. **包边界**：无 `<style>`、无 fetch；grid token。

### 边界用例

- 空/单列/多列/auto/1–12/非法档位
- 列 class/style/嵌套 grid
- gap/align/valign 组合
- 窄屏/深色
- themeCss/列 mode（未接）

### 优先级

1. 列/档位；2. gap/对齐；3. 响应式/嵌套；4. 样式/缺口。

## 2. 复杂度

- 等级：**M 中**（Amis 333 行；Vamis 58 行）；依赖 container。
- 风险：档位 class/token 映射。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `columns` / `body` | 列 | 已接 |
| xs/sm/md/lg | 档位 | 已接 |
| `gap` / `align` / `valign` | 布局 | 已接 |
| 列 class/style | 覆盖 | 已接 |
| themeCss/列 mode | 目标 | 未接 |

## 4. 架构

- [`Grid.vue`](../../../packages/vamis/src/renderers/Grid.vue)：columns/gridColumnClass/gap/align。
- [`grid.ts`](../../../packages/vamis-core/src/utils/grid.ts)：档位/gap 纯函数。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：列 body。

## 5. 样式

- data-col/gap/align token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、列 mode/horizontal、深色/窄屏逐项。

## 7. 验收

- 档位/auto/空列/gap/对齐/嵌套/窄屏；未接不误标。

## 8. 后续

补 themeCss/列 mode；响应式宽度用 token，不写死。

---

返回 [组件设计索引](README.md)
