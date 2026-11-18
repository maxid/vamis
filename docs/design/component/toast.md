# Toast 轻提示 · `toast` 设计

> 状态：**进行中 100%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/toast) · Amis：`/zh-CN/components/toast`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Toast 是**全局轻提示**：由 `actionType: toast` 触发，ToastHost 挂在 VamisApp/Teleport body，按 position 分组、mobile 样式、自动关闭/点击关闭、hover 暂停。桌面/移动差异已对齐 Amis；深色手核是余项。

## 1. 边界与优先级（先读）

1. **Host**：claimToastHost 只允许一个 primary；卸载 release；Teleport body，不跟随组件。
2. **位置**：position 分组（top-center/center/...）；mobile 标记切换暗底居中。
3. **生命周期**：自动关闭/点击关闭/hover 暂停；多条叠加；卸载清 timer。
4. **内容**：msg/title/level/icon；HTML 信任边界由调用方。
5. **包边界**：无 `<style>`、无 fetch；toast token。

### 边界用例

- 空/多条/不同 position/mobile
- 自动关闭/点击/hover 暂停/重复触发
- 深色/窄屏/长文本
- 无 Host 降级（如有）

### 优先级

1. Host/生命周期；2. 位置/移动；3. 内容/关闭；4. 深色。

## 2. 复杂度

- 等级：**L 重**（Amis 433 行；Vamis ToastHost+ToastMessage）；依赖 toast-store。
- 风险：全局 Host/多实例/timer。

## 3. 契约

| 能力 | 现状 |
|---|---|
| position 分组 | 已接 |
| mobile 暗底居中 | 已接 |
| 自动/点击关闭/hover 暂停 | 已接 |
| 多条叠加 | 已接 |
| 深色 | 未逐项 |

## 4. 架构

- [`ToastHost.vue`](../../../packages/vamis/src/ToastHost.vue)：Teleport/分组/primary。
- [`toast-store.ts`](../../../packages/vamis-core/src/toast-store.ts)：items/位置/自动关闭。
- [`ToastMessage.vue`](../../../packages/vamis/src/ToastMessage.vue)：单条 UI。
- action `toast` 在 core actions/run.ts。

## 5. 样式

- toast 层/暗底/状态图标 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

深色手核；无 Host 降级需确认。

## 7. 验收

- 多条/位置/mobile/关闭/hover/重复/深色；未接不误标。

## 8. 后续

深色手核；保持单 primary Host。

---

返回 [组件设计索引](README.md)
