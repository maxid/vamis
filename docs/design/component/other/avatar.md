# Avatar 头像 · `avatar` 设计

> 状态：**进行中 90%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/avatar) · Amis：`/zh-CN/components/avatar`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Avatar 当前是**图片/文字/图标头像**（150 行）：src/text/icon、size/fit/gap/radius、draggable/crossOrigin、图片错误回退、文字自适应缩放、badge。主路径较完整；深色/皮肤/无障碍可继续核。

## 1. 边界与优先级（先读）

1. **视图优先级**：src 加载成功 → 图片；否则 text → 文字；否则 icon。
2. **回退**：图片 error 按 keepImageAfterError/trusted 决定是否保留；不能无限重试。
3. **文字缩放**：ResizeObserver + 文字宽度计算 scale；卸载 disconnect。
4. **尺寸/形状**：size/radius/fit/gap；style 作者覆盖。
5. **包边界**：无 `<style>`、无 fetch；avatar token。

### 边界用例

- src/text/icon/空/图片失败/keepImage
- size/radius/fit/gap/draggable/crossOrigin
- 文字自适应/ResizeObserver/卸载
- badge/窄屏/深色

### 优先级

1. 视图/回退；2. 尺寸/文字；3. badge/无障碍；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 194 行；Vamis 150 行）；依赖 badge/icon。
- 风险：图片回退/文字缩放。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src/text/icon | 内容 | 已接 |
| size/radius/fit/gap | 样式 | 已接 |
| draggable/crossOrigin | 图片 | 已接 |
| badge | 角标 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`Avatar.vue`](../../../../packages/vamis/src/renderers/Avatar.vue)：src/text/icon/scale/resize/error。
- [`avatar.ts`](../../../../packages/vamis-core/src/utils/avatar.ts)：src/text/size/fit/gap。
- [`BadgeHost`](../../../../packages/vamis/src/renderers/BadgeHost.vue)：badge。

## 5. 样式

- 头像尺寸/圆角/文字/图标 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss/深色/无障碍细节。

## 7. 验收

- 视图/回退/尺寸/文字/图片错误/badge/窄屏；未接不误标。

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

themeCss/无障碍随主题批次补。

---

返回 [组件设计索引](../README.md)
