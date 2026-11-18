# Chart 图表 · `chart` 设计

> 状态：**进行中 65%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/chart) · Amis：`/zh-CN/components/chart`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Chart 是“ECharts option 的数据适配层”：不实现图表类型，只负责 config/source/api 取 option、懒加载 echarts、setOption、轮询、resize、click 事件与组件 API。核心风险是**echarts 可选依赖、option 生命周期、轮询/重载竞态、事件/动作缺口**。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **option 来源**：`config` / `chart` → `source`（数据域变量）→ `api`（requestApi）依次取；返回非对象显示占位，不抛崩溃。
2. **echarts 可选依赖**：动态 `import('echarts')`；未安装显示占位、保留 chart 类型，不让整页白屏。
3. **实例生命周期**：`el` 出现才 init；卸载/元素消失 dispose；`setOption(option, replaceChartOption===true)` 决定 merge/replace；reset 重新读原始 option。
4. **轮询**：`interval >= 1000` 才启动；每次 load 后 schedule；卸载清 timer；api/data 变化按 isApiOutdated 重载。
5. **resize**：窗口 resize 只绑一次并清理；容器尺寸变化（LazyComponent/隐藏）不能只靠 window。
6. **click**：先 `runOnEvent('click')`，未 prevented 才执行 `clickAction`；payload = 数据域 + echarts params。
7. **包边界**：无 `<style>`；高度/style 由 schema/作者；echarts 不进主包，按需加载。

### 1.2 边界用例

- config / source / api 三者优先级与空 option
- echarts 未安装 / 动态 import 失败
- API 失败/慢返回/返回 `{config}` 或裸 option
- interval <1000、轮询中 api 变化、卸载
- replaceChartOption true/false；setValue/reset
- click 参数、preventDefault、clickAction
- 容器隐藏/显示、resize、LazyComponent unMountOnHidden
- 高度/宽度 0、深色主题、窄屏
- 未接：mouseover/legendselectchanged/finished/init、mapURL/dataFilter/trackExpression/initFetch

### 1.3 优先级

1. option 来源/生命周期
2. echarts 可选依赖/占位
3. 轮询/重载/resize
4. click 事件/动作
5. 深色/窄屏/主题

## 2. 复杂度

- 等级：**XL 特重**（Amis `Chart.tsx` 935 行；Vamis 171 行 + echarts 运行时）
- 依赖：`echarts`（按需）、`LazyComponent`、`action`、`page/service` 数据域
- 风险：图表库外部依赖 + 轮询/事件/动作组合

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'chart'`
- Amis 渲染器：`packages/amis/src/renderers/Chart.tsx`
- 在线文档：[Vamis `/components/chart`](/components/chart)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 现状 |
|---|---|---|
| `config` / `chart` | ECharts option | 已接 |
| `source` | 数据域变量 option | 已接 |
| `api` | 远程 option | 已接；返回 `{config}` 或裸 option |
| `interval` | 轮询 | 已接，≥1000ms |
| `replaceChartOption` | setOption replace | 已接 |
| `height` / `style` | 尺寸 | 已接（height 默认 16rem） |
| `unMountOnHidden` | 隐藏卸载 | 已接（Vamis 扩展） |
| `clickAction` | 点击行为 | 已接 |
| `mapURL` / `dataFilter` / `trackExpression` / `initFetch` | Amis 能力 | **未接** |
| `theme` / `map` | 主题/地图 | 未完整（需 echarts 资源） |

### 3.3 事件

已接：`click`（echarts params + 数据域；可 preventDefault 阻止 clickAction）。

未接：`init`、`mouseover`、`legendselectchanged`、`finished`。文档中未接项必须标注，不要按 Amis 事件表声称全部可用。

### 3.4 动作/API

已接：`reload`、`setValue`、`reset`（Chart.vue 注册 chartApi）；`clickAction` 在 click 未阻止时执行。

组件 API：`getData() → { option }`；`setData({ option })`；`doAction(reload|setValue|reset)`。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Chart.vue`](../../../packages/vamis/src/renderers/Chart.vue) | option 获取、echarts 懒加载、setOption、轮询、resize、click/API |
| [`LazyComponent`](https://github.com/baidu/amis) | 可见时才渲染 echarts 容器；unMountOnHidden |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | `.vamis-chart__empty` 占位 |
| `echarts` | 可选 peer/动态依赖；未安装降级 |

### 4.2 状态

```text
config/source/api → option
   → lastOption
   → el 就绪 → echarts.init → setOption(option, replace)
   → resize/click/interval
   → unload dispose + clear timer + remove resize
```

- `lastOption` 用于元素重建时恢复；reset 重新 fetchOption。
- 轮询是 `setTimeout` 链，不是 setInterval；避免请求堆叠。
- `missing` 显示错误/占位，不影响其他组件。

### 4.3 事件/动作顺序

```text
echarts click → payload(data+params) → runOnEvent('click')
  → prevented? stop
  → clickAction? runAction
```

## 5. 样式与边界

- 容器宽度吃满；height 由 schema.height 或 16rem；style 透传。
- 占位 `.vamis-chart__empty` 用 token；无 `<style>`。
- 深色主题需 echarts theme/option 颜色适配；当前未自动换主题。
- 窄屏图表 resize/高度；地图/大屏需单独核。

## 6. 当前状态与缺口

- 已接：config/source/api、echarts 懒加载/占位、setOption/replace、interval、click/clickAction、reload/setValue/reset、unMountOnHidden。
- 未接/风险：mapURL/dataFilter/trackExpression/initFetch、mouseover/legendselectchanged/finished/init 事件、主题/地图资源、容器尺寸变化（非 window resize）、轮询竞态。
- 对照：chart 在 compare `SKIP_TYPES`，只能双站手核；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Chart / LazyComponent / echarts 边界已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（部分未接）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Chart 相关）
- [ ] `pnpm typecheck` 0
- [ ] 双站手核（compare SKIP）
- [ ] 深色 / 375px 窄屏
- [ ] echarts 未安装降级

### 验收重点

- option 来源优先级
- echarts 缺失/加载失败
- setOption replace/merge、reset
- 轮询清理/竞态
- click preventDefault/clickAction

## 8. 后续

1. 先补容器尺寸监听（ResizeObserver）与轮询竞态。
2. 再补 mouseover/legendselectchanged/finished 事件与 dataFilter/trackExpression。
3. 主题/地图属资源能力，单独设计。

---

返回 [组件设计索引](README.md)
