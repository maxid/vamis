# Link 链接 · `link` 设计

> 状态：**进行中 85%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/link) · Amis：`/zh-CN/components/link`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Link 当前是**链接渲染**（76 行）：href 插值/body SchemaNode、blank/htmlTarget、title、disabled、icon/rightIcon、badge、className/style、static-link。主路径较完整；缺口是 `env.tracker` 埋点。

## 1. 边界与优先级（先读）

1. **href**：模板插值；disabled 时不生成 href；空 href 渲染文本/body。
2. **目标**：blank 默认 true；htmlTarget 覆盖；不要用 window.open 绕过 target。
3. **内容**：label 模板；body SchemaNode；icon/rightIcon/badge。
4. **禁用**：disabled 去 href + 禁用色/无下划线；仍可显示 title。
5. **安全**：href 需可信；javascript: 等协议是否过滤未定义，不能声称已拦截。
6. **包边界**：无 `<style>`、无 fetch；link token。

### 边界用例

- 空/插值/disabled/body/label/icon/badge
- blank true/false/htmlTarget/title/static-link
- 非法协议/外部链接/窄屏/深色
- tracker 埋点（未接）

### 优先级

1. href/目标；2. 内容/禁用；3. 安全/埋点；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 131 行；Vamis 76 行）；依赖 icon/badge。
- 风险：href 插值/目标/安全。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| href/blank/htmlTarget | 链接 | 已接 |
| label/body | 内容 | 已接 |
| disabled/title | 状态 | 已接 |
| icon/rightIcon/badge | 附属 | 已接 |
| tracker | 埋点 | 未接 |

## 4. 架构

- [`Link.vue`](../../../packages/vamis/src/renderers/Link.vue)：href/label/body/target/disabled/icon。
- [`link.ts`](../../../packages/vamis-core/src/utils/link.ts)：href/目标/class。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：body SchemaNode。

## 5. 样式

- link 色/禁用/下划线/token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

env.tracker；协议安全策略未定义；深色逐项。

## 7. 验收

- href/目标/内容/禁用/icon/badge/窄屏；未接不误标。

## 8. 后续

补 tracker 与协议安全（若需要），不要改默认 link 语义。

---

返回 [组件设计索引](README.md)
