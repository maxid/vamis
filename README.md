# vamis

用 Vue 3 复刻 [百度 Amis](https://github.com/baidu/amis) 的 JSON 低代码运行时。作者格式是 **YAML**；信封对齐 **xdmp LCDP IR**（`apiVersion: lcdp.ir/v1`）。

按 **Amis 组件 type** 继续搬运；UI 原语用 **shadcn-vue**，不追像素级 `cxd`。YAML 作者态和对齐 xdmp IR 不变。

## 当前状态（2026-10-20）

- amis type 名称覆盖 **181 / 189（95.8%）**，剩 5 个 type 与 3 个别名。
- `pnpm test` 37/37 通过；`pnpm build` 通过；`pnpm typecheck` 仍有 27 个错误待清。
- amis 上游自 2026-03-18 无新提交，仍对齐 6.13.0，本轮无需搬运新组件。

完整状态、实现深度分级与下一阶段清单见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md)。覆盖数字可用 `pnpm status -- --amis ../amis` 复算。

## 设计文档

- [运行时与 IR 设计](docs/superpowers/specs/2026-10-20-vamis-vue3-runtime-design.md)：YAML 作者态、`UiPage` 信封、渲染管线。
- [运行时语义设计](docs/superpowers/specs/2026-10-20-vamis-runtime-semantics-design.md)：基于 amis 文档对齐数据域、表达式、API、事件动作、表单、CRUD 的 v0.2 增补与路线图。
- [amis 同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md)：type 覆盖、上游对齐、实现深度分级。

## 怎么跑

需要 Node 20+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

浏览器打开 http://127.0.0.1:5173

| 路由 | 做什么 |
|------|--------|
| `/` | Playground：左侧贴 YAML，右侧实时渲染。可加载黄金表单、CRUD，或把 Amis JSON 转成 YAML |
| `/editor` | 编辑器骨架：左树 / 中预览 / 右属性 + YAML |

跑核心测试：

```bash
pnpm test
```

## YAML 与 IR 的关系

xdmp 低代码的唯一真源是 IR 信封（见 `megre/xdmp` 的 `docs/superpowers/specs/2026-10-17-lcdp-ir-kernel-design.md`）：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage          # vamis 扩展；xdmp 已有 TableDef/FormDef/PageDef…
metadata:
  name: form-page
  description: 表单页面
spec:
  type: page          # 这里是 Amis 兼容的 widget 树
  title: 表单页面
  body: [...]
```

- **YAML** 是作者态。
- **JSON**（Amis 页面）经 `jsonToIr()` 包成 `kind: UiPage`，再 `yamlFromIr()` 写出。
- 运行时 `VamisRoot` 先 normalize 成 IR，再 `compileIrToWidget()` 得到 widget 树。
- 未知 `type` / 未实现的 `kind` 显示占位，不崩。

黄金样例：

- `playground/src/examples/form-page.yaml` — 从 Amis `examples/components/Page/Form.jsx` 转出
- `playground/src/examples/amis-form.json` — 原始 JSON，Playground 里点「Amis JSON → YAML」
- `playground/src/examples/crud-page.yaml` — 查询表 + 表格 + 弹窗编辑

`playground/src/examples/` 下共 14 个 YAML 样例，另含向导、组合录入、选择器、展示、布局、事件、校验、Amis REST 等。

## 与 xdmp 的对接点

| 点 | 做法 |
|----|------|
| 信封 | 同 `apiVersion` / `kind` / `metadata` / `spec` |
| `UiPage` | vamis 扩展 kind，承载 widget 树；将来可挂到 `PageDef.spec.schema` 或 `pageKind: SCHEMA` |
| `FormDef` / `TableDef` | 已能编译成 form / crud 预览 |
| 存储 | 不实现 `lcdp_ir_def`；xdmp 后端把 `UiPage` 注册成 `LcdpIrKind` 即可收纳 |

细节：`docs/superpowers/specs/2026-10-20-vamis-vue3-runtime-design.md`

## 包结构

```
packages/vamis-core     工厂、IR、公式、Pinia hub、SchemaRenderer
packages/vamis-ui       shadcn-vue 原语（Button/Input/Select/Dialog/Table…）
packages/vamis          P0 渲染器注册表
packages/vamis-editor   树 + 属性 + YAML + 预览
playground               Vite 演示与 mock API
```

公式层使用 `amis-formula@6.13.0`（MIT）。Amis 概念与 Schema 兼容性遵循 Apache-2.0，见 `NOTICE`。

## 许可

Apache-2.0。UI 原语来自 shadcn-vue（MIT）。不要把 Amis 源码整仓复制进本仓库。
