# Alert 提示 · `alert` 设计

> 状态：**进行中 70%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/alert) · Amis：`/zh-CN/components/alert`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Alert 当前是**级别提示条**：level info/success/warning/danger、title/body/actions、showIcon、showCloseButton；关闭只隐藏本地。字号、四档底色、正文/标题色、边距、flex 盒模型与图标解析已按 Amis/cxd 对齐。内置 SVG、URL、Font Awesome class 共用图标链；仍没有独立关闭事件，70% 是真实缺口。

## 1. 边界与优先级（先读）

1. **level**：info/success/warning/danger；支持表达式；未知回落 info。
2. **内容**：title 字符串/Schema；body 节点；actions 动作。
3. **图标**：showIcon 默认 false；icon 先查 VAMIS 内置 SVG，再走 URL / resolveIcon class，未写 icon 时用 levelToFeedbackIcon；iconClassName。
4. **关闭**：showCloseButton；点击只 `open=false`，无事件/回调；卸载后不恢复。
5. **包边界**：无 `<style>`、无 fetch；alert token。

### 边界用例

- 四级别/表达式/未知
- title 字符串/Schema/空；body/actions
- showIcon/iconSrc/close
- 关闭事件/fa icon（未接）
- 窄屏/深色

### 优先级

1. level/内容；2. 图标/关闭；3. 事件/像素；4. 深色。

## 2. 复杂度

- 等级：**M 中**（Amis 109 行；Vamis 82 行）；依赖 alert/icon。
- 风险：关闭语义/图标来源。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| level/title/body | 内容 | 已接 |
| showIcon/icon/iconClassName | 图标 | 已接；内置 SVG / URL / FA class |
| showCloseButton | 关闭 | 本地隐藏；盒模型对齐 Amis |
| actions | 操作 | 已接 |
| close 事件/fa 名 | 目标 | 未接 |

## 4. 架构

- [`Alert.vue`](../../../../packages/vamis/src/renderers/Alert.vue)：level/title/body/icon/close。
- [`alert.ts`](../../../../packages/vamis-core/src/utils/alert.ts)：level/title/body/icon/actions。

## 5. 样式

- 根字号 12 / 400；无标题 title/desc 24px 行高，有标题 title 22px / desc 20px。无标题 padding `4×16`，有标题 `16`，默认 margin-bottom `16`，radius `4`。文档示例按 Amis 补 `className: mb-1` / `mb-3`，实际边距 4 / 12；className 同时落到 Alert 根，utilities 可覆盖默认 margin。四档背景使用 brand/success/warning/error fill-10，文字统一 neutral-text-2，warning 不再使用白字。图标槽 `16×24` flex 居中，16px SVG 上下各余 4px、右缝 8；关闭钮黑字 opacity 0.2 / hover 0.5。

## 6. 缺口

关闭事件/像素级 cxd/深色。

## 7. 验收

- level/内容/图标/关闭/actions/窄屏；未接不误标。

### 验收清单（文档核对：9 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [x] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [x] 组件页活示例运行、无 console error
- [x] `pnpm test`（组件相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page alert` 桌面
- [x] `pnpm compare --page alert --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

补关闭事件；像素级 cxd 最后做。

---

返回 [组件设计索引](../README.md)
