# Radio 单选框 · `radio` 设计

> 状态：**进行中 88%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/radio) · Amis：`/zh-CN/components/form/radio`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Radio 与 Checkbox 共用同一套值/锁定/option/API 逻辑，差异是**单选圆点 + Combo 互斥**。主路径较完整；风险在 combo radio 写回、true/false 映射、事件拦截、圆点样式与无障碍。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值映射**：`checkboxIsChecked` / `checkboxWriteValue` 共用；trueValue/falseValue 可为 1/'1'/true，不能只判布尔。
2. **Combo 互斥**：`useComboRadio` 存在时，先调 `combo.onChange`；返回 false 时 Radio 不再自己写值（由 Combo 整列写回）。
3. **事件先于写值**：change prevented 不写；payload 含 value/[name]。
4. **锁定**：disabled/readOnly/readOnlyOn/static 全部禁止写。
5. **圆点**：18px 圆、内点 10；按钮模式与 Checkbox 按钮同构。
6. **包边界**：无 `<style>`、无 fetch；`--checkbox-*`/radio token。

### 1.2 边界用例

- 无 name/有 name/初始值/true/false 自定义
- 值 0/1、'0'/'1'、布尔、空串
- Combo 内 radio（互斥/取消）、独立 Radio
- disabled/readOnly/readOnlyOn/static
- option 文本/Schema、按钮模式
- change 阻止
- clear/reset/setValue
- 窄屏/深色/错误态

### 1.3 优先级

1. 值映射/Combo 互斥
2. 事件/锁定
3. option/圆点/按钮
4. API/无障碍/深色

## 2. 复杂度

- 等级：**L 重**（Amis 186 行；Vamis 219 行）
- 依赖：`FormItem`、`comboRadio`、checkbox 工具
- 风险：Combo 互斥与独立写值分叉

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 字段/初始值 | 已接 |
| `trueValue` / `falseValue` | 值映射 | 已接 |
| `option` / `label` | 文案/Schema | 已接 |
| `optionType: button` | 按钮样式 | 已接 |
| `disabled` / `readOnly` / `readOnlyOn` / `static` | 锁定 | 已接 |
| Combo 互斥 | combo radio | 已接 |
| `themeCss` | 皮肤变量 | 未接 |
| input-table 互斥 | 目标 | 未接 |

### 事件/动作

事件：`change`（可阻止）。组件 API：`getData/getValue/setData/doAction(clear|reset|setValue)`。

## 4. 架构

- [`form/Radio.vue`](../../../packages/vamis/src/renderers/form/Radio.vue)：值/锁定/option/Combo 回调/API。
- [`formContext.ts`](../../../packages/vamis/src/formContext.ts)：`useComboRadio`。
- [`checkbox.ts`](../../../packages/vamis-core/src/utils/checkbox.ts)：值映射/clear/reset。
- [`styles.css`](../../../packages/vamis-ui/src/styles.css)：radio 圆点 token。

### 数据流

```text
current → checkboxIsChecked → checked
onToggle → combo.onChange? false ← stop
        → change 事件 → prevented? stop
        → checkboxWriteValue → setValue
```

## 5. 样式与边界

- 18/10 圆点、按钮模式、禁用灰；无 `<style>`。
- 深色/焦点/键盘/无障碍单独核；themeCss 未接。

## 6. 当前状态与缺口

- 已接：true/false、option、按钮、锁定/静态、Combo 互斥、change、clear/reset/setValue、API。
- 缺口：themeCss、input-table 互斥、深色/无障碍细节。
- 对照：TODO 88%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Radio / comboRadio 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Radio 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page radio` 桌面
- [ ] `pnpm compare --page radio --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- Combo 内互斥/取消
- true/false 映射
- change 阻止
- 锁定/静态
- 圆点/按钮视觉

## 8. 后续

1. themeCss/皮肤变量。
2. input-table 互斥 + 深色/键盘专项。

---

返回 [组件设计索引](README.md)
