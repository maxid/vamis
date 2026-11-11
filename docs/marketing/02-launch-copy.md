# 首发文案包

所有文案都按「先讲清楚是什么，再给可点的东西，最后坦白局限」写。发布前把 `https://maxid.github.io/vamis/` 换成自定义域名，`{{NPM}}` 换成 npm 包名（发布后）。

## 0. 统一口径

**一句话（中）**：Vamis 用 Vue 3 原生重写了 Amis 的 JSON/YAML 低代码运行时——同一份 schema，不再套 React。

**一句话（英）**：Vamis is an Amis-compatible JSON/YAML low-code runtime, natively built for Vue 3.

**三条卖点**（任何渠道都用这三条，顺序可换）：

1. **同一份 Amis schema，Vue 3 原生跑**：不是 iframe，也不是在 Vue 里挂一个 React 根；渲染器、数据域、动作都在 Vue 里。
2. **184 / 189 个 Amis type 已注册**：表单、CRUD、表格、日期（含 375 移动端滚轮）、向导、SDK 嵌入都能用；组件语义平均 59%，每个文档页都标了进度。
3. **YAML 与 JSON 双作者态 + 两条入口**：Vue 用 `VamisRoot`，任意 HTML 用 `vamis.embed`；UI 走 shadcn-vue / Tailwind。

**30 秒口头版**：

> Amis 是百度开源的 JSON 低代码框架，但运行时是 React 的。Vamis 把同一套 schema 用 Vue 3 重写了：184 个 type 已注册，YAML 和 JSON 都能写，可以嵌进任意 HTML。现在还是 alpha，组件语义平均 59%，但表单和 CRUD 已经能跑，文档里每个组件都标了真实进度。

**必须带的一句**：

> 非百度官方项目，与百度无关联；Apache-2.0；alpha 阶段，不建议直接用于关键生产。

## 1. 掘金（主阵地）

**标题候选**（按点击欲排序，选一个；不要标题党到失真）：

1. `我把百度 Amis 重写成了 Vue 3 版本：184/189 个 type、1142 条对照用例`
2. `Amis 只能 React？Vue 3 原生低代码运行时 Vamis 开源了`
3. `同一份 Amis schema，React 和 Vue 并排跑：一次不改 schema 的 Vue 3 重写`
4. `三周、255 次提交：用 Vue 3 重写 Amis 低代码运行时`
5. `YAML 写后台，Vue 3 渲染：Vamis 的 10 分钟上手`

**摘要**（不超过 120 字）：

> Amis 的 schema 能不能直接跑在 Vue 3 里？我把运行时重写了一遍：184/189 个 type、880 个单测、1142 条 Amis 并排对照用例。现在 alpha 开源，表单/CRUD/移动端已可用。本文讲为什么重写、怎么保证像、以及现在还不能做什么。

**标签**：`前端`、`Vue.js`、`低代码`、`开源`

**封面**：直接用 `docs/marketing/assets/og-card.png`（1280 × 640），或换成 `assets/readme/compare-amis.png` 裁切。

**开头**（直接用作正文前 300 字）：

> Amis 是百度开源的低代码框架，用 JSON 描述后台页面，表单、表格、CRUD 都能直接配出来。它的生态和文档都很成熟，但有一个前提：运行时是 React 的。
>
> 很多团队是 Vue 技术栈。用 amis 的 JS SDK 嵌进 Vue 能跑，但页面里始终有一层 React；主题、Vue 组件复用、调试链路、包体积都要绕。过去三周我把这套运行时用 Vue 3 重写了一遍，取名 Vamis，今天开源 alpha：184/189 个 Amis type 已注册，同一份 schema 可以左右并排跑，YAML 和 JSON 都能写。
>
> 这篇文章讲三件事：为什么重写而不是封装、怎么保证像 Amis、以及现在还不能做什么。

**正文**：用 [03-launch-article.md](03-launch-article.md)，首尾按掘金习惯微调。

**结尾 CTA**：

> 项目刚开源，最缺的是真实 schema 的反馈。如果你手上有 Amis 项目，欢迎把跑不通的 schema 贴到 issue；如果只是想看看效果，Demo 和对照页都在 README 里。觉得有价值的话点个 star，对我很重要。

