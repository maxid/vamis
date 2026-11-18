# Json 展示 · `json` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/json) · Amis：`/zh-CN/components/json`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Json 当前是**递归 JSON 树展示**（54 行）：readRaw/JSON.parse、levelExpand、displayDataTypes、sortKeys、复制。没有编辑/搜索/路径复制/大对象虚拟化；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：readRaw；字符串尝试 JSON.parse，失败按字符串；null 空态。
2. **非对象**：包装 `{type: value}`；数组/对象递归。
3. **levelExpand**：默认 1；仅影响初始展开，不改变数据。
4. **展示**：displayDataTypes/sortKeys；复制 JSON.stringify；剪贴板失败静默。
5. **包边界**：无 `<style>`、无 fetch；json token。

### 边界用例

- 空/null/字符串/非法 JSON/数组/嵌套对象
- levelExpand 0/1/大；sortKeys/displayDataTypes
- 复制成功/失败；大对象滚动
- 深色/窄屏

### 优先级

1. 解析/递归；2. levelExpand/类型/排序；3. 复制/大对象；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 199 行；Vamis 54 行）；依赖 JsonNode。
- 风险：非法 JSON/大对象/递归。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| 值/raw | JSON | 已接 |
| levelExpand | 初始展开 | 已接 |
| displayDataTypes/sortKeys | 展示 | 已接 |
| enableClipboard | 复制 | 已接 |
| 编辑/搜索/路径 | 目标 | 未接 |

## 4. 架构

- [`display/Json.vue`](../../../packages/vamis/src/renderers/display/Json.vue)：parse/JsonNode/copy。
- [`JsonNode.vue`](../../../packages/vamis/src/renderers/display/JsonNode.vue)：递归树。
- [`prop.ts`](../../../packages/vamis/src/renderers/display/prop.ts)：readRaw。

## 5. 样式

- json 边框/滚动/节点 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

编辑/搜索/路径复制/大对象虚拟化/深色。

## 7. 验收

- 解析/递归/levelExpand/复制/非法/窄屏；未接不误标。

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

先做搜索/路径复制，再评估大对象虚拟化；保持只读。

---

返回 [组件设计索引](README.md)
