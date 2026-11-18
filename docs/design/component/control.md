# Control 表单项包裹 · `control` 设计

> 状态：**进行中 40%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/form/control) · Amis：`/zh-CN/components/form/control`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Control 当前是**FormItem + 单个子 schema 的薄包装**（14 行）：body 或 control；没有额外布局/状态/API。40% 是因为它只做包裹，不表示能力完整。

## 1. 边界与优先级（先读）

1. **子节点**：body 优先，否则 control；空不渲染。
2. **FormItem 外壳**：label/校验/静态/错误由 FormItem 提供。
3. **包边界**：无 `<style>`、无 fetch；form token。

### 边界用例

- body/control/空/复杂子 schema
- FormItem label/校验/静态
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 53 行；Vamis 14 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| body/control | 子 schema | 已接 |
| FormItem | 外壳 | 已接 |

## 4. 架构

- `Control.vue`：FormItem + SchemaRenderer。

## 5. 缺口

无；能力由子 schema/FormItem 决定。

## 6. 验收

- 子 schema/空/表单包裹；不按独立控件验收。

## 7. 后续

保持薄；不要扩成第二套 FormItem。

---

返回 [组件设计索引](README.md)
