# ClassName 类型设计

> 状态：**进行中 70%** · Amis 核对：类型主路径 + Vamis 源码 / 活示例 · 对应站点：`/types/classname` · 源码：[website/src/types/classname.md](../../../website/src/types/classname.md)

## 0. 设计结论

ClassName 页定义**作者类名解析**：字符串/对象/模板，`resolveClassName` 统一落地；支持 helper、`m:`/`pc:`、状态前缀。默认盒模型已铺满，`className` 只用于覆盖。

## 1. 边界与优先级

1. **三形态**：字符串、对象+表达式、模板；false/null 忽略。
2. **落点**：外层 `.vamis-node`；表单项 className 落标签（对齐 Amis）。
3. **helper**：间距/宽高/布局；Tailwind 与 `--gap-*` 的差异要写清。
4. **前缀**：`m:` <768px、`pc:` ≥768px；状态 hover/active/focus/disabled/group-hover。
5. **默认宽度**：容器/控件默认铺满，不教先写 `w-full`。
6. **未齐**：其余组件 `xxxClassName` 与 hover 全矩阵仍是 P1。

## 2. 内容契约

- 三形态各一个可运行例。
- 字符串/数组/对象返回规则表格化。
- 明确外层/内层差异，给 `bodyClassName` 方案。
- 与 style 首页/CSS 变量互链，不复制全表。

## 3. 实现

- [resolveClassName](../../../packages/vamis-core/src)：解析。
- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：落点。
- [helpers](../../../packages/vamis-ui/src)：类生成。

## 4. 缺口

- 其余组件 `xxxClassName` 未全覆盖。
- hover/响应式全矩阵未齐。

## 5. 验收清单（已核对）

- [x] 三形态/落点/前缀边界已盘点
- [x] resolve/SchemaRenderer/helpers 已定位
- [x] 三形态示例可运行
- [x] 对象/模板/空值规则核对
- [x] 外层/内层落点可复现
- [x] P1 覆盖缺口标注
- [x] 与 style 文档互链
