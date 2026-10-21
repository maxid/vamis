# @vamis/formula

Vamis 公式引擎：表达式、模板 `${}`、过滤器、内置函数。

引擎正文从 [amis-formula@6.13.0](https://github.com/aisuda/amis-tpl) 搬运，版权仍是 **百度智能云爱速搭**（MIT，必须保留）。本包的包装、测试脚手架和后续改动归 Vamis contributors。保留 lexer / parser / evaluator 与 Amis 相同的公式语义，不改写成另一套语言。

对外入口：

```ts
import { evaluate, parse, registerFilter, registerFunction } from '@vamis/formula'

evaluate('${name}', { name: 'Ada' })
evaluate('1 + 2', {}, { evalMode: true })
```

运行时薄封装在 `@vamis/core` 的 `evalFormula` / `filterTpl`。
