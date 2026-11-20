# Page 页面 · `page` 设计

> 状态：**进行中 95%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/page) · Amis：`/zh-CN/components/page`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Page 是**页面级独立 Scope + 布局壳**：title/subTitle/remark、toolbar、aside（可拖拽宽度）、body、initApi/轮询、page API。主路径已成熟；唯一明确缺口是移动端 `pullRefresh`，所以停在 95%。

## 1. 边界与优先级（先读）

1. **独立 Scope**：Page 建 scope；body 读 Page 域，不是父域；`reload/setValue/getData` 通过 scope。
2. **URL 查询种子**：首屏把 URL query 合并进 scope；不要覆盖已有 schema data，顺序需固定。
3. **initApi / 根级 Action**：initApi 的 GET 不把整个数据域拼 query，`initFetch/initFetchOn` 决定首屏；Page 内根级 `ajax` Action 在请求期间复用同一 Page overlay，请求结束即撤罩，feedback Dialog 在其后打开。
4. **轮询**：interval ≥1000；stopAutoRefreshWhen 命中停止；silentPolling 只隐藏轮询遮罩，首次/手动 reload 仍显示。
5. **布局**：无 title 时 toolbar 吃满；header/toolbar/body/aside 全 div；aside 可拖拽 min/max，拖拽监听卸载清理。
6. **事件**：init、inited；payload 含 responseData/Status/Msg + 当前域；不要漏失败路径。
7. **包边界**：无 `<style>`、无 fetch；Page/panel/toolbar token。

### 边界用例

- 空 body/title/toolbar/aside；aside 左/右、sticky、min/max 拖拽
- initApi 成功/失败/skipped/initFetch false/变量 URL
- interval/stopAutoRefreshWhen/silentPolling；卸载清 timer
- URL query 种子/覆盖顺序
- reload(extra,replace)/setValue
- 窄屏/深色/pullRefresh（未接）

### 优先级

1. Scope/URL 种子/initApi；2. 布局/aside；3. 轮询/事件；4. 移动 pullRefresh/样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 1329 行；Vamis 355 行）；依赖 container/panel/flex/grid/tabs/action/service/dialog/drawer/crud/form/tpl/spinner/remark。
- 风险：Scope/API/轮询/aside 拖拽多状态。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `title`/`subTitle`/`remark` | 头部 | 已接 |
| `toolbar` / `body` / `aside` | 布局 | 已接 |
| `asidePosition`/`asideSticky`/min/max | 侧栏 | 已接 |
| `initApi`/`initFetch`/`initFetchOn` | 初始化 | 已接 |
| 根级 `ajax` Action | Page loading overlay | 已接；请求期间显示，feedback 打开前关闭 |
| `interval`/`stopAutoRefreshWhen`/`silentPolling` | 轮询 | 已接 |
| `css` / 区域 class | 样式 | 已接 |
| `pullRefresh` | 移动 | **未接** |

### 事件/API

事件：`init`、`inited`。API：`reload(extra,replace)`、`getData`、`setData`；scoped 注册。

## 4. 架构

- [`Page.vue`](../../../../packages/vamis/src/renderers/Page.vue)：scope/布局/aside/initApi/轮询/API。
- ``page.ts``：title/布局/尺寸纯函数。
- [`SchemaRenderer`](../../../../packages/vamis-core/src/SchemaRenderer.vue)：body/toolbar/aside。

### 数据流

```text
URL query + props.data → scope
initApi(initial) → merge scope → inited → schedulePoll
reload(extra,replace) → scope.merge → initApi
```

## 5. 样式

- page/header/toolbar/aside/body token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

pullRefresh（移动端）；深色/窄屏逐项；aside 拖拽触控。

## 7. 验收

- Scope/URL/initApi/轮询/aside/拖拽/事件/窄屏；pullRefresh 不误标。

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

补 pullRefresh 前先定移动端刷新交互；其余保持稳定，不与页面级重构混刀。

---

返回 [组件设计索引](../README.md)
