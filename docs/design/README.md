# Vamis 设计文档

> 2026-11-18。设计文档按“运行时组件”和“站点文档域”分开：组件设计按功能分目录；站点域设计按 website/src 的章节分目录。

## 目录

> 站点文档域按 `website/src` 逐页建立设计文档，设计内容在 `docs/design/` 内；站点只作为内容真源。

| 域 | 覆盖 | 设计文档 |
|---|---|---|
| 组件 | 155 个组件（另 CollapseGroup 配套篇） | [component/README.md](component/README.md)（layout / functional / form / display / feedback / other） |
| 站点文档 | website/src 84 页逐页设计 | concepts 9 / style 63 / extend 4 / start 4 / types 4 |
| 概念 | schema / 数据域 / 模板 / 映射 / 表达式 / 联动 / 事件动作 / 行为 / 样式 | [concepts/README.md](concepts/README.md) |
| 样式 | CSS 变量、响应式、状态、Layout / Flex / Grid / Box Alignment / Spacing / Sizing / Typography / Background / Border / Effect | [style/README.md](style/README.md) |
| 扩展 | 自定义组件 / 编辑器 / 国际化 / 调试 | [extend/README.md](extend/README.md) |
| 开始 | 介绍 / 快速开始 / JS SDK / FAQ | [start/README.md](start/README.md) |
| 类型 | API / ClassName / Definitions / SchemaNode | [types/README.md](types/README.md) |

> **Amis 核对状态**：84 篇站点设计尚未逐篇核对 Amis 6.13.0；已完成的目录/抽样核对与未核对项见 [AMIS-AUDIT.md](AMIS-AUDIT.md)。

## 统一标准

- 先写边界与优先级，再写信息架构、契约、实现与缺口。
- 文档必须能追溯到 `website/src/**/*.md`、`website/nav.mjs` 与相关运行时源码。
- 未实现的能力标为缺口；不把文档进度当成功能验收。
- `docs/design/component/<分类>/` 是组件长期设计和当前状态真源；组件剩余工作的增量执行规格放到 `docs/superpowers/specs/component/<分类>/`，不在这里再建第二份进度或契约真源。
