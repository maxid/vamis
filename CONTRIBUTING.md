# 贡献指南

感谢愿意参与 Vamis。这个项目还在 alpha，最需要的是**真实 schema 和真实差异**，不是礼貌的 star。

## 先读

- [README.md](README.md)：项目是什么、怎么跑、包结构。
- [AGENTS.md](AGENTS.md)：命令、约定、任务收工必须回写进度。
- [CONTEXT.md](CONTEXT.md)：术语、当前进度、后续计划（进度真源）。
- [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)：155 项侧栏组件的状态。

## 环境

- Node 20+
- pnpm 10（`packageManager` 已锁定版本）
- 对照需要本机装有 Playwright 浏览器（首次 `pnpm compare` 会提示安装）

```bash
pnpm install
pnpm dev            # http://127.0.0.1:5173
pnpm test           # formula + core + sdk
pnpm typecheck      # vue-tsc；仓内仍有既有报错
pnpm sdk:build      # packages/vamis-sdk/dist/sdk.js
pnpm compare        # Amis / Vamis Playwright 对照
```

`pnpm compare` 常用参数：

```bash
pnpm compare --page button          # 只跑某个组件
pnpm compare --bucket 组件 --section 功能
pnpm compare --id <case-id>         # 单条
pnpm compare --mobile               # 375 窄屏
```

## 报问题

开 issue 前先搜一下现有 issue。Bug / 渲染问题请提供：

1. 最小可复现 schema（脱敏，不要贴密钥或内网地址）；
2. 期望行为 vs 实际行为；
3. 浏览器、桌面/移动视口（375）、浅色/深色；
4. 控制台报错或截图。

Amis 语义差异请用「Amis 语义差异」模板，附 Amis 文档链接或对照用例 id；能说明是不是 P0 更好。

## 提交 PR

- 一个 PR 只做一件事；组件修复附**修复前后截图**和对照结果。
- 跑过的命令写进 PR 模板；没跑的说明原因。
- 组件改动：先 `pnpm sdk:build`，再 `pnpm compare --page <type>`；全局 token / 样式改动跑全量 `pnpm compare`。
- `compare-cases.js`、`dist/`、对照产物**不进 git**。
- 按 [AGENTS.md](AGENTS.md) 的要求回写 `CONTEXT.md` 的完成状态和后续计划；修复组件后把可复用经验去重回写 `.cursor/rules/lessons.mdc`。
- 不要提交密钥、`.env`、内网地址；模板默认转义，`|raw` / 字符串函数只在受信任模式启用。
- 中文 / 英文提交都可以；commit message 用 `<type>(<scope>): <说明>`，说明优先中文。

## 代码边界

- Schema 字段名与 Amis 语义不改写；扩展只加新字段或新 IR `kind`。
- 渲染器只消费 `schema` / `data` / `env`，禁止组件内直接 `fetch`。
- 状态用 Pinia hub，不引入 MST。
- 不复制 Amis 源码、logo、文档原文；公式层来自 MIT 的 `amis-formula@6.13.0`，见 [NOTICE](NOTICE)。
- 自定义组件走 Vue 组件或已有 `custom` DOM，不把 React 打进产物。

## 许可

贡献即同意按 Apache-2.0 授权（`@vamis/formula` 为 MIT）。不需要签 CLA。

## 沟通

- 使用问题 / 想法：GitHub Discussions（如果还没开，先开 issue）。
- 安全问题：不要公开贴细节，见 [SECURITY.md](SECURITY.md)。
