# ButtonToolbar 按钮工具栏 · `button-toolbar` 设计

> 状态：**进行中 60%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/button-toolbar) · Amis：`/zh-CN/components/form/button-toolbar`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

ButtonToolbar 当前是**按钮横向容器**（19 行）：buttons/body + flex wrap；注册为 `isFormItem`。没有分组/对齐/间距档/溢出；60% 是真实缺口。

## 1. 边界与优先级（先读）

1. **子项**：buttons/body；SchemaRenderer；空不崩。
2. **布局**：flex wrap gap-2；没有对齐/等宽/垂直。
3. **表单**：isFormItem true，包 FormItem；按钮在表单里可 submit/reset。
4. **包边界**：无 `<style>`、无 fetch；toolbar token。

### 边界用例

- 空/单/多按钮/submit/reset
- 换行/窄屏/深色
- 对齐/等宽/溢出（未接）

### 优先级

1. 子项/布局；2. 表单提交；3. 对齐/响应式；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 72 行；Vamis 19 行）；依赖 action/container。
- 风险：当前仅 flex 容器。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| buttons/body | 子按钮 | 已接 |
| FormItem | 表单包装 | 已接 |
| 对齐/等宽/溢出 | 目标 | 未接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`ButtonToolbar.vue`](../../../packages/vamis/src/renderers/ButtonToolbar.vue)：buttons/flex。
- [`Action`](action.md)：按钮行为。

## 5. 样式

- flex wrap gap；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

对齐/等宽/溢出/themeCss/深色。

## 7. 验收

- 空/多按钮/换行/表单提交/窄屏；未接不误标。

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

先补对齐/等宽，再做溢出；保持薄容器。

---

返回 [组件设计索引](README.md)
