# HBox 布局 · `hbox` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/hbox) · Amis：`/zh-CN/components/hbox`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

HBox 当前是**横向列布局**（79 行）：columns/body、列宽/auto、gap xs、align/valign、columnClassName、ListItem 字段模式。没有 themeCss、列 mode/horizontal；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **列**：columns/body 过滤 visible；列宽 mode/auto 由 hboxColumnWidthMode 生成。
2. **对齐**：data-align/valign 与列 data-hbox-valign；不要写死。
3. **ListItem 模式**：asListField 时渲染 label+value 结构，不影响普通模式。
4. **样式**：columnClassName/style 只作用列。
5. **包边界**：无 `<style>`、无 fetch；hbox token。

### 边界用例

- 空/单列/多列/auto/隐藏列；ListItem 模式
- align/valign/columnClass/嵌套 hbox
- 窄屏/深色
- themeCss/列 mode 未接

### 优先级

1. 列/宽度；2. 对齐/ListItem；3. 嵌套/响应式；4. 缺口。

## 2. 复杂度

- 等级：**M 中**（Amis 226 行；Vamis 79 行）；依赖 container。
- 风险：列宽/ListItem 双模式。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `columns`/`body` | 列 | 已接 |
| width/auto | 列宽 | 已接 |
| gap/align/valign | 布局 | 已接 |
| ListItem 模式 | 行字段 | 已接 |
| themeCss/列 mode | 目标 | 未接 |

## 4. 架构

- [`layout/HBox.vue`](../../../../packages/vamis/src/renderers/layout/HBox.vue)：columns/width/align/ListItem。
- [`hbox.ts`](../../../../packages/vamis-core/src/utils/hbox.ts)：列宽/gap/对齐。
- ``listItemField.ts``：ListItem 上下文。

## 5. 样式

- data-hbox 属性/token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、列 mode/horizontal、深色/窄屏。

## 7. 验收

- 列/auto/隐藏/ListItem/对齐/嵌套/窄屏；未接不误标。

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

补 themeCss/列 mode；保持列宽 token 化。

---

返回 [组件设计索引](../README.md)
