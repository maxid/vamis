# Vamis Vue3 运行时与 IR 对齐设计

- 日期：2026-10-20
- 状态：第一期已按此实施；**JS SDK P0 已落地**（见 [JS SDK](./2026-10-21-vamis-js-sdk.md)）
- 语义设计增补：数据域、表达式、API、事件动作、表单、CRUD 的 v0.2 设计见 [2026-10-20-vamis-runtime-semantics-design.md](./2026-10-20-vamis-runtime-semantics-design.md)
- 嵌入入口：Vue 组件 `VamisRoot` + JS SDK `vamis.embed`
- 源项目：百度 Amis 6.13.0（同级 `../amis`）
- IR 来源：LCDP IR（`apiVersion: lcdp.ir/v1`）

## 1. LCDP IR 结论

低代码的唯一真源是 YAML/JSON 信封：

```yaml
apiVersion: lcdp.ir/v1
kind: TableDef | FormDef | ActionDef | PageDef | ViewDef | JobDef | ChartDef | ReportDef | BizDef
metadata:
  name: ...
  description: ...
  businessTerms: [...]
  useCases: [...]
  labels: { ... }
spec: { ... }
```

已落地 kind：`TableDef`、`FormDef`。`PageDef` 规划为固定壳（LIST / TREE_LIST / DETAIL_TABS / DASHBOARD / REPORT）+ 引用组合，**任意 widget 树被明确延后**。

Vamis 不取代 TableDef/FormDef，而是增加扩展 kind：

| kind | 职责 |
|------|------|
| `UiPage` | Amis 兼容的 widget 树（`spec.type` + `body`）。将来可嵌入 `PageDef.spec.schema` 或 `pageKind: SCHEMA` |
| `FormDef` | 编译为 `page > form`（controlType → input-text/select/…） |
| `TableDef` | 编译为 `page > crud` 预览 |

对接点：同一信封、同一 `metadata` 字段、未知 kind 占位不崩。宿主可把 `UiPage` 注册成 `LcdpIrKind` 插件而不改内核。

## 2. 作者格式

作者态**同时支持 YAML 与 JSON**，不强制 YAML。解析后进同一棵 schema / IR。

- YAML 1.2 Core（`packages/vamis-core/src/yaml.ts`）与 JSON 都是一等输入
- `parseSchemaText`：以 `{` / `[` 开头走 `JSON.parse`，否则走 YAML
- 对象、JSON 字符串、YAML 字符串、IR 信封：`VamisRoot` / `vamis.embed` 都收
- 编辑器可以把源码格式化成 YAML 或 JSON；字段名不改写

YAML「标准数据类型」只指语法层标量，不指业务字段的 jdbc/Java 类型：

| 类型 | dump | 说明 |
|------|------|------|
| boolean | `true` / `false` | 不加引号；不要写成 `"true"` |
| null | `null` | 不用 `~` 或空值 |
| integer | `5`、`-1` | 不加引号；字符串 `"012"` 必须加引号 |
| float | `1.5` | 不加引号 |
| string | 默认可不引号 | 看起来像 `yes`/`On`/`true`/`012`、或含 `:` / `#` 时必须加引号 |

解析用 Core Schema，避免 YAML 1.1 陷阱：`On`/`yes` 是字符串不是布尔；八进制只用 `0o12`，不要把 `012` 当八进制。

```yaml
required: true
perPage: 5
label: "On"
zip: "012"
```

## 3. 运行时

Vue 3 + Pinia hub（仿 MST 节点树）+ `@vamis/formula`（从 `amis-formula@6.13.0` 搬运）。继续按 Amis 的 `type` 注册渲染器；每个渲染器封装 shadcn-vue（reka-ui）原语。不搬 `cxd-` 前缀，cxd 能力尽量像素级转写；不改 YAML/IR 信封。

对外两条入口，同一内核：

| 入口 | 宿主 | API |
|------|------|-----|
| Vue 组件 | Vue 3 + Pinia 工程 | `<VamisRoot :schema />` |
| JS SDK | 任意 HTML | `vamis.embed('#root', schema, props?, env?)` |

SDK 把 Vue/Pinia/渲染器打进 IIFE（`sdk.js` + `sdk.css`），**不是**第二套渲染器。契约见 [JS SDK](./2026-10-21-vamis-js-sdk.md)。

## 4. 非目标（第一期）

`.cxd-*` 前缀 / Amis 主题 SCSS 包、MST、office/pdf 真实预览、TinyMCE 全家桶、Amis `amisRequire` AMD、IE11。cxd 能力转写到 shadcn-vue / Tailwind 属于目标。Amis type 继续补齐。**JS SDK 属于目标，不是非目标。** Monaco：`code` 走 `colorize`；`editor` / `diff-editor` 本阶段待接。
