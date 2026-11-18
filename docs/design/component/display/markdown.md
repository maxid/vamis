# Markdown 渲染 · `markdown` 设计

> 状态：**进行中 45%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/markdown) · Amis：`/zh-CN/components/markdown`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Markdown 当前是**精简 Markdown → HTML**（43 行）：内容字段或远程 `src`，按 isApiOutdated 重载；渲染库精简。45% 是真实缺口：表格/代码块/任务列表/安全清洗等取决于渲染库。

## 1. 边界与优先级（先读）

1. **内容来源**：schema 内容字段优先；否则远程 src 拉文本；失败保留空/旧内容。
2. **重载**：src 变化按 isApiOutdated；卸载不清空但不再请求。
3. **渲染**：renderMarkdown 输出 HTML；信任边界由渲染库决定，不能默认 raw 用户输入。
4. **包边界**：无 `<style>`、无 fetch（src 走 requestApi）；markdown token。

### 边界用例

- 空/纯文本/标题/列表/代码块/表格/链接
- src 成功/失败/变化/慢返回
- 不可信 HTML/脚本（清洗）
- 深色/窄屏

### 优先级

1. 内容/src；2. 渲染覆盖；3. 安全清洗；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 118 行；Vamis 43 行）；依赖 markdown 渲染库/API。
- 风险：渲染库能力/安全。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| 内容字段 | Markdown | 已接 |
| `src` | 远程 | 已接 |
| 表格/代码块/任务列表 | 渲染 | 取决于库 |
| 安全清洗 | 目标 | 未单实现 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`display/Markdown.vue`](../../../../packages/vamis/src/renderers/display/Markdown.vue)：content/src/load/renderMarkdown。
- ``markdown.ts``：渲染。
- [`requestApi`](../../../../packages/vamis-core/src/utils/api.ts)：src。

## 5. 样式

- markdown 内容 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

完整 Markdown 能力/安全清洗/事件动作/深色。

## 7. 验收

- 内容/src/失败/常见语法/深色；未接不误标。

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

先定渲染库与清洗策略，再补语法覆盖；事件动作后置。

---

返回 [组件设计索引](../README.md)
