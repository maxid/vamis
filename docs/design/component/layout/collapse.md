# Collapse 折叠器 · `collapse` 设计

> 状态：**进行中 70%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/collapse) · Amis：`/zh-CN/components/collapse`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Collapse 是**单面板折叠**，可独立或嵌入 CollapseGroup：header/title、body、collapsable、active/collapsed、箭头/图标位置、change 事件可阻止。主路径可用；深色/无障碍/逐章未核。

## 1. 边界与优先级（先读）

1. **受控/非受控**：独立时 active/collapsed 初始化 local；group 内由 group.activeKeys 控制。
2. **change 事件**：先事件再切换；prevented 不改状态。
3. **collapsable=false / disabled**：不能折叠，按钮禁用。
4. **header**：字符串模板或 SchemaNode；无 header 用“折叠”。
5. **图标**：expandIcon 优先，位置 left/right；group 可继承。
6. **包边界**：无 `<style>`、无 fetch；collapse token。

### 边界用例

- 独立/group、active/collapsed、accordion
- change 阻止、disabled、collapsable false
- header 字符串/Schema/空、图标位置
- 窄屏/深色/键盘

### 优先级

1. 受控/事件；2. header/图标；3. 无障碍/深色；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 537 行；Vamis 146 行）；依赖 icon/container。
- 风险：独立/group 双控制。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| header/title/body | 内容 | 已接 |
| active/collapsed/collapsable | 状态 | 已接 |
| expandIcon/position | 图标 | 已接 |
| change | 事件 | 已接，可阻止 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`Collapse.vue`](../../../../packages/vamis/src/renderers/Collapse.vue)：header/body/toggle/group。
- [`collapse.ts`](../../../../packages/vamis-core/src/utils/collapse.ts)：key/standalone/toggle。
- [`CollapseGroup`](collapse-group.md)：受控上下文。

## 5. 样式

- header/arrow/body token；无 `<style>`；深色/键盘/窄屏单独核。

## 6. 缺口

themeCss、无障碍/键盘、深色逐项。

## 7. 验收

- 独立/group/change 阻止/disabled/header/图标/窄屏；未接不误标。

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

补无障碍/themeCss；group 联动测试。

---

返回 [组件设计索引](../README.md)
