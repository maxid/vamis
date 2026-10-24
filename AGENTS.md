# AGENTS.md

本文件为 **AI 编码助手的唯一工作指引**（Cursor / Claude Code 等）。读者默认对项目一无所知。不要在 `CLAUDE.md` 复制本节内容；`CLAUDE.md` 只指向本文件。

文档分工：

- [README.md](README.md) — 怎么跑、包结构（改结构先改它）
- [CONTEXT.md](CONTEXT.md) — 术语、模块层次、**当前进度与后续计划**
- 本文件 — 命令、约定、提交、任务收工必须回写文档
- `docs/superpowers/` — 规格 / 计划正文

## 项目概述

**Vamis** 用 Vue 3 复刻百度 Amis 的 JSON 低代码运行时。作者态同时支持 **YAML 1.2 Core** 与 **JSON**（不强制 YAML）；信封对齐 LCDP IR（`apiVersion: lcdp.ir/v1`）。按 Amis **组件 type / schema 语义** 搬运；UI 原语是 **shadcn-vue**（reka-ui + CSS 变量 + Tailwind）。**不搬 `cxd-` 前缀和主题 SCSS**；cxd 的盒子、密度、helper、交互尽量像素级转写到这套设计语言。

**技术栈**：Vue 3.5 + TypeScript + Vite + pnpm workspace + Pinia + Tailwind + shadcn-vue + `@vamis/formula`（从 `amis-formula@6.13.0` 搬运）。

## 项目结构

```
packages/vamis-core     工厂、IR、公式封装、Pinia hub、SchemaRenderer、env
packages/vamis-formula  表达式 / 过滤器 / 内置函数（从 amis-formula 6.13.0 搬运）
packages/vamis-ui       shadcn-vue 原语与主题 token
packages/vamis          渲染器注册表（register.ts + extras/*.ts）
packages/vamis-editor   可视化编辑器（树 / 预览 / 属性 / Schema）
packages/vamis-sdk      JS SDK（sdk.js + vamis.embed）
playground              文档（`/`）+ 组件 + 样式 + 示例 + 编辑器 + 对照（同一 Vite，5173）
website                 文档 Markdown 真源（可选 VitePress 静态导出）
docs/superpowers/       specs / plans
```

改目录树先改 README，再核对本文件。

## 常用命令

```bash
pnpm install
pnpm dev          # 文档（首页）/ 组件 / 示例，默认 http://127.0.0.1:5173
pnpm docs         # 同上（文档不另起端口）
pnpm test         # @vamis/formula + @vamis/core + @vamis/sdk vitest
pnpm compare:p0   # Amis vs Vamis SDK 盒模型对照（Playwright；失败 exit 1）
pnpm compare      # 对照 + 文档 schema 收割；用例按 Amis 侧栏 文档/组件/样式
                  # 全局修完必须全量重跑；组件修完只跑自身：`--page button`
                  # `--bucket 组件 --section 功能` 切一组；`--id` 单条
                  # `--mobile` / `pnpm compare:mobile` 按 375px 跑 Amis 窄屏表单
pnpm sdk:build    # 打 JS SDK：packages/vamis-sdk/dist/sdk.js
pnpm build        # SDK + playground 生产构建（GitHub Pages：VITE_BASE=/<repo>/）
pnpm typecheck    # vue-tsc 无错误
pnpm status -- --amis ../amis   # 复算 type 覆盖（默认对照仓是同级 ../amis）
```

对照源码：默认 `../amis`（6.13.0）。怎么查文档 / 样式 / 核心 / 组件见 `.cursor/rules/amis-lookup.mdc`。组件进度见 [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)。

## 架构约定

- Schema 字段名与 Amis 语义不改写；扩展只加新字段或新 IR `kind`。
- 渲染器只消费 `schema` / `data` / `env`；禁止组件内直接 `fetch`。
- 状态用 Pinia hub，不引入 MST。
- 嵌入必须两条入口：Vue `VamisRoot` 和 JS SDK `vamis.embed`。SDK 不另做渲染器，不搬 `amisRequire`。 `pnpm --filter @vamis/sdk build` 打 `sdk.js`。
- 对照重跑：全局类问题修完必须 `pnpm compare` 全量；组件级修完只跑自身 `pnpm compare --page <type>`。动到窄屏 / `m:` / 移动端表单再跑 `pnpm compare --mobile`（375px，Amis `<768` 断点）。
- 站点 / 样式 / 组件约定见项目规则：`.cursor/rules/site.mdc`、`style.mdc`、`component.mdc`。Amis 对照仓位置与查阅见 `amis-lookup.mdc`。任务收工见 `update-progress.mdc`。

## 关键文档

| 文档 | 用途 |
|------|------|
| [CONTEXT.md](CONTEXT.md) | 术语 + **进度 / 后续计划**（每任务必改） |
| [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md) | 155 项侧栏组件状态与百分比 |
| [运行时语义](docs/superpowers/specs/2026-10-20-vamis-runtime-semantics-design.md) | D1–D12 kernel 决策 |
| [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md) | type 覆盖率（与语义进度分开） |
| [主题 / 样式](docs/superpowers/specs/2026-10-21-vamis-theme-shadcn.md) | Amis 水标 × shadcn token |
| [在线文档](docs/superpowers/specs/2026-10-21-vamis-online-docs.md) | 与 Playground 同端口的文档结构 |
| [JS SDK](docs/superpowers/specs/2026-10-21-vamis-js-sdk.md) | 任意 HTML `vamis.embed`；与 `VamisRoot` 同一内核 |

## 任务开始与结束（强制）

**开始**：先读 `CONTEXT.md` 的「当前进度 / 后续计划」和相关 spec 状态行，对照代码。范围以文档为准，未列入的不擅自扩大。

**结束（每一项已交付的任务，不论大小）**：

1. 回写完成状态与进度（禁止代码已合入仍写「未开始」，禁止未做写成「已完成」）。
2. 规划并写下一条后续计划（下一刀做什么、为何、卡在哪）。
3. 具体改哪些文件见项目规则 `.cursor/rules/update-progress.mdc`。

未合入的项保持原状态并注明阻塞。不要 git commit / push，除非用户当轮明确要求。

## 提交说明

本轮改过文件时，在回复末尾提供 commit message，未要求提交则不要执行 `git commit`。标题：`<type>(<scope>): <说明>`（`feat` / `fix` / `docs` / `test` / `refactor` / `chore` / `style`）。**说明优先中文**，与现有 `git log` 一致。正文 1–2 句写为什么改；禁止 Co-authored-by。

## 安全

- 不要提交密钥、`.env`、内网地址。
- 模板默认转义；`|raw` / 字符串函数只在受信任模式。
- 不要把 Amis 源码整仓复制进本仓库。
