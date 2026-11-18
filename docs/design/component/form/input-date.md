# InputDate 日期选择器 · `input-date` 设计

> 状态：**进行中 92%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-date) · Amis：`/zh-CN/components/form/input-date`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputDate 是“文本输入 + 日历面板 + 移动端滚轮 + 值格式转换”的组合控件。核心难点不在日历格子，而在：

1. **值格式 / 显示格式 / 时区**三者的转换；
2. **编辑草稿**与**已提交值**分离（输入中不写值，Enter/失焦/选择才写）；
3. 范围限制、快捷键、内嵌、原生输入、移动端确认；
4. 与 InputDateTime / 日期范围共用 `utils/input-date.ts`，不能各写一套解析。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值写入**：统一 `fieldApi.setValue(name, next)`；`storeInputDateValue` 决定写 string/number/timestamp；`format` / `valueFormat` / `timezone` 是同一转换链。
2. **编辑态不写值**：输入框 `draft` 只在编辑；`commit` 先 `change` 事件，未阻止才写值；`inputForbid` 时不接受手工输入。
3. **日期限制**：`minDate` / `maxDate` / `minDate` 表达式 / 禁用日期走 `isInputDateDisabled`；日历、快捷键、输入都要用同一判定。
4. **时区 / UTC**：所有比较和显示走同一 dayjs 时区配置；`utc: true` 时提交 ISO/UTC，不能只在显示层加 Z。
5. **移动端**：底部 picker 是草稿，`confirmPicker` 才写值；关闭/取消不提交；滚轮列由 `inputDatePickerColumns` 统一。
6. **内嵌 / 原生**：`embed` 不打开弹层；`native` 走原生 input 但值格式仍走同一解析；`inputForbid` 与 native 不冲突。
7. **包边界**：渲染器无 `<style>`、无直接 fetch；日历/弹层/local 样式走 token；与日历范围组件复用 `calendar.ts`。

### 1.2 边界用例

- 空值 / 非法字符串 / number timestamp / ISO 字符串 / 时区偏移
- `format` / `valueFormat` / `timezone` / `utc` 组合
- `minDate` / `maxDate` / 禁用表达式（env.trusted 才执行 JS）
- `shortcuts`：今天/昨天/近一周；点击快捷键是否 close
- 手工输入日期/时间、Enter 提交、Esc 关闭、失焦 trim/commit
- `inputForbid`、`native`、`embed`、`clearable`
- 移动端滚轮列、确认/取消、跨月/跨年
- 时间部分（hour/minute/second）、`timeOnly`
- disabled/static/readOnly
- 深色日历、窄屏弹层、错误态

### 1.3 优先级

