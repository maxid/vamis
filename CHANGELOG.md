# Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)；版本遵循 SemVer，但 alpha 阶段 API 与语义仍会变。

## [Unreleased]

### Added

- 中英双 README 首屏（定位、状态、截图、快速开始、与 Amis 的关系）
- `assets/readme/` 演示截图；`docs/marketing/` 首发材料包（检查清单、GitHub 资料、渠道文案、长文、npm 清单）
- `CONTRIBUTING.md`、`SECURITY.md`、`ROADMAP.md`、issue / PR 模板
- 社交预览图 `docs/marketing/assets/og-card.png`

### Changed

- README 从按任务追加的进度日志改为对外 landing page；进度细节继续以 `CONTEXT.md` 为准
- 对外统一口径：184 / 189 type 名称覆盖；组件语义平均 59%；alpha、非百度官方项目

## [0.1.0-alpha.1] — 待发布

### Added

- Vue 3 运行时：`VamisRoot`、`registerRenderer`、IR / SchemaRenderer / Pinia hub / env
- JS SDK：`vamis.embed`、`updateSchema`、`updateProps`、`doAction`、`getComponentByName`
- YAML / JSON 双作者态，LCDP IR（`lcdp.ir/v1`）信封
- 184 / 189 Amis type 注册；Playwright 对照用例 1142 条
- Playground：文档 / 组件 / 样式 / 示例 / 编辑器 / Amis 对照
- 单测：formula 185 + core 620 + sdk 75

### Known limitations

- 组件语义平均 59%，`table` / `crud` / `diff-editor` 等仍在补
- combo 独立数据域、D7 渲染器 API 余项、D8 诊断未完成
- npm 构建与发布流程仍在准备
