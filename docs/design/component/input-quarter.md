# InputQuarter 季度 · `input-quarter` 设计

> 状态：**进行中 45%** · 复杂度：**XL 特重**（Amis 824 行系列，共享 77 行）
> 文档：[在线 API 手册](/components/form/input-quarter) · Amis：`/zh-CN/components/form/input-quarter`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputQuarter 与 year/month 共用 `DatePart.vue`：年 number + Q1–Q4 select，值 `YYYY-Qn`（`formatQuarter/parseQuarter`）。没有季度历、格式/值格式、范围表达式、事件/动作；45% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **共享组件**：quarter/month/year 共用 DatePart；改 quarter 回归另外两个。
2. **值格式**：`YYYY-Qn`；`parseQuarter` 对非法值兜底；不要写 `{year,quarter}` 对象。
3. **年/季**：年 1900–2100；季度 1–4；年空或季空时不要拼出半合法值。
4. **写回**：无 name 不写；FormItem/校验负责 required。
5. **包边界**：无 `<style>`、无 fetch；输入/select token。

### 1.2 边界用例

- 空/合法季度/非法季度/年越界/季空
- 值 `/`、`-` 分隔、大小写 Q
- month/year 类型切换
- disabled/static/readOnly
- 外部 setValue/reset
- 目标季度历/格式/事件动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 共享组件/值格式
2. 年季组合/空值
3. 格式/季度历
4. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis 824 行；Vamis DatePart 77 行，共享）
- 依赖：`FormItem`、`formatQuarter/parseQuarter`
- 风险：共享组件 + 字符串格式

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | `YYYY-Qn` | 已接 |
| `min` / `max` | 年范围 | 原生 1900–2100 |
| `format` / `valueFormat` | 格式 | 未接 |
| 季度历 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/form.ts`](../../../packages/vamis/src/extras/form.ts)：注册。
- [`form/DatePart.vue`](../../../packages/vamis/src/renderers/form/DatePart.vue)：kind=quarter、quarter computed。
- [`quarter.ts`](../../../packages/vamis-core/src/utils/quarter.ts)：format/parse。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → parseQuarter → {year,quarter}
输入年/季 → formatQuarter → setValue('YYYY-Qn')
```

## 5. 样式与边界

- 年 input + 季度 native select；无专属类、无 `<style>`。
- 窄屏年/季并排；深色 select 单独核。

## 6. 当前状态与缺口

- 已接：年+季度输入、`YYYY-Qn`、1900–2100。
- 未接：季度历/格式/范围表达式/事件动作/深色。
- 对照：TODO 45%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] 共享 DatePart / quarter 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（quarter 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-quarter` 桌面
- [ ] `pnpm compare --page input-quarter --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 三类共享测试。
2. 季度历/格式/事件动作若需要，先改 DatePart。
3. 深色/窄屏专项。

---

返回 [组件设计索引](README.md)
