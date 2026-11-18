# OfficeViewer 文档预览 · `office-viewer` 设计

> 状态：**进行中 10%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/office-viewer) · Amis：`/zh-CN/components/office-viewer`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

OfficeViewer 当前是**占位预览**（14 行）：readSrc/filename → ViewerStub，没有 Office 解析/渲染。10% 是占位，不表示可预览 Word/Excel/PPT。

## 1. 边界与优先级（先读）

1. **src/filename**：readSrc；空文件名兜底。
2. **不解析**：不加载 Office SDK/转换服务；不要按文档预览验收。
3. **安全**：src 由宿主决定；不 fetch 文件内容。
4. **包边界**：无 `<style>`、无 fetch；viewer-stub token。

### 边界用例

- 空/文件名/URL
- doc/xls/ppt（均占位）
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 396 行；Vamis 14 行占位）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src/filename | 文件 | 已接 |
| 解析/渲染 | 目标 | 未接（占位） |

## 4. 架构

- `display/OfficeViewer.vue` → `ViewerStub.vue`。
- `prop.ts`：readSrc/fileNameOf。

## 5. 缺口

Office 解析/渲染/分页/下载。

## 6. 验收

- 占位/文件名/空/窄屏；不按真实预览验收。

## 7. 后续

Office 预览需独立 SDK/转换服务与安全评估，单独立项。

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

---

返回 [组件设计索引](README.md)
