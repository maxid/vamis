# Dialog 对话框 · `dialog` 设计

> 状态：**已完成 100%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/dialog) · Amis：`/zh-CN/components/dialog`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

`type: dialog` 的 Vue 文件只是**内嵌预览壳**（34 行）。真正的弹层由 `actionType: dialog` 打开，由 `OverlayHost` + `Dialog` 原语渲染。Dialog.vue 本身不负责打开、关闭、压栈、焦点、z-index；这些都在 overlay/core action 里。改 Dialog 务必同时看 `OverlayHost.vue`、`overlay.ts`、`actions/run.ts`。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **打开入口**：弹层由 `actionType: dialog` / `dialog` 动作打开，不是渲染一个 `type: dialog` 节点；`type: dialog` 只是文档/内嵌预览。
2. **压栈与数据域**：`overlay.openDialog` 把当前层 data 合并给下一层；关闭后恢复上一层，不能把弹层字段写回页面根域。`closeDialog(result)` 的 result 要可空。
3. **关闭方式**：`showCloseButton` 默认 true；`closeOnEsc` / `closeOnOutside` 默认 false；点遮罩/Esc 被阻止时不能关闭；关闭按钮/取消/确认的动作语义要区分。
4. **弹层表单**：`body` 是 form 时，默认 `mode: horizontal`、`wrapWithPanel: false`；未写 actions 不画默认提交；`confirm` 动作优先 `submitDialogForm`，不要绕过表单校验。
5. **尺寸**：默认 500px，`size` xs–full、`width/height` 自定义；<576px 拉满；不要用 Tailwind `max-w-*` 运行时拼接。
6. **层级/焦点**：z-index `--z-modal` 1400；焦点在弹层内，关闭后归还；嵌套弹层顺序不能乱。
7. **包边界**：无 `<style>`、无直接 fetch；Dialog/Overlay 样式走 `@vamis/ui` token。

### 1.2 边界用例

- 基本打开/取消/确认/关闭按钮/Esc/点遮罩（开/关两态）
- 多级 dialog 压栈、关闭恢复上一层数据
- body 为 form：提交校验、确认、取消、关闭后回写
- data 映射 / 模板 / 标题为 SchemaNode
- `size` xs–full / width/height / 窄屏 <576
- actions 默认 vs 自定义 vs `[]`
- 表单提交失败 / feedback / `closeOnEsc: false`
- 深色、长内容滚动、焦点

### 1.3 优先级

1. 打开/关闭/压栈/数据域
2. 表单绑定与确认/取消
3. 尺寸/焦点/层级
4. 样式/深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Dialog.tsx` 1226 行；Vamis Dialog.vue 34 行 + OverlayHost/overlay/core actions）
- 依赖：`action`、`form`、`button`、`overlay`、`dialog` 原语
- 风险：打开/关闭/表单/压栈跨多个文件，单看 Dialog.vue 会误判

## 3. Amis 契约

### 3.1 入口

- 弹层：`actionType: dialog`（或 `dialog` 动作）
- 内嵌预览：`type: 'dialog'`
- Amis 渲染器：`packages/amis/src/renderers/Dialog.tsx`
- 在线文档：[Vamis `/components/dialog`](/components/dialog)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `title` | 标题 | 支持 SchemaNode/模板；空标题不画标题栏 |
| `body` | 内容 | SchemaNode[]；form 时默认 horizontal/wrapWithPanel false |
| `size` / `width` / `height` | 尺寸 | 默认 500；<576 拉满 |
| `showCloseButton` | 关闭 X | 默认 true |
| `closeOnEsc` / `closeOnOutside` | 关闭方式 | 默认 false；可阻止 |
| `actions` | 底部按钮 | 默认取消+确认；`[]` 隐藏 |
| `data` | 弹层数据 | 与父层 merge，关闭恢复 |
| `feedback` / 提交回写 | 目标能力 | 当前未完整接，按缺口处理 |

### 3.3 事件/动作

- 文档目标：`confirm` / `cancel` 事件；弹层动作 `closeDialog`、`close`、`cancel`、`confirm`。
- 当前实现：动作按钮走 core `runAction`；`confirm` 动作会先 `submitDialogForm` 再关闭，`cancel/close` 关闭当前层。**未统一派发 confirm/cancel 事件**，不能按事件表声称已接。
- 关闭 X / Esc / 遮罩走 overlay 的 `closeDialog`，不触发 action 的 confirm。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Dialog.vue`](../../../../packages/vamis/src/renderers/Dialog.vue) | 仅 `type: dialog` 内嵌预览（title/body/actions/尺寸） |
| [`OverlayHost.vue`](../../../../packages/vamis/src/OverlayHost.vue) | 弹层/抽屉宿主、Dialog 原语、关闭按钮/Esc/遮罩、SchemaRenderer |
| [`overlay.ts`](../../../../packages/vamis-core/src/overlay.ts) | 打开/关闭/压栈、DialogForm 注册/提交、数据合并 |
| [`actions/run.ts`](../../../../packages/vamis-core/src/actions/run.ts) | `dialog` / `closeDialog` / `confirm` / `cancel` 动作 |
| [`dialog.ts`](../../../../packages/vamis-core/src/utils/dialog.ts) | title/body/actions/size/close 纯函数 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | Dialog 尺寸/间距/按钮 token |

