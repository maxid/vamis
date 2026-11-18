# Spinner 加载中 · `spinner` 设计

> 状态：**进行中 95%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/spinner) · Amis：`/zh-CN/components/spinner`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Spinner 是**加载遮罩/容器**：show/showOn、size、icon、tip/tipPlacement、delay、overlay、body、loadingConfig.root、父子 loading 互斥。主路径成熟；缺 Dialog/Form/Select 宿主细项。

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
- Dialog/Form/Select 宿主（未核）
- 窄屏/深色

### 优先级

1. show/delay/overlay；2. 父子互斥/卸载；3. 图标/tip；4. 宿主/深色。

## 2. 复杂度

- 等级：**M 中**（Amis 96 行；Vamis 190 行）；依赖 spinner store。
- 风险：父子 loading/全局宿主。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| show/showOn | 显示 | 已接 |
| size/icon/tip/tipPlacement | 外观 | 已接 |
| delay/overlay/body | 行为 | 已接 |
| loadingConfig.root | 宿主 | 已接 |
| 父子互斥 | 状态 | 已接 |
| Dialog/Form 细项 | 宿主 | 未核 |

## 4. 架构

- [`Spinner.vue`](../../../packages/vamis/src/renderers/Spinner.vue)：show/delay/overlay/parent/icon。
- [`spinner-store.ts`](../../../packages/vamis-core/src/spinner-store.ts)：push/remove/check/订阅。
- [`spinner.ts`](../../../packages/vamis-core/src/utils/spinner.ts)：show/body/icon/tip。

## 5. 样式

- 菱形/遮罩/tip token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

Dialog/Form/Select 宿主细项；深色/窄屏逐项。

## 7. 验收

- show/delay/overlay/父子互斥/root/卸载/图标；宿主缺口不误标。

## 8. 后续

宿主细项按需补；保持 push/remove 成对。

---

返回 [组件设计索引](README.md)
