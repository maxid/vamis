# 发布检查清单

更新：2026-11-10。`✅` 已就绪，`⚠️` 有材料但还没落地，`⬜` 未开始。渠道账号和投放由项目作者负责，这里只列发布前必须清掉的项。

## P0：不清掉不要首发

| # | 项 | 现状 | 动作 | 验收 | 负责 |
|---|----|------|------|------|------|
| 1 | GitHub About / topics / homepage | ⚠️ 仓库描述是泛描述，缺 Vue / Amis 关键词 | 复制 [01-github-profile.md](01-github-profile.md) 里的文案，设 homepage 为演示域名 | GitHub 搜索 `amis vue` / `vue lowcode` 能命中；About 一眼能看出是什么 | 作者 |
| 2 | README 首屏（中 / 英） | ✅ 本包已改 [README.md](../../README.md) 与 [README.en.md](../../README.en.md) | 替换 demo 域名为自定义域名；确认图片可访问 | 无痕窗口 10 秒内能说出「是什么、给谁、现在能跑什么」 | 作者 |
| 3 | npm 可安装 | ⚠️ 见 [05-npm-release.md](05-npm-release.md) | 补构建产物 + 包元数据 + 注册 `@vamis` scope | 全新目录 `pnpm add vamis` 后能 `import { VamisRoot }` 渲染 | 作者 |
| 4 | 演示站可达 | ⚠️ `maxid.github.io` 在当前网络被重定向；GitHub Pages 作为唯一入口有风险 | 换自定义域名（Cloudflare Pages 等）；GitHub Pages 留作备份；手机 4G 实测 | 国内手机 4G 打开 ≤3s；`/`、`/components`、`/sdk/compare.html` 都能用 | 作者 |
| 5 | 首屏截图 | ✅ `assets/readme/editor.png`、`assets/readme/compare-amis.png` | 检查 alt 文案；README 引用路径 | 图片在 GitHub 页面正常渲染 | 已完成 |
| 6 | 社区文件 | ✅ [CONTRIBUTING.md](../../CONTRIBUTING.md)、[SECURITY.md](../../SECURITY.md)、[ROADMAP.md](../../ROADMAP.md)、[CHANGELOG.md](../../CHANGELOG.md)、issue / PR 模板已在本包补齐 | 需要在 GitHub 上打开 Discussions 并建分类 | 陌生人能知道怎么提 issue、怎么跑测试、怎么参与 | 作者 |
| 7 | 免责声明 / 许可 | ✅ README 已加 alpha 与非官方声明；[NOTICE](../../NOTICE) 已有 | 检查 About 里也写上 unofficial | 不出现"百度官方"暗示 | 已完成 |
| 8 | 渠道口径 | ✅ 见 [02-launch-copy.md](02-launch-copy.md) | 发布前通读统一口径 | 不出现"100% 兼容 / 生产可用 / 替代 Amis" | 作者 |

## P1：首发前最好有

- ⬜ **StackBlitz / CodeSandbox 一键模板**：依赖 npm 发布；README 放按钮。
- ⬜ **1 分钟以内的 GIF**（README 首屏用，不是视频站）：分镜见 [04-readme-and-assets.md](04-readme-and-assets.md)。没有 GIF 不阻塞首发，截图可以先顶。
- ⬜ **GitHub Release `v0.1.0-alpha.1`**：模板见 [01-github-profile.md](01-github-profile.md)。哪怕 npm 没发，先有 release notes 也能建立"在维护"的信号。
- ⬜ **3 个非熟人 10 分钟上手测试**：记录卡点，修完再发。至少覆盖：桌面 Chrome、手机 4G、一个不装 Node 的人。
- ⬜ **站点统计**：Umami / Plausible 任一，至少统计 demo 访问、组件页、对照页；外链全部带 UTM。
- ⬜ **第二篇文章的素材**：把首发评论区的真实问题收集起来，D+7 发第二篇。

## P2：发布后