### 4.2 数据流

```text
actionType: dialog
  → runAction('dialog') → overlay.openDialog(schema, actionData)
  → OverlayHost: Dialog + SchemaRenderer(body/actions, extra=overlay.data)
  → confirm: submitDialogForm? → closeDialog(values)
  → cancel/close/X/Esc/outside: closeDialog(false / result)
```

- overlay.data 是当前层数据；子层 merge 父层，关闭 pop。
- `DialogForm` 由 Form.onMounted 注册；提交成功 `closeDialog({...values})`。
- 关闭后页面数据域不能残留弹层字段。

### 4.3 表单弹层

- body 为 form：默认 horizontal、wrapWithPanel false；actions 缺省时不要画默认提交。
- 确认动作：先 `submitDialogForm`，校验/API 成功才关闭；失败留在弹层。
- 取消/关闭：不提交，恢复父层数据。
- 嵌套 dialog：每层独立 form/data，关闭按栈顺序。

## 5. 样式与边界

- Dialog 原语尺寸/间距/底部按钮走 token；渲染器无 `<style>`。
- <576px 弹层拉满、底栏横排均分；桌面默认 500。
- z-index `--z-modal` 1400；深色遮罩/边框/按钮单独核。
- 作者 className 只落 `vamis-node`；不要给 DialogContent 写死 `max-w-none`。

## 6. 当前状态

