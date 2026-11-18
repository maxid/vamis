# Timeline 时间轴 · `timeline` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/timeline) · Amis：`/zh-CN/components/timeline`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 1. 一页结论

Timeline 当前是**静态节点列表**（68 行）：items/time/title/detail、颜色点、reverse、horizontal。没有自定义图标/节点内容/点击/激活态/事件；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **数据**：`items` 由 resolveItems 解析；reverse 复制反转，不改源；空数组显示空列表。
2. **节点**：time/title/detail 模板；title 支持 SchemaNode；detail 只文本。
3. **颜色**：success/warning/danger/info/primary 类；`#hex` 内联样式；未知回落 info。
4. **方向**：vertical 默认；horizontal flex；窄屏横向可能溢出。
5. **包边界**：无 `<style>`、无 fetch；dot/线/文字 token。

### 边界用例

- 空/单节点/多节点/reverse/horizontal
- time/title/detail 空/模板/SchemaNode
- 颜色名/hex/未知
- 窄屏/深色
- 点击/自定义图标/激活（未接）

### 优先级

1. 数据/节点；2. 颜色/方向；3. 点击/图标/激活；4. 事件动作/样式。

## 2. 复杂度

- 等级：**M 中**（Amis 312 行；Vamis 68 行）；依赖 icon、tpl、card。
- 风险：横向/窄屏、节点内容扩展。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `items` | 节点 | 已接 |
| `reverse` / `direction` | 顺序/方向 | 已接 |
| `time/title/detail` | 内容 | 已接 |
| `color` | 点颜色 | 已接 |
| 自定义图标/点击 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`layout/Timeline.vue`](../../../packages/vamis/src/renderers/layout/Timeline.vue)：items/颜色/方向/节点。
- [`utils.ts`](../../../packages/vamis/src/renderers/layout/utils.ts)：resolveItems。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：title SchemaNode。
- [`styles.css`](../../../packages/vamis-ui/src/styles.css)：timeline token。

## 5. 样式

- 竖线/dot/时间/标题/详情；无 `<style>`；窄屏横向/深色单独核。

## 6. 缺口

点击/激活、自定义图标/节点、事件动作；窄屏/深色。

## 7. 验收

- 数据/reverse/方向/颜色/空节点/窄屏；未接不误标。

## 8. 后续

先补点击/激活/自定义图标，再评估节点 Schema；深色窄屏后置。

---

返回 [组件设计索引](README.md)
