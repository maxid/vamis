# OfficeViewer Excel · `office-viewer-excel` 设计

> 状态：**进行中 10%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/office-viewer-excel) · Amis：`/zh-CN/components/office-viewer-excel`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

OfficeViewer Excel 当前是**同一 OfficeViewer 占位**：ViewerStub + filename；没有表格解析/多 sheet/单元格渲染。10% 是占位。

## 1. 边界与优先级（先读）

1. **与 OfficeViewer 同实现**：不要复制第二套 stub。
2. **不解析**：不加载 Excel SDK；不要按单元格预览验收。
3. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/文件名/xlsx/xls
- 多 sheet/公式（未接）
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 975 行；Vamis 占位）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src/filename | 文件 | 已接 |
| 表格解析/多 sheet | 目标 | 未接 |

## 4. 架构

- `display/OfficeViewer.vue`（同一 stub）。

## 5. 缺口

Excel 解析/多 sheet/样式/下载。

## 6. 验收

- 占位/文件名/空；不做真实表格验收。

## 7. 后续

与 OfficeViewer 一并立项；先定解析库/安全。

---

返回 [组件设计索引](README.md)
