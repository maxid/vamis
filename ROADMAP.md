# Roadmap

> 进度真源是 [CONTEXT.md](CONTEXT.md)，组件粒度见 [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)。本页只列阶段目标，不承诺日期；alpha 阶段顺序会随真实反馈调整。

## 现在（v0.1 alpha）

- [x] 184 / 189 个 Amis type 名称注册
- [x] Vue `VamisRoot` + JS SDK `vamis.embed` 双入口
- [x] YAML / JSON 双作者态 + LCDP IR 信封
- [x] Playwright Amis 并排对照 + 组件进度公开
- [x] 880 个单测；文档 / 示例 / 编辑器骨架可跑
- [ ] npm alpha 可安装（见 `docs/marketing/05-npm-release.md`）
- [ ] 自定义域名演示站 + 英文文档入口

## 下一阶段（v0.2）

- [ ] 主路径组件继续按依赖顺序补（`radio`、`table` / `crud` 语义、展示类）
- [ ] kernel D6：combo 独立数据域、路径值余项
- [ ] kernel D7：渲染器 `dispatch` / `reload` API
- [ ] kernel D8：`env.debug`、未知 type 带 schema path、动作日志、渲染错误边界
- [ ] 样式：色盘表、Panel 像素级、`registerTheme`
- [ ] 深色浮层回归（tooltip / 下拉 / PopOver / 日期）

## 之后（v0.5 → v1.0）

- [ ] 侧栏 155 组件语义平均 ≥ 85%，`table` / `crud` / `diff-editor` 达标
- [ ] 英文文档（至少组件索引 + 概念页）
- [ ] npm 稳定版与升级指南
- [ ] 真实项目案例与兼容性白皮书
- [ ] 1.0 前不做 Product Hunt / 大规模发布式推广

## 非目标

- 复制 Amis 源码、`cxd-` 前缀、主题 SCSS
- 兼容 IE；把 React 打进 SDK
- office / PDF 真实预览、TinyMCE
- amis-editor 级插件市场
- MST、`amisRequire` AMD