**评论区置顶**：

> 利益相关：我是作者。Demo：`https://maxid.github.io/vamis/`；与 Amis 并排对照：`.../sdk/compare.html`；源码：`https://github.com/maxid/vamis`。当前 alpha，组件语义平均 59%，每个文档页都标了进度，欢迎拍砖。

**发布时间**：工作日 09:30–11:00 或 20:00–22:00；避开周五晚上和节假日。

## 2. 知乎

**先找存量问题，不要自问自答刷屏**：

- 「Vue 3 有哪些好用的低代码框架？」
- 「百度 amis 支持 Vue 吗？」
- 「如何评价百度开源的低代码框架 amis？」
- 「前端低代码平台怎么选型？」
- 「有没有类似 amis 的 Vue 低代码方案？」

**回答模板**（前 2/3 回答原问题，最后 1/3 才提项目）：

> 先说结论：amis 本身是 React 运行时，Vue 项目用它的 JS SDK 能跑，但等于在 Vue 里再挂一个 React 根；如果你要的是"schema 不变、渲染层是 Vue"，目前没有官方方案。
>
> 选型上可以先分清三类：……
>
> 利益相关：我最近开源了 Vamis，就是按这个思路做的——Vue 3 原生渲染 Amis schema，184/189 个 type 已注册，YAML/JSON 都能写。当前 alpha，组件语义平均 59%，表单和 CRUD 可用，不建议直接上关键生产。Demo 和对照页：……
>
> 如果只是要一个 Vue 表单/表格，form-create、lowcode-engine-vue 也值得看；Vamis 的差异只在"Amis schema 兼容"这一件事上。

**注意**：不要复制粘贴到不相关的问题下；同一个问题只答一次；回答里写明作者身份。

## 3. V2EX

节点：**分享创造**

标题：

```
分享一个用 Vue 3 原生重写 Amis 低代码运行时的项目（开源 alpha）
```

正文：

```
最近在做一个实验：把 Amis 的 JSON schema 用 Vue 3 原样渲染，而不是在 Vue 里嵌 amis SDK。

项目叫 Vamis。三周时间，目前：
- 184/189 个 Amis type 名称已注册，组件语义平均 59%（每个文档页标了进度）
- 同一份 schema 可以和 Amis 并排跑，1142 条 Playwright 对照用例，P0 差异归零
- 880 个单测；YAML / JSON 双作者态；Vue VamisRoot + 任意 HTML vamis.embed 两条入口
- UI 用 shadcn-vue 重新实现，不搬 cxd 前缀

现在能跑：表单、CRUD、表格、日期（含 375 移动端滚轮）、向导、SDK 嵌入、编辑器骨架。
还不能跑：table/crud 语义仍在补，combo 独立数据域、诊断、渲染器 API 余项未完成；alpha，不建议直接上生产。

Demo：https://maxid.github.io/vamis/
对照：https://maxid.github.io/vamis/sdk/compare.html
源码：https://github.com/maxid/vamis

利益相关：作者。求拍砖，尤其是真实 Amis schema 跑不通的 case。非百度官方项目。
```

**注意**：V2EX 对纯推广敏感；正文必须有技术细节和限制说明，回复里别只贴链接。

## 4. 公众号 / 周刊投稿

### 通用投稿邮件

主题：

```
投稿｜Vue 3 原生重写 Amis 低代码运行时（附可运行 Demo 与源码）
```

正文：

```
编辑老师好：

我是 Vamis 的作者。Vamis 用 Vue 3 原样渲染 Amis 的 JSON/YAML schema，
解决的是"Vue 团队想用 amis，但不想在页面里套 React"这个问题。

目前：184/189 个 Amis type 已注册，组件语义平均 59%，880 个单测，
与 Amis 并排对照 1142 条用例（P0 差异归零），表单/CRUD/移动端已可用。

文章约 4000 字，含架构、对照方法和诚实的限制清单，配 3 张截图。
Demo：https://maxid.github.io/vamis/
源码：https://github.com/maxid/vamis
对照：https://maxid.github.io/vamis/sdk/compare.html

如果适合贵号，我可以按你们的排版/授权要求调整；也接受删减。
非百度官方项目，Apache-2.0。

作者名 / 联系方式
```

