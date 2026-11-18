# InputExcel Excel 解析 · `input-excel` 设计

> 状态：**进行中 20%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-excel) · Amis：`/zh-CN/components/form/input-excel`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputExcel 当前是**文件选择占位**（22 行）：只记录文件名/大小/type，不解析表格、不上传。20% 是真实缺口；完整解析需要 Excel 依赖、列头映射、错误行处理。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：当前写 `{name,size,type}`；不是 Excel 行数据。不要把它当解析结果。
2. **文件选择**：accept 只做前端提示；不校验真实内容；不自动上传。
3. **安全**：不把文件内容写 DOM/日志；解析库需按需加载并限制大小。
4. **无 name 不写**；disabled 时不能选文件。
5. **包边界**：无 `<style>`、无 fetch；Input file/token 由 UI。

### 1.2 边界用例

- 空文件/取消选择/超大文件/错误后缀
- 非 .xlsx/.xls/.csv；合法但空表
- 重复选择同名文件
- disabled/static
- 目标解析：表头/工作 sheet/错误行/类型推断（未接）
- 窄屏/深色

### 1.3 优先级

1. 文件元信息/写回
2. 文件类型/大小/错误提示
3. 解析能力（依赖/列映射/错误行）
4. 上传/预览/事件动作

## 2. 复杂度

- 等级：**XL 特重**（Amis 975 行；Vamis 22 行）
- 依赖：`FormItem`、`input-file`（目标）
- 风险：当前仅占位，解析/上传全未接

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 文件信息/解析结果 | 仅 `{name,size,type}` |
| `accept` | 后缀 | 已写死 xlsx/xls/csv |
| 解析/列头/错误行 | 目标 | 未接 |
| 上传/预览 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`InputExcel.vue`](../../../packages/vamis/src/renderers/form/InputExcel.vue)：file input + onFile。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。
- 解析库应独立通道（动态 import），不能进主包。

## 5. 缺口/非目标

真实解析、上传、预览、列映射、错误行、事件动作。

## 6. 验收

- 选择/取消/空文件/错误后缀/disabled/窄屏深色。
- 不测试解析结果（未实现）。
- 文件大小/安全限制需明确。

## 7. 后续

先定是否做解析（依赖/大小/映射），再做上传/预览；否则保持占位并明确标注。

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

返回 [组件设计索引](README.md)
