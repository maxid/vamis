# Extend 扩展示例文档设计

> 状态：**进行中** · 覆盖 [website/src/extend](../../../website/src/extend) · 4 篇
> 盘点日期：2026-11-18。本文是站点文档域的设计，不替代各页正文。

## 0. 一页结论

Extend 描述 Vamis 的**扩展边界**：自定义渲染器、编辑器、国际化、调试。现状差异很大：调试 90%，自定义组件 55%，编辑器 35%，国际化 15%。文档必须把“已接的扩展点”和“未实现契约”分开，不能把 Amis 能力当成已交付。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **渲染器扩展**：`registerRenderer({ type, test, weight, isolateScope, component })`；组件只吃 `schema` / `data` / `env`。
2. **禁止直接 fetch**：请求走 `env.fetcher` / `requestApi`，或包在 `service`。
3. **两入口同一注册表**：Vue `VamisRoot` 与 JS SDK `vamis.registerRenderer` 必须同语义；SDK 不另做一套渲染器。
4. **编辑器只写 schema**：选中节点回写 Amis 字段名，不发明平行配置；没有插件市场，不按 amis-editor 验收。
5. **i18n 双通道**：组件内置文案与 schema 文案分开；当前都没有 locale 注入，`locale` / `replaceText` 是契约/缺口，不是已实现。
6. **调试品牌**：`enableVamisDebug` / `vamisDebug=1`；`schema.debug` 只显示表单域，不开启动作日志；诊断走 `env.onDiagnostic`。
7. **扩展不等于云端**：文档不承诺云端插件、远程加载组件。

### 1.2 页面清单

| 页面 | 设计重点 | 自报 |
|---|---|---|
| [自定义组件](../../../website/src/extend/custom.md) | registerRenderer、test/weight/isolateScope、SDK 注册 | 55% |
| [编辑器](../../../website/src/extend/editor.md) | 树/画布/属性/Schema、写回契约 | 35% |
| [国际化](../../../website/src/extend/i18n.md) | locale、内置文案、replaceText | 15% |
| [调试](../../../website/src/extend/debug.md) | env/全局/URL 开关、诊断对象、日志分组 | 90% |

## 2. 文档契约

- 每个扩展点先给最小可运行代码，再给 API 表，再给“未实现/不要依赖”的明确段。
- 自定义组件示例必须展示 `schema`/`data`/`env` 三个入参，并强调无 fetch。
- 编辑器页区分“已接：树/画布/属性/Schema”与“未接：插件市场/协作/撤销栈”。
- i18n 页所有“尚未注入”的示例要标注为契约，不写成可直接运行。
- 调试页给出三种开关的优先级与生产环境建议。

## 3. 实现与数据流

- [核心注册表](../../../packages/vamis-core/src)：`registerRenderer` / `SchemaRenderer` / 诊断。
- [Vamis 渲染器入口](../../../packages/vamis/src/index.ts)：注册表与公共 API。
- [编辑器包](../../../packages/vamis-editor/src)：树、属性面板、Schema 面板。
- [JS SDK](../../../packages/vamis-sdk/src)：`vamis.embed` / `vamis.registerRenderer`。
- [调试文档源](../../../website/src/extend/debug.md)：env / window / URL 三种开关。

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

## 4. 当前缺口

- i18n 无包、无 locale 注入；文档仍按 Amis 契约列举。
- 编辑器无插件市场/错误边界；仅骨架。
- 自定义组件的错误边界、SDK 一致性、懒加载组合仍缺。
- 调试的可视化 Debug 面板/数据链检查器未接。

## 5. 验收清单（文档核对：3 / 12）

- [x] website/src/extend 4 篇与 extendNav 已定位
- [x] 注册表 / 编辑器 / SDK / 诊断源码已定位
- [x] 扩展点与未实现能力已盘点
- [ ] `registerRenderer` 示例在 Vue 与 SDK 双入口跑通
- [ ] 自定义组件无 fetch 约束有反例
- [ ] 编辑器写回字段名与 Amis 一致
- [ ] i18n 契约/缺口标注逐段核对
- [ ] 调试三种开关与诊断对象示例可运行
- [ ] 页面活示例无 console error
- [ ] 375px/深色下代码块与表格可读
- [ ] `pnpm test`（注册/SDK 相关）
- [ ] `pnpm typecheck` 0（只改文档时说明未跑）

## 6. 后续

1. 自定义组件与 SDK 双入口示例先收口。
2. 编辑器/i18n 文档补“未实现”清单，避免误用。
3. 调试页补生产环境建议与诊断字段表。
