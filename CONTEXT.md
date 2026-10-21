# 项目领域上下文 (CONTEXT)

> vamis：Vue 3 低代码运行时。本文档是术语表与**进度真源**；任务结束必须回写「当前进度」和「后续计划」。

## 文档定位

| 文档类型 | 位置 | 用途 |
|---------|------|------|
| 术语与进度 | 本文件 | 领域语言、模块层次、当前进度、下一步 |
| AI 工作指引 | [AGENTS.md](AGENTS.md) | 命令、约定、收工回写；`CLAUDE.md` 只指向它 |
| 规格 | `docs/superpowers/specs/` | 运行时 / 语义 / 组件 TODO / 主题 |
| 计划 | `docs/superpowers/plans/` | 可执行任务清单 |

> **图表**：优先 mermaid。

## 模块层次

| 模块 | 路径 | 职责 |
|------|------|------|
| `@vamis/core` | `packages/vamis-core` | `registerRenderer`、IR、公式、Pinia hub、Scope/env/动作（契约仍在补） |
| `@vamis/ui` | `packages/vamis-ui` | shadcn-vue 原语与 CSS 变量（密度、状态色） |
| `vamis` | `packages/vamis` | Amis type 渲染器；`register.ts` + `extras/*.ts` |
| `@vamis/editor` | `packages/vamis-editor` | 树 / 画布 / 属性 / YAML |
| playground | `playground` | 分类树 + 预览 + IR Tab |

## 术语表

| 术语 | 定义 |
|------|------|
| **Amis** | 百度 JSON 低代码引擎（6.13.0）。vamis 对齐其 **schema 语义**，不复制 React/MST/cxd |
| **type** | Schema 节点种类（`page` / `form` / `crud`…）。侧栏 155 项见组件 TODO |
| **已注册 ≠ 语义完成** | `registerRenderer` 有调用只说明能 resolve；进度看文档主路径 |
| **IR 信封** | `apiVersion: lcdp.ir/v1` + `kind` + `metadata` + `spec`。与 xdmp LCDP IR 同形 |
| **UiPage** | vamis 扩展 kind，`spec` 里放 Amis widget 树 |
| **FormDef / TableDef** | xdmp 已有 kind；可编译成 form / crud 预览 |
| **YAML 1.2 Core** | 作者态字面量：bool/null/数字不加引号；`yes`/`On`/`012` 当字符串 |
| **Scope / 数据链** | 数据域 + `__super`；设计 D1，尚未落地 |
| **env** | 运行时注入：`fetcher` / `notify` / `jumpTo` / `alert` / `confirm` |
| **onEvent** | 组件事件到动作注册表；设计 D4，现为精简 switch |
| **shadcn token** | `--background` / `--primary` / `--control-h` 等；对齐 Amis 后台密度（14px / 32px 控件），不引入 `cxd-` |
| **kernel P0** | 语义设计 D1–D8：Scope、表达式过滤器、API 管线、事件对象、联动、表单路径值、渲染器契约、诊断 |
| **占位 / 精简** | 占位：明确未接入；精简：能绑值渲染但缺真实能力（Monaco、地图、Office 预览等） |

## 当前进度（2026-10-21）

回写时更新日期，并同步组件 TODO 汇总行、同步状态里的覆盖数字（若 type 有增减）。

| 面 | 状态 | 说明 |
|----|------|------|
| type 名称覆盖 | 181 / 189（95.8%） | 见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md) |
| 组件语义（侧栏 155） | 已完成 **0** / 进行中 153 / 未开始 2，平均 **47%** | [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)；未开始：`popOver` 属性、`badge` 属性 |
| kernel D1–D8 | 未落地 | 卡住绝大多数「进行中」组件升到已完成 |
| 视觉 | shadcn token 对齐密度/状态色 | 缺 `m:`/`pc:` className（D12 P1） |
| Playground | 右 Tab：组件树 / 示例树 / IR 源码 | 可点树驱动预览 |
| 编辑器 | 可用骨架 | 色板+树+画布点选/拖拽；无插件市场 |
| 测试 | `pnpm test` 37 过 | `typecheck` 仍有既有错误 |

**最近交付**

- 增加 `AGENTS.md`、`CONTEXT.md`、`CLAUDE.md` 与项目规则 `.cursor/rules/update-progress.mdc`：每完成一项任务必须回写进度/完成状态，并写下后续计划。
- 组件 P0 TODO 按 amis 文档侧栏分类落地。
- Playground 改为分类树 + 组件/示例/IR 三 Tab。
- 主题层用 shadcn CSS 变量对齐 Amis 后台水标（不搬 cxd）。

## 后续计划

按「契约先于组件数量」排序。做完当前刀立刻改本段，把已完成的挪到「最近交付」。

1. **P0 kernel D1 Scope**：显式数据域 + `__super`，先让 `page` / `service` / `form` / `crud` 不再每节点浅拷贝父数据。
2. **P0 kernel D2 表达式过滤器**：`${name|raw}` / `|json` 走同一 `expr` 层，模板默认转义。
3. **P0 kernel D3 API 管线**：`sendOn` / adaptor / `responseData` / `replaceData`，form/crud 先接。
4. **P0 kernel D4/D5**：事件对象 + 动作注册表 + 动态 target。
5. 组件语义：在 kernel 挡住变少后，按 TODO 把 ≥50% 的项往 80%+ 推（先 form 主路径、crud filter 作用域）。
6. 清 `pnpm typecheck` 既有错误，再考虑进 CI。

非本阶段：office/pdf 真实预览、Monaco/TinyMCE、像素级 cxd、MST、完整 amis-editor。
