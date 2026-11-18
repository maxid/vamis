# ListSelect 列表选择 · `list-select` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/list-select) · Amis：`/zh-CN/components/form/list-select`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

ListSelect 当前是**按钮列表选择**（45 行）：options 渲成 Button，单选/多选切换选中。没有列/卡片布局、搜索、远程 source、禁用 option、图标、事件/动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值形态**：单选写单值/字符串；多选 `joinValues` 字符串或数组；parse/dump 成对。
2. **切换**：单选直接替换；多选 toggle；`optionValuesEqual` 比较值。
3. **选项**：options normalize；空 options 无按钮；按钮整行。
4. **禁用/校验**：当前仅整体 disabled；单 option disabled/required 未接。
5. **包边界**：无 `<style>`、无 fetch；Button/token。

### 边界用例

- 空/单选/多选/重复 value/joinValues false
- disabled/static、FormItem 校验
- 搜索/远程/图标/列布局（未接）
- 窄屏/深色

### 优先级

1. 值/切换；2. 选项/禁用；3. 搜索/布局；4. 事件动作。

## 2. 复杂度

- 等级：**M 中**（Amis 272 行；Vamis 45 行）；依赖 `select`、`list`。
- 风险：当前只是按钮组，不是完整列表选择。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `options` | 选项 | 已接 |
| `multiple` / `joinValues` | 值形态 | 已接 |
| 搜索/布局/图标 | 目标 | 未接 |
| disabled option | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/ListSelect.vue`](../../../packages/vamis/src/renderers/form/ListSelect.vue)：options + Button + selected/pick。
- [`options.ts`](../../../packages/vamis-core/src/utils/options.ts)：normalize/parse/dump/equal。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
field value → parseJoined → selected[]
pick → toggle/替换 → dumpJoined → setValue
```

## 5. 样式

- 纵向按钮列表；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

搜索/布局/图标/禁用 option/校验/事件动作。

## 7. 验收

- 值/切换/多选/disabled/空 options；未接不误标。

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

先补禁用/搜索，再评估列表/卡片布局；事件动作后置。

---

返回 [组件设计索引](README.md)
