# InputSubForm 子表单 · `input-sub-form` 设计

> 状态：**进行中 45%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-sub-form) · Amis：`/zh-CN/components/form/input-sub-form`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputSubForm 当前是**内嵌子表单**（71 行）：把 `form.body` 铺在行内、NestedFormScope 提供子域、multiple 增删行。文档中的“设置”弹层/按钮、拖拽排序、source/initApi、多选弹层等尚未接；45% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值形态**：`multiple: false` 为对象，`multiple: true` 为对象数组；无 name 不写；空值展示 `[{}]`/`{}`。
2. **子域**：每行 NestedFormScope；子字段 name 是行内相对路径，不写父表单顶层；`persistCurrent` 整体换新行对象。
3. **字段来源**：`schema.form.body` / `schema.body` / `controls`；不要直接把整个 form schema 当字段渲染。
4. **增删**：multiple 才显示新增；删除后至少保留一行；非 multiple 不显示新增/删除。
5. **当前无弹层**：不渲染“设置”按钮/Modal；不要按文档的弹层交互测试。
6. **校验**：子字段 required/validations 归表单/FormItem；InputSubForm 不能只写值绕过校验。
7. **包边界**：无 `<style>`、无 fetch；卡片/子表单样式走 token。

### 1.2 边界用例

- 空值 / 对象 / 数组 / `[{}]`
- multiple false/true、增删到 0 行
- labelField 为空/有值；btnLabel
- form.body / body / controls 三种来源
- 子字段 input/select/日期/嵌套 schema
- 子字段校验/disabled/static
- 外部 setValue/reset 后行同步
- 目标弹层/拖拽/source（当前未接）
- 窄屏、深色、长表单

### 1.3 优先级

1. 值形态/子域/增删
2. 子字段校验
3. 弹层/设置按钮（目标）
4. 拖拽/source/initApi
5. 样式/窄屏/深色

## 2. 复杂度

- 等级：**L 重**（Amis `Form/InputSubForm.tsx` 648 行；Vamis 71 行）
- 依赖：`form`、`action`、`service`、`container`
- 风险：当前只有内嵌基座；弹层/多选/远程数据未接

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'input-sub-form'`
- Amis 渲染器：`packages/amis/src/renderers/Form/InputSubForm.tsx`
- 在线文档：[Vamis `/components/form/input-sub-form`](/components/form/input-sub-form)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `form` / `body` / `controls` | 子表单字段 | 已接（取 body/controls） |
| `multiple` | 多行子表单 | 已接 |
| `labelField` | 行标题字段 | 已接 |
| `btnLabel` | 设置按钮文案 | 已接（仅用于行标题） |
| `addButtonText` | 新增文案 | 已接 |
| `draggable` | 行拖拽 | 未接 |
| `source` / `initApi` | 远程初始值 | 未接 |
| `addControls` / `editControls` | 弹层表单 | 未接 |
| `minLength` / `maxLength` | 行数限制 | 未接 |
| `scaffold` | 新增默认值 | 未接 |
| 事件/动作 | 文档目标 | 未接 |

### 3.3 事件/动作

当前无独立事件/动作，也没有 scoped API；不要按 Combo 的动作套用。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputSubForm.vue`](../../../packages/vamis/src/renderers/form/InputSubForm.vue) | 子表单行、增删、label、NestedFormScope |
| [`NestedFormScope.vue`](../../../packages/vamis/src/NestedFormScope.vue) | 行子域/persist |
| [`sub-form.ts`](https://github.com/baidu/amis) | Amis 目标工具；Vamis 暂未拆 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | subform 行/标签 token |

### 4.2 状态

```text
field value ──> rows：multiple ? array : [object]
rows ──add/remove/persistCurrent──> fieldApi.setValue(name, multiple ? next : next[0]||{})
每行 NestedFormScope → SchemaRenderer(fields)
```

- `fields` 只取 form.body/body/controls 的首层节点。
- 行标题优先 labelField，否则 `${btnLabel} ${i+1}`。
- 没有本地草稿/弹层；编辑即写值。

### 4.3 目标扩展

- **弹层模式**：btnLabel 打开 dialog，addControls/editControls 表单；确认才写回。
- **拖拽**：行身份 + 重排；与 multiple 值同步。
- **source/initApi**：初始子值/远程选项；不要让子表单请求污染父表单。
- **min/max/scaffold**：按钮与新增默认值。

## 5. 样式与边界

- 默认类：`.vamis-subform__item`、`.vamis-subform__label`。
- 行卡片/删除按钮/新增按钮走 token；无 `<style>`。
- 窄屏字段换行、深色卡片、长表单滚动单独核。

## 6. 当前状态与缺口

- 已接：内嵌子表单、multiple 增删、labelField/btnLabel、子域写回、body/controls。
- 未接：弹层设置、draggable、source/initApi、min/max/scaffold、事件/动作、深色窄屏。
- 对照：TODO 45%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputSubForm / NestedFormScope 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputSubForm 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-sub-form` 桌面
- [ ] `pnpm compare --page input-sub-form --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 单对象/对象数组
- 子域/路径/校验
- 空行/删除最后一行
- 弹层/拖拽缺口不要误标
- 外部 setValue/reset

## 8. 后续

1. 先定弹层模式（btnLabel 打开、add/editControls、确认写回）。
2. 再做 draggable 行身份与 min/max/scaffold。
3. source/initApi 与样式专项最后做。

---

返回 [组件设计索引](README.md)
