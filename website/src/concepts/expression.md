---
title: 表达式
---

# 表达式

::: info 实现进度 55% · 进行中
公式引擎已在 `@vamis/formula`；`${}` / `visibleOn` / `sendOn` / `trackExpression` 能跑。D2 未齐：运行时过滤器不全，模板默认仍是 `raw`。
:::

公式引擎是仓内的 `@vamis/formula`（从 `amis-formula@6.13.0` 搬运）。配置里常见：

| 写法 | 用途 |
|------|------|
| `${name}` | 插值 |
| `visibleOn` / `hiddenOn` / `disabledOn` | 显隐、禁用 |
| `sendOn` | 是否发请求（D3，已接） |
| `trackExpression` | 重新拉取的依赖 |

```schema
type: page
data:
  showExtra: true
body:
  - type: tpl
    tpl: 始终可见
  - type: tpl
    visibleOn: ${showExtra}
    tpl: 仅 showExtra 为真时出现
```

## 过滤器

`${}` 走同一套 parser，`${name|raw}` / `${name|html}` 可用。日期、`json` 等 Amis 运行时补的过滤器还没全搬过来；模板默认转义（D2）也还没收口，现在默认 `raw`。
