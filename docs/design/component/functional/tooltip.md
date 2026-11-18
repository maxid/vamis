# Tooltip 文字提示 · `tooltip-wrapper` 设计

> 状态：**进行中 92%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/tooltip) · Amis：`/zh-CN/components/tooltip-wrapper`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

TooltipWrapper 当前是**文字/内容浮层**（146 行）：title/content、hover/click/focus、placement/offset/arrow/inline/wrapperComponent/disabled；浮层走 VamisOverlay `--z-tooltip` 1600。主路径成熟；缺口 themeCss。

## 1. 边界与优先级（先读）

1. **内容**：title/content；空内容不弹；content Schema/tpl。
2. **触发**：hover/click/focus 可组合；disabled 不弹；enterable 允许移入浮层。
3. **定位**：placement 主轴放不下翻对面；offset/arrow 跟随；不要把 placement 写死。
4. **层级**：VamisOverlay Teleport + --z-tooltip；关闭点外部/定时；卸载清 timer。
5. **包装**：inline/wrapperComponent；tag 不破坏原作者布局。
6. **包边界**：无 `<style>`、无 fetch；tooltip token。

### 边界用例

- hover/click/focus/组合/disabled/空内容
- placement 四向/翻面/offset/arrow/enterable
- click 外部关闭/定时/卸载
- inline/wrapperComponent/窄屏/深色
- themeCss 缺口

### 优先级

1. 内容/触发；2. 定位/层级；3. 关闭/包装；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 338 行；Vamis 146 行）；依赖 overlay/tpl。
- 风险：定位翻面/触发组合/timer。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| title/content | 内容 | 已接 |
| trigger/placement/offset/arrow | 交互/定位 | 已接 |
| disabled/enterable | 状态 | 已接 |
| inline/wrapperComponent | 包装 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`layout/TooltipWrapper.vue`](../../../../packages/vamis/src/renderers/layout/TooltipWrapper.vue)：内容/触发/定时/定位。
- [`VamisTooltipLayer.vue`](../../../../packages/vamis/src/overlay/VamisTooltipLayer.vue)：浮层。
- ``tooltip.ts``：triggers/placement/body/theme。

## 5. 样式

- 升高面/文字/边框/圆角 8/箭头 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss、深色逐项；其余主路径已对齐。

## 7. 验收

- 触发/内容/定位/翻面/enterable/外部关闭/卸载/窄屏；未接不误标。

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

themeCss 随主题批次补；深色手核。

---

返回 [组件设计索引](../README.md)
