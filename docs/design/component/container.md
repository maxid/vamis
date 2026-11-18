# Container 容器 · `container` 设计

> 状态：**已完成 100%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/container) · Amis：`/zh-CN/components/container`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Container 是**布局/包装容器**：body 子 schema、wrapperComponent 白名单、wrapperBody、bodyClassName、可选作者 style。协议简单但边界清楚：div 默认 `display: contents` 扁平化，非 div 才成为真实语义容器。

## 1. 边界与优先级（先读）

1. **wrapperComponent**：仅白名单（div/section/article/main/header/footer/aside/nav/pre/span）；非法回落 div。
2. **扁平化**：tag=div 时 `display: contents`，不产生额外盒子；非 div 才 `w-full min-w-0`。
3. **wrapperBody**：默认包 `.vamis-container-body`；false 直接渲染 body。
4. **bodyClassName**：只落内层 body 容器，不污染根。
5. **事件/动作**：组件自身不注册事件；外层 SchemaRenderer/宿主负责。不要声称 click 事件一定由 Container 派发。
6. **包边界**：无 `<style>`、无 fetch；布局/间距 token。

### 边界用例

- 空 body/单/多节点；wrapperBody true/false
- wrapperComponent 白名单/非法/大写；style 覆盖
- bodyClassName/父级宽度/嵌套容器
- 窄屏/深色

### 优先级

1. 白名单/扁平化；2. wrapperBody/class；3. 嵌套/响应式；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 275 行；Vamis 54 行）；依赖 container 语义。
- 风险：div contents 的盒模型/嵌套。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `body` | 子 schema | 已接 |
| `wrapperComponent` | 语义标签 | 白名单 |
| `wrapperBody` | 内层包装 | 已接 |
| `bodyClassName` | 内层类 | 已接 |
| `style` | 作者样式 | 透传 |

## 4. 架构

- [`Container.vue`](../../../packages/vamis/src/renderers/Container.vue)：tag/body/wrapperBody/class。
- [`SchemaRenderer`](../../../packages/vamis-core/src/SchemaRenderer.vue)：body 递归。

### 数据流

```text
schema.body → 可选 .vamis-container-body → SchemaRenderer
tag=div → display:contents；其它 → 真实标签
```

## 5. 样式

- 根 div 扁平；非 div w-full；bodyClassName 只内层；无 `<style>`。
- 嵌套/窄屏/深色单独核。

## 6. 缺口

无功能缺口；深色/嵌套盒模型可继续核。

## 7. 验收

- 白名单/非法标签/wrapperBody/bodyClassName/空 body/嵌套；不误标页面级事件。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

保持薄；不要给 Container 加页面级布局逻辑（交给 Page/Grid/Flex）。

---

返回 [组件设计索引](README.md)
