# Status 状态 · `status` 设计

> 状态：**进行中 75%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/status) · Amis：`/zh-CN/components/status`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Status 当前是**默认状态映射 + 自定义 map/labelMap/source**（85 行）：boolean/0/1 只画图标，字符串状态默认文案/图标/颜色，source 可覆盖 label/icon/color/className，placeholder 兜底。主路径较完整；缺口是图标依赖 Font Awesome、深色/宿主图标一致性。

## 1. 边界与优先级（先读）

1. **值解析**：schema.value 优先，否则 data[name]；boolean → 1/0；数字串转 int；空值显示 placeholder。
2. **映射优先级**：source 自定义 > labelMap > DEFAULT；map 只映射 icon。
3. **默认状态**：0/1 无 label 只图标；success/pending/queue/schedule/fail/warning/info 有文案/图标/颜色。
4. **图标**：resolveIcon + IconMark；依赖 Font Awesome 字形/宿主注入，不能假设任意图标可用。
5. **颜色**：默认 token；custom.color 可覆盖；深色只换 token。
6. **包边界**：无 `<style>`、无 fetch；状态/图标 token。

### 边界用例

- 空/boolean/0/1/数字串/未知字符串
- map 图标/labelMap/source 覆盖/placeholder
- 自定义 className/color
- 深色/宿主无 FA/窄屏
- 事件/动作（无）

### 优先级

1. 值/映射优先级；2. 默认态/图标；3. 自定义颜色/深色；4. 图标依赖。

## 2. 复杂度

- 等级：**M 中**（Amis 239 行；Vamis 85 行）；依赖 icon。
- 风险：图标字形依赖宿主、映射优先级。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `value` / `name` | 状态值 | 已接 |
| `map` | 图标映射 | 已接 |
| `labelMap` | 文案映射 | 已接 |
| `source` | 自定义对象 | 已接 |
| `placeholder` | 空态 | 已接 |
| 事件/动作 | 目标 | 无 |

## 4. 架构

- [`Status.vue`](../../../packages/vamis/src/renderers/Status.vue)：DEFAULTS/ICONS/raw/key/source/custom/label/icon/color。
- [`IconMark.vue`](../../../packages/vamis/src/renderers/IconMark.vue)：图标渲染。
- [`styles.css`](../../../packages/vamis-ui/src/styles.css)：status token。

## 5. 样式

- inline-flex gap；颜色 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

默认图标以外字形依赖宿主；深色逐项；事件动作无。

## 7. 验收

- 0/1/boolean/字符串/未知/空；map/labelMap/source 优先级；深色/窄屏。

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

补深色/宿主图标一致性；映射优先级补测试；不新增事件动作。

---

返回 [组件设计索引](README.md)
