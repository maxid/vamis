# Editor 代码编辑器 · `editor` 设计

> 状态：**进行中 85%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/editor) · Amis：`/zh-CN/components/form/editor`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Editor 是 Monaco 的容器：语言/值/主题/主题切换、全屏、schema 智能提示、事件与组件 API。它不直接处理网络；Monaco 通过 `code-highlight` 动态挂载。核心风险是 **value ↔ editor session 同步、dispose、主题 observer、language 推断、intellisense schema**。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值同步**：`fieldApi.getValue(name)` 优先，schema.value 兜底；无 name 不写；外部 setValue 要同步 editor model，不能只改 Monaco 不写表单。
2. **初始化 seed**：仅当字段值 undefined 且 schema.value 非空时写一次；不能覆盖已有值。
3. **language**：`type` 后缀（js-editor/ts-editor/xxx-editor）优先于 `language`；`language` 支持 `$` 变量；未知语言要有兜底。
4. **主题**：跟随 `.dark` MutationObserver；`editorTheme` 显式优先；卸载断开 observer，不泄漏。
5. **Monaco 生命周期**：mount 一次，dispose 时销毁 session/layout；全屏切换只改布局，不重建。
6. **智能提示**：`intellisense: schema` 按组件树/JSON Schema 提供提示；不要把整个 schema 塞进 model。
7. **包边界**：无 `<style>`；Monaco 按需加载；不直接 fetch。

### 1.2 边界用例

- 空值 / schema.value / 已有字段值 / 外部 setValue
- js/ts/json/yaml language，变量 language
- 暗色切换、编辑器主题覆盖
- 全屏切换/尺寸变化/卸载
- disabled/readOnly、hideButtons、size: full
- schema 智能提示（有/无 renderer 定义）
- 事件 change/focus/blur
- 未接 editorDidMount / 动作
- 窄屏、长文本

### 1.3 优先级

1. 值双向同步/seed
2. language/主题
3. Monaco dispose/全屏/布局
4. 智能提示
5. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/Editor.tsx` 455 行；Vamis 283 行 + Monaco）
- 依赖：`Monaco`、`FormItem`、`code-highlight`、`schema-type-catalogs`
- 风险：Monaco 外部依赖 + 值/主题/布局生命周期

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'editor'`；变体 `js-editor` / `ts-editor` / `*-editor`
- Amis 渲染器：`packages/amis/src/renderers/Form/Editor.tsx`
- 在线文档：[Vamis `/components/form/editor`](/components/form/editor)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 字段/初始值 | 已接 |
| `language` | 语言 | 已接，含变量 |
| `editorTheme` | 主题 | 已接；默认 vs/vs-dark |
| `options` | Monaco options | 已接 |
| `height` | 高度 | 已接 |
| `hideButtons` | 隐藏按钮 | 已接 |
| `size: full` | 全屏 | 已接 |
| `intellisense: schema` | schema 提示 | 已接 |
| `editorDidMount` | 挂载回调 | **未接** |
| 动作 | 目标 | 未接（D7） |

### 3.3 事件/API

已接：`change`、`focus`、`blur`（emit + runOnEvent）。组件 API 未完整注册；editorDidMount 未接。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`form/Editor.vue`](../../../packages/vamis/src/renderers/form/Editor.vue) | 值/语言/主题/全屏/挂载/事件 |
| [`display/code-highlight.ts`](../../../packages/vamis/src/renderers/display/code-highlight.ts) | Monaco 动态加载、mount、主题、高度、值 normalize |
| [`schema-type-catalogs.ts`](../../../packages/vamis-core/src/schema-type-catalogs.ts) | schema 智能提示数据 |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |

### 4.2 状态

```text
field value / schema.value → normalizeEditorValue → Monaco model
Monaco change → emit/change → fieldApi.setValue
dark class MutationObserver → editorTheme
size: full → CSS 全屏（不重建）
```

- seed 仅一次；外部值变化 watch 同步 model（避免回环）。
- dispose 时销毁 session、断开 observer、释放 layout。

## 5. 样式与边界

- 编辑器容器高度/全屏/按钮走 token；无 `<style>`。
- Monaco 主题 vs/vs-dark；作者覆盖 `editorTheme`。
- 窄屏宽度/全屏按钮、深色单独核。

## 6. 当前状态与缺口

- 已接：Monaco、language、值 seed/同步、主题、全屏、hideButtons、intellisense schema、change/focus/blur。
- 未接：`editorDidMount`、组件动作（D7）、部分布局/错误态；深色/窄屏未逐项。
- 对照：TODO 85%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Editor / code-highlight 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（editorDidMount/动作未接）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Editor 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page editor` 桌面
- [ ] `pnpm compare --page editor --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 补 editorDidMount 与基础动作/API。
2. 深色/全屏/窄屏专项。
3. Monaco 体积/按需加载评估。

---

返回 [组件设计索引](README.md)
