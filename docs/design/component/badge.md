# Badge 角标 · `badge` 设计

> 状态：**进行中 95%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/badge) · Amis：`/zh-CN/components/badge`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Badge **不是独立渲染器**：通过 `BadgeHost` HOC 给目标组件加角标；`badge` 对象/布尔控制。主路径成熟；缺口 themeCss/深色逐项。

## 1. 边界与优先级（先读）

1. **HOC**：badge 挂在目标组件上，不单独输出；目标/位置/偏移由 badge schema。
2. **内容**：文本/数字/点；mode/level 等由 badge 配置。
3. **层级**：角标在目标上方，不能裁切；`--badge-*` token。
4. **包边界**：无 `<style>`、无 fetch；badge token。

### 边界用例

- 无 badge/文本/数字/点/偏移
- 目标尺寸/裁切/深色/窄屏
- 自定义 className/themeCss（未接）

### 优先级

1. HOC/内容；2. 位置/偏移；3. 深色/themeCss。

## 2. 复杂度

- 等级：**S 轻**（Amis 253 行；Vamis BadgeHost 共享）；依赖目标组件。
- 风险：裁切/偏移。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| badge 文本/数字/点 | 内容 | 已接 |
| 位置/偏移 | 布局 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`BadgeHost.vue`](../../../packages/vamis/src/renderers/BadgeHost.vue)：HOC 包装/角标。
- [`badge.ts`](../../../packages/vamis-core/src/utils/badge.ts)：配置/位置。
- [`styles.css`](../../../packages/vamis-ui/src/styles.css)：`--badge-*`。

## 5. 样式

- 角标色/尺寸/偏移 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss/深色逐项。

## 7. 验收

- 无/文本/数字/点/偏移/裁切/深色；不按独立组件验收。

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

随目标组件/主题批次补 themeCss；保持 HOC。

---

返回 [组件设计索引](README.md)
