# InputTime 时间 · `input-time` 设计

> 状态：**进行中 60%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-time) · Amis：`/zh-CN/components/form/input-time`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputTime **没有独立渲染器**：是 `input-date` 别名，走 InputDate 的时间模式（时间面板/窄屏滚轮）；桌面仍是下拉，时间 min/max 约束未齐。60% 是真实缺口。

## 1. 边界与优先级（先读）

1. **别名**：input-time → InputDate；改行为只改 InputDate/日期工具。
2. **时间值**：HH:mm(:ss)；valueFormat/timezone/utc 与 InputDate 共用。
3. **约束**：min/max 时间约束未齐；不要声称完整。
4. **移动**：窄屏滚轮已接；桌面仍是下拉。
5. **包边界**：无 `<style>`、无 fetch；日期 token。

### 边界用例

- 空/合法时间/非法/秒
- min/max/时区/UTC
- 桌面下拉/移动滚轮
- 禁用/静态/窄屏/深色

### 优先级

1. 别名/时间值；2. 约束/格式；3. 桌面交互；4. 样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 824 行；Vamis 复用 InputDate 552 行）；依赖 input-date。
- 风险：时间约束/桌面交互缺口。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| name/value | 时间 | 已接 |
| valueFormat/utc | 格式 | 共享 |
| min/max 时间 | 约束 | 未齐 |
| 桌面下拉/移动滚轮 | 交互 | 部分 |

## 4. 架构

- `register.ts` alias → [`InputDate.vue`](../../../packages/vamis/src/renderers/form/InputDate.vue)。
- [`input-date.ts`](../../../packages/vamis-core/src/utils/input-date.ts)：时间解析/列。

## 5. 样式

- 时间列/滚轮 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

时间 min/max 约束、桌面下拉体验、深色。

## 7. 验收

- 值/格式/桌面/移动/禁用/窄屏；未接不误标。

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

随时段约束/桌面交互单独立项；不新增组件。

---

返回 [组件设计索引](README.md)
