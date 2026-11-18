# 快速开始设计

> 状态：**已完成 95%** · 对应站点：`/start/getting-started` · 源码：[website/src/start/getting-started.md](../../../website/src/start/getting-started.md)

## 0. 设计结论

快速开始是**首次成功路径**：安装 → 引样式 → 渲染最小 `page` schema → 预期结果。设计目标是让 Vue 作者一次跑通，同时说明 YAML/JSON/IR 与样式前置。

## 1. 边界与优先级

1. **最短路径**：一屏内完成；不先讲架构。
2. **双入口**：Vue 为主，JS SDK 链到 sdk 页。
3. **样式必需**：`@vamis/ui/styles.css` 不能省略。
4. **作者态**：JSON 主例，YAML 对照；IR 只给信封。
5. **失败态**：缺样式、未注册 type、接口 404 排查。
6. **版本**：不承诺未发布 npm/CDN。

## 2. 内容契约

- 完整 `main.ts` + 组件 + schema，不省略导入。
- 输出截图/预期文本；样式缺失时说明会“裸奔”。
- 给 `pnpm install` / `pnpm dev` 与包引用两种方式。
- 与 sdk/FAQ 互链。

## 3. 实现

- [VamisRoot](../../../packages/vamis/src/index.ts)：Vue 入口。
- [Playground](../../../README.md)：`pnpm dev`。
- [SDK](../../../packages/vamis-sdk/src)：另一入口。

## 4. 缺口

- 环境前提（Node/pnpm/浏览器）未集中。
- npm 发布状态未写清。

## 5. 验收清单（文档核对：3 / 12）

- [x] Vue 路径/样式前置已盘点
- [x] VamisRoot/Playground 已定位
- [ ] 从零按文档跑通
- [ ] YAML/JSON/IR 示例核对
- [ ] 缺样式/未注册/404 排查
- [ ] 与 sdk/FAQ 互链
- [ ] 版本承诺与现状一致
