# TabsTransfer 组合穿梭器 · `tabs-transfer` 设计

> 状态：**进行中 40%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/tabs-transfer) · Amis：`/zh-CN/components/form/tabs-transfer`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

TabsTransfer 当前是**分组 options → tabs → 每 tab 一个 Transfer**（30 行）。它没有独立的跨 tab 选择状态/校验/事件/动作；value 由各 Transfer 共用的字段串起来。TabsTransferPicker 是它的别名。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **分组**：options 有 children 时按父 label 分 tab；否则“全部”一个 tab；空分组要兜底。
2. **值**：各 tab 的 Transfer 共用 `name` 字段；每 tab 的 selected 只包含本 tab options，但写回的是全局值。不能在一个 tab 清空其他 tab 的值。
3. **tab 切换**：只切展示，不丢值；`default-value` 当前用 title，title 重复会有 key 冲突。
4. **校验/事件/动作**：当前没有 tabChange、change 事件，也没有 scoped API；不要按 Transfer 的动作套用。
5. **包边界**：无 `<style>`、无 fetch；Tabs/Transfer token。

### 1.2 边界用例

- 无 children/单组/多组/空 options
- 同名 tab/重复 label
- 跨 tab 选择/取消/清空
- value 来自表单/外部 setValue
- disabled/static
- 目标 tabChange/校验/事件动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 分组/值隔离
2. tab 切换/key
3. 事件动作/校验
4. 样式/窄屏

## 2. 复杂度

- 等级：**L 重**（Amis 377 行；Vamis 30 行）
- 依赖：`Transfer`、`Tabs`、options
- 风险：各 tab Transfer 共用字段，值/选择边界易错

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `options` children | 分组 tab | 已接 |
| `name` / `value` | 共用值 | 已接 |
| tab 标题 | label | 已接 |
| tabChange/校验/动作 | 目标 | 未接 |
| TabsTransferPicker | 别名 | 同一组件 |

## 4. 架构

- [`extras/rest.ts`](../../../../packages/vamis/src/extras/rest.ts)：tabs-transfer / tabs-transfer-picker 注册。
- [`form/TabsTransfer.vue`](../../../../packages/vamis/src/renderers/form/TabsTransfer.vue)：分组 + Tabs + Transfer。
- [`form/Transfer.vue`](../../../../packages/vamis/src/renderers/form/Transfer.vue)：单 tab 值/选项。

### 数据流

```text
options(children) → tabs [{title, options}]
每 tab → Transfer(schema.options=tab.options, name=同一字段)
selected 读写共享表单字段
```

## 5. 样式

- Tabs/Transfer 皮肤；无 `<style>`；窄屏 tab 滚动/换行单独核。

## 6. 缺口

tabChange/校验/事件动作、重复 title 的 key、跨 tab 选择一致性、深色。

## 7. 验收

- 分组/跨 tab 值/空 options/disabled/窄屏；未接不要误标。

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

先定跨 tab 选择模型与 tabChange，再做校验/动作；Picker 别名后续评估。

---

返回 [组件设计索引](../README.md)
