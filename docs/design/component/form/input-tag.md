# InputTag 标签选择 · `input-tag` 设计

> 状态：**进行中 50%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-tag) · Amis：`/zh-CN/components/form/input-tag`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputTag 当前是**可输入标签 + 建议**（91 行）：回车/批量分隔添加、去重、max、maxTagLength、joinValues、options 建议。没有 allowCreate=false 只选、远程 source、maxTagCount、拖拽排序、事件/动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：`joinValues` 默认 true 写分隔字符串；false 写数组；`parseJoined/dumpJoined` 必须成对。
2. **添加规则**：trim、空值忽略、去重、max、maxTagLength；`enableBatchAdd` 按 separator 切分。
3. **建议**：options 建议只是辅助；当前允许自由输入（无 allowCreate=false）。
4. **删除**：按 index 过滤并写回；不能只删 DOM。
5. **事件/校验**：当前无 change 事件；必填/长度校验未接。
6. **包边界**：无 `<style>`、无 fetch；标签/输入/按钮走 token。

### 1.2 边界用例

- 空 / 多标签 / joinValues false / 重复 / 空格 / 超长 / max
- 批量分隔（逗号/自定义 separator）
- options 建议无匹配/空 options
- 删除中间/最后一个
- disabled/static
- 远程 source/allowCreate false/maxTagCount/拖拽（未接）
- 窄屏/深色

### 1.3 优先级

1. 值形态/添加/删除
2. 去重/max/长度/批量
3. allowCreate/远程/建议
4. maxTagCount/拖拽/事件动作
5. 样式/无障碍

## 2. 复杂度

- 等级：**L 重**（Amis 786 行；Vamis 91 行）
- 依赖：`FormItem`、`Badge`、`select`/`tag`
- 风险：输入自由文本 vs 只选预设的语义

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 标签值 | 已接 |
| `joinValues` / `delimiter` | 值形态 | 已接 |
| `max` / `maxTagLength` | 上限 | 已接 |
| `enableBatchAdd` / `separator` | 批量 | 已接 |
| `options` | 建议 | 已接 |
| `allowCreate` | 只选预设 | 未接（当前总是可创建） |
| `source` / 远程 | 选项 | 未接 |
| `maxTagCount` | 折叠 | 未接 |
| 事件/动作 | 目标 | 未接 |

### 事件/动作

当前无 change 事件/动作，也没有 scoped API。

## 4. 架构

- [`form/InputTag.vue`](../../../../packages/vamis/src/renderers/form/InputTag.vue)：tags、add/remove、suggestions。
- [`options.ts`](../../../../packages/vamis-core/src/utils/options.ts)：normalize/parse/dump。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → parseJoined → tags[]
add → trim/batch/去重/max/长度 → dumpJoined → setValue
remove(index) → filter → setValue
```

## 5. 样式与边界

- 标签 Badge、移除按钮、建议按钮；无 `<style>`。
- 窄屏换行/长标签溢出；深色标签/移除 hover 单独核。

## 6. 当前状态与缺口

- 已接：标签添加/删除、去重、max/maxTagLength、批量、建议、joinValues。
- 未接：allowCreate=false、远程 source、maxTagCount、拖拽、事件/动作、校验/深色。
- 对照：TODO 50%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputTag / options 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputTag 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-tag` 桌面
- [ ] `pnpm compare --page input-tag --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- joinValues 两种值形态
- 去重/max/长度/批量
- 自由输入 vs allowCreate
- 删除/空标签
- 事件/动作缺口

## 8. 后续

1. 先补 allowCreate=false 与远程 source。
2. 再做 maxTagCount/拖拽/事件动作。
3. 深色/无障碍最后做。

---

返回 [组件设计索引](../README.md)
