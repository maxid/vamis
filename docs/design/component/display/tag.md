# Tag 标签 · `tag` 设计

> 状态：**进行中 90%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/tag) · Amis：`/zh-CN/components/tag`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Tag 当前是**标签展示/可选/可关闭**（152 行）：三种 displayMode、预设/自定义 color、icon/closeIcon、closable、checkable、click/mouseenter/mouseleave/close 事件。主路径成熟；checkable 是 Vamis 增强，themeCss 缺口。

## 1. 边界与优先级（先读）

1. **label**：value/name 优先，否则 label 模板；空不崩。
2. **displayMode**：normal/rounded/status；status 默认圆点/自定义 icon。
3. **颜色**：预设 inactive/active/success/processing/error/warning；自定义 hex 按模式落背景/边框/status 色。
4. **交互**：click/mouseenter/mouseleave/close；disabled 不响应；close 不自动隐藏，由事件/动作决定。
5. **checkable**：仅 Vamis 增强；切换 checked，不写表单值。
6. **包边界**：无 `<style>`、无 fetch；tag token。

### 边界用例

- 空/文本/对象/变量/三模式
- 预设/自定义色/icon/closeIcon/closable
- checkable/click/close/disabled
- 窄屏/深色

### 优先级

1. label/模式；2. 颜色/图标；3. 事件/checkable；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 205 行；Vamis 152 行）；依赖 icon。
- 风险：颜色模式/事件阻止。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| label/value | 内容 | 已接 |
| displayMode/color | 外观 | 已接 |
| icon/closeIcon/closable | 附属 | 已接 |
| click/mouse/close | 事件 | 已接，可阻止 |
| checkable | 增强 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`rest/Tag.vue`](../../../../packages/vamis/src/renderers/rest/Tag.vue)：label/mode/color/icon/events。
- ``tag.ts``：label/mode/color/icon。
- [`IconMark`](../../../../packages/vamis/src/renderers/IconMark.vue)：图标。

## 5. 样式

- tag 预设/自定义色/圆角/关闭 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

themeCss/深色逐项；checkable 保持增强。

## 7. 验收

- 三模式/颜色/图标/关闭/事件/checkable/窄屏；未接不误标。

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

themeCss/深色随主题批次；不要改 close 默认隐藏语义。

---

返回 [组件设计索引](../README.md)
