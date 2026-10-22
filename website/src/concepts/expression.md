---
title: 表达式
---

# 表达式

::: info 实现进度 80% · 进行中
公式引擎在 `@vamis/formula`；`${}` / `visibleOn` / `sendOn` / `trackExpression` 能跑。D2 P0 过滤器与模板默认转义已接。Amis 其余运行时过滤器、表达式诊断（D8）仍缺。
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

`${}` 走同一套 parser。P0 已接：

| 过滤器 | 作用 |
|--------|------|
| `raw` | 不转义，Tpl 才按 HTML 插入 |
| `html` | 转义 `<` `>` `&` 等 |
| `json` | `JSON.stringify` |
| `date` / `datetime` | moment 格式化 |
| `number` | 千分位 |
| `percent` | 乘 100 加 `%` |
| `default` | 空值回落 |
| `truncate` | 截断 |
| `first` | 取数组第一项 |

写法：`${name|raw}`、`${n|percent:2}`、`${d|date:'YYYY-MM-DD'}`。