### 目标与投递方式

| 渠道 | 适合内容 | 方式 | 备注 |
|------|----------|------|------|
| HelloGitHub 月刊 | 项目自荐 | GitHub issue（按当月招募格式） | 月初/月中招募，提前看当期 issue |
| 奇舞周刊 | 文章收录 | 邮件 / GitHub issue 自荐链接 | 周更，收录制，不全文转载 |
| 前端早读课 | 工程实践长文 | 公众号后台 / 邮件投稿 | 偏业务与工程，标题要具体 |
| GitHubDaily | 开源项目推荐 | 微博 / 公众号投稿 | 一句话 + 截图 + 链接 |
| 阮一峰周刊 | 项目自荐 | GitHub issue / 邮件 | 选品严格，写清楚"为什么值得看" |
| 若川视野 | 源码/工程长文 | 公众号投稿 | 适合架构与对照方法那一段 |

### HelloGitHub 自荐模板

```
项目名称：Vamis
项目地址：https://github.com/maxid/vamis
一句话介绍：用 Vue 3 原生渲染 Amis schema 的 JSON/YAML 低代码运行时。
项目截图：<editor 截图/链接>
为什么值得推荐：
- Amis 只有 React 运行时，Vamis 让同一份 schema 在 Vue 3 里原生跑
- 184/189 个 type 已注册；YAML/JSON 双作者态；可嵌入任意 HTML
- 每个组件文档页公开实现进度，alpha 阶段不吹完成度
运行方式：pnpm install && pnpm dev（或在线 Demo）
开源协议：Apache-2.0（非百度官方项目）
```

### 阮一峰周刊自荐模板

```
阮老师好，自荐一个开源项目：Vamis（https://github.com/maxid/vamis）。

一句话：用 Vue 3 原生重写 Amis 的 JSON/YAML 低代码运行时，同一份 schema
不再需要 React。

为什么值得看：Amis 是很有影响力的 schema 低代码框架，但只有 React 运行时；
Vamis 把渲染器、数据域、动作都用 Vue 3 重写，同时用 1142 条 Playwright 用例
和 Amis 并排对照，文档里公开每个组件的真实进度。现在 alpha，184/189 个 type
已注册，组件语义平均 59%。

在线 Demo：https://maxid.github.io/vamis/
非百度官方项目，Apache-2.0。
```

## 5. 国际渠道

### Hacker News（Show HN）

标题（≤80 字符）：

```
Show HN: Vamis – Amis-compatible low-code runtime for Vue 3
```

URL 用 Demo，不要用仓库（HN 更喜欢能直接玩的东西）。

作者首条评论（发完立刻自己回一条，说明背景和限制）：

```
Author here. Amis is Baidu's JSON low-code framework for schema-driven admin
pages. It's React-only; you can embed its JS SDK in a Vue app, but you still
ship React. I wanted the same schemas to run natively in Vue 3, so I
reimplemented the runtime: 184/189 Amis types registered, shadcn-vue UI,
YAML or JSON authoring, both a Vue component and an embeddable SDK.

Status is alpha: ~59% average semantic parity across the 155 sidebar
components, with per-page progress shown in the docs. There are 1,142
Playwright comparison cases that render the same schema in Amis and Vamis
side by side; P0 diffs are zero, 30 non-P0 diffs remain.

Demo / compare / repo links are in the post. Feedback welcome — especially
real-world Amis schemas that break.
```

时间：北京时间周二/周三 21:00–23:00（美西上午）。发完 2 小时内守着评论区。

### Reddit r/vuejs

标题：

```
I reimplemented Baidu Amis's JSON/YAML low-code runtime natively in Vue 3 — 184/189 types, same schemas
```

正文：

