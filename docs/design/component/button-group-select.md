# ButtonGroupSelect 按钮点选 · `button-group-select` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/button-group-select) · Amis：`/zh-CN/components/form/button-group-select`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

ButtonGroupSelect 当前是**按钮组单选/多选**（46 行）：options → Button，选中用 default/outline 区分，支持 joinValues、disabled option。没有自适应宽度/图标/按钮组拼接/键盘/校验汇总/事件动作；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值形态**：单选写单值/字符串；多选 joinValues 字符串或数组；parse/dump 成对。
2. **切换**：多选 toggle；单选替换；optionValuesEqual 比较。
3. **禁用**：整体/单 option disabled；不可选但仍展示。
4. **布局**：flex wrap gap；没有等宽/分组/图标布局。
5. **包边界**：无 `<style>`、无 fetch；Button/token。

### 边界用例

- 空 options/单选/多选/重复 value/joinValues false
- disabled option/整体 disabled
- 外部 setValue/reset/static
- 窄屏换行/深色
- 图标/等宽/键盘（未接）

### 优先级

1. 值/切换；2. 禁用/选项；3. 布局/图标；4. 校验/事件动作。

## 2. 复杂度

- 等级：**M 中**（Amis 219 行；Vamis 46 行）；依赖 Options、FormItem、ButtonGroup。
- 风险：按钮组布局/值形态。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `options` / `multiple` / `joinValues` | 选项/值 | 已接 |
| disabled option | 禁用 | 已接 |
| 等宽/图标/拼接 | 布局 | 未接 |
| 校验/事件动作 | 目标 | 未接 |

## 4. 架构

- [`form/ButtonGroupSelect.vue`](../../../packages/vamis/src/renderers/form/ButtonGroupSelect.vue)：options/selected/toggle。
- [`options.ts`](../../../packages/vamis-core/src/utils/options.ts)：normalize/parse/dump。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
field value → parseJoined → selected[]
toggle → dumpJoined → setValue
```

## 5. 样式

- Button 组 flex wrap；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

等宽/图标/拼接/键盘/校验/事件动作/深色。

## 7. 验收

- 值/单选多选/禁用/空 options/窄屏；未接不误标。

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

先做等宽/图标布局，再做键盘/校验；事件动作后置。

---

返回 [组件设计索引](README.md)
