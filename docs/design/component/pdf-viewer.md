# PdfViewer PDF 预览 · `pdf-viewer` 设计

> 状态：**进行中 10%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/pdf-viewer) · Amis：`/zh-CN/components/pdf-viewer`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

PdfViewer 当前是**占位预览**（14 行）：ViewerStub + filename；没有 PDF.js/分页/缩放/搜索。10% 是占位。

## 1. 边界与优先级（先读）

1. **src/filename**：readSrc；空文件名兜底。
2. **不渲染**：不加载 PDF SDK；不要按分页/缩放验收。
3. **安全**：PDF 内容由宿主决定；不 fetch。
4. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/URL/文件名
- 分页/缩放/搜索（未接）
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 315 行；Vamis 14 行占位）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src/filename | 文件 | 已接 |
| 渲染/分页/缩放 | 目标 | 未接 |

## 4. 架构

- `display/PdfViewer.vue` → `ViewerStub.vue`。

## 5. 缺口

PDF.js 渲染/分页/缩放/搜索/下载。

## 6. 验收

- 占位/文件名/空/窄屏；不按真实预览验收。

## 7. 后续

PDF.js 单独立项；先定体积/安全/下载策略。

---

返回 [组件设计索引](README.md)
