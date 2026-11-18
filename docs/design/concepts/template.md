# 模板设计

> 状态：**已完成 100%** · Amis 核对：主路径 + Vamis 源码 / 活示例 · 对应站点：`/concepts/template` · 源码：[website/src/concepts/template.md](../../../website/src/concepts/template.md)

## 0. 设计结论

模板页只解决**字符串插值**：`${...}` 默认转义，`|raw` 才插入 HTML；复杂逻辑应去表达式/联动/事件，不在模板里堆函数。

## 1. 边界与优先级

1. **默认转义**：所有插值先转义，防 XSS。
2. **raw 信任边界**：`|raw` / 字符串函数只用于可信作者内容；用户输入禁止。
3. **求值上下文**：当前域 + 当前项；不隐式读全局。
4. **过滤器**：使用已注册过滤器；`json` 默认紧凑，`json:2` 才按两格缩进，作者显式选择展示形态。
5. **与表达式分工**：模板返回字符串；布尔/对象运算用表达式。
6. **嵌套**：模板里不嵌 schema；需要组件用 SchemaNode。

## 2. 内容契约

- 必须并列“默认转义/raw”两例，并给恶意输入反例。
- 变量缺失、空值、对象/数组的字符串化要有说明。
- 过滤器列表标 P0/P1；不要承诺 Amis 全量。
- 模板与 tpl 组件、Textarea 默认值的边界要互链。

## 3. 实现

- [formula 包](../../../packages/vamis-formula)：filterTpl/过滤器。
- [Tpl 组件](../../../packages/vamis/src/renderers/Tpl.vue)：HTML 渲染与信任边界。
- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：字符串→tpl。

## 4. 边界余项

- lodash `<% %>` 属于明确不实现的 D2 差异，不计为本文缺口。
- `json` 默认紧凑，`json:2` 由作者显式选择缩进；Toast 保留换行。

## 5. 验收清单（文档核对：7 / 7）

- [x] 模板/转义/raw 边界已盘点
- [x] filterTpl/Tpl 已定位
- [x] 默认转义与 raw 反例可复现
- [x] 变量缺失/空值/对象示例可复现
- [x] 过滤器 P0/P1 清单对齐
- [x] 与表达式/联动边界互链
- [x] 深色/移动可读
