# Date 日期展示 · `date` 设计

> 状态：**进行中 60%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/date) · Amis：`/zh-CN/components/date`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Date 是**静态日期展示**（StaticValue），date/datetime/time/month 类型共用；date/datetime 过滤器已接，组件自身格式档未齐。60% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：value/name/data；空值 placeholder；不参与表单值写入。
2. **格式**：依赖 date/datetime 过滤器；format/valueFormat 组件属性未齐。
3. **时区/UTC**：过滤器层处理；组件不单独换算。
4. **包边界**：无 `<style>`、无 fetch；static/tpl token。

### 边界用例

- 空/日期字符串/时间戳/对象/非法值
- date/datetime/time/month 类型
- 格式/时区/placeholder（部分未接）
- 深色/窄屏

### 优先级

1. 值/空；2. 过滤器/格式；3. 时区/类型；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 250 行；Vamis 复用 StaticValue）；依赖 tpl/formula。
- 风险：格式/时区能力分散。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/name | 值 | 继承 Static |
| date/datetime 过滤器 | 格式 | 已接 |
| format/valueFormat | 目标 | 未齐 |
| 时区 | 目标 | 过滤器层 |

## 4. 架构

- `extras/rest.ts` → `StaticValue`。
- formula date/datetime 过滤器。

## 5. 样式

- 静态文本；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

格式/时区组件属性/深色。

## 7. 验收

- 值/类型/空/过滤器；未接不误标。

## 8. 后续

格式统一到 formula；不复制日期解析。

---

返回 [组件设计索引](README.md)
