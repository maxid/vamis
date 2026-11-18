# Service 服务 · `service` 设计

> 状态：**进行中 70%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/service) · Amis：`/zh-CN/components/service`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Service 是**带独立数据域的数据加载容器**：`api` 拉数据、`schemaApi` 拉子 schema、`interval` 轮询、错误 alert、loading spinner，并把数据 merge 到自己的 Scope / form / 页面。它不画业务 UI，但数据域隔离、轮询清理、schema 重建和错误状态是核心难点。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **独立 Scope**：Service 用 `hub.add` 建独立 store，数据只进本层 Scope；`scope.merge` 后再渲染子节点，不能把父域字段随手写进本层或反过来。
2. **api vs schemaApi**：`api` 拉数据、`schemaApi` 拉子 schema；两者都有时先数据/后 schema（或按 reload flags），不要混成一个请求。
3. **轮询**：`interval >= 1000` 才启动；`stopAutoRefreshWhen` 命中时停止；卸载清 timer；`silentPolling` 只隐藏 loading，不跳过请求。
4. **错误/加载**：失败显示 error alert + notify，成功清错误；`hideError` 等开关按 schema；spinner 只覆盖 loading 区。
5. **数据合并**：`setData` / API 返回要区分 merge / replace（`replaceData`）；表单存在时同步 `formApi.setData`；不要只改 store 不同步 Scope。
6. **事件时序**：`init` → `fetchInited` / `fetchSchemaInited`；事件参数含 responseData/Status/Msg/error + 当前域字段；不要漏 fetchSchemaInited。
7. **包边界**：无 `<style>`、无直接 fetch；`requestApi` 统一；SchemaRenderer 渲染 body/error/spinner。

### 1.2 边界用例

- 无 api / 只有 schemaApi / 两者都有 / initFetch false
- api 慢返回、失败、skipped、replaceData
- schemaApi 返回 schema 字符串/数组/对象
- `interval` <1000 / stopAutoRefreshWhen / silentPolling
- 卸载时轮询停止、定时器清理
- 错误 alert / hideError / 重试
- 表单存在时 setData 同步；无表单时 Scope
- 父域字段、同名覆盖、独立数据域
- WebSocket / 外部函数（文档章节，当前未接要注明）
- 窄屏/深色/loading

### 1.3 优先级

1. 独立 Scope / api / schemaApi
2. 轮询与清理
3. 错误/加载/数据合并
4. 事件/动作
5. WebSocket/外部数据源（后续）
6. 样式/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Service.tsx` 932 行；Vamis 303 行）
- 依赖：`container`、`spinner`、`alert`、`schema` 渲染链
- 风险：数据域 × API 状态 × 轮询 × schema 重建叠加

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'service'`
- Amis 渲染器：`packages/amis/src/renderers/Service.tsx`
- 在线文档：[Vamis `/components/service`](/components/service)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `api` | 数据接口 | 返回数据 merge store/Scope |
| `schemaApi` | 子 schema 接口 | 远程 schema 渲染；与 api 分开 |
| `initFetch` / `initFetchSchema` | 初始化是否拉取 | false 时不请求 |
| `interval` / `stopAutoRefreshWhen` | 轮询 | ≥1000ms；命中停止 |
| `silentPolling` | 静默轮询 | 不显示 loading，仍请求 |
| `messages` | 成功/失败文案 | env.notify |
| `hideError` / `errorClassName` | 错误展示 | 与 error alert 一致 |
| `body` / `schema` | 子内容 | SchemaRenderer 渲染 |
| `data` | 初始数据 | 进独立 Scope |
| `name` / `id` | 组件 API 目标 | setValue/reload/rebuild |

### 3.3 事件

已接：`init`、`fetchInited`、`fetchSchemaInited`（api/schemaApi 后）；参数含 responseData/Status/Msg/error + 当前域字段。

### 3.4 动作/API

已接：`reload`、`rebuild`、`setValue`（scoped API）；`getData` / `setData` / `doAction(reload|rebuild)`。

`rebuild` 可带 args 合并数据并重建 schema；`reload` 可带 data，`dataMergeMode: override` 覆盖。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Service.vue`](../../../packages/vamis/src/renderers/Service.vue) | store/Scope、api/schemaApi、轮询、错误/loading、reload/rebuild、scoped API |
| [`service.ts`](https://github.com/baidu/amis) | service schema 工具（远程 schema 解析在 core） |
| [`OverlayHost`](../../../packages/vamis/src/OverlayHost.vue) 等 | 与 Service 无直接关系；浮层内 Service 仍用独立 Scope |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | service/error/spinner token |

### 4.2 生命周期

```text
onMounted:
  init 事件 → reload(api/schemaApi per initFetch) → startPolling
watch api/schemaApi/data → isApiOutdated → reload
watch interval/stopAutoRefreshWhen → startPolling
unmount → stopPolling + unregister + hub.remove
```

- `fetchOne` 负责单请求/错误/loading；`reload` 串行 api → schemaApi，各派发事件。
- `applyFetchedData` 合并 store + Scope + formApi；`applySchemaResult` 设置 remoteSchema。
- `rebuild` 停轮询→拉 schemaApi→重启轮询；不重复拉 api（除非调用方另行 reload）。

### 4.3 数据域

- 每个 Service 独立 store；body 的 SchemaRenderer 用 `store.data` extra-data。
- 父域只读不自动写入；同名构造由 schema 作者决定。
- 表单内 Service 的 `setData` 会同步 formApi，避免表单与 Service 数据分叉。

## 5. 样式与边界

- 默认：service 容器本身无皮肤；error alert/spinner 用 `@vamis/ui` 原语/token。
- 错误层与内容层不要互相遮挡；loading 只覆盖内容区。
- 深色/窄屏/空态单独核。

## 6. 当前状态与缺口

- 已对齐：独立 Scope、api/schemaApi、initFetch、interval/stopAutoRefresh/silentPolling、错误 alert、loading、reload/rebuild/setValue、init/fetchInited/fetchSchemaInited。
- 缺/未核：WebSocket、外部函数数据源、隐藏错误细化、轮询竞态/重叠请求、schemaApi 重建时的滚动/焦点、深色窄屏。
- 对照：TODO 记录 service 主路径；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Service / scoped API 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Service 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page service` 桌面
- [ ] `pnpm compare --page service --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 独立 Scope 与父域隔离
- api/schemaApi 失败/重试
- 轮询清理/静默/停止条件
- setData 同步表单
- 事件顺序与参数

## 8. 后续

1. 先补轮询竞态/重叠请求（Abort/序号），再谈 WebSocket。
2. schemaApi 重建的滚动/焦点单独立项。
3. WebSocket/外部函数数据源属新能力，先定 schema 与安全边界。

---

返回 [组件设计索引](README.md)
