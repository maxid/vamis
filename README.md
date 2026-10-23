# Vamis

用 Vue 3 复刻 [百度 Amis](https://github.com/baidu/amis) 的 JSON 低代码运行时。作者态同时支持 **YAML** 与 **JSON**；信封对齐 **LCDP IR**（`apiVersion: lcdp.ir/v1`）。

按 **Amis 组件 type** 继续搬运；UI 原语用 **shadcn-vue / Tailwind**。不搬 `cxd-` 前缀，cxd 能力尽量像素级转写。作者态和对齐 LCDP IR 不变。

## 当前状态（2026-10-22）

- 进度真源：[CONTEXT.md](CONTEXT.md)（任务结束必须回写完成状态与后续计划）。
- 嵌入入口：Vue 用 `VamisRoot`；任意 HTML 用 JS SDK `vamis.embed`（`pnpm --filter @vamis/sdk build` → `packages/vamis-sdk/dist/sdk.js`）。
- **cxd 转写**：不搬 `cxd-` 前缀；盒子、密度、交互尽量像素级落到 shadcn-vue / Tailwind。
- **默认自适应**：page / form / 表单控件不写 `size` 就吃满容器；`size` / `className` 只是收窄。
- **组装容器**：schema 布局壳用 `div`（对齐 Amis）；Form 顶层 `<form>`，嵌套默认 `div`。见 `.cursor/rules/assembly-containers.mdc`。
- **作者态**：YAML 与 JSON 并列，不强制 YAML。
- **在线文档**：组件 / 类型 / 概念 / 开始 / 样式 / 扩展页标题下显示「实现进度 · 完成状态」（已注册 ≠ 语义完成）。目录页（介绍、组件介绍）除外。
- kernel D1 Scope、D3 API 管线、D4 事件对象 P0 已落地。
- amis type 名称覆盖 **181 / 189（95.8%）**，剩 5 个 type 与 3 个别名。
- 组件语义（侧栏 155）：已完成 **2**（`page` 95% / `container` 100%）/ 进行中 151 / 未开始 2，平均 **47%**。
- `pnpm test`：formula 185 + core 175 + sdk 13；`pnpm build` 通过；`pnpm typecheck` 已通过。
- amis 上游自 2026-03-18 无新提交，仍对齐 6.13.0。

type 覆盖复算：`pnpm status -- --amis ../amis`。细节见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md) 与 [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)。

## 给 AI / 协作者

- [AGENTS.md](AGENTS.md) — 命令、约定、任务收工必须回写进度
- [CONTEXT.md](CONTEXT.md) — 术语、**当前进度与后续计划**
- 在线文档：`pnpm dev` 后打开 http://127.0.0.1:5173/（首页即文档，与示例同一应用；文档页标题下有实现进度）
- GitHub Pages：https://maxid.github.io/vamis/（推 `main` 后由 Actions 发布）

## 设计文档

- [运行时与 IR 设计](docs/superpowers/specs/2026-10-20-vamis-vue3-runtime-design.md)：YAML 作者态、`UiPage` 信封、渲染管线、Vue / JS SDK 双入口。
- [JS SDK](docs/superpowers/specs/2026-10-21-vamis-js-sdk.md)：`vamis.embed`，对齐 Amis SDK 用法。
- [运行时语义设计](docs/superpowers/specs/2026-10-20-vamis-runtime-semantics-design.md)：基于 amis 文档对齐数据域、表达式、API、事件动作、表单、CRUD 的 v0.2 增补与路线图。
- [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)：按文档侧栏的状态与进度（已注册 ≠ 语义完成）。
- [amis 同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md)：type 覆盖、上游对齐、实现深度分级。
- [主题映射](docs/superpowers/specs/2026-10-21-vamis-theme-shadcn.md)：Amis 后台水标 × shadcn token。
- [在线文档](docs/superpowers/specs/2026-10-21-vamis-online-docs.md)：与 Playground 同应用（首页 `/`、`/components`、`/style`）；文档页标题下「实现进度 · 状态」。

## 怎么跑

需要 Node 20+ 与 pnpm。

```bash
pnpm install
pnpm dev          # 文档 / 组件 / 样式 / 示例，http://127.0.0.1:5173
```

