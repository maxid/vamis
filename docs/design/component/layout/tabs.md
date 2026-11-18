# Tabs 选项卡 · `tabs` 设计

> 状态：**进行中 95%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/tabs) · Amis：`/zh-CN/components/tabs`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Tabs 是**选项卡容器**：tabs/source、activeKey/defaultKey、九种 tabsMode、工具栏/图标/提示、表单 name 写值、增删改拖、折叠「更多」、hash 同步、change/delete 事件。主路径成熟；缺口 swipeable/chrome 耳朵 SVG/themeCss/单项 unmountOnExit。

## 1. 边界与优先级（先读）

1. **tabs/source**：tabsFromSource；visible 过滤；activeKey/defaultKey 初始化；空不崩。
2. **切换**：先 change 事件，prevented 不切换；写 name/scope/hash；只渲染 active/visited。
3. **模式**：九种 tabsMode/sidePosition；不要各模式各写状态。
4. **增删改拖**：addable/editable；Sortable 250ms；拖完按对象重绑 active；delete 事件。
5. **折叠/溢出**：按容器溢出显示「更多」；collapseBtnLabel；不要写死宽度。
6. **hash**：address bar #hash 来回同步；不要覆盖其他 hash。
7. **包边界**：无 `<style>`、无 fetch；tabs token。

### 边界用例

- 空/单/多/activeKey/defaultKey/visible
- form name/独立 scope/hash/切换阻止
- 九种 mode/side/icon/tooltip/toolbar
- 增删改拖/折叠/溢出/unmountOnExit
- 窄屏/深色

### 优先级

1. tabs/active/change；2. 模式/工具栏；3. 增删改拖/折叠；4. hash/样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 1182 行；Vamis 780 行）；依赖 container/action/tpl。
- 风险：模式/hash/拖拽/折叠多状态。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| tabs/source/activeKey | 状态 | 已接 |
| tabsMode/side/icon/toolbar | 外观 | 已接 |
| addable/editable/delete | 增删改 | 已接 |
| 拖拽/折叠/hash | 交互 | 已接 |
| swipeable/耳朵 SVG/themeCss | 目标 | 未接 |

## 4. 架构

- [`Tabs.vue`](../../../../packages/vamis/src/renderers/Tabs.vue)：tabs/active/mode/CUD/drag/collapse/hash。
- [`tabs.ts`](../../../../packages/vamis-core/src/utils/tabs.ts)：source/mode/key/visible。
- [`SchemaRenderer`](../../../../packages/vamis-core/src/SchemaRenderer.vue)：tab body。

## 5. 样式

- tab/link/content/折叠 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

swipeable/chrome 耳朵 SVG/themeCss/单项 unmountOnExit/深色。

## 7. 验收

- active/change/mode/增删拖/hash/折叠/窄屏；未接不误标。

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

按缺口单独立项，不与 Tabs 状态重构混刀。

---

返回 [组件设计索引](../README.md)
