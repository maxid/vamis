# AnchorNav 锚点导航 · `anchor-nav` 设计

> 状态：**进行中 55%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/anchor-nav) · Amis：`/zh-CN/components/anchor-nav`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

AnchorNav 当前是**锚点导航**（65 行）：links/children 展平、点击 scrollIntoView、active href/索引、横向/纵向。没有滚动自动高亮/吸顶/嵌套深度；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **sections**：anchorNavSections 展平 links/children；key/title/body；空数组不崩。
2. **current**：chosen 点击优先，否则 schema.active（href/索引）解析。
3. **点击**：CSS.escape key 找 data-anchor，scrollIntoView smooth；找不到不报错。
4. **方向**：horizontal 横排，否则 lg 两栏；窄屏单栏。
5. **包边界**：无 `<style>`、无 fetch；anchor token。

### 边界用例

- 空/单/多锚点、children 展平、active href/索引
- 点击不存在的 key、重复 key
- 横向/纵向/窄屏/深色
- 滚动自动高亮（未接）

### 优先级

1. sections/current；2. 点击/scroll；3. 方向/响应式；4. 自动高亮。

## 2. 复杂度

- 等级：**L 重**（Amis 252 行；Vamis 65 行）；依赖 link/icon。
- 风险：key/滚动/自动高亮。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| links/children | 锚点 | 已接 |
| active | 当前 | 已接 |
| direction | 横向/纵向 | 已接 |
| 滚动高亮 | 目标 | 未接 |

## 4. 架构

- [`layout/AnchorNav.vue`](../../../packages/vamis/src/renderers/layout/AnchorNav.vue)：sections/current/go。
- [`anchor-nav.ts`](../../../packages/vamis-core/src/utils/anchor-nav.ts)：展平/active/direction。

## 5. 样式

- 链接/内容区/滚动；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

滚动自动高亮/吸顶/key 去重/深色浅色。

## 7. 验收

- sections/active/点击/方向/空/窄屏；未接不误标。

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

补 IntersectionObserver 自动高亮；再评估吸顶/嵌套。

---

返回 [组件设计索引](README.md)
