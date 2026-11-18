# ConditionBuilder 条件组合 · `condition-builder` 设计

> 状态：**进行中 35%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/condition-builder) · Amis：`/zh-CN/components/form/condition-builder`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

ConditionBuilder 当前是**精简规则组**（121 行）：字段 + 操作符 + 值 + 且/或，单层 children。没有嵌套组、公式、日期控件、远程 fields、拖拽、非内嵌模式、事件/动作。35% 是真实能力缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值格式**：值形如 `{ conjunction: 'and'|'or', children: ConditionRule[] }`；`normalizeConditionValue` 兜底；无 name 不写。
2. **规则更新**：任何字段/操作符/值/删除/新增都产生新对象（不可变更新），不能直接改 `value` 内数组；否则表单/渲染不刷新。
3. **字段/操作符匹配**：操作符从字段 allowed ops 过滤；字段切换要清空 value；`is_empty` / `is_not_empty` 不需要值。
4. **空规则**：删到 0 条仍保留一条空规则，不能出现空 children 让 UI 崩。
5. **值控件**：字段有 `options` 用 select，否则 Input；后续日期/数字/区间类型应走字段 type 决定控件，不能一律字符串。
6. **表单边界**：走 FormItem/FieldValue；不要在组件内自建提交/错误。
7. **包边界**：无 `<style>`、无 fetch；规则 UI 走 token。

### 1.2 边界用例

- 空值 / 只有 conjunction / children 空 / 一条规则
- 切换字段后清空值；操作符不含值
- 字段 operators 限制 / 未知 op
- options 值类型 number/bool / 空 options
- 删除最后一条；新增
- 路径 name / 无 name / disabled
- 嵌套/公式/日期（目标能力，当前未接）
- 窄屏换行、深色

### 1.3 优先级

1. 值格式/不可变更新/空规则
2. 字段/操作符/值控件
3. 嵌套组 / 公式 / 日期/数字类型
4. 远程 fields / 拖拽/非内嵌
5. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis `ConditionBuilder.tsx` 257 行 + 子组件；Vamis 121 行）
- 依赖：`FormItem`、`Options`、`select`、`input-text`、`action`
- 风险：当前只有单层字符串规则；日期/嵌套/公式会改变值模型

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'condition-builder'`
- Amis 渲染器：`packages/amis/src/renderers/Form/ConditionBuilder.tsx`
- 在线文档：[Vamis `/components/form/condition-builder`](/components/form/condition-builder)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `fields` | 字段定义（name/label/type/operators/options） | 已接基础 |
| `name` / `value` | 表单值 | 已接 |
| `conjunction` | 默认且/或 | 已接（UI 可切） |
| `showNot` / `not` | 取反 | 未接 |
| `builderMode` / `embed` | 简易/非内嵌 | 未接 |
| `draggable` | 规则拖拽 | 未接 |
| `searchable` / 字段搜索 | 字段搜索 | 未接 |
| 日期/数字/区间值控件 | 按字段 type | 未接（当前只 Input/select） |
| 嵌套组 | 子 group | 未接 |
| 公式编辑器 | formula | 未接 |
| 远程 fields | source/api | 未接 |

### 3.3 事件/动作

当前 **无事件/动作**（没有 createVamisEvent/scoped API）；文档也没有独立事件/动作表。不要把 ConditionBuilder 当 select 或 Action。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`ConditionBuilder.vue`](../../../../packages/vamis/src/renderers/form/ConditionBuilder.vue) | 单层规则、字段/操作符/值/增删、conjunction |
| ``condition.ts`` | `CONDITION_OPERATORS` / `emptyConditionRule` / `normalizeConditionValue` |
| [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | condition-builder toolbar/label/native-select token |

### 4.2 状态

```text
fieldApi.getValue(name) ──normalize──> value
value.children[i] ──patchRule/add/remove──> 新对象 ──setValue
opsFor(field) 过滤操作符；fieldOptions(field) 决定 select/Input
```

- `patchRule` 逐条复制；`addRule` 追加 `emptyConditionRule`；`removeRule` 为空时补一条。
- `needsValue` 排除 is_empty/is_not_empty。
- 表单值格式是 Amis condition-builder 兼容目标；改动前先对齐核心类型。

### 4.3 目标扩展

- **嵌套组**：children 支持 group 节点，递归渲染；值模型/匹配函数同步。
- **字段类型**：date/number/range 走对应控件；不要全部字符串。
- **公式/非内嵌/拖拽**：独立设计，不要塞进当前 121 行。
- **远程 fields**：fields source/api；先定 loading/失败。

## 5. 样式与边界

- 默认类：`.vamis-condition-builder__toolbar`、`__label`、`.vamis-native-select`。
- 规则行换行/宽度/深色走 token；无 `<style>`。
- 窄屏字段/操作符/值三段换行；深色 select/input 单独核。

## 6. 当前状态与缺口

- 已接：单层规则、字段/操作符/值、且/或、增删、空规则兜底、options 值。
- 未接：嵌套组、公式、日期/数字/区间控件、远程 fields、showNot、非内嵌/简易模式、拖拽、搜索、事件/动作。
- 对照：TODO 35%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis ConditionBuilder / condition 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（ConditionBuilder 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page condition-builder` 桌面
- [ ] `pnpm compare --page condition-builder --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 值不可变更新/空规则
- 字段切换清值
- 无值操作符
- 值控件类型
- 嵌套/公式不要误标

## 8. 后续

1. 先抽 `ConditionGroup` / `ConditionRule` 子件，为嵌套组做准备。
2. 再按字段 type 接日期/数字/区间；值模型先定。
3. 公式/远程 fields/拖拽单独立项，不混在 35% 基座里。

---

返回 [组件设计索引](../README.md)
