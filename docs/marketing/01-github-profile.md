# GitHub 资料与发布设置

目标：一个从没听过 Vamis 的人，在 GitHub 搜索 / 仓库首页 / 社交预览三处都能在 10 秒内知道「这是什么、能不能用、怎么试」。

## 1. About（仓库右上角）

GitHub 的 description 上限 350 字符，中英可混排。推荐英文为主 + 中文补充，兼顾国际搜索和中文用户：

```
Amis-compatible JSON/YAML low-code runtime for Vue 3. 184/189 Amis types, shadcn-vue UI, embeddable vamis.embed SDK. Unofficial; not affiliated with Baidu. 用 Vue 3 原生渲染 Amis schema 的低代码运行时。
```

短版（如果觉得太长）：

```
Vue 3 原生的 Amis 兼容低代码运行时：同一份 JSON/YAML schema，184/189 types，shadcn-vue，可嵌入 SDK。非百度官方项目。
```

**不要写**：

- "百度 Amis 官方 Vue 版"（会被当成官方，也有商标风险）。
- "完全兼容 / 100% 兼容 / 生产可用"（和实际进度冲突）。
- "最强的低代码框架"（HN / V2EX 会反感）。

## 2. Homepage

填演示站的自定义域名，不要填 GitHub 仓库或 `github.io`：

```
https://<你的域名>/
```

如果暂时没有自定义域名，先填当前 Pages 地址，但在首发前换掉（见 [检查清单](00-launch-checklist.md) P0-4）。

## 3. Topics（最多 20 个）

复制这些，按 GitHub 的格式小写、连字符：

```
vue
vue3
typescript
lowcode
low-code
amis
yaml
json-schema
schema-driven
form-builder
admin
crud
shadcn-vue
tailwindcss
vite
lcdp
renderer
json
```

说明：`amis`、`vue3`、`lowcode`、`yaml`、`form-builder`、`admin` 是搜索入口；`shadcn-vue`、`lcdp` 是差异化标签。GitHub topics 页面本身也会带来少量长尾流量。

## 4. 社交预览图（Social preview）

- 尺寸：**1280 × 640**，PNG / JPG，尽量 < 1 MB。
- 现成文件：`docs/marketing/assets/og-card.png`（已生成，可直接上传）。
- 内容：左边 `Vamis` + 「Amis 的 Schema，原生跑在 Vue 3 上」+ 三行小字（184/189 types · YAML/JSON · 非官方）；右边编辑器截图（`assets/readme/editor.png`）裁切。
- 位置：仓库 **Settings → Social preview → Upload an image**。
- 这张图会出现在 X / 掘金 / 公众号 / Slack 等所有分享卡片里，值得花 20 分钟做。

## 5. README 首屏

已按方案改好：[README.md](../../README.md)、[README.en.md](../../README.en.md)。方案和素材规格见 [04-readme-and-assets.md](04-readme-and-assets.md)。

首屏必须保留的四件事：

1. 一句话定位（Amis 的 Schema，原生跑在 Vue 3 上）。
2. 一张真实产品截图（编辑器 / CRUD / 对照页三选一，不要放 logo 墙）。
3. 状态说明：alpha、184/189 type、语义 59%、非官方。
4. 三个入口：Demo、文档、对照页。

徽章建议（npm 发布前不要放 npm 徽章，会显示 package not found）：

```markdown
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-alpha-orange.svg)](CONTEXT.md)
[![Amis types](https://img.shields.io/badge/Amis%20types-184%2F189-brightgreen.svg)](docs/superpowers/specs/2026-10-20-amis-sync-status.md)
[![Tests](https://img.shields.io/badge/tests-880%20passing-brightgreen.svg)](package.json)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
```

npm 发布后追加：

```markdown
[![npm](https://img.shields.io/npm/v/vamis.svg)](https://www.npmjs.com/package/vamis)
[![npm downloads](https://img.shields.io/npm/dm/vamis.svg)](https://www.npmjs.com/package/vamis)
```

## 6. Discussions / Issues

- **Settings → Features → Discussions** 打开。
- 建三个分类：`Q&A`（用 Vamis 遇到的问题）、`Ideas`（组件/能力建议）、`Show and tell`（用 Vamis 做了什么）。
- Issues 模板见 [社区文件清单](00-launch-checklist.md#社区文件清单建议直接建)。
- 置顶一个 issue：**"Want to help? Start here"**，列出 good first issue 和对照方法。首发后这是贡献者的第一入口。

## 7. 第一个 Release：`v0.1.0-alpha.1`

标题：

```
v0.1.0-alpha.1 — 第一次公开 alpha
```

正文模板：

```markdown
> ⚠️ Alpha. API 与组件语义仍会变；不建议直接用于关键生产。非百度官方项目。

## 这次有什么

- 184 / 189 个 Amis type 名称已注册，组件语义平均 59%
- Vue `VamisRoot` + 任意 HTML `vamis.embed` 两条入口
- YAML / JSON 双作者态，信封对齐 LCDP IR（`apiVersion: lcdp.ir/v1`）
- 880 个单测通过；Playwright 对照用例 1142 条，P0 差异归零
- 在线 Demo / 组件文档 / Amis 并排对照页

## 现在能跑

表单、CRUD、表格、日期（含 375 移动端滚轮）、向导、SDK 嵌入、可视化编辑器骨架。

## 已知限制

- `table` / `crud` / `diff-editor` 等语义仍在补，详见 CONTEXT.md
- combo 独立数据域、D8 诊断、D7 渲染器 API 余项未完成
- npm 包（如果这次还没发）：本 release 仅提供源码运行

## 链接

- Demo: <...>
- 文档: <...>
- 与 Amis 并排对照: <...>
- 进度真源: CONTEXT.md
```

## 8. 搜索与长尾关键词

首发文章和文档标题里自然覆盖这些词（不要堆砌）：

- `amis vue`、`vue amis`、`amis vue3`、`amis 支持 vue 吗`
- `vue 低代码`、`vue3 低代码框架`、`json 低代码`
- `yaml 页面`、`schema 驱动页面`、`json schema 表单`
- `shadcn-vue 低代码`、`lcdp ir`

验证方式：GitHub 搜索 `amis vue`、`vue lowcode`、`vamis`，看仓库是否出现在前几页；掘金文章发布 1 周后看搜索来源占比。

## 9. 账号与主页

- 仓库 Pin：把 `vamis` 置顶到个人主页（Profile → Customize your pins）。
- 个人主页 README 加一行："Working on Vamis — Amis-compatible low-code runtime for Vue 3."
- X / 掘金 / 知乎的简介用同一句话，方便别人跨平台确认是同一个人。
