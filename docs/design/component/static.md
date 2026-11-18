# Static 静态展示 · `static` 设计

> 状态：**进行中 85%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/static) · Amis：`/zh-CN/components/form/static`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Static 当前是**静态值/子组件展示**（139 行）：name/value/text/tpl、static-xxx 泛型、popOver、copyable、Schema 子组件。主路径成熟；缺口 quickEdit/themeCss/深色。

## 1. 边界与优先级（先读）

1. **取值**：form 值优先，其次 data，最后 schema.value；name 路径。
2. **子类型**：`static-xxx` → xxx；无后缀 tpl 走 tpl，否则 plain。
3. **text/tpl**：text 优先模板；tpl 走 Tpl；对象 JSON.stringify。
4. **copyable/popOver**：复制内容/提示；popOver 包内容。
5. **包边界**：无 `<style>`、无 fetch；static token。

### 边界用例

- 空/字符串/对象/数组/form/data/schema.value
- text/tpl/static-xxx/Schema 子组件
- copyable/popOver/quickEdit（未接）
- 深色/窄屏

### 优先级

1. 取值/子类型；2. text/tpl；3. copy/popOver；4. quickEdit/样式。

## 2. 复杂度

- 等级：**L 重**（Amis 236 行；Vamis 139 行）；依赖 tpl/popOver/icon。
- 风险：取值优先级/子类型映射。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| name/value | 值 | 已接 |
| text/tpl | 展示 | 已接 |
| static-xxx | 子类型 | 已接 |
| copyable/popOver | 附属 | 已接 |
| quickEdit | 目标 | 未接 |

## 4. 架构

- [`form/Static.vue`](../../../packages/vamis/src/renderers/form/Static.vue)：取值/子类型/Tpl/popOver/复制。
- [`tpl`](tpl.md)/[`PopOver`](popover.md)：渲染。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- static 文本/复制/图标 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

quickEdit/themeCss/深色。

## 7. 验收

- 取值/子类型/text/tpl/copy/popOver/空；未接不误标。

## 8. 后续

quickEdit 单独立项；themeCss/深色随主题。

---

返回 [组件设计索引](README.md)