1. 值解析/格式化/时区
2. 编辑态与提交时序
3. 日期限制/快捷键
4. 移动端/内嵌/原生
5. 样式/深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/InputDate.tsx` 824 行；Vamis 552 行 + core `utils/input-date.ts` + `calendar.ts`）
- 依赖：`FormItem`、`calendar`、`popOver`、`button`、`input-range` 相关
- 风险：值格式/时区/移动端/输入编辑四套状态叠加

## 3. Amis 契约

### 3.1 入口与源码

- 入口：`input-date`；同族 `input-datetime` / `input-time` / `input-month` / 范围组件复用本套日期工具
- Amis 渲染器：`packages/amis/src/renderers/Form/InputDate.tsx`
- 在线文档：[Vamis `/components/form/input-date`](/components/form/input-date) / Amis `/zh-CN/components/form/input-date`

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `format` | 显示格式 | 只影响展示/输入解析，不是提交值格式 |
| `valueFormat` | 提交值格式 | `timestamp` / `YYYY-MM-DD` / `X` 等；与 format 分开 |
| `timezone` / `utc` | 时区 | 同一 dayjs 配置；UTC 提交/显示一致 |
| `minDate` / `maxDate` | 范围 | 日历/快捷键/输入同一判定；表达式按数据域 |
| `shortcuts` | 快捷项 | 解析为日期/范围；点击后是否 close |
| `embed` | 内嵌日历 | 不弹层；受 FormItem 静态/错误影响 |
| `native` | 原生 input | 值仍走日期解析 |
| `inputForbid` | 禁止手工输入 | 只能选择 |
| `clearable` | 清除 | clear 事件可阻止 |
| `closeOnSelect` | 选完关闭 | embed 时不关闭 |
| `timeFormat` / `showSeconds` | 时间部分 | datetime/time 共用 |
| `resetValue` | reset 值 | 与 clear 区分 |
| `disabled` / `static` / `readOnly` | 状态 | 统一禁止编辑/选择 |

### 3.3 事件

已接：`change`、`focus`、`blur`（非 embed）。

- `change` 在写值前派发，`prevented` 时不写值、不关闭；
- `focus` / `blur` 只对输入框形态（embed 不触发）。
- 没有独立 `open` / `close` 事件；不要自造。

### 3.4 动作/API

已接：`clear`、`reset`、`setValue`、`focus`（组件 API）。

`setValue({ value })` 按 `parseInputDateValue` + `storeInputDateValue` 写值；`reset` 使用 `resetValue` 或初始值；`clear` 写空串并触发 change。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputDate.vue`](../../../../packages/vamis/src/renderers/form/InputDate.vue) | 输入/日历/时间/移动端/内嵌/原生、draft、commit、API |
| [`input-date.ts`](../../../../packages/vamis-core/src/utils/input-date.ts) | 解析/格式化/限制/快捷键/移动列/reset 值 |
| [`calendar.ts`](../../../../packages/vamis-core/src/utils/calendar.ts) | 月格/年/月/禁用日期纯函数 |
| [`DateRange` / `InputDateRange`](https://github.com/baidu/amis) | 范围组件复用解析/日历/时区；不要另写 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | calendar/picker/日期弹层 token |

### 4.2 状态

```text
rawValue(name) ──parseInputDateValue──> parsed
      │                                   │
      ├─ displayText（format）            ├─ cursor / panelView
      ├─ draft（编辑中）                  ├─ pickerDraft（移动端）
      └─ open / embed / native            └─ shortcuts / disabled cells

commit(next) → change 事件 → write(next) → 可选 close
```

- `parsed` 只从当前值算；`draft` 在编辑时显示，不在 input 时写值。
- `cursor` 只控制面板月份；不随值变化重置到当月，除非同步逻辑。
- 移动端 `pickerDraft` 是草稿；确认时 `confirmPicker` 才 commit。
- `inputDateResetValue` / `pristine` 决定 reset 值。

### 4.3 交互

- 输入：`onInput` 只改 draft；Enter/失焦 commit；非法值不写。
- 选择日期：`pickDay` → `commit(storeInputDateValue, closeOnSelect)`；`cellDisabled` 拦截。
- 时间：`pickTime` 改 hour/minute/second；datetime 提交带时间。
- 移动端：`seedPicker` / `onPickerValues` / `confirmPicker`；取消不提交。
- 快捷键：`pickShortcut` 走同一 commit；范围/时区由 schema 决定。

## 5. 样式与边界

- 默认类：calendar/picker/date panel 相关，位于 `@vamis/ui/styles.css`；渲染器无 `<style>`。
- 日期弹层/日历格/快捷键/移动端滚轮走 token；不要写死 px/hex。
- 深色下日历边框、禁用格、快捷键 hover、选中年月要单独看；窄屏使用底部弹层。
- 作者 `className` 只落 `div.vamis-node`。

## 6. 当前状态与缺口

- 已对齐：`format` / `valueFormat` / `timezone` / UTC、min/max、shortcuts、embed、native、inputForbid、clearable、closeOnSelect、datetime 时间、移动端 picker、change/focus/blur、clear/reset/setValue/focus。
- 对照：TODO 记录 input-date 页面主路径；本轮未重跑。
- 风险/缺口：
  - `input-date` 与 `input-datetime` / time / month 的共享边界需逐项测；
  - 非法/空值/时区偏移的解析；
  - 移动端 picker 的跨月/跨年；
  - 深色日历与窄屏需专项截图；
  - 日期范围组件不在本文范围。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器 / input-date 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（日期相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-date` 桌面
- [ ] `pnpm compare --page input-date --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- `format` / `valueFormat` / timezone / utc 的组合
- 非法值不写、change 被阻止不写
- min/max 与 shortcuts、手工输入一致
- 移动端确认才写值
- 内嵌/原生/禁用态

## 8. 后续

1. 先补值格式/时区矩阵测试（与 datetime/time/month 共用工具）。
2. 移动端 picker 跨月/跨年与取消分支单独立项。
3. 深色日历/窄屏截图专项，不与日期逻辑混刀。

---

返回 [组件设计索引](../README.md)