```
Context: Amis is a popular JSON low-code framework in China (schema-driven
admin pages). It's React-only. The JS SDK works inside Vue, but you're still
running React under the hood.

I reimplemented the runtime in Vue 3 instead:
- 184/189 Amis component types registered; same schema semantics
- YAML or JSON authoring; optional LCDP IR envelope
- shadcn-vue + Tailwind UI (no cxd prefix)
- Vue component (`VamisRoot`) and embeddable SDK (`vamis.embed`)
- 880 unit tests; 1,142 Playwright cases comparing Amis and Vamis on the same schema

Status: alpha. Average semantic parity is ~59%, with per-component progress in
the docs. Forms, CRUD, tables, mobile date picker, wizard and SDK embedding are
usable; table/crud semantics are still being filled in. Not production-ready.

Demo: ...
Compare: ...
Repo: ...

Disclosure: I'm the author. Happy to answer questions, and I'd love feedback
from anyone who has real Amis schemas.
```

### dev.to

标题：

```
Running Amis schemas natively in Vue 3: why I rewrote the runtime instead of embedding React
```

大纲：

1. What Amis is and why Vue teams hit the React wall
2. Three options: iframe, React shell, native rewrite（附对比表）
3. The runtime: schema → IR → widget tree → renderer registry → Pinia hub
4. Proving parity: 1,142 side-by-side Playwright cases
5. What works and what doesn't (honest list)
6. Try it / links

### X / Twitter

英文 thread（6 条，配 `assets/readme/editor.png` 和 `assets/readme/compare-amis.png`）：

1. `Amis (Baidu's JSON low-code framework) is React-only. I reimplemented its runtime natively in Vue 3. Same schemas, no React under the hood. Open-sourced an alpha today. 🧵`
2. `Why not just embed the Amis JS SDK in Vue? You can — but you still ship React, and theme/component/debug/upgrade paths stay React-shaped. I wanted the renderer itself to be Vue.`
3. `What's in the alpha: 184/189 Amis types registered, YAML or JSON authoring, shadcn-vue UI, VamisRoot + vamis.embed. Forms, CRUD, mobile date picker, wizard work.`
4. `How I know it's close: 1,142 Playwright cases render the same schema in Amis and Vamis side by side, comparing node values/names/actions. 880 unit tests. P0 diffs zero.`
5. `Status is alpha: ~59% average semantic parity, per-component progress public in the docs. Not production-ready. The point is to get real schemas in and fix the gaps.`
6. `Demo / compare / repo: <links>. Feedback welcome — especially Amis schemas that break. Disclosure: I'm the author.`

中文短版（即刻/微博，4 条）：

1. `Amis 是 React 低代码运行时。我用 Vue 3 把它重写了一遍，同一份 JSON/YAML schema，不再套 React。开源 alpha：184/189 个 type 已注册。`
2. `不是封装 SDK，也不是 iframe：渲染器、数据域、动作都在 Vue 里；UI 用 shadcn-vue 重新实现，不搬 cxd 前缀。`
3. `怎么证明像 Amis：1142 条 Playwright 对照用例，同一份 schema 左右跑，按 schema 树结点比值/name/动作；880 个单测。P0 差异归零。`
4. `现在平均语义 59%，每个文档页公开进度，alpha 不上生产。Demo/源码见评论。非百度官方项目，求拍砖。`

### awesome-vue

一条 PR 只加一行，放在 **Frameworks → Other**（`Vue-Low-Code` 附近），格式跟相邻条目一致：

```markdown
- [Vamis](https://github.com/maxid/vamis) - An Amis-compatible JSON/YAML low-code runtime, natively implemented for Vue 3. [Online Demo](https://maxid.github.io/vamis/)
```

PR 描述里写清楚：定位（不是 fork、不是封装）、Demo、许可证、非官方。先读仓库当前 README 的排版，别改别人的行。

### Made with Vue.js

提交入口：<https://madewithvuejs.com/>（Projects → Submit）。用和 Reddit 相同的简介，配编辑器截图。

## 6. UTM 规划

所有对外链接统一带：

```
https://<demo>/?utm_source=<source>&utm_medium=<medium>&utm_campaign=launch-202611
```

