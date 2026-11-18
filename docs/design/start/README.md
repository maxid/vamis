# Start 上手文档设计

> 状态：**进行中** · 覆盖 [website/src/start](../../../website/src/start) · 3 篇 + 首页介绍
> 盘点日期：2026-11-18。本文是站点文档域的设计，不替代各页正文。

## 0. 一页结论

Start 是**首次成功路径**：介绍 → 快速开始 → JS SDK → FAQ。目标是在最短时间内让作者跑通第一张 schema，并明确 Vue 与 JS SDK 两条入口、YAML/JSON/IR 三种作者态。当前 90–95%，主路径已通，缺口在环境前提、版本/构建约定与失败态。

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
| [介绍](../../../website/src/index.md) | 定位、能力边界、首屏 CRUD 示例 | — |
| [快速开始](../../../website/src/start/getting-started.md) | Vue 入口、安装、最小 schema | 95% |
| [JS SDK](../../../website/src/start/sdk.md) | sdk.js、embed、registerRenderer、样式 | 90% |
| [常见问题](../../../website/src/start/faq.md) | 环境/渲染/请求/样式/迁移 | 90% |

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
- [站点首页](../../../website/src/index.md)：首屏 CRUD 活示例。

```text
Vue 宿主 → VamisRoot(schema) ─┐
JS SDK → vamis.embed(schema) ─┼→ 同一 SchemaRenderer / 注册表
IR / YAML / JSON ────────────┘
```

## 4. 当前缺口

- npm 发布/CDN 版本未在文档中形成稳定契约。
- 环境前提（Node/pnpm 版本、浏览器支持）未集中。
- SDK 样式/资源路径与构建产物说明仍偏仓库内视角。
- FAQ 缺“文档示例跑不起来”的排查树。

## 5. 验收清单（文档核对：3 / 12）

- [x] website/src/start 3 篇 + 首页已定位
- [x] VamisRoot / SDK / 构建命令已定位
- [x] 双入口与作者态边界已盘点
- [ ] 快速开始按文档从零跑通（Vue）
- [ ] SDK 按文档构建并 embed 跑通
- [ ] YAML / JSON / IR 示例各跑通一次
- [ ] 样式缺失/接口失败/CORS 排查项核对
- [ ] 代码块可复制、无省略导入
- [ ] 375px/深色下首屏示例可读
- [ ] `pnpm build`（文档站）通过
- [ ] `pnpm typecheck` 0（只改文档时说明未跑）
- [ ] 版本/CDN 承诺与现状一致

## 6. 后续

1. 集中环境前提与故障排查。
2. 统一 npm/CDN 版本口径，未发布就标规划。
3. 首屏示例与 SDK 示例共用同一份 schema。
