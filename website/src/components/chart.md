---
title: Chart 图表
outline: deep
---

# Chart 图表

::: warning 实现进度 45% · 进行中
有 `config`/`api` 时动态加载 echarts；画布走内核 LazyComponent（`unMountOnHidden` 默认 false）；`api` 按 `isApiOutdated` 刷新。属性表 / 事件表 / 动作表已按 Amis 列出：事件与 `reload` / `setValue` 尚未接到 Chart。无 `mapURL` / `source` 变量；无库则占位。
:::

图表走 echarts，配置格式与 echarts 相同。对齐 Amis 同名 schema；YAML 与 JSON 同等有效。属于侧栏分类 **数据展示**。

## 基本用法

`api` 可直接返回完整 echarts option。

```schema
type: page
title: chart
body:
  - type: chart
    api: /api/mock2/chart/chart1
```

## 静态数据

在 `config` 里写完整 option，数据是静态的。

```schema: scope="body"
{
  "type": "chart",
  "config": {
    "xAxis": { "type": "category", "data": ["A", "B", "C"] },
    "yAxis": { "type": "value" },
    "series": [{ "type": "bar", "data": [4, 7, 2] }]
  }
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `string` | `"chart"` | 指定为 chart 渲染器 |
| `className` | `string` | | 外层 class |
| `api` | [API](/types/api) | | 配置项接口。无 `$` 时只挂载拉一次 |
| `config` / `chart` | `object` | | echarts option；无 `api` 时用这份 |
| `unMountOnHidden` | `boolean` | `false` | 滚出视口是否卸载画布。Amis 源码有、文档属性表未列 |
| `style` | `object` | | 根元素 style |
| `width` / `height` | `string` | | **未齐**（当前画布高度写死 16rem，宽随容器） |
| `initFetch` | `boolean` | | **未接** |
| `interval` | `number` | | **未接**（Chart 不轮询） |
| `source` | 数据映射 | | **未接** |
| `replaceChartOption` | `boolean` | `false` | **未接** |
| `trackExpression` | `string` | | **未接**（url 含 `$` 才随数据重拉） |
| `dataFilter` | `string` | | **未接** |
| `mapURL` / `mapName` / `loadBaiduMap` | | | **未接** |
| `data` | `object` | | 静态数据，当前多与父级浅合并 |
| `onEvent` | `object` | | 见事件表 |
| `visibleOn` / `hiddenOn` | `string` | | 显隐表达式 |

画布始终包一层内核 `LazyComponent`（对齐 Amis Chart）。默认进视口才初始化 echarts；`unMountOnHidden: true` 才在滚出时拆掉画布。Chart 的 `api` 仍在组件挂载时发，不跟画布可见性走。

## 事件表

Amis Chart 通过 `onEvent` 派发以下事件。Vamis **尚未把这些接到 Chart**（没有 `runOnEvent`）。

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `init` | — | **未接**。Amis：插入 DOM 时 |
| `click` | ECharts 事件 | **未接** |
| `mouseover` | ECharts 事件 | **未接** |
| `legendselectchanged` | ECharts 事件 | **未接** |
| `finished` | `{ echarts }` | **未接** |

## 动作表

其它组件通过 `actionType` + `componentId` 触发。Chart **没有注册** `reload` / `setData`，下面两项目前无效。

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `reload` | — | **未接**。Amis：重新拉 `api` |
| `setValue` | `value: object` | **未接**。Amis：更新图表依赖的数据域 |
| ECharts 组件行为 | `actionType` 为行为名 | **未接** |

要对图表换数据，先给上层 Page / Form 发 `setValue` / `reload`，再等 Chart 自己的 `isApiOutdated`（url 含 `$` 时）。

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `unMountOnHidden` 已接；Amis 官方属性表未写此字段，源码默认 `false`。
- 事件表、动作表与 Amis 同名列出，行为尚未落地。
- 未安装 `echarts` 时显示占位，不报崩溃。
- 动作控制流（循环 / switch / parallel / 广播）仍是 D4 P1。
