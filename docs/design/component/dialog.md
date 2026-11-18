# Dialog 对话框 · `dialog` 设计

> 状态：**进行中 88%** · 复杂度：**XL 特重**
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
| [`Dialog.vue`](../../../packages/vamis/src/renderers/Dialog.vue) | 仅 `type: dialog` 内嵌预览（title/body/actions/尺寸） |
| [`OverlayHost.vue`](../../../packages/vamis/src/OverlayHost.vue) | 弹层/抽屉宿主、Dialog 原语、关闭按钮/Esc/遮罩、SchemaRenderer |
| [`overlay.ts`](../../../packages/vamis-core/src/overlay.ts) | 打开/关闭/压栈、DialogForm 注册/提交、数据合并 |
| [`actions/run.ts`](../../../packages/vamis-core/src/actions/run.ts) | `dialog` / `closeDialog` / `confirm` / `cancel` 动作 |
| [`dialog.ts`](../../../packages/vamis-core/src/utils/dialog.ts) | title/body/actions/size/close 纯函数 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | Dialog 尺寸/间距/按钮 token |

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

## 6. 当前状态与缺口

- 已对齐：打开/关闭/压栈、data 合并、标题/内容/actions、尺寸/窄屏、Esc/遮罩开关、弹层表单确认。
- 缺口：confirm/cancel 事件未统一派发；feedback 未完整；多级弹层同时错位/焦点、拖拽、像素级 cModal 未核；深色未逐章。
- 对照：TODO 记录 dialog 主路径；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] OverlayHost / overlay / actions 文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（confirm/cancel 未统一）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Dialog 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page dialog` 桌面
- [ ] `pnpm compare --page dialog --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 关闭方式 × 数据恢复
- 弹层表单确认失败不关闭
- 多级压栈
- 字号/尺寸/窄屏
- confirm/cancel 事件缺口

## 8. 后续

1. 统一 confirm/cancel 事件（payload + preventDefault）。
2. feedback / 表单提交回写单独立项。
3. 多级弹层焦点/错位与深色专项。

---

返回 [组件设计索引](README.md)
