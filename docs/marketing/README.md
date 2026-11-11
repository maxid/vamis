# Vamis 发布材料包

状态：**初稿就绪**（2026-11-10）。渠道执行、账号与投放节奏由项目作者负责；按约定**不含视频站内容**（B 站 / YouTube 暂不做）。

这个目录是"发布前准备"的材料，不是运行时文档。公开仓库提交前可以整目录移除，或只保留对外的 README / 英文 README；下面的文案里已经标注了哪些链接需要替换。

## 推荐使用顺序

1. 先过一遍 [发布检查清单](00-launch-checklist.md)，把「阻塞项」清掉。
2. 用 [GitHub 资料](01-github-profile.md) 改仓库 About / topics / 社交预览。
3. 按 [README 与素材](04-readme-and-assets.md) 确认首屏图片和链接；根目录 [README.md](../../README.md)、[README.en.md](../../README.en.md) 已按这个方案改好。
4. 渠道文案直接用 [首发文案](02-launch-copy.md)（掘金 / 知乎 / V2EX / 公众号 / HN / Reddit / X / awesome-list）。
5. 长文正文用 [首发长文](03-launch-article.md)，按渠道改标题和开头即可。
6. npm 发布前读 [npm 发布清单](05-npm-release.md)；当前包还缺构建产物和元数据，属于阻塞项。

## 文件

| 文件 | 用途 |
|------|------|
| [00-launch-checklist.md](00-launch-checklist.md) | 发布前阻塞项、验收标准、自测清单 |
| [01-github-profile.md](01-github-profile.md) | GitHub About / topics / 社交预览 / Discussions / Release |
| [02-launch-copy.md](02-launch-copy.md) | 各渠道现成文案、排期、UTM、评论回复话术 |
| [03-launch-article.md](03-launch-article.md) | 首发长文初稿（可直接发，约 4k 字） |
| [04-readme-and-assets.md](04-readme-and-assets.md) | README 首屏方案、图片规格、GIF 分镜、OG 卡 |
| [05-npm-release.md](05-npm-release.md) | npm alpha 发布步骤与当前缺口 |

## 统一口径（所有渠道都别跑偏）

- **184 / 189 是 type 名称覆盖，不是语义完成**。对外同时说"组件语义平均 59%"，否则首发就会被真实用户打脸。
- **非百度官方项目**，与百度无关联；Apache-2.0；不复制 Amis 源码、logo、文档原文。见 [NOTICE](../../NOTICE)。
- **不承诺 100% 兼容，也不建议直接上关键生产**。alpha 就是 alpha。
- **不贬低 Amis**。讲故事用"Vue 团队需要原生实现"，不用"Amis 不行"。
- 所有渠道第一句或简介里注明"我是作者 / 利益相关"，尤其是 HN、Reddit、V2EX。

## 链接替换清单

发布前全局搜索并替换：

| 占位 / 当前值 | 替换为 | 出现位置 |
|---------------|--------|----------|
| `https://maxid.github.io/vamis/` | 自定义域名（如 `https://vamis.dev/`），GitHub Pages 作为备份 | README、文案、文章 |
| `{{NPM}}` | `vamis`（npm 发布后） | README、文案 |
| `{{DISCUSSIONS}}` | 仓库 Discussions 地址 | 文案 |
| `{{COMPARE_URL}}` | `<demo>/sdk/compare.html` | 文案、文章 |

当前已知信息：

- 仓库：<https://github.com/maxid/vamis>
- 演示站（待换域名）：<https://maxid.github.io/vamis/>
- 对照页：<https://maxid.github.io/vamis/sdk/compare.html>
- 进度真源：[CONTEXT.md](../../CONTEXT.md)
- 组件 TODO：[2026-10-20-vamis-component-todo.md](../superpowers/specs/2026-10-20-vamis-component-todo.md)