- 打开/关闭/压栈、data 映射、标题/内容/actions、尺寸/窄屏、Esc/遮罩开关、弹层表单确认与 `close: false` 已对齐。
- 多级弹层同时保留可见层，按 Amis `Modal--Nth` 30px 步进；`close: "name"` 可关闭目标层及子层。
- 关闭控件只有 1 枚，DOM 位于 `DialogHeader` 内，盒模型对齐 Amis `Modal-close` 的 16×22 / 16px 图标；无标题时 header 仍保留关闭控件。
- confirm/cancel 事件统一派发并支持 `preventDefault()`；feedback 会等待关闭，并支持 `skipRestOnCancel` / `skipRestOnConfirm`。
- feedback 的 `visibleOn`、confirm/cancel 和关闭层级只决定二级弹框是否出现；外层 Form 的成功 toast 由 Form 提交结果决定。`/api/mock2/form/initData` 的空 `msg` 不应被补成“保存成功”，否则会在 Amis 无提示的 feedback 示例中多出一条 toast。
- `setValue` 可按 Dialog id 更新弹层数据，支持覆盖；Dialog body 有 Form 时，footer 的 AJAX / confirm Action 会先委派给 Form，Form body overlay 与 `Dialog-info` 小 Spinner 同时出现。没有 Form 时才只有 `Dialog-info`；Action 数量不能决定 Spinner 数量。
- 未设置 `title` 时按 Amis `Dialog.defaultProps.title` 使用 locale 默认“弹框”；显式 `title: false` / `title: ''` 才关闭标题。
- Form 自己的 body Action 由 `Form.handleAction` 接管，只显示 Form body overlay，不额外点亮 Dialog-info；Dialog body 直接挂的、Form 外部的 Action 才由 Dialog sensor 接管。
- Amis 6.13.0 调用链：`ActionRenderer.handleAction` 返回 Promise → `Dialog.handleAction` 的 `tryChildrenToHandle` 优先找 Form/CRUD/Wizard → `Form.doAction/handleAction` 的 AJAX/API 分支设置 `FormStore.saving`，同时 Dialog 设置 `ModalStore.busying` → Form body `Spinner show={store.loading}` + Dialog footer `Dialog-info` `Spinner size="sm"`。confirm 分支则先转成 `actionType: submit` 后走同一条 Form 链。Form body Spinner 在接口请求结束时结束；Dialog `busying` 覆盖整个 Form Promise，包含 feedback Dialog 的等待，因此二级弹框未关闭时第一层 `Dialog-info` 必须继续显示。
- 验证失败时 `store.errors[name]` 落 FormItem 的 `is-error`，控件红框由 `--destructive` 驱动；Dialog footer 动态生成 `Dialog-error`，文案使用 `Form.validateFailed` locale（中文“依赖的部分字段没有通过验证”）。与 Amis `tryChildrenToHandle.catch` 一致，error 设置后 3 秒自动清空 `Dialog-info`，每层独立 timer，关闭 / 重开 / 卸载时取消旧 timer。
- 拖拽使用视口绝对坐标与 10px 安全边距，连续拖拽不累计、不越界；resize 后自动回夹。Dialog 拖拽关闭 shadcn enter/zoom/transition，pointer 与盒子 1:1 跟手。
- 盒模型实测对齐 `_modal.scss`：flex column、content 24px 纵向 padding、header/title 21px、body 16/24 margin 与 24px 横向 padding、6px 圆角、背景遮罩 0.7。Vamis 的 3px focus glow 通过 body 内侧 3px 呼吸位保留。
- 文档 23 个 schema 围栏按 Amis 顺序核查：feedback、表单内反馈、取消 / 确认中断、条件 feedback 和 Esc / 外部关闭均使用 Amis 原始 schema；独立“拖拽弹框”示例归回 `draggable` 属性与数据映射示例。
- 对照：桌面 / 移动均 **22 / 23**，P0 0；剩余 1 条是 CRUD 列按钮的 schema-tree 定位假阴性，页面实际可点击。

## 7. 验收计划与完成度

### 验收清单（12 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] OverlayHost / overlay / actions 文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [x] schema 属性 / 默认值逐项核对
- [x] 事件 / 动作逐项核对
- [x] 边界用例逐项核对
- [x] 组件页活示例运行、无 console error
- [x] `pnpm test`（Dialog 相关）
- [x] `pnpm typecheck` 0
- [x] `pnpm compare --page dialog` 桌面
- [x] `pnpm compare --page dialog --mobile`
- [x] 深色 / 375px 窄屏

### 验收重点

- 关闭方式 × 数据恢复
- 弹层表单确认失败不关闭
- 多级压栈
- 字号/尺寸/窄屏
- confirm/cancel 事件缺口

## 8. 后续

1. 修复对照 harness 对 CRUD 列内 Action 的 schema-tree 定位，消除最后 1 条假阴性。
2. 在 Dialog 稳定后继续 Select 的 `selectMode` / `deferApi`。

---

返回 [组件设计索引](../README.md)
