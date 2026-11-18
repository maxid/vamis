# Log 实时日志 · `log` 设计

> 状态：**进行中 25%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/log) · Amis：`/zh-CN/components/log`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Log 当前是**静态分行展示**（20 行）：数组/字符串按换行拆行，ScrollArea。没有轮询/ANSI 颜色/自动滚动/过滤/行号；25% 是真实缺口，“实时”未实现。

## 1. 边界与优先级（先读）

1. **值**：value/data 或 schema.source；数组逐项 String，字符串按换行；空显示“暂无日志”。
2. **无实时**：没有 interval/WebSocket/自动追加；不要按实时日志验收。
3. **无 ANSI**：颜色/控制字符不解析。
4. **滚动**：ScrollArea 展示；自动滚到底/暂停未接。
5. **包边界**：无 `<style>`、无 fetch；log token。

### 边界用例

- 空/单行/多行/数组/对象
- 长日志/自动滚动/过滤（未接）
- ANSI/错误高亮（未接）
- 深色/窄屏

### 优先级

1. 值/分行；2. 滚动/大日志；3. 实时/ANSI/过滤；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 555 行；Vamis 20 行）；依赖 ScrollArea。
- 风险：被误认为实时日志。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/source | 日志文本 | 已接 |
| interval/实时 | 目标 | 未接 |
| ANSI/过滤/行号 | 目标 | 未接 |
| 自动滚动 | 目标 | 未接 |

## 4. 架构

- [`rest/Log.vue`](../../../../packages/vamis/src/renderers/rest/Log.vue)：lines + ScrollArea。
- [`format.ts`](../../../../packages/vamis/src/renderers/rest/format.ts)：readValue。

## 5. 样式

- log 行/token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

实时/ANSI/过滤/行号/自动滚动/深色。

## 7. 验收

- 值/分行/空/长日志/窄屏；不要测实时。

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

实时/ANSI 单独立项；先定数据源与背压，再做自动滚动。

---

返回 [组件设计索引](../README.md)
