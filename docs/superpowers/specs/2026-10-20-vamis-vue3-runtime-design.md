# vamis Vue3 运行时与 IR 对齐设计

- 日期：2026-10-20
- 状态：第一期已按此实施；最新同步与覆盖数字见 [2026-10-20-amis-sync-status.md](./2026-10-20-amis-sync-status.md)
- 语义设计增补：数据域、表达式、API、事件动作、表单、CRUD 的 v0.2 设计见 [2026-10-20-vamis-runtime-semantics-design.md](./2026-10-20-vamis-runtime-semantics-design.md)
- 源项目：百度 Amis 6.13.0（`/Users/maxid/Develop/IdeaProjects/github/amis`）
- IR 来源：xdmp LCDP IR（`megre/xdmp/docs/superpowers/specs/2026-10-17-lcdp-ir-kernel-design.md`）

## 1. xdmp IR 结论

xdmp 低代码的唯一真源是 YAML/JSON 信封：

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

vamis 不取代 TableDef/FormDef，而是增加扩展 kind：

| kind | 职责 |
|------|------|
| `UiPage` | Amis 兼容的 widget 树（`spec.type` + `body`）。将来可嵌入 `PageDef.spec.schema` 或 `pageKind: SCHEMA` |
| `FormDef` | 编译为 `page > form`（controlType → input-text/select/…） |
| `TableDef` | 编译为 `page > crud` 预览 |

对接点：同一信封、同一 `metadata` 字段、未知 kind 占位不崩。xdmp 后端可把 `UiPage` 注册成 `LcdpIrKind` 插件而不改内核。

## 2. 作者格式

- 正式作者态：**YAML 1.2 Core Schema**（`packages/vamis-core/src/yaml.ts`）
- Amis JSON：`jsonToIr()` 包成 `UiPage` 再 `yamlFromIr()`
- 运行时输入：IR 文档或裸 `{type: page}`，Root 一律先 normalize

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

Vue 3 + Pinia hub（仿 MST 节点树）+ `amis-formula@6.13.0`。继续按 Amis 的 `type` 注册渲染器；每个渲染器封装 shadcn-vue（reka-ui）原语，不追 cxd 像素，也不改 YAML/IR 信封。

## 4. 非目标（第一期）

完整像素级 cxd、MST、office/pdf 真实预览、TinyMCE/Monaco 全家桶。Amis type 继续补齐。
