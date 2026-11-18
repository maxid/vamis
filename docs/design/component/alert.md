# Alert 提示 · `alert` 设计

> 状态：**进行中 60%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/alert) · Amis：`/zh-CN/components/alert`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Alert 当前是**级别提示条**（82 行）：level info/success/warning/danger、title/body/actions、showIcon、showCloseButton；关闭只隐藏本地。没有关闭事件、fa/内置 icon 名、像素级 cxd；60% 是真实缺口。

## 1. 边界与优先级（先读）

1. **level**：info/success/warning/danger；支持表达式；未知回落 info。
2. **内容**：title 字符串/Schema；body 节点；actions 动作。
3. **图标**：showIcon 默认 false；iconSrc 图片或 levelToFeedbackIcon；iconClassName。
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
| showIcon/iconClassName | 图标 | 已接 |
| showCloseButton | 关闭 | 本地隐藏 |
| actions | 操作 | 已接 |
| close 事件/fa 名 | 目标 | 未接 |

## 4. 架构

- [`Alert.vue`](../../../packages/vamis/src/renderers/Alert.vue)：level/title/body/icon/close。
- [`alert.ts`](../../../packages/vamis-core/src/utils/alert.ts)：level/title/body/icon/actions。

## 5. 样式

- Alert 级别色/图标/关闭 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

关闭事件/fa 内置 icon/像素级 cxd/深色。

## 7. 验收

- level/内容/图标/关闭/actions/窄屏；未接不误标。

## 8. 后续

补关闭事件/fa 图标；像素级 cxd 最后做。

---

返回 [组件设计索引](README.md)
