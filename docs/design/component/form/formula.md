# Formula 公式 · `formula` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/formula) · Amis：`/zh-CN/components/form/formula`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Formula 是**公式写值**：formula/value 计算、initSet/autoSet、condition、组件 API apply。当前公式引擎/模板混合，NaN 兜底 0；缺完整函数/错误展示/input-formula 编辑器。

## 1. 边界与优先级（先读）

1. **计算**：`${...}` 走 filterTpl，否则 evalFormula；NaN → 0；结果 string/number。
2. **写值**：name+form 才写；condition 不满足不写；applying 防回环。
3. **autoSet**：监听 form.store.data/data 深比较；卸载停 watch。
4. **initSet**：挂载先 apply；false 不初始化。
5. **包边界**：无 `<style>`、无 fetch；input 只读展示。

### 边界用例

- 空 formula/模板/表达式/NaN/对象
- initSet/autoSet/condition/disabled
- 依赖字段变化/回环/卸载
- 窄屏/深色

### 优先级

1. 计算/写值；2. autoSet/condition；3. 防回环/API；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 181 行；Vamis 79 行）；依赖 formula/tpl。
- 风险：公式求值/回环/NaN。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| formula/value | 公式 | 已接 |
| initSet/autoSet/condition | 行为 | 已接 |
| apply/reload API | 动作 | 已接 |
| input-formula 编辑器 | 目标 | 未接 |

## 4. 架构

- [`form/Formula.vue`](../../../../packages/vamis/src/renderers/form/Formula.vue)：result/apply/watch/API。
- [`formula` 包](../../../../packages/vamis-formula)：evalFormula/filterTpl。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label。

## 5. 样式

- 只读 Input；无专属类、无 `<style>`；深色/窄屏单独核。

## 6. 缺口

input-formula 编辑器/完整函数/错误展示/深色。

## 7. 验收

- 计算/模板/NaN/autoSet/condition/卸载；未接不误标。

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

input-formula 单独立项；公式引擎按公式包统一。

---

返回 [组件设计索引](../README.md)
