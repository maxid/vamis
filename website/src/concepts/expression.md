---
title: 表达式
---

# 表达式

公式引擎用 `amis-formula@6.13.0`。配置里常见：

| 写法 | 用途 |
|------|------|
| `${name}` | 插值 |
| `visibleOn` / `hiddenOn` / `disabledOn` | 显隐、禁用 |
| `sendOn` | 是否发请求（D3，未齐） |
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

Amis 支持 `${name|raw}`、`${date|date:YYYY-MM-DD}` 等。vamis **D2** 要把过滤器和模板默认转义收口到同一层。现在部分过滤器能跑，不要假设和官网 1:1。
