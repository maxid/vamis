# Extend 扩展示例文档设计

> 状态：**进行中** · 4 页主路径已核对；i18n 主路径已落地 · 覆盖 [website/src/extend](../../../website/src/extend) · 4 篇
> 盘点日期：2026-11-19。本文是站点文档域的设计，不替代各页正文。

## 0. 一页结论

Extend 描述 Vamis 的**扩展边界**：自定义渲染器、编辑器、国际化、调试。实现进度保持自定义 55%、编辑器 35%、国际化 85%、调试 90%；文档核对与未接能力分别记录，不把 Amis 能力当成已交付。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **渲染器扩展**：`registerRenderer({ type, test, weight, isolateScope, component })`；组件只吃 `schema` / `data` / `env`。
2. **禁止直接 fetch**：请求走 `env.fetcher` / `requestApi`，或包在 `service`。
3. **两入口同一注册表**：Vue `VamisRoot` 与 JS SDK `vamis.registerRenderer` 必须同语义；SDK 不另做一套渲染器。
4. **编辑器只写 schema**：选中节点回写 Amis 字段名，不发明平行配置；没有插件市场，不按 amis-editor 验收。
5. **i18n 双通道**：组件内置文案与 schema 文案分开；`locale` / `registerLocale` / `replaceText` / schema 覆盖已接，其余组件内置文案继续抽取。
6. **调试品牌**：`enableVamisDebug` / `vamisDebug=1`；`schema.debug` 只显示表单域，不开启动作日志；诊断走 `env.onDiagnostic`。
7. **扩展不等于云端**：文档不承诺云端插件、远程加载组件。

### 1.2 页面清单

| 页面 | 设计重点 | 自报 |
|---|---|---|
| [自定义组件](custom.md) | registerRenderer、test/weight/isolateScope、SDK 注册 | 55% |
| [编辑器](editor.md) | 树/画布/属性/Schema、写回契约 | 35% |
| [国际化](i18n.md) | locale、内置文案、replaceText | 85% |
| [调试](debug.md) | env/全局/URL 开关、诊断对象、日志分组 | 90% |

## 2. 文档契约

- 每个扩展点先给最小可运行代码，再给 API 表，再给“未实现/不要依赖”的明确段。
- 自定义组件示例必须展示 `schema`/`data`/`env` 三个入参，并强调无 fetch。
- 编辑器页区分“已接：树/画布/属性/Schema”与“未接：插件市场/协作/撤销栈”。
- i18n 页给出 Vue / SDK 可运行用法，并明确内置文案覆盖范围与回退规则。
- 调试页给出三种开关的优先级与生产环境建议。

## 3. 实现与数据流

- [核心注册表](../../../packages/vamis-core/src)：`registerRenderer` / `SchemaRenderer` / 诊断。
- [Vamis 渲染器入口](../../../packages/vamis/src/index.ts)：注册表与公共 API。
- [编辑器包](../../../packages/vamis-editor/src)：树、属性面板、Schema 面板。
- [JS SDK](../../../packages/vamis-sdk/src)：`vamis.embed` / `vamis.registerRenderer`。
- [调试文档源](debug.md)：env / window / URL 三种开关。

```text
宿主 / SDK
  → registerRenderer 注册表
  → SchemaRenderer(type → component)
  → schema/data/env

编辑器
  → 选中节点
  → 属性面板
  → 回写 schema（Amis 字段名）
```

## 4. 运行时余项（不属于文档缺口）

- i18n 主路径已接；剩余是其他组件内置文案抽取、完整日期区域格式化与 RTL。
- 编辑器仅骨架，JSON 双 Tab、插件市场、协作与完整撤销栈未接。
- 自定义组件已有错误边界与 SDK 同注册表；远程加载 / 插件市场不在范围。
- 调试的可视化 Debug 面板 / 数据链检查器未接。

## 5. 验收清单（已核对）

- [x] website/src/extend 4 篇与 extendNav 已定位
- [x] 注册表 / 编辑器 / SDK / 诊断源码已定位
- [x] 扩展点与未实现能力已盘点
- [x] `registerRenderer` 示例在 Vue 与 SDK 双入口跑通
- [x] 自定义组件无 fetch 约束有反例
- [x] 编辑器写回字段名与 Amis 一致
- [x] i18n 四条主路径与回退规则有 core / SDK 回归
- [x] 调试三种开关与诊断对象示例可运行
- [x] 页面活示例无 console error
- [x] 375px/深色下代码块与表格可读
- [x] `pnpm test`（注册/SDK 相关）
- [x] `pnpm typecheck` 0（只改文档时说明未跑）

## 6. 后续

1. 新增扩展点时同时更新 Vue / SDK 双入口测试和失败态。
2. 继续抽取其他组件内置文案；若实现编辑器 JSON 双 Tab或可视化 Debug，再改对应运行时进度，不回改文档边界。
3. 保持 Amis 产品专用 React / amisRequire 代码不进入 Vamis 示例。
