---
title: ClassName
---

# ClassName

`className` 在 Amis 里可以是字符串、对象或表达式。vamis 当前当 **字符串** 用，并交给 Tailwind。

```yaml
type: tpl
className: text-sm text-muted-foreground
tpl: 辅助说明
```

对象形式（`{ "text-danger": "${error}" }`）和 `m:` / `pc:` 前缀尚未解析。主题色请改 token 或 `cssVars`，不要堆业务色 class。