| 渠道 | utm_source | utm_medium |
|------|------------|------------|
| 掘金 | `juejin` | `article` |
| 知乎 | `zhihu` | `answer` |
| V2EX | `v2ex` | `post` |
| 公众号 | `wechat` | `newsletter` |
| HelloGitHub | `hellogithub` | `newsletter` |
| 阮一峰周刊 | `ruanyifeng` | `newsletter` |
| HN | `hn` | `social` |
| Reddit | `reddit` | `social` |
| dev.to | `devto` | `article` |
| X | `x` | `social` |
| awesome-vue | `awesome-vue` | `backlink` |

对照页 / 文档页也带同一组参数；GitHub 仓库链接不用带（GitHub 不接受 UTM，但可以用 `?utm_source` 无效，改用 README 内的来源链接）。

## 7. 首发排期（不含视频站）

| 时间 | 动作 |
|------|------|
| D-7 | 清 P0 阻塞项；找 3 个非熟人做 10 分钟上手；确认 Demo 手机 4G 可用 |
| D-3 | 发 npm alpha（如果就绪）；打 GitHub Release；README/About/社交预览全部更新并自测 |
| D0（周二/周三） | 掘金长文 + 知乎回答 + V2EX + X/即刻；朋友圈/群只发一次，不刷屏 |
| D+1 | 公众号与 HelloGitHub 投稿；回复 D0 的所有评论；记录问题 |
| D+2（北京 21:00–23:00） | HN Show HN + Reddit r/vuejs + dev.to；守评论区 2 小时 |
| D+3 | awesome-vue PR + Made with Vue.js 提交 |
| D+7 | 复盘：来源、star、npm 下载、issue 质量；发第二篇（把评论区问题写成文章） |
| D+14 | 组件进度周报；整理 good first issue |

## 8. 评论回复话术

**「又一个 Amis 换皮 / 复刻？」**

> 不是换皮，也不是 fork：Amis 是 React 运行时，Vamis 的渲染器、数据域、动作是 Vue 3 重写的，只兼容 schema 语义。代码里没有 Amis 源码（公式引擎是从 MIT 的 amis-formula 移植，NOTICE 里有署名）。

**「为什么不用 amis 的 JS SDK 直接嵌 Vue？」**

> 可以，而且最省事。代价是页面里始终有 React，主题、Vue 组件复用、调试链路、升级和包体积都要绕。Vamis 给的是另一种选择：schema 不变，渲染层是 Vue。两个方案不冲突。

**「59% 也敢发？」**

> 所以叫 alpha，而且每个文档页都标了真实进度。表单、CRUD、表格、移动端日期这些主路径能跑；table/crud 语义还在补。发出来就是为了拿真实 schema 修差距，不是宣称完成。

**「和百度什么关系？叫 Vamis 是不是蹭？」**

> 非官方，与百度无关联。名字是 Vamis（Vue + Amis），README 和 About 都写了 unofficial；只做 schema 兼容，不复制 Amis 源码、logo 和文档原文，遵循 Apache-2.0 并保留 NOTICE。

**「能商用吗？」**

> 许可证是 Apache-2.0，商用允许；但当前是 alpha，组件语义未完成，关键生产建议等 1.0 或自己充分验证。文档里的进度表就是给你评估用的。

**「Amis 上游更新了怎么办？」**

> 目前对齐 6.13.0；上游近几个月没有新提交。跟进策略是先在对照用例里加 case，再按组件依赖顺序补，不整仓复制。上游真有大版本，会先评估差异再排期。

**「为什么不用 form-create / lowcode-engine？」**

> 它们解决的是"Vue 里的表单/低代码搭建"，Vamis 解决的是"Amis schema 兼容"。如果你没有 Amis 存量 schema，form-create 可能更合适；有存量 schema 才是 Vamis 的场景。

## 9. 发布红线

- 不买 star、不刷榜、不群发。
- 不在 Amis 官方 issue 下贴链接；只在别人问 Vue 集成时回答，并注明非官方。
- 不说"100% 兼容"、"生产可用"、"替代 Amis"、"Amis 不行了"。
- 不用 Amis 的 logo / 文档原文截图做物料。
- 不伪装成第三方推荐；所有渠道披露作者身份。
