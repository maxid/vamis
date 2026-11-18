# 自定义组件设计

> 状态：**进行中 55%** · Amis 核对：custom-sdk 主路径 + Vamis 源码 / SDK 示例 · 对应站点：`/extend/custom` · 源码：[website/src/extend/custom.md](../../../website/src/extend/custom.md)

## 0. 设计结论

自定义组件页定义**注册器扩展点**：`registerRenderer({ type, test, weight, isolateScope, component })`。设计重点不是示例组件，而是注册优先级、隔离域、双入口一致性和错误边界。

## 1. 边界与优先级

1. **注册键**：`type` 精确匹配；`test` 正则/权重决定冲突优先级。
2. **隔离域**：`isolateScope` 影响数据域可见性，默认 false；不能拿它替代安全隔离。
3. **组件契约**：props 收 `schema` / `data`，`env` 用 `useEnv()` 注入；禁止直接 fetch，请求走统一 API 管线。
4. **双入口**：Vue `registerRenderer` 与 SDK `vamis.registerRenderer` 同注册表。
5. **懒加载**：重组件用 LazyComponent 包，不改变注册协议。
6. **错误**：渲染异常进诊断；插件市场/远程加载不在本期。

## 2. 内容契约

- 首例最小 `hello` 组件，必须给 schema 使用例。
- 注册表按 type/test/weight 讲冲突；给覆盖顺序。
- 明确“不要 fetch / 不要 amisRequire”。
- 表单校验扩展单独小节，不混在渲染器注册。
- 失败态：未注册 type、重复 type、组件抛错。

## 3. 实现

- [registerRenderer](../../../packages/vamis-core/src/index.ts)：注册表与类型。
- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：查找/渲染/错误边界。
- [SDK index](../../../packages/vamis-sdk/src/index.ts)：`vamis.registerRenderer`。

## 4. 缺口

- 重复 type/权重冲突的提示未统一。
- 插件市场 / 远程加载不在范围；渲染错误边界与 `env.onDiagnostic` 已接。

## 5. 验收清单（已核对）

- [x] 注册协议/优先级/双入口已盘点
- [x] registerRenderer/SchemaRenderer/SDK 已定位
- [x] hello 示例在 Vue 与 SDK 双入口跑通
- [x] type/test/weight 冲突示例可复现
- [x] 无 fetch 约束与反例
- [x] 未注册/重复/抛错失败态可复现
- [x] 与 concepts/schema、start/sdk 互链
