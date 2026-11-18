# TabsTransferPicker 组合穿梭选择 · `tabs-transfer-picker` 设计

> 状态：**进行中 35%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/tabs-transfer-picker) · Amis：`/zh-CN/components/form/tabs-transfer-picker`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

TabsTransferPicker **没有独立渲染器**：`extras/rest.ts` 把它作为 `tabs-transfer` 的别名。因此它具备 TabsTransfer 的全部分组/Transfer 行为与缺口；不是独立 Picker 弹层。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **别名**：tabs-transfer-picker → TabsTransfer；改行为只改 TabsTransfer/Transfer。
2. **分组/值**：与 TabsTransfer 相同，各 tab 共享字段值。
3. **无独立 Picker**：不要按 pickerSchema/弹层验收。
4. **事件/动作**：当前未接。
5. **包边界**：Tabs/Transfer token，无 `<style>`。

### 1.2 边界用例

- 分组/跨 tab 选择/空 options/重复 title
- value 外部 setValue/disabled
- Picker 弹层预期（非目标）
- 窄屏/深色

## 2. 复杂度

- 等级：**L 重**（Amis 177 行；Vamis 复用 TabsTransfer 30 行）
- 依赖：TabsTransfer、Transfer、Tabs

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| options children | 分组 | 继承 |
| name/value | 值 | 继承 |
| Picker 弹层 | 目标 | 非目标/未接 |
| 事件动作 | 目标 | 未接 |

## 4. 架构

- [`extras/rest.ts`](../../../../packages/vamis/src/extras/rest.ts)：alias 注册。
- [`tabs-transfer`](tabs-transfer.md)：全部行为。

## 5. 缺口

与 TabsTransfer 相同：tabChange/校验/事件动作/重复 title/跨 tab 一致性。

## 6. 验收

- 确认走 TabsTransfer；跨 tab 值/disabled/窄屏；不要测 Picker 弹层。

## 7. 后续

随 TabsTransfer 一起补；若确实需要 Picker 弹层，单独立项。

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

返回 [组件设计索引](../README.md)
