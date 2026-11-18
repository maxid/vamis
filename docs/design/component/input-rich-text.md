# InputRichText 富文本 · `input-rich-text` 设计

> 状态：**进行中 25%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-rich-text) · Amis：`/zh-CN/components/form/input-rich-text`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputRichText 是**明确的精简非目标实现**：多行 Textarea，保存 HTML/纯文本，不加载 TinyMCE/Froala。25% 不是“快完成”，而是“设计上不做完整富文本”。若要做完整能力，需单独立项并引入编辑器依赖。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：字段值是字符串（HTML 或纯文本）；`controlInputValue` 把 null/对象收成字符串；无 name 不写。
2. **不做富文本**：当前没有工具栏/粘贴清洗/图片上传/HTML 编辑；不要按 TinyMCE/Froala 行为验收。
3. **安全**：保存的是原始字符串；展示端必须走 `tpl` 转义或 trusted raw，组件自身不做 sanitize。
4. **校验**：必填/长度/自定义 validations 归 FormItem；组件不另写。
5. **包边界**：无 `<style>`、无 fetch/上传；Textarea/token 由 UI 提供。

### 1.2 边界用例

- 空值 / null / 对象 / 长文本 / HTML 字符串
- disabled/static/readOnly
- 外部 setValue/reset
- 粘贴 HTML/脚本（展示端负责）
- 窄屏/深色
- 完整富文本能力（非目标，勿误标）

### 1.3 优先级

1. 值/写回/安全说明
2. FormItem 校验/状态
3. 若升级富文本：依赖/工具栏/上传/清洗独立立项

## 2. 复杂度

- 等级：**XL 特重**（Amis 464 行；Vamis 27 行，精简）
- 依赖：`FormItem`、`Textarea`
- 风险：容易被误认为完整富文本

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 字符串值 | 已接 |
| `placeholder` | 占位 | 已接 |
| 工具栏/图片/附件 | 富文本能力 | **非目标，未接** |
| 上传/清洗 | 富文本能力 | **非目标，未接** |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`InputRichText.vue`](../../../packages/vamis/src/renderers/form/InputRichText.vue)：Textarea + FormItem。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。
- 展示端用 Tpl/HTML 渲染；不要在本组件内 `v-html` 作者输入。

## 5. 缺口/非目标

完整富文本编辑器、工具栏、图片上传、HTML 清洗、事件动作。文档必须写“精简实现”。

## 6. 验收

- 值/占位/disabled/校验/窄屏/深色。
- 不测试 TinyMCE/Froala 行为。
- 展示端转义/raw 信任边界单独核。

## 7. 后续

保持精简，或单独立项“富文本编辑器”并明确依赖/安全边界。

---

返回 [组件设计索引](README.md)
