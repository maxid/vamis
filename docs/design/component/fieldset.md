# Fieldset 分组 · `fieldset` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/fieldset) · Amis：`/zh-CN/components/form/fieldset`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Fieldset 当前是**可折叠/legend 分组**（30 行）：details/summary 或 fieldset/legend，body/controls。没有 icon/extra/嵌套分组样式；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **collapsable**：true 用 details；false 用 fieldset/legend。
2. **title**：title/label 兜底“分组”；空标题仍画 legend。
3. **body**：body/controls；SchemaRenderer；空不崩。
4. **包边界**：无 `<style>`、无 fetch；fieldset token。

### 边界用例

- collapsable true/false/初始 collapsed
- title 空/长文本/嵌套 fieldset
- 空 body/多节点/窄屏/深色

### 优先级

1. 折叠/legend；2. body/title；3. 嵌套/响应式；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 164 行；Vamis 30 行）；依赖 container。
- 风险：details/fieldset 语义。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| collapsable/collapsed | 折叠 | 已接 |
| title/label | 标题 | 已接 |
| body/controls | 子项 | 已接 |
| icon/extra | 目标 | 未接 |

## 4. 架构

- `form/Fieldset.vue`：details/fieldset/body。

## 5. 样式

- fieldset legend/title token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

icon/extra/嵌套样式/深色。

## 7. 验收

- 折叠/title/body/嵌套/窄屏；未接不误标。

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

补 icon/extra；保持原生 details/fieldset。

---

返回 [组件设计索引](README.md)
