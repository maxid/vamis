# Checkboxes 复选框组 · `checkboxes` 设计

> 状态：**进行中 55%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/checkboxes) · Amis：`/zh-CN/components/form/checkboxes`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Checkboxes 当前是**最小多选组**（52 行）：options 数组 + Checkbox、值数组。没有列数/全选/按钮模式/单选互斥/disabled option/远程 source/校验/事件/动作；55% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：值是数组；无 name 不写；初始非数组要兜底成 `[]`。
2. **选项映射**：对象 `{label,value}` / 标量 `label`；value 缺省用 label；重复 value 要明确。
3. **toggle**：用 Set 增删，不能用 index；顺序保持插入顺序。
4. **禁用**：当前仅整体 disabled；单 option disabled/readOnlyOn 未接。
5. **校验**：必选/最少选未接；不要声称 FormItem 自动处理。
6. **包边界**：无 `<style>`、无 fetch；Checkbox/token 由 UI。

### 1.2 边界用例

- 空 options / 空数组 / 非数组值
- 标量/对象 option、重复 value、value=0/false
- 全选/取消全选（未接）
- disabled option / 整体 disabled
- 列数/按钮模式（未接）
- 远程 source/分组（未接）
- 窄屏换行、深色、错误态

### 1.3 优先级

1. 值/选项/toggle
2. 禁用/校验
3. 全选/列数/按钮模式
4. 远程/事件动作
5. 样式/无障碍

## 2. 复杂度

- 等级：**L 重**（Amis 544 行；Vamis 52 行）
- 依赖：`checkbox`、Options、FormItem
- 风险：当前只有基础多选，Amis 能力多未接

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `options` | 选项 | 已接基础 |
| `name` / `value` | 数组值 | 已接 |
| `columns` | 列数 | 未接 |
| `checkAll` | 全选 | 未接 |
| `optionType: button` | 按钮组 | 未接 |
| `disabled` / `disabledOn` | 禁用 | 仅整体 |
| `source` / 远程 | 选项 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/Checkboxes.vue`](../../../../packages/vamis/src/renderers/form/Checkboxes.vue)：options/selected/toggle。
- [`checkbox`](checkbox.md)：单盒视觉/值语义。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。
- 目前未注册 scoped API。

### 数据流

```text
options → 标准化 {label,value}
field value → selected[]
toggle → Set 增删 → setValue
```

## 5. 样式与边界

- flex wrap gap；无专属皮肤类、无 `<style>`。
- 窄屏换行、深色勾选、按钮模式（未接）。
- option 内 Schema 未接。

## 6. 当前状态与缺口

- 已接：options 基础、值数组、toggle、整体 disabled。
- 未接：columns/checkAll/按钮模式/disabled option/远程/校验/事件动作/scoped API。
- 对照：TODO 55%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Checkboxes / checkbox 依赖已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Checkboxes 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page checkboxes` 桌面
- [ ] `pnpm compare --page checkboxes --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 值数组/toggle 顺序
- 重复/0/false value
- 整体 vs 单 option 禁用
- 缺口不要误标

## 8. 后续

1. 先补 columns/checkAll/按钮模式（不改值模型）。
2. 再做 disabledOn/校验/远程 source。
3. 最后事件动作/无障碍。

---

返回 [组件设计索引](../README.md)
