# Portlet 门户栏目 · `portlet` 设计

> 状态：**进行中 65%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/portlet) · Amis：`/zh-CN/components/portlet`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Portlet 当前是**带 tabs 的栏目容器**（180 行）：tabs/source、active、mountOnEnter/unmountOnExit、toolbar、description、hideHeader/divider、change 可阻止。没有 themeCss/scrollable/icon 像素；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **tabs**：tabsFromSource/visible；key 用 tabKey；disabled 不切。
2. **active**：activeKey/初始 active；切换先 change 事件，prevented 不写。
3. **懒挂载**：mountOnEnter 默认 false；unmountOnExit 决定离开卸载；visited 控制。
4. **toolbar**：全局+tab 级；description/hideHeader/divider。
5. **包边界**：无 `<style>`、无 fetch；portlet token。

### 边界用例

- 空/单/多 tab/disabled/activeKey
- mountOnEnter/unmountOnExit、change 阻止
- toolbar 全局/tab、description、hideHeader/divider
- 窄屏/深色/scrollable（未接）

### 优先级

1. tabs/active；2. 懒挂载/事件；3. toolbar/description；4. 样式/scrollable。

## 2. 复杂度

- 等级：**L 重**（Amis 424 行；Vamis 180 行）；依赖 tabs/action/container。
- 风险：tabs 状态/懒挂载。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| tabs/source | 栏目 | 已接 |
| activeKey/change | 切换 | 已接，可阻止 |
| mountOnEnter/unmountOnExit | 懒挂载 | 已接 |
| toolbar/description | 工具栏/描述 | 已接 |
| hideHeader/divider | 外观 | 已接 |
| themeCss/scrollable | 目标 | 未接 |

## 4. 架构

- [`layout/Portlet.vue`](../../../../packages/vamis/src/renderers/layout/Portlet.vue)：tabs/active/visited/toolbar。
- [`portlet.ts`](../../../../packages/vamis-core/src/utils/portlet.ts)：tabs/toolbar/description。
- [`SchemaRenderer`](../../../../packages/vamis-core/src/SchemaRenderer.vue)：tab body。

## 5. 样式

- portlet head/link/toolbar/body token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss/scrollable/icon 像素/深色。

## 7. 验收

- tabs/active/change 阻止/懒挂载/toolbar/窄屏；未接不误标。

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

补 scrollable/themeCss/深色；保持 tabs 状态不复制。

---

返回 [组件设计索引](../README.md)
