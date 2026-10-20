# varmis Vue3 运行时与 IR 对齐设计

- 日期：2026-10-20
- 状态：第一期已按此实施
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

varmis 不取代 TableDef/FormDef，而是增加扩展 kind：

| kind | 职责 |
|------|------|
| `UiPage` | Amis 兼容的 widget 树（`spec.type` + `body`）。将来可嵌入 `PageDef.spec.schema` 或 `pageKind: SCHEMA` |
| `FormDef` | 编译为 `page > form`（controlType → input-text/select/…） |
| `TableDef` | 编译为 `page > crud` 预览 |

对接点：同一信封、同一 `metadata` 字段、未知 kind 占位不崩。xdmp 后端可把 `UiPage` 注册成 `LcdpIrKind` 插件而不改内核。

## 2. 作者格式

- 正式作者态：**YAML**
- Amis JSON：`jsonToIr()` 包成 `UiPage` 再 `yamlFromIr()`
- 运行时输入：IR 文档或裸 `{type: page}`，Root 一律先 normalize

## 3. 运行时

Vue 3 + Pinia hub（仿 MST 节点树）+ `amis-formula@6.13.0`。UI 原语来自 shadcn-vue（reka-ui），不追 cxd 像素。

## 4. 非目标（第一期）

完整 amis-editor、crud2/table2、wizard/combo、office/pdf/chart、MST、像素级 cxd。
