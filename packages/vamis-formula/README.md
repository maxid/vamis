# @vamis/formula

Vamis 公式引擎：表达式、模板 `${}`、过滤器、内置函数。

源码从 [amis-formula@6.13.0](https://github.com/aisuda/amis-tpl) 搬运（MIT，Copyright 百度智能云爱速搭）。保留 lexer / parser / evaluator 与 Amis 相同的公式语义，不改写成另一套语言。

对外入口：

```ts
import { evaluate, parse, registerFilter, registerFunction } from '@vamis/formula'

evaluate('${name}', { name: 'Ada' })
evaluate('1 + 2', {}, { evalMode: true })
```

运行时薄封装在 `@vamis/core` 的 `evalFormula` / `filterTpl`。