- ⬜ `good first issue` × 5–10 个（组件缺少的语义、文档错别字、对照用例）。
- ⬜ 组件进度周报（可直接截 [CONTEXT.md](../../CONTEXT.md) 的进度表 + 本周新增）。
- ⬜ 真实用户案例：哪怕是一个朋友的项目，写 300 字 + 截图。
- ⬜ 0.2 / 0.5 / 1.0 里程碑各做一次发布式传播；1.0 之前不碰 Product Hunt。

## 社区文件清单（已补齐）

| 文件 | 状态 |
|------|------|
| `CONTRIBUTING.md` | ✅ 跑起来的命令、测试/对照命令、PR 要求、进度回写规则 |
| `.github/ISSUE_TEMPLATE/bug_report.md` | ✅ schema 片段、期望、实际、浏览器/视口、移动端 |
| `.github/ISSUE_TEMPLATE/component_parity.md` | ✅ Amis 文档链接、对照用例 id、Amis/Vamis 行为 |
| `.github/ISSUE_TEMPLATE/feature_request.md` | ✅ 使用场景、schema 示例、是否 Amis 已有字段 |
| `.github/ISSUE_TEMPLATE/config.yml` | ✅ 引导到 Discussions 与进度页 |
| `.github/PULL_REQUEST_TEMPLATE.md` | ✅ 改了什么、为什么、跑过哪些命令、截图 / 对照前后 |
| `ROADMAP.md` | ✅ 阶段目标；进度真源仍指向 CONTEXT.md 与组件 TODO |
| `CHANGELOG.md` | ✅ 从 `0.1.0-alpha.1` 开始记 |
| `SECURITY.md` | ✅ 私密报告入口与已知取舍 |

## 渠道账号准备（作者执行，不阻塞材料）

| 渠道 | 需要准备 | 状态 |
|------|----------|------|
| 掘金 | 账号 / 专栏 / 作者简介（一句话定位） | ⬜ |
| 知乎 | 账号；先关注 3–5 个存量问题，别临时找 | ⬜ |
| V2EX | 账号（分享创造节点） | ⬜ |
| X / Twitter | 账号 + 头像 + 简介（与 GitHub 同一句） | ⬜ |
| Hacker News | 账号（发 Show HN 需要）；提前读 Show HN 规则 | ⬜ |
| Reddit | 账号 + r/vuejs 参与记录；纯新号发推广容易被删 | ⬜ |
| dev.to | 账号；英文长文同步 | ⬜ |
| 公众号 / 周刊 | 投稿邮箱或 issue 入口；按各号最近一个月的内容判断是否合适 | ⬜ |
| GitHub | Discussions 打开并建分类；About / topics / social preview 落地 | ⬜ |
| 邮箱 | 一个公开联系邮箱（GitHub profile 可见） | ⬜ |

## 发布前 3 天自测剧本

1. **无痕桌面**：打开仓库 → 10 秒内能说出是什么、现在能跑什么、怎么试。
2. **手机 4G（不连 Wi-Fi、不开代理）**：打开演示站 → 首页 CRUD 能滚、能点；对照页能打开；加载 ≤3s。
3. **冷启动**：删掉本地 `node_modules`，按 README 从 `pnpm install` 走到 `pnpm dev`，记录耗时和报错。
4. **npm**（发布后）：空目录 `pnpm add vamis @vamis/ui` + Vite Vue 模板，按 README 渲染一个表单。
5. **链接**：README / 文案 / 文章里的每个链接点一遍；过期链接和 `localhost` 全部清掉。
6. **搜索**：GitHub 搜 `amis vue`、`vue lowcode`、`vamis`；确认 About / topics 生效。
7. **图片**：README 在手机宽度下图片不溢出，alt 文案完整。
8. **口径**：所有对外文字里搜一遍 `100%`、`完全兼容`、`生产可用`、`官方`，该删的删。

## 明确不做

- 买 star / 刷榜 / 淘宝推广。
- 在 Amis 官方 issue 下贴广告；只在别人问 Vue 集成时回答，并注明非官方。
- 首发当天全渠道铺完；一次只打一波，留复盘时间。
- 宣称"替代 Amis"或"Amis 不行了"。
- 用 Amis 的 logo、文档原文截图做物料。
