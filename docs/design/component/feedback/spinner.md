# Spinner 加载中 · `spinner` 设计

> 状态：**已完成 100%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/spinner) · Amis：`/zh-CN/components/spinner`
> 完成规格：[Spinner 完成设计](../../../superpowers/specs/component/feedback/2026-11-20-vamis-spinner-completion-design.md)
> 盘点日期：2026-11-21。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Spinner 是**加载遮罩/容器**：show/showOn、size、icon、tip/tipPlacement、delay、overlay、body、loadingConfig.root、父子 loading 互斥。主路径完整；Page / Service / CRUD / Dialog / Form / Select / InputText / InputTree / TreeSelect 已回归。默认中心对称菱形是 Vamis 有意保留的产品化视觉，不跟 Amis 六边形重合。

## 1. 边界与优先级（先读）

1. **show/showOn**：表达式/布尔；false 不触发；delay 内不显示。
2. **overlay**：源码默认 false；true 覆盖父级；父子 loading 互斥由 spinnerCheckLoading/spinnerPushParent 维护。
3. **body/容器**：body 存在即容器；无 body 只遮罩；loadingConfig.root 可 Teleport 到根。
4. **图标/tip**：default 菱形/fa/URL；tipPlacement top/right/bottom/left。
5. **卸载**：timer 清理、parent push/remove 成对；不能残留全局 loading。
6. **包边界**：无 `<style>`、无 fetch；spinner token。

### 边界用例

- show true/false/showOn/delay 0/正数
- overlay true/false/body/root
- default/fa/URL 图标、tip 位置
- 父子同时 loading/卸载/快速切换
- Dialog / Form / Select / InputText / InputTree / TreeSelect 宿主（footer 有 Form 时 body overlay + Dialog-info 双层已核）
- 窄屏/深色

### 优先级

1. show/delay/overlay；2. 父子互斥/卸载；3. 图标/tip；4. 宿主/深色。

## 2. 复杂度

- 等级：**M 中**（Amis 96 行；Vamis 约 300 行）；依赖 spinner store。
- 风险：父子 loading/全局宿主。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| show/showOn | 显示 | 已接 |
| size/icon/tip/tipPlacement | 外观 | 已接 |
| delay/overlay/body | 行为 | 已接 |
| loadingConfig.root | 宿主 | 已接 |
| 父子互斥 | 状态 | 已接 |
| Dialog / Form / Select / Tree 细项 | 宿主 | 已接；footer AJAX / confirm 委派 Form 时 body overlay + Dialog-info，Form body Action 只占 Form；Select trigger 与显式 overlay 分离，树懒加载透传 `loadingConfig` |

## 4. 架构

- [`Spinner.vue`](../../../../packages/vamis/src/renderers/Spinner.vue)：show/delay/overlay/parent/icon。
- [`Form.vue`](../../../../packages/vamis/src/renderers/Form.vue)：Form 自己按 `saving/fetching` 渲染一枚 body overlay，不跟随 Action 数量。
- [`spinner-store.ts`](../../../../packages/vamis-core/src/spinner-store.ts)：push/remove/check/订阅。
- [`spinner.ts`](../../../../packages/vamis-core/src/utils/spinner.ts)：show/body/icon/tip。

## 5. 样式

- 菱形/遮罩/tip token；无 `<style>`；深色与 375px 已核。

## 6. 缺口

无。默认菱形为有意产品化差异，不属于实现缺口。SDK 对照报告里的 page-body `14/16px` 字体差是全局正文基线；实测 `.vamis-spinner` 自身为 `16px / 24px`，与 Amis 一致。

## 7. 验收

- show/delay/overlay/父子互斥/root/卸载/图标；宿主缺口不误标。

### 验收清单（12 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [x] schema 属性 / 默认值逐项核对
- [x] 事件 / 动作逐项核对
- [x] 边界用例逐项核对
- [x] 组件页活示例运行、无 console error
- [x] `pnpm test`（组件相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page spinner` 桌面
- [x] `pnpm compare --page spinner --mobile`
- [x] 深色 / 375px 窄屏核对

## 8. 后续

后续仅维护宿主接入契约；新增 loading 宿主时必须继续复用 `Spinner.vue` 并保持 push/remove 成对。

---

返回 [组件设计索引](../README.md)
