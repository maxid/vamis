# InputKV 键值对 · `input-kv` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-kv) · Amis：`/zh-CN/components/form/input-kv`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputKV 当前是**最小键值对编辑器**（57 行）：`{ key, value }` 行、增删、写回对象。它没有 key 唯一/非空校验、value 类型、拖拽、批量粘贴、首行固定、事件/动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值转换**：`kvRowsFromValue` / `valueFromKvRows` 是对象 ↔ 行唯一入口；key 重复会覆盖，必须在提交/校验层处理，不能静默丢数据。
2. **不可变更新**：update/add/remove 都返回新 rows；删除到 0 条仍保留一条空行，不能让 UI 空掉。
3. **写回**：无 name 不写；value 保持用户输入类型（当前字符串），不要擅自转 number/boolean。
4. **key 唯一/必填**：重复/空 key 是主要错误来源；当前未校验，不能声称已支持。
5. **行身份**：当前用 index；拖拽/删除要同步值，后续需稳定 key（可能 `$id`）。
6. **包边界**：无 `<style>`、无 fetch；输入/按钮/行布局走 token。

### 1.2 边界用例

- 空值 / 空对象 / 多行 / 空 key / 重复 key
- value 字符串/数字/布尔/空串
- 删除最后一行 / 删除中间行 / 新增
- 外部 setValue/reset 后行同步
- disabled/static、FormItem 错误
- 拖拽/批量粘贴/首行固定（未接）
- 窄屏、深色

### 1.3 优先级

1. 值转换/不可变更新/空行
2. key 唯一/必填
3. 删除/新增/写回
4. 拖拽/批量/首行固定
5. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/InputKV.tsx` 2154 行；Vamis 57 行）
- 依赖：`FormItem`、`input-text`、`action`
- 风险：当前仅有基座；key 冲突/类型/拖拽/批量都未接

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'input-kv'`
- Amis 渲染器：`packages/amis/src/renderers/Form/InputKV.tsx`
- 在线文档：[Vamis `/components/form/input-kv`](/components/form/input-kv)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 对象值 | 已接 |
| `keyPlaceholder` / `valuePlaceholder` | 占位 | 已接 |
| `keyField` / `valueField` | 字段名 | 未接（固定 key/value） |
| `draggable` | 行拖拽 | 未接 |
| `addable` / `removable` | 增删开关 | 始终显示 |
| 批量粘贴 | 目标 | 未接 |
| 首行固定 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

### 3.3 事件/动作

当前无独立事件/动作，也没有 scoped API；不要按 Combo 的动作套用。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputKV.vue`](../../../packages/vamis/src/renderers/form/InputKV.vue) | rows、update/add/remove、写回 |
| [`kv.ts`](../../../packages/vamis-core/src/utils/kv.ts) | `kvRowsFromValue` / `valueFromKvRows` |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |

### 4.2 状态

```text
field value ──kvRowsFromValue──> rows
rows ──update/add/remove──> valueFromKvRows ──setValue
```

- 每行 `{key,value}`；当前字符串 value。
- 删除最后一行补空行；update 按 index 复制。
- 无本地草稿；编辑即写值。

## 5. 样式与边界

- 行 `flex` + Input/按钮；无专属皮肤类、无 `<style>`。
- 窄屏 key 固定宽度可能挤压 value；深色输入/删除按钮单独核。

## 6. 当前状态与缺口

- 已接：对象值、行增删、编辑写回、FormItem 壳。
- 未接：key 唯一/必填、value 类型、keyField/valueField、拖拽、批量粘贴、首行固定、事件/动作。
- 对照：TODO 50%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputKV / kv 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputKV 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-kv` 桌面
- [ ] `pnpm compare --page input-kv --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 值转换/空行/重复 key
- 删除最后一行
- value 类型保持
- 拖拽/批量缺口不要误标

## 8. 后续

1. 先做 key 必填/唯一与错误提示。
2. 再定 keyField/valueField 与 value 类型。
3. 拖拽/批量粘贴/首行固定独立设计，最后事件动作。

---

返回 [组件设计索引](README.md)
