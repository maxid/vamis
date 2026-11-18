# Button 按钮 · `button` 设计

> 状态：**进行中 96%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/button) · Amis：`/zh-CN/components/button`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Button **不是独立渲染器**：`register.ts` 把 `button` 作为 `action` 的别名，行为/事件/动作全在 Action.vue。Button 关注外观（level/size/block/iconOnly），Action 关注 actionType/confirm/浮层/API；改按钮先看 Action。

## 1. 边界与优先级（先读）

1. **别名**：button → Action；不存在 Button.vue；不要复制 action 分支。
2. **外观**：level/primary/size/block/icon；空 label + icon 方形 32；level link 无下划线。
3. **点击**：Action 的 onClick/runOnEvent/runAction 链；button 在表单里 submit/reset 类型由 Action 处理。
4. **禁用/loading**：不能点击；tooltip 仍可显示。
5. **包边界**：无 `<style>`、无 fetch；Button token。

### 边界用例

- 正常/空 label+icon/level/size/block
- submit/reset/普通/容器
- disabled/loading/tooltip
- 窄屏/深色/表单内

### 优先级

1. 别名/外观；2. 表单类型/点击；3. disabled/loading；4. 样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 1005 行；Vamis 复用 Action 391 行）；依赖 action/icon。
- 风险：把 Button 当独立实现，行为分叉。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| level/size/block/icon | 外观 | 继承 Action |
| actionType/confirm/dialog/ajax | 行为 | 继承 Action |
| click/mouse 事件 | 事件 | 继承 Action |
| disabled/loading | 状态 | 继承 Action |

## 4. 架构

- [`register.ts`](../../../packages/vamis/src/register.ts) alias → [`Action.vue`](../../../packages/vamis/src/renderers/Action.vue)。
- [`action`](action.md)：全部行为。

## 5. 样式

- Button token（22/30/32/38 尺寸、主题）；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

随 Action：nextCondition/关闭祖先浮层；深色逐项。

## 7. 验收

- 确认走 Action；外观/表单类型/禁用/loading；不复制实现。

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

随 Action 统一补；不新增 Button.vue。

---

返回 [组件设计索引](README.md)