| 路由 | 做什么 |
|------|--------|
| `/` | 文档首页（开始 / 概念 / 类型 / 扩展；标题下显示实现进度） |
| `/components` | 组件文档（侧栏对齐 Amis，YAML / JSON 实时预览，标题下显示实现进度） |
| `/style` | 样式（对齐 Amis 顶栏：快速开始 / CSS 变量 / 辅助类目录） |
| `/examples` | 示例：分类树 + 预览 + Schema |
| `/editor` | 编辑器骨架：左树 / 中预览 / 右属性 + Schema |

跑核心测试：

```bash
pnpm test
```

## GitHub Pages

Playground（`/` 文档 + `/components` + `/style` + `/examples` + `/editor`）可静态发布到 https://maxid.github.io/vamis/ 。

第一次需要在仓库 **Settings → Pages → Source** 选 **GitHub Actions**。之后推 `main` 或手动跑 workflow `Deploy playground to GitHub Pages`。

`pnpm build` 产出全静态目录：每个文档/组件路由都有一份 `index.html`，无 Node 服务。`/api/mock2` 打进前端 JS。项目站带仓库名前缀，构建时 `VITE_BASE=/vamis/`。

本地按 Pages 路径预览：

```bash
VITE_BASE=/vamis/ pnpm build
VITE_BASE=/vamis/ pnpm preview   # http://127.0.0.1:4173/vamis/
```

## 作者态与 IR 的关系

低代码的唯一真源是 IR 信封：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage          # Vamis 扩展；LCDP IR 已有 TableDef/FormDef/PageDef…
metadata:
  name: form-page
  description: 表单页面
spec:
  type: page          # 这里是 Amis 兼容的 widget 树
  title: 表单页面
  body: [...]
```

- **YAML** 与 **JSON** 都是作者态，不强制某一种。`parseSchemaText` 以 `{` / `[` 开头走 JSON，否则走 YAML。
- 裸 widget 或 IR 信封都可以；`jsonToIr()` 把裸树包成 `kind: UiPage`。
- 运行时 `VamisRoot` 先 normalize 成 IR，再 `compileIrToWidget()` 得到 widget 树。
- 未知 `type` / 未实现的 `kind` 显示占位，不崩。

黄金样例：

- `playground/src/examples/form-page.yaml` — 从 Amis `examples/components/Page/Form.jsx` 转出
- `playground/src/examples/amis-form.json` — 原始 JSON；Playground 源码 Tab 可在 YAML / JSON 间格式化
- `playground/src/examples/crud-page.yaml` — 查询表 + 表格 + 弹窗编辑

`playground/src/examples/` 下共 14 个 YAML 样例，另含向导、组合录入、选择器、展示、布局、事件、校验、Amis REST 等。

## 与 LCDP IR 的对接点

| 点 | 做法 |
|----|------|
| 信封 | 同 `apiVersion` / `kind` / `metadata` / `spec` |
| `UiPage` | Vamis 扩展 kind，承载 widget 树；将来可挂到 `PageDef.spec.schema` 或 `pageKind: SCHEMA` |
| `FormDef` / `TableDef` | 已能编译成 form / crud 预览 |
| 存储 | 不实现 `lcdp_ir_def`；宿主把 `UiPage` 注册成 `LcdpIrKind` 即可收纳 |

细节：`docs/superpowers/specs/2026-10-20-vamis-vue3-runtime-design.md`

## 包结构

```
packages/vamis-core     工厂、IR、公式封装、Pinia hub、SchemaRenderer
packages/vamis-formula  表达式 / 过滤器 / 内置函数（amis-formula 6.13.0 MIT）
packages/vamis-ui       shadcn-vue 原语（Button/Input/Select/Dialog/Table…）
packages/vamis          P0 渲染器注册表
packages/vamis-editor   树 + 属性 + Schema + 预览
packages/vamis-sdk      JS SDK（`sdk.js` / `vamis.embed`）
playground               文档 / 组件 / 样式 / 示例（5173）
website                  文档 Markdown；可选 VitePress 静态导出
```

公式层在 `@vamis/formula`，从 `amis-formula@6.13.0`（MIT）搬运。Amis 概念与 Schema 兼容性遵循 Apache-2.0，见 `NOTICE`。

## 许可

Apache-2.0。UI 原语来自 shadcn-vue（MIT）。不要把 Amis 源码整仓复制进本仓库。
