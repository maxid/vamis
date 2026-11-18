# InputKVS 键值组 · `input-kvs` 设计

> 状态：**进行中 45%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-kvs) · Amis：`/zh-CN/components/form/input-kvs`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputKVS 当前是**键值行数组**（31 行）：`{key,value}` 行、增删、写数组。没有分组 keyField/valueField、类型、批量、拖拽、校验、事件/动作；45% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：数组 `{key,value}`；空数组显示一行空；无 name 不写。
2. **不可变更新**：update/add/remove 返回新数组；key 重复会覆盖/冲突，需校验。
3. **key/value 类型**：当前字符串；value 数字/布尔未接。
4. **行身份**：index；拖拽/删除需同步值。
5. **包边界**：无 `<style>`、无 fetch；Input/按钮 token。

### 边界用例

- 空/单行/多行/空 key/重复 key
- value 字符串/数字/布尔
- 增删/删除最后一行
- disabled/static、FormItem 校验
- 拖拽/批量（未接）
- 窄屏/深色

### 优先级

1. 值/不可变更新/空行；2. key 唯一/类型；3. 拖拽/批量；4. 事件动作。

## 2. 复杂度

- 等级：**XL 特重**（Amis 2154 行；Vamis 31 行）；依赖 `input-kv`、`action`。
- 风险：与 InputKV 重叠；当前更精简。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 数组 | 已接 |
| key/value 字段 | 固定 | key/value |
| 增删 | 基础 | 已接 |
| 类型/唯一/拖拽/批量 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/InputKVS.vue`](../../../packages/vamis/src/renderers/form/InputKVS.vue)：groups + Input/Button。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。
- 无 scoped API。

### 数据流

```text
field value → groups[]（空则一行）
输入/增删 → setValue(array)
```

## 5. 样式

- 行 flex；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

key 唯一/类型/拖拽/批量/事件动作/深色。

## 7. 验收

- 值/空行/重复 key/增删/disabled；未接不误标。

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

与 InputKV 统一值/校验模型，避免两套；先做唯一/类型，再做拖拽/批量。

---

返回 [组件设计索引](README.md)
