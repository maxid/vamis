# Flex 布局 · `flex` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/flex) · Amis：`/zh-CN/components/flex`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Flex 当前是**响应式 flex 容器**（45 行）：justify/alignItems/alignContent/direction/items、mobile 覆盖、media query。没有 themeCss、整树 envOverwrite；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **resolved schema**：`flexResolvedSchema(schema,isMobile)` 合并 mobile 覆盖；不要在模板里手写 media 分支。
2. **items**：items 或 body；空数组不崩；子节点 SchemaRenderer。
3. **样式**：`flexLayoutStyle` 映射 justify/align/direction；不要写死 px。
4. **media**：matchMedia 监听，卸载移除；SSR/无 window 兜底 false。
5. **包边界**：无 `<style>`、无 fetch；flex token。

### 边界用例

- 空/单/多子项；row/column；justify/align 组合
- mobile 覆盖/无 media 环境
- 嵌套 flex/grid；窄屏/深色
- themeCss/envOverwrite 未接

### 优先级

1. resolved/items；2. 样式/媒体；3. 嵌套/响应式；4. 缺口。

## 2. 复杂度

- 等级：**M 中**（Amis 252 行；Vamis 45 行）；依赖 container。
- 风险：mobile 覆盖/媒体监听。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `items`/`body` | 子项 | 已接 |
| justify/alignItems/alignContent/direction | 布局 | 已接 |
| `mobile` | 覆盖 | 已接 |
| themeCss/envOverwrite | 目标 | 未接 |

## 4. 架构

- [`Flex.vue`](../../../packages/vamis/src/renderers/Flex.vue)：resolved/items/layoutStyle/media。
- [`flex.ts`](../../../packages/vamis-core/src/utils/flex.ts)：resolved/style。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：子项。

## 5. 样式

- inline flex style；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、整树 envOverwrite、深色/窄屏逐项。

## 7. 验收

- 子项/方向/对齐/mobile/空/窄屏；未接不误标。

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

补 themeCss/envOverwrite；媒体监听已清，保持。

---

返回 [组件设计索引](README.md)
