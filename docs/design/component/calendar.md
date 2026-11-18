# Calendar 日历 · `calendar` 设计

> 状态：**进行中 60%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/calendar) · Amis：`/zh-CN/components/calendar`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Calendar 当前是**月历展示/日程**（188 行）：cursor、large、schedules、周/月/年切换、移动滚轮、年月选择、schedule 打开。没有拖拽建日程/多日跨周条/编辑 API；60% 是真实缺口。

## 1. 边界与优先级（先读）

1. **cursor/值**：calendarParseDate/calendarRawValue；无效值回落今天。
2. **schedules**：calendarSchedules；按日期映射；跨周日程 lanes。
3. **视图**：days/months/years；large/移动滚轮；切换不清选中。
4. **交互**：schedule 打开/关闭；拖拽建/改未接；事件/动作未接。
5. **包边界**：无 `<style>`、无 fetch；calendar token。

### 边界用例

- 空/单日程/多日程/跨周/跨月/跨年
- large/移动/days/months/years
- schedule 打开/关闭/拖拽（未接）
- 窄屏/深色

### 优先级

1. cursor/schedules；2. 视图/移动；3. schedule/交互；4. 拖拽/API。

## 2. 复杂度

- 等级：**L 重**（Amis 59 行包装 + calendar；Vamis 188 行）；依赖 calendar 工具。
- 风险：跨周 lanes/移动滚轮。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/cursor | 当前月 | 已接 |
| schedules | 日程 | 已接 |
| large/view | 展示 | 已接 |
| schedule 打开 | 交互 | 已接 |
| 拖拽/API/事件 | 目标 | 未接 |

## 4. 架构

- [`display/Calendar.vue`](../../../packages/vamis/src/renderers/display/Calendar.vue)：cursor/schedules/weeks/lanes/视图。
- [`calendar.ts`](../../../packages/vamis-core/src/utils/calendar.ts)：月格/weekLanes/年月。
- [`InputDate`](input-date.md)：日期组件（非日历）。

## 5. 样式

- 日历格/日程条/移动滚轮 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

拖拽建/改/删除日程、事件动作、深色/窄屏。

## 7. 验收

- cursor/schedules/跨周/视图/移动/打开；拖拽不误标。

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

拖拽/API 单独立项；保持日历只展示。

---

返回 [组件设计索引](README.md)
