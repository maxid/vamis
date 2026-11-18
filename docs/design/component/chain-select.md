# ChainedSelect 链式下拉 · `chained-select` 设计

> 状态：**进行中 50%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/chain-select) · Amis：`/zh-CN/components/form/chain-select`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

ChainedSelect 当前是**本地 options 级联下拉**（93 行）：按 path 逐层展开 Select，选中写数组/分隔字符串。没有远程 api 级联、异步 children、加载态、禁用/校验、事件/动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：数组或 joinValues 字符串，表示每层选择；parse/dump 成对。
2. **path/selected**：selected watch 同步 path；pick 截断后续层；不能留脏 path。
3. **层级**：optionsAt 递归 children；最多 8 层；空 children 停止。
4. **切换**：改上层必须清空下层；当前 pick 用 slice 实现。
5. **远程**：当前只本地 options；api/children 异步未接。
6. **包边界**：无 `<style>`、无 fetch；Select/token。

### 边界用例

- 空/单层/多层/改上层/清空/joinValues
- children 空/循环引用/超过 8 层
- disabled/static、FormItem 校验
- 远程 api/加载态（未接）
- 窄屏/深色

### 优先级

1. 值/path 同步；2. 层级/切换；3. 远程/加载；4. 事件动作/样式。

## 2. 复杂度

- 等级：**L 重**（Amis 491 行；Vamis 93 行）；依赖 `select`。
- 风险：selected/path 双状态同步、远程级联未接。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `options` | 树 | 已接本地 |
| `name` / `value` | 层级值 | 已接 |
| `joinValues` | 字符串 | 已接 |
| `api` / 异步 children | 远程 | 未接 |
| 加载/禁用/事件动作 | 目标 | 未接 |

## 4. 架构

- [`form/ChainedSelect.vue`](../../../packages/vamis/src/renderers/form/ChainedSelect.vue)：selected/path/levels/pick。
- [`options.ts`](../../../packages/vamis-core/src/utils/options.ts)：normalize/parse/dump/equal。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
field value → parseJoined → selected[] → watch → path
optionsAt(depth) → levels
pick(depth,value) → path/selected 截断 → dumpJoined → setValue
```

## 5. 样式

- 横向 Select + 空态文本；无专属类、无 `<style>`；窄屏换行/深色单独核。

## 6. 缺口

远程/异步 children/loading/禁用 option/校验/事件动作。

## 7. 验收

- 值/层级/改上层清下层/空 options/disabled/窄屏；未接不误标。

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

先定异步级联 API 与 loading，再补禁用/校验；事件动作后置。

---

返回 [组件设计索引](README.md)
