# PopOver 弹出提示 · `popOver` 设计

> 状态：**进行中 90%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/popover) · Amis：`/zh-CN/components/popover`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

PopOver **不是独立 type**，是字段/单元格 HOC：`popOver` 对象或 HOC config，点击/悬浮显示 title/body，支持 position/mode/trigger/icon/overflow。主路径成熟；缺口 CRUD 默认 header 像素、list 其余皮肤。

## 1. 边界与优先级（先读）

1. **启用**：popOverEnabled；无 body 不弹；table cell/static 各自 defaultPosition。
2. **触发/模式**：trigger click/hover；mode popOver/dialog；exclusive 打开关闭互斥。
3. **位置**：center/auto/方向/fixed；table td 居中、static right 放大镜；offset/gap。
4. **overflow**：ellipsis 时内容放不下才弹；否则常显 icon。
5. **层级**：VamisOverlay + `--z-popover` 1400；外部关闭/卸载清 timer。
6. **包边界**：无 `<style>`、无 fetch；popover token。

### 边界用例

- 无 body/title/icon/ellipsis；click/hover/dialog
- center/auto/方向/fixed/offset
- table 单元格/static/form 混用
- 外部关闭/嵌套/窄屏/深色
- CRUD header/list 皮肤（未核）

### 优先级

1. 启用/触发；2. 位置/overflow；3. 层级/关闭；4. 宿主皮肤。

## 2. 复杂度

- 等级：**L 重**（Amis 356 行；Vamis 448 行）；依赖 tpl/overlay。
- 风险：定位/宿主差异/overflow。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| popOver 对象 | title/body/icon/mode/position | 已接 |
| trigger/mode | 交互 | 已接 |
| overflow/offset | 溢出/偏移 | 已接 |
| table/static 默认位置 | 宿主 | 已接 |
| 宿主皮肤 | CRUD/list | 未核 |

## 4. 架构

- [`PopOverHost.vue`](../../../packages/vamis/src/renderers/PopOverHost.vue)：触发/位置/溢层。
- [`VamisOverlay.vue`](../../../packages/vamis/src/overlay/VamisOverlay.vue)：浮层。
- [`popover.ts`](../../../packages/vamis-core/src/utils/popover.ts)：enable/position/trigger/schema。

## 5. 样式

- popover 白底/深色 `--popover-layer-bg`/层级；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

CRUD 默认 header 像素、list 其余皮肤、深色逐项。

## 7. 验收

- 触发/位置/overflow/宿主/外部关闭/窄屏；未接不误标。

## 8. 后续

补宿主皮肤/深色；不要新增独立 type。

---

返回 [组件设计索引](README.md)
