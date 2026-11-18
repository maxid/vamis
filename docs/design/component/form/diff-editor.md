# DiffEditor 对比编辑器 · `diff-editor` 设计

> 状态：**进行中 65%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/diff-editor) · Amis：`/zh-CN/components/form/diff-editor`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

DiffEditor 是 Monaco DiffEditor 容器：左侧 `diffValue` 只读、右侧绑定 `name` 修改值；语言/主题/高度/options 与 Editor 共用 `code-highlight`。核心风险是**只读原值模板、modified 值同步、语言推断、主题/dispose**。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **两栏语义**：`diffValue` 是左侧只读原文；`name` 字段是右侧可编辑值；不要把两者混写或把左侧写回表单。
2. **值同步**：右侧 `fieldApi.getValue(name)` 优先，schema.value 兜底；外部 setValue 要同步 Monaco modified model。
3. **seed**：仅字段值 undefined 且 schema.value 非空时写一次；diffValue 不参与 seed。
4. **language**：从 schema.language（支持变量）解析；未知兜底；左右两侧同语言。
5. **主题**：跟随 `.dark` observer / `editorTheme`；卸载断开，dispose diff session。
6. **只读/禁用**：右侧只读/disabled 时不能编辑；左侧始终只读。
7. **包边界**：无 `<style>`、无直接 fetch；Monaco 按需加载。

### 1.2 边界用例

- 空 diffValue / 空 name / 两者都有
- diffValue 模板 `${...}` / 非字符串
- language 变量/未知；editorTheme 覆盖
- 外部 setValue / 表单 reset
- disabled/readOnly
- 暗色切换/卸载/布局
- 长文本/窄屏/全屏（若支持）
- 动作/editorDidMount（未接）

### 1.3 优先级

1. 两栏值语义/seed/同步
2. language/主题
3. dispose/布局/只读
4. 事件/动作
5. 样式/深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/DiffEditor.tsx` 265 行；Vamis 207 行 + Monaco）
- 依赖：`Monaco DiffEditor`、`FormItem`、`code-highlight`
- 风险：左右 model 与表单值双向同步

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'diff-editor'`
- Amis 渲染器：`packages/amis/src/renderers/Form/DiffEditor.tsx`
- 在线文档：[Vamis `/components/form/diff-editor`](/components/form/diff-editor)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 现状 |
|---|---|---|
| `diffValue` | 左侧只读原值 | 已接，支持模板 |
| `name` / `value` | 右侧修改值 | 已接 |
| `language` | 语言 | 已接，支持变量 |
| `editorTheme` / options / height | 外观 | 已接 |
| `disabled` / `readOnly` | 只读 | 部分 |
| `editorDidMount` | 挂载回调 | 未接 |
| 动作 | 目标 | 未接（D7） |

### 3.3 事件/API

文档目标事件：change/focus/blur；当前实现路径与 Editor 类似，具体事件是否全部派发由 code-highlight/session 决定，补测试后再宣称完整。动作/editorDidMount 未接。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`form/DiffEditor.vue`](../../../../packages/vamis/src/renderers/form/DiffEditor.vue) | diffValue/name、language/theme、挂载/事件 |
| [`display/code-highlight.ts`](../../../../packages/vamis/src/renderers/display/code-highlight.ts) | Monaco Diff 动态加载、mount、主题、normalize |
| [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |

### 4.2 状态

```text
diffValue (filterTpl) → 左侧只读 model
field value/schema.value → 右侧 modified model
Monaco change → 写 name（如果可编辑）
dark observer/theme → 两侧主题
dispose → 销毁左右 model/session
```

- 左侧不写值；右侧是唯一表单值。
- seed 只对右侧；模板 diffValue 只渲染。
- 语言变化需要重建/更新 model；不要在旧 model 上换语言。

## 5. 样式与边界

- 容器高度/差异色/主题走 Monaco + token；无 `<style>`。
- 深色 diff 高亮、只读侧、窄屏宽度单独核。
- 作者 className 只落节点。

## 6. 当前状态与缺口

- 已接：diffValue/name、language、theme、height/options、Monaco Diff 挂载/销毁。
- 未接/未核：editorDidMount、动作、完整事件、disabled/readOnly 细节、深色/窄屏。
- 对照：TODO 65%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis DiffEditor / code-highlight 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（DiffEditor 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page diff-editor` 桌面
- [ ] `pnpm compare --page diff-editor --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 补 editorDidMount/事件完整性。
2. 验证 disabled/readOnly 与外部 setValue。
3. 深色/窄屏专项。

---

返回 [组件设计索引](../README.md)
