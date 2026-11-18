# Types 类型文档设计

> 状态：**进行中** · 覆盖 [website/src/types](../../../website/src/types) · 4 篇
> 盘点日期：2026-11-18。本文是站点文档域的设计，不替代各页正文。

## 0. 一页结论

Types 是作者/扩展者的**契约层**：API、ClassName、Definitions、SchemaNode。API 与 SchemaNode 92%，ClassName 70%，Definitions 仅 20% 且运行时尚未解析 `$ref`。文档必须把“类型契约”和“运行时已实现”分开。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **字段名不改写**：API/ClassName/SchemaNode 字段与 Amis 同形；扩展只加新字段/IR kind。
2. **API 单一管线**：所有请求走 `requestApi`（normalize → sendOn → adaptor → cache → fetch → payload → adaptor → responseData）；渲染器禁止自己 fetch。
3. **ClassName 统一入口**：`resolveClassName` 支持字符串/对象/模板；`m:`/`pc:`/状态前缀；表单项 className 落标签。
4. **Definitions 顶级**：`definitions` 只能在顶级；`$ref` 引用；当前运行时未解析，文档必须标“未实现”。
5. **SchemaNode 三态**：模板字符串 / Schema 对象 / SchemaArray；`false` 不渲染；字符串按 `tpl`。
6. **TS 类型宽松**：`SchemaObject` 仍宽松，文档不要承诺穷尽联合类型。
7. **API 返回**：`data/status/msg` 与 `responseData/replaceData` 语义要写清；GET initApi 不把域拼 query。

### 1.2 页面清单

| 页面 | 设计重点 | 自报 |
|---|---|---|
| [API](api.md) | 请求管线、方法、返回、适配器、GraphQL | 92% |
| [ClassName](classname.md) | resolveClassName、helper、状态/响应式前缀 | 70% |
| [Definitions](definitions.md) | 顶级 definitions、$ref、树形复用 | 20% |
| [SchemaNode](schemanode.md) | 模板/Schema/SchemaArray、false、数组展开 | 92% |

## 2. 文档契约

- 每页先给类型形状（TS/JSON Schema 片段），再给运行时行为，再给边界/未实现。
- API 页的每个阶段给一个可观察结果；不要把 Amis 源码函数名当 Vamis 实现。
- ClassName 页给“字符串/对象/模板”三例 + `m:`/`pc:` + 状态前缀；明确默认盒模型不需要 `w-full`。
- Definitions 页每个示例标“运行时未解析”，避免作者误用。
- SchemaNode 页给字符串→tpl、对象→type、数组→容器展开、false→不渲染四例。

## 3. 实现与数据流

- [requestApi](../../../packages/vamis-core/src/utils/api.ts)：API 管线与 `env.fetcher`。
- [resolveClassName](../../../packages/vamis-core/src)：class 解析；样式 helper 在 `@vamis-ui`。
- [SchemaRenderer](../../../packages/vamis-core/src/SchemaRenderer.vue)：SchemaNode 分派。
- [类型源](../../../website/src/types)：4 篇 + `website/nav.mjs` 的 `typeNav`。

```text
SchemaNode
  ├─ string → tpl
  ├─ object(type) → renderer
  ├─ array → container 展开
  └─ false → 不渲染
```

## 4. 当前缺口

- Definitions 运行时未解析 `$ref`；文档只能是契约/示例。
- API 全局 `addApiRequestAdaptor`、blob 下载等 P1 未接。
- ClassName 其余组件 `xxxClassName` 与 hover 全矩阵未齐。
- `SchemaObject` 类型仍宽松，无法靠 TS 穷尽校验。

## 5. 验收清单（文档核对：3 / 12）

- [x] website/src/types 4 篇与 typeNav 已定位
- [x] requestApi / resolveClassName / SchemaRenderer 已定位
- [x] 类型契约与运行时缺口已盘点
- [ ] API 管线每阶段示例可运行
- [ ] ClassName 三形态 + 前缀示例可运行
- [ ] Definitions 示例标注未实现且不误导
- [ ] SchemaNode 四态示例可运行
- [ ] 页面活示例无 console error
- [ ] 375px/深色下表格与代码块可读
- [ ] `pnpm test`（API/类型相关）
- [ ] `pnpm typecheck` 0（只改文档时说明未跑）
- [ ] 交叉链接到 concepts/components 补齐

## 6. 后续

1. Definitions 先定运行时 `$ref` 方案，再提升文档进度。
2. API P1 适配器/下载补文档或标缺口。
3. 类型页与组件设计文档的“契约表”建立互链。
