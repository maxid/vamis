# App 多页应用 · `app` 设计

> 状态：**进行中 55%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/app) · Amis：`/zh-CN/components/app`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

App 当前是**静态多页壳**（95 行）：pages/分组展平、schema/link/visible、默认页/404、brand/slots；没有 hash 路由/schemaApi/api/redirect/rewrite。55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **导航**：appNav/appFlat 展平 pages，group 只作标题；visible false 隐藏。
2. **页面**：item.schema 内嵌；link 走 env.jumpTo；当前 key 不在 flat 时显示 notFound。
3. **默认页**：无 currentKey 用 defaultPage；isDefaultPage 标记。
4. **槽位**：brand/logo/header/asideBefore/asideAfter/footer。
5. **包边界**：无 `<style>`、无 fetch；app token。

### 边界用例

- 空 pages/分组/多页/缺 schema/link/visible false
- 默认页/404/当前 key 失效
- brand/logo/slots/窄屏/深色
- hash 路由/api/redirect/rewrite（未接）

### 优先级

1. 导航/页面；2. 默认/404；3. slots/brand；4. 路由/API。

## 2. 复杂度

- 等级：**L 重**（Amis 582 行；Vamis 95 行）；依赖 page/nav/service。
- 风险：页面切换/默认页/路由缺口。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| pages/分组 | 导航 | 已接 |
| schema/link/visible | 页面 | 已接 |
| isDefaultPage/404 | 默认 | 已接 |
| brand/logo/slots | 外观 | 已接 |
| hash 路由/schemaApi/api | 目标 | 未接 |

## 4. 架构

- [`layout/App.vue`](../../../../packages/vamis/src/renderers/layout/App.vue)：nav/flat/current/slots。
- [`app.ts`](../../../../packages/vamis-core/src/utils/app.ts)：nav/flat/default/notfound/slots。
- [`SchemaRenderer`](../../../../packages/vamis-core/src/SchemaRenderer.vue)：页面 schema。

## 5. 样式

- app 边框/侧栏/品牌/内容；token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

hash 路由/schemaApi/api/redirect/rewrite/深色窄屏。

## 7. 验收

- 导航/页面/默认/404/slots/窄屏；未接不误标。

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

路由/API 单独立项；当前保持静态页面。

---

返回 [组件设计索引](../README.md)
