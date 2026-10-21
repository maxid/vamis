# 项目领域上下文 (CONTEXT)

> Vamis：Vue 3 低代码运行时。本文档是术语表与**进度真源**；任务结束必须回写「当前进度」和「后续计划」。

## 文档定位

| 文档类型 | 位置 | 用途 |
|---------|------|------|
| 术语与进度 | 本文件 | 领域语言、模块层次、当前进度、下一步 |
| AI 工作指引 | [AGENTS.md](AGENTS.md) | 命令、约定、收工回写；`CLAUDE.md` 只指向它 |
| 规格 | `docs/superpowers/specs/` | 运行时 / 语义 / 组件 TODO / 主题 / 在线文档 |
| 计划 | `docs/superpowers/plans/` | 可执行任务清单 |
| 在线文档 | `website/src` + playground 路由 | 与示例同端口；进度仍以本文件为准 |

> **图表**：优先 mermaid。

## 模块层次

| 模块 | 路径 | 职责 |
|------|------|------|
| `@vamis/core` | `packages/vamis-core` | `registerRenderer`、IR、公式、Pinia hub、Scope/env/动作（契约仍在补） |
| `@vamis/ui` | `packages/vamis-ui` | shadcn-vue 原语与 CSS 变量（密度、状态色） |
| `vamis` | `packages/vamis` | Amis type 渲染器；`register.ts` + `extras/*.ts` |
| `@vamis/editor` | `packages/vamis-editor` | 树 / 画布 / 属性 / YAML |
| playground | `playground` | 示例（`/`）+ 文档（`/docs`）+ 组件文档（`/components`） |
| 文档正文 | `website/src` | Markdown 真源；playground 在 5173 渲染 |

## 术语表

| 术语 | 定义 |
|------|------|
| **Amis** | 百度 JSON 低代码引擎（6.13.0）。Vamis 对齐其 **schema 语义**，不复制 React/MST/cxd |
| **type** | Schema 节点种类（`page` / `form` / `crud`…）。侧栏 155 项见组件 TODO |
| **已注册 ≠ 语义完成** | `registerRenderer` 有调用只说明能 resolve；进度看文档主路径 |
| **IR 信封** | `apiVersion: lcdp.ir/v1` + `kind` + `metadata` + `spec`。与 LCDP IR 同形 |
| **UiPage** | Vamis 扩展 kind，`spec` 里放 Amis widget 树 |
| **FormDef / TableDef** | LCDP IR 已有 kind；可编译成 form / crud 预览 |
| **YAML 1.2 Core** | 作者态字面量：bool/null/数字不加引号；`yes`/`On`/`012` 当字符串 |
| **Scope / 数据链** | 数据域 + `__super`；设计 D1，尚未落地 |
| **env** | 运行时注入：`fetcher` / `notify` / `jumpTo` / `alert` / `confirm` |
| **onEvent** | 组件事件到动作注册表；设计 D4，现为精简 switch |
| **shadcn token** | 颜色独立；**盒子对齐 cxd**（32 控件 / 24 表单项 / 98 label / 40 表行），不引入 `cxd-` |
| **kernel P0** | 语义设计 D1–D8：Scope、表达式过滤器、API 管线、事件对象、联动、表单路径值、渲染器契约、诊断 |
| **占位 / 精简** | 占位：明确未接入；精简：能绑值渲染但缺真实能力（Monaco、地图、Office 预览等） |

## 当前进度（2026-10-21）

回写时更新日期，并同步组件 TODO 汇总行、同步状态里的覆盖数字（若 type 有增减）。

| 面 | 状态 | 说明 |
|----|------|------|
| type 名称覆盖 | 181 / 189（95.8%） | 见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md) |
| 组件语义（侧栏 155） | 已完成 **0** / 进行中 153 / 未开始 2，平均 **47%** | [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)；未开始：`popOver` 属性、`badge` 属性 |
| kernel D1–D8 | 未落地 | 卡住绝大多数「进行中」组件升到已完成 |
| 视觉 | 盒子数字对齐 cxd；配色独立 | 控件宽档 `size`、表格 cell padding、`m-t-xs` 阶尚未吃满 |
| Playground | `/` 示例 + `/docs` 文档 + `/components` 组件 | 同一 5173；`pnpm build` 全静态 HTML，可发 GitHub Pages |
| 编辑器 | 可用骨架 | 色板+树+画布点选/拖拽；无插件市场 |
| 在线文档 | 已并入 playground | `pnpm dev` → `/docs`；` ```schema ` 进 `VamisRoot`，可编辑即时预览 |
| 测试 | `pnpm test` 37 过 | `typecheck` 仍有既有错误 |

**最近交付**

- 文档产品名统一为 **Vamis**；IR 只写 LCDP IR / `lcdp.ir/v1`，不再写外部平台名。
- Playground `pnpm build` 全静态导出：每个文档/组件路径一份 `index.html`，可发 GitHub Pages（`VITE_BASE=/<repo>/`）；`/api/mock2` 打进前端 JS。首次需 Settings → Pages 选 GitHub Actions。
- Playground `/` 与 `/docs` 共用同一外壳：`max-w-[1800px]`、相同左右 padding、主栏 `flex-1` 撑满；文档不再套 `max-w-3xl` 把内容栏收窄。
- 锁定商业对齐口径：配色可自生成；cxd **盒子系统**（2px 阶、32/24/98/40）写入 token 与样式 spec；横排 label 从 120px 改回 98px。
- 文档 ` ```schema ` 对齐 Amis Play mini：同一 `VamisRoot` 真跑 + 侧栏改 YAML 即时预览；介绍页换成打 `/api/mock2/sample` 的 CRUD（筛选/批量/删除/重置）。
- 文档并入 Playground：`pnpm dev` 的 5173 同时提供文档 / 组件 / 示例，顶栏对齐 Amis；Markdown 仍在 `website/src`。
- 增加 `AGENTS.md`、`CONTEXT.md`、`CLAUDE.md` 与项目规则 `.cursor/rules/update-progress.mdc`：每完成一项任务必须回写进度/完成状态，并写下后续计划。
- 组件 P0 TODO 按 amis 文档侧栏分类落地。
- Playground 改为分类树 + 组件/示例/IR 三 Tab。
- 主题层用 shadcn CSS 变量对齐 Amis 后台水标（不搬 cxd）。

## 后续计划

按「契约先于组件数量」排序。做完当前刀立刻改本段，把已完成的挪到「最近交付」。

1. **盒子吃满**：FormItem `size` 落到 `--form-control-width-*`；Table 用 `--table-cell-px` / `--table-row-h`；辅助类 `m-t-xs` 映射 `--gap-*`（仍 D12）。
2. **P0 kernel D1 Scope**：显式数据域 + `__super`，先让 `page` / `service` / `form` / `crud` 不再每节点浅拷贝父数据。文档高级示例依赖它。
3. **P0 kernel D2 表达式过滤器**：`${name|raw}` / `|json` 走同一 `expr` 层，模板默认转义。
4. **P0 kernel D3 API 管线**：`sendOn` / adaptor / `responseData` / `replaceData`，form/crud 先接。
5. **P0 kernel D4/D5**：事件对象 + 动作注册表 + 动态 target。
6. 组件语义：在 kernel 挡住变少后，按 TODO 把 ≥50% 的项往 80%+ 推（先 form 主路径、crud filter 作用域）。
7. 清 `pnpm typecheck` 既有错误，再考虑进 CI。

非本阶段：office/pdf 真实预览、Monaco/TinyMCE、`.cxd-` 类名/云舍蓝、MST、完整 amis-editor。
