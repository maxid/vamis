# ChartRadios 图表单选框 · `chart-radios` 设计

> 状态：**进行中 35%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/chart-radios) · Amis：`/zh-CN/components/form/chart-radios`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

ChartRadios **不是图表组件**：当前只是 `Radios` 的薄包装（10 行），没有真实图表点选/图表渲染。35% 是“占位别名”，不要按 Amis 图表交互验收。

## 1. 边界与优先级（先读）

1. **真实行为**：ChartRadios → Radios；schema.type 被 Radios 识别为普通单选，图表配置不生效。
2. **无图表**：不加载 echarts、不点选图表；不要按 chart-radios 视觉验收。
3. **值/事件**：与 Radios 相同（单选值/change）。
4. **包边界**：无 `<style>`、无 fetch。
5. **计划**：若要真实图表点选，必须独立设计（echarts + 选中映射 + 无障碍），不要在 Radios 上硬塞。

### 边界用例

- options/单选/disabled/外部 setValue
- 图表配置/点选（非目标）
- 窄屏/深色

### 优先级

1. 明确占位边界；2. 真实图表点选独立立项；3. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 183 行；Vamis 10 行）；依赖 Radios、chart。
- 风险：被误认为完整图表选择。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| options/value | 单选 | 继承 Radios |
| 图表配置/点选 | 目标 | 未接/非目标 |
| 事件/动作 | 目标 | 继承 Radios |

## 4. 架构

- [`form/ChartRadios.vue`](../../../../packages/vamis/src/renderers/form/ChartRadios.vue)：仅 `<Radios :schema>`。
- [`form/Radios.vue`](../../../../packages/vamis/src/renderers/form/Radios.vue)：全部行为。

## 5. 缺口

真实图表点选/echarts 集成/无障碍；当前无。

## 6. 验收

- 确认走 Radios；不要测图表；未接不误标。

## 7. 后续

保持精简或单独立项“图表点选”；先定图表类型/选中事件/无障碍。

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

---

返回 [组件设计索引](../README.md)
