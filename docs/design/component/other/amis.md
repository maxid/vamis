# Amis 嵌入 · `amis` 设计

> 状态：**进行中 40%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/amis) · Amis：`/zh-CN/components/amis`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

Amis 当前是**内嵌 schema 包装**（11 行）：amisEmbedInner 解析后交给 SchemaRenderer。没有外部 Amis 运行时/iframe/跨版本兼容；40% 是精简。

## 1. 边界与优先级（先读）

1. **内层 schema**：amisEmbedInner；无 inner 不渲染。
2. **不搬 amisRequire**：不加载外部 Amis；只在本运行时渲染。
3. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/对象/字符串/嵌套 page/form
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 58 行；Vamis 11 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| schema/body | 内层 | 已接 |
| 外部 Amis | 目标 | 非目标 |

## 4. 架构

- `rest/AmisEmbed.vue`：amisEmbedInner/SchemaRenderer。

## 5. 缺口

外部运行时/跨版本（非目标）。

## 6. 验收

- 内层 schema/空/嵌套/窄屏。

## 7. 后续

保持内嵌；不引入外部 Amis。

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
