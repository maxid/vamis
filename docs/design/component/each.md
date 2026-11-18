# Each 循环渲染器 · `each` 设计

> 状态：**进行中 90%** · 复杂度：**M 中**
> 文档：[/components/each](/components/each) · Amis 文档：`/zh-CN/components/each`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取，人工设计取舍待补。

## 1. 复杂度

- 等级：**M 中**；Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- Amis 源码：**193** 行；Vamis 实现：**43** 行；依赖：**1** 个
- 集成面：子 Schema
- 判定依据：Vamis 43 行 + Amis 193 行 + 1 依赖 + schema

## 2. Amis 契约

- 入口 type：`each`
- Amis 源文件：`packages/amis/src/renderers/Each.tsx`
- 依赖：`tpl`
- 文档章节：`/zh-CN/components/each`

## 3. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/Each.vue`](../../../packages/vamis/src/renderers/Each.vue)
- 注册形态：普通渲染器（无独立 Scope/API 标记）
- 项目模式：
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 4. 样式与边界

- 相关默认皮肤类：`.vamis-each`, `.vamis-each__placeholder`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 5. 当前状态与缺口

- TODO 记录：文档主路径已对标 Amis：基本 / 对象数组 / 嵌套 / Table 列 / Form 静态 / source 映射 / 动态表单项。取值 `value` > `source` > `name`；空数组占位「暂无数据」；`items` 数组拆开渲染。对照桌面 **7/7**、移动 **7/7**（P0 0）。缺 `themeCss`
- 状态：进行中，进度 90%；如进度未到 100，按上条缺口补齐。

## 6. 验证计划

- 组件页对照：`pnpm compare --page each`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

## 7. 后续

- 先补第 5 节列出的缺口，再按第 6 节对照到通过；复杂项（M 中）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
