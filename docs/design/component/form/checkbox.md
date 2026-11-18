# Checkbox 勾选框 · `checkbox` 设计

> 状态：**进行中 90%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/checkbox) · Amis：`/zh-CN/components/form/checkbox`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Checkbox 是“单值布尔勾选”控件，同时支持 `trueValue/falseValue`、`option` 文案/Schema、`optionType: button`、禁用/只读/静态、`badge`、组件 API。主路径已较完整；风险集中在**值映射、事件拦截、按钮模式、indeterminate、无障碍**。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值映射**：`checkboxIsChecked` / `checkboxWriteValue` 统一处理 trueValue/falseValue；当前值可能是 `1/'1'/true`，不要只判断 `=== true`。
2. **事件先于写值**：`change` 事件 `prevented` 时不写值、不切换；payload 含 value 与 `[name]`。
3. **锁定**：disabled / readOnly / readOnlyOn / static 任一为真都不能写；按钮模式仍要拦截。
4. **partial**：`partial: true` 只影响 indeterminate 视觉，不等同 checked；写值不能把 partial 当 true。
5. **option**：字符串/数字模板，或 SchemaNode；`label` 与 `option` 分工不能重复画。
6. **API**：按 id/name 注册；`clear` / `reset` / `setValue` 与表单值一致；卸载注销。
7. **包边界**：无 `<style>`、无 fetch；盒模型 `--checkbox-*` 16px/圆角 2。

### 1.2 边界用例

- 无 name / 有 name / 初始值 / trueValue/falseValue 自定义
- 值 `0/1`、`'0'/'1'`、布尔、空串
- disabled / readOnly / readOnlyOn / static
- option 文本 / SchemaNode / badge
- optionType button（选中/禁用/键盘）
- change 被 preventDefault
- clear/reset/setValue 动作
- indeterminate/partial
- 窄屏、深色、错误态

### 1.3 优先级

1. 值映射/事件顺序
2. 锁定/静态
3. option/按钮模式/partial
4. API/动作
5. 深色/无障碍/窄屏

## 2. 复杂度

- 等级：**L 重**（Amis `Form/Checkbox.tsx` 316 行；Vamis 219 行）
- 依赖：`FormItem`、`BadgeHost`、`checkbox` 纯函数
- 风险：值映射/锁定/事件拦截

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'checkbox'`
- Amis 渲染器：`packages/amis/src/renderers/Form/Checkbox.tsx`
- 在线文档：[Vamis `/components/form/checkbox`](/components/form/checkbox)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 字段/初始值 | 已接 |
| `trueValue` / `falseValue` | 值映射 | 已接 |
| `option` / `label` | 文案/Schema | 已接 |
| `optionType: button` | 按钮样式 | 已接 |
| `partial` | indeterminate | 已接视觉 |
| `disabled` / `readOnly` / `readOnlyOn` / `static` | 锁定 | 已接 |
| `badge` | 角标 | 已接 |
| `themeCss` | 皮肤变量 | 未接 |

### 3.3 事件/动作

事件：`change`（可阻止）；组件 API：`getData/getValue/setData/doAction(clear|reset|setValue)`。没有独立 open/close。

## 4. Vamis 架构

- [`form/Checkbox.vue`](../../../../packages/vamis/src/renderers/form/Checkbox.vue)：值/锁定/option/按钮/partial/API。
- [`checkbox.ts`](../../../../packages/vamis-core/src/utils/checkbox.ts)：`checkboxIsChecked` / `checkboxWriteValue` / clear/reset/setData。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/静态/错误。
- [`styles.css`](../../../../packages/vamis-ui/src/styles.css)：`--checkbox-*`。

### 数据流

```text
field value → checkboxIsChecked → checked
onToggle → change 事件 → prevented? stop → checkboxWriteValue → setValue
partial → nativeEl.indeterminate
```

## 5. 样式与边界

- 16×16 盒、圆角 2、勾/半选图标；按钮模式 `vamis-checkbox--button`。
- 禁用灰底、深色、焦点环；无 `<style>`。
- 作者 className 只落节点；themeCss 未接。

## 6. 当前状态与缺口

- 已接：true/false 值、option、按钮模式、锁定/静态、partial、badge、change、clear/reset/setValue、API 注销。
- 缺口：themeCss 皮肤变量、深色逐项、按钮模式无障碍/键盘细节。
- 对照：TODO 90%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Checkbox / checkbox 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Checkbox 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page checkbox` 桌面
- [ ] `pnpm compare --page checkbox --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- true/false 映射
- change 阻止
- 锁定/静态
- partial 不等于 checked
- 按钮模式/无障碍

## 8. 后续

1. themeCss/皮肤变量。
2. 深色/焦点/键盘无障碍专项。
3. 与 Checkboxes/Matrix 的视觉一致性。

---

返回 [组件设计索引](../README.md)
