# InputNumber 数字输入 · `input-number` 设计

> 状态：**进行中 88%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-number) · Amis：`/zh-CN/components/form/input-number`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputNumber 是**数值格式化 + 步进 + 精度/min-max + 单位/前后缀 + 增强模式**的组合控件。主路径较完整；风险在格式化/解析、聚焦草稿、百分比/大数/单位、clamp/step、事件拦截与移动端单位弹层。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **存储值 vs 显示值**：聚焦时 `draft` 用原始输入，失焦才格式化；格式化不能写回字符串（除非 schema 明确），提交仍走 `normalizeNumberValue`。
2. **精度/步长**：precision 默认由 step 推；step 0 兜底 1；步进不能越过 min/max，也不能破坏精度。
3. **min/max**：`filterNumberProp` 解析变量/表达式；clamp 在提交/步进/失焦都生效。
4. **百分比**：`showAsPercent` 显示 ×100，存储仍是原值；聚焦/失焦要成对换算，避免重复乘除。
5. **大数/千分位**：`big` 用字符串/大数处理，不走 Number 丢精度；千分位只在显示层。
6. **单位**：`unitOptions` 单位与值拼接/剥离靠 `numberStripUnit`/`numberAttachUnit`；单位弹层走 `VamisOverlay`，卸载清理。
7. **事件/动作**：change/focus/blur 先事件后写值，prevented 不写；clear/reset/setValue 走组件 API。
8. **包边界**：无 `<style>`、无 fetch；单位弹层 token。

### 1.2 边界用例

- 空值/0/负数/小数/科学计数/非法输入
- precision/step 组合、min/max、步进越界
- big 大数、kilobit 千分位、百分比
- 单位单/多、无单位、移动端单位弹层
- prefix/suffix 模板、enhance 模式
- resetValue/clearValueOnEmpty
- focus/blur/change 阻止
- disabled/readOnly/static/错误态
- 窄屏/深色

### 1.3 优先级

1. 解析/格式化/精度
2. min/max/step/clamp
3. 百分比/大数/单位
4. 事件/API/移动端弹层
5. 样式/深色/无障碍

## 2. 复杂度

- 等级：**L 重**（Amis 703 行；Vamis 549 行）
- 依赖：`FormItem`、`VamisOverlay`、number 工具
- 风险：显示/存储双形态、精度/百分比/单位换算

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 字段/初始值 | 已接 |
| `step` / `precision` | 步长/精度 | 已接 |
| `min` / `max` | 范围 | 已接 |
| `prefix` / `suffix` / `unitOptions` | 前后缀/单位 | 已接 |
| `kilobitSeparator` / `showAsPercent` | 格式 | 已接 |
| `big` | 大数 | 已接 |
| `displayMode: enhance` / `showSteps` | 增强/步进 | 已接 |
| `resetValue` / `clearValueOnEmpty` | 重置/空值 | 已接 |
| `themeCss` | 皮肤变量 | 未接 |

### 事件/动作

事件：`change`、`focus`、`blur`（可阻止）。组件 API：`clear` / `reset` / `setValue`（以在线文档为准）。

## 4. 架构

- [`form/InputNumber.vue`](../../../../packages/vamis/src/renderers/form/InputNumber.vue)：格式化/解析/步进/单位/事件/API。
- ``number.ts``：normalize/step/unit/percent/kilobit 等纯函数。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。
- [`styles.css`](../../../../packages/vamis-ui/src/styles.css)：单位/步进/前后缀 token。

### 数据流

```text
field value → numberStripUnit/percentView/formatDisplay → 显示
focus → draft（原始输入）
blur/commit → parseNumberInput → normalize/clamp → percentStore/attachUnit → setValue
step → numberStepValue → clamp → setValue
```

## 5. 样式与边界

- 单位/步进/前后缀/增强模式走 token；无 `<style>`。
- 移动端单位弹层用 `VamisOverlay`；深色单位菜单、窄屏对齐单独核。
- 作者 className 只落节点；themeCss 未接。

## 6. 当前状态与缺口

- 已接：步进/精度/min-max、前缀/后缀/千分位、单位、enhance、大数、reset/clear、change/focus/blur、API。
- 缺口：themeCss、深色/窄屏逐项、单位弹层焦点细节。
- 对照：TODO 88%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputNumber / number 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputNumber 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-number` 桌面
- [ ] `pnpm compare --page input-number --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 显示/存储/精度/百分比
- big/千分位/单位
- min/max/step 越界
- focus/blur/change 阻止
- 移动端单位弹层

## 8. 后续

1. themeCss/皮肤变量。
2. 深色/单位弹层/窄屏专项。
3. 大数与百分比组合补测试。

---

返回 [组件设计索引](../README.md)
