# Code 代码高亮 · `code` 设计

> 状态：**进行中 92%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/code) · Amis：`/zh-CN/components/code`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Code 是**只读 Monaco**：行号/折叠/wordWrap/主题/语言/customLang/maxHeight，按容器宽度折行，共享主题。主路径成熟；不收 options/编辑光标。

## 1. 边界与优先级（先读）

1. **只读**：无编辑光标；不要按编辑器验收。
2. **语言**：language/customLang；未知兜底 plaintext。
3. **主题**：editorTheme/vs-dark 与 `.dark` 同步；卸载 dispose。
4. **折行/行号/折叠**：wordWrap 默认 true；lineNumbers on/off/relative；folding 默认 false。
5. **高度**：maxHeight/boxStyle；容器滚动不丢高亮。
6. **包边界**：无 `<style>`、无 fetch；code token。

### 边界用例

- 空/多行/超长行/未知语言
- wordWrap/lineNumbers/folding/theme 切换
- customLang/容器 resize/卸载
- 深色/窄屏

### 优先级

1. 只读/语言；2. 折行/行号/主题；3. 高度/自定义语言；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 377 行；Vamis 159 行）；依赖 Monaco。
- 风险：Monaco 生命周期/主题。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/language | 内容/语言 | 已接 |
| wordWrap/lineNumbers/folding | 展示 | 已接 |
| editorTheme/customLang | 主题/语言 | 已接 |
| maxHeight | 高度 | 已接 |
| options/编辑 | 目标 | 非目标 |

## 4. 架构

- [`display/Code.vue`](../../../../packages/vamis/src/renderers/display/Code.vue)：mount/theme/language/watchers。
- [`code-highlight.ts`](../../../../packages/vamis/src/renderers/display/code-highlight.ts)：Monaco 加载/主题/mount。
- [`styles.css`](../../../../packages/vamis-ui/src/styles.css)：code token。

## 5. 样式

- 代码容器/行号/滚动 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

深色/窄屏逐项；options 非目标；Monaco 体积。

## 7. 验收

- 内容/语言/折行/行号/主题/resize/卸载；不按编辑器验收。

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

保持只读；Monaco 体积/按需加载单独评估。

---

返回 [组件设计索引](../README.md)
