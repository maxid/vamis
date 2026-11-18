# Start 上手文档设计

> 状态：**进行中** · 4 页主路径已核对，实现进度保持原值 · 覆盖 [website/src/start](../../../website/src/start) · 3 篇 + 首页介绍
> 盘点日期：2026-11-18。本文是站点文档域的设计，不替代各页正文。

## 0. 一页结论

Start 是**首次成功路径**：介绍 → 快速开始 → JS SDK → FAQ。目标是在最短时间内让作者跑通第一张 schema，并明确 Vue 与 JS SDK 两条入口、YAML/JSON/IR 三种作者态。当前实现进度仍为 90–95%；环境前提、构建产物、双入口、作者态与失败排查已核对，但文档核对不提升实现百分比。未发布的 npm / CDN 不作承诺。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **双入口**：Vue `<VamisRoot :schema>` 与 JS SDK `vamis.embed`；同一内核，不是两套运行时。
2. **作者态**：YAML / JSON 并列；IR 信封也可进；示例不要只给一种。
3. **安装**：workspace 用 pnpm；发布后用 npm 包名；样式必须引 `@vamis/ui/styles.css`。
4. **构建**：SDK 先 `pnpm --filter @vamis/sdk build`；产物在 `packages/vamis-sdk/dist/`；不要把源码路径当 CDN。
5. **品牌**：Mock API/示例用 Vamis 品牌，不出现 Amis 自称或假主机。
6. **FAQ 先给结论**：每条问题一个可执行答案，再给原因/链接。
7. **不承诺未发布能力**：npm 发布、CDN 版本、云端编辑器若未交付，标注为规划。

### 1.2 页面清单

| 页面 | 设计重点 | 自报 |
|---|---|---|
| [介绍](intro.md) | 定位、能力边界、首屏 CRUD 示例 | — |
| [快速开始](getting-started.md) | Vue 入口、安装、最小 schema | 95% |
| [JS SDK](sdk.md) | sdk.js、embed、registerRenderer、样式 | 90% |
| [常见问题](faq.md) | 环境/渲染/请求/样式/迁移 | 90% |

## 2. 文档契约

- 首次成功路径不超过一屏：安装 → 引样式 → 最小 schema → 预期结果。
- 每个代码块可直接复制；Vue 示例给完整 `main.ts`/组件，不省略样式导入。
- SDK 示例给 `sdk.js`/`sdk.css` 的相对路径与构建前提，不写不存在的 CDN。
- YAML 与 JSON 至少各出现一次；IR 信封给最小可运行例子。
- 失败态：缺样式、未注册渲染器、接口 404、CORS 各给一条排查。

## 3. 实现与数据流

- [VamisRoot](../../../packages/vamis/src/index.ts)：Vue 入口；`createPinia` + 样式。
- [SDK embed](../../../packages/vamis-sdk/src)：`sdk.js` loader、`vamis.embed`、`registerRenderer`。
- [Playground 启动](../../../README.md)：`pnpm dev` 同端口文档/组件/示例。
- [站点首页](intro.md)：首屏 CRUD 活示例。

```text
Vue 宿主 → VamisRoot(schema) ─┐
JS SDK → vamis.embed(schema) ─┼→ 同一 SchemaRenderer / 注册表
IR / YAML / JSON ────────────┘
```

## 4. 边界

- npm / CDN 未发布，正文明确按 workspace 与本地构建产物使用。
- Node/pnpm/浏览器前提、SDK 样式和 chunks 路径、FAQ 排查树均已补齐。
- `updateProps` 当前只合并 data；locale / context 不冒称已应用。

## 5. 验收清单（已核对）

- [x] website/src/start 3 篇 + 首页已定位
- [x] VamisRoot / SDK / 构建命令已定位
- [x] 双入口与作者态边界已盘点
- [x] 快速开始按文档从零跑通（Vue）
- [x] SDK 按文档构建并 embed 跑通
- [x] YAML / JSON / IR 示例各跑通一次
- [x] 样式缺失/接口失败/CORS 排查项核对
- [x] 代码块可复制、无省略导入
- [x] 375px/深色下首屏示例可读
- [x] `pnpm build`（文档站）通过
- [x] `pnpm typecheck` 0（只改文档时说明未跑）
- [x] 版本/CDN 承诺与现状一致

## 6. 后续

1. 发布后只补真实 npm / CDN 地址，不回写未验证版本承诺。
2. 新增入口参数时同步 SDK API 表、真实 embed 测试与 FAQ。
