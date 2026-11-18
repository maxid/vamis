# TransferPicker 弹层穿梭 · `transfer-picker` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/transfer-picker) · Amis：`/zh-CN/components/form/transfer-picker`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

TransferPicker 当前是**Dialog + Transfer**（26 行）：按钮打开弹层，Transfer 直接写字段；没有确认/取消草稿、pickerSchema、搜索/分页；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **复用 Transfer**：值/选项/树/搜索继承 Transfer；不复制。
2. **草稿/确认**：当前 Transfer 直接写值；弹层无确认/取消草稿，不能声称“确认才写”。
3. **弹层**：Dialog max-w-2xl；关闭不恢复；移动端未适配。
4. **包边界**：无 `<style>`、无 fetch；transfer/dialog token。

### 边界用例

- 空/打开/关闭/直接改值
- 搜索/多选/树（继承）
- 确认/取消草稿（未接）
- 窄屏/深色

### 优先级

1. 复用 Transfer；2. 草稿/确认；3. 弹层/移动；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 230 行；Vamis 26 行）；依赖 transfer/dialog。
- 风险：直接写值/无确认。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| 按钮/弹层 | 打开 | 已接 |
| Transfer | 选择 | 继承 |
| 草稿/确认 | 目标 | 未接 |

## 4. 架构

- `form/TransferPicker.vue`：Dialog + Transfer。
- [`transfer`](transfer.md)：全部选择逻辑。

## 5. 缺口

草稿/确认/取消、pickerSchema、移动/深色。

## 6. 验收

- 打开/关闭/Transfer/值/窄屏；不按确认草稿验收。

## 7. 后续

先做草稿/确认，再做移动/皮肤；保持 Transfer 复用。

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
