# Radios 单选框组 · `radios` 设计

> 状态：**进行中 55%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/radios) · Amis：`/zh-CN/components/form/radios`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Radios 当前是**RadioGroup 选项组**（49 行）：options、form/scope 值、RadioGroup；没有列数/按钮模式/disabled option/远程 source/事件动作；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：有 form 走 fieldApi；无 form 读 scope；写回匹配 option 原值（保留 number）。
2. **options**：对象/标量；label/value；空数组不崩。
3. **布局**：flex wrap gap；没有 columns/按钮模式。
4. **禁用**：整体 disabled；单 option disabled 未接。
5. **包边界**：无 `<style>`、无 fetch；radio token。

### 边界用例

- 空/单/多/标量/对象 option/表单/scope
- 值 number/string/非法值
- disabled/columns/按钮/远程（未接）
- 窄屏/深色

### 优先级

1. 值/选项；2. 布局/禁用；3. 按钮/远程；4. 事件动作。

## 2. 复杂度

- 等级：**L 重**（Amis 300 行；Vamis 49 行）；依赖 radio/options。
- 风险：form/scope 双读、原值匹配。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| options/name/value | 选项/值 | 已接 |
| form/scope | 值域 | 已接 |
| columns/按钮模式 | 布局 | 未接 |
| disabled option/remote | 状态/数据 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/Radios.vue`](../../../../packages/vamis/src/renderers/form/Radios.vue)：options/value/RadioGroup。
- [`radio`](radio.md)：单选框。
- [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts)：映射。

## 5. 样式

- RadioGroup flex；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

columns/按钮/disabled option/远程/事件动作/深色。

## 7. 验收

- 值/选项/表单/scope/disabled/窄屏；未接不误标。

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

先补 columns/按钮模式，再补远程/事件；不要复制 Radio 逻辑。

---

返回 [组件设计索引](../README.md)
