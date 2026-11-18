# Drawer 抽屉 · `drawer` 设计

> 状态：**进行中 88%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/drawer) · Amis：`/zh-CN/components/drawer`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

和 Dialog 一样，`type: drawer` 只是内嵌预览壳（34 行）；真正的抽屉由 `actionType: drawer` 打开、`OverlayHost` + `Sheet` 渲染。Drawer 的独特处是**方向/尺寸/遮罩/可拖拽调整大小**；当前已接方向、尺寸、遮罩开关，resizable 未接。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **打开入口**：`actionType: drawer` / `drawer` 动作打开；`type: drawer` 仅预览。
2. **方向/尺寸**：`position` 默认 right，支持 left/top/bottom；`size` 空=400px，xs/sm/md/lg/xl；width/height 自定义。方向决定宽/高和 max 尺寸，不要只改一侧。
3. **遮罩/关闭**：`overlay` 默认 true；`showCloseButton` 默认 true；`closeOnEsc` / `closeOnOutside` 默认 false；点遮罩/Esc 可阻止。
4. **压栈/数据域**：与 Dialog 共用 overlay 栈；子层 merge 父层数据，关闭恢复；弹层表单/确认/取消语义同 Dialog。
5. **可拖拽调整大小**：文档目标能力；当前未接，不能按属性表声称可用。
6. **移动端**：窄屏抽屉按方向拉满/限宽；不要用 Dialog 的居中逻辑套抽屉。
7. **包边界**：无 `<style>`、无直接 fetch；Sheet/overlay token。

### 1.2 边界用例

- right/left/top/bottom × size 空/xs/sm/md/lg/xl
- width/height 自定义、窄屏
- overlay true/false、showCloseButton false
- Esc/遮罩开/关
- 多级抽屉压栈、关闭恢复数据
- body 为 form：提交/校验/确认/取消
- actions 默认/自定义/[]
- 深色、长内容滚动、焦点归还
- resizable 未接的降级

### 1.3 优先级

1. 打开/关闭/压栈/数据域
2. 方向/尺寸/遮罩/关闭
3. 表单绑定与确认/取消
4. resizable / 移动端
5. 样式/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Drawer.tsx` 1059 行；Vamis Drawer.vue 34 行 + OverlayHost/overlay）
- 依赖：`action`、`form`、`button`、`sheet`、`overlay`
- 风险：方向/尺寸组合、压栈、表单绑定跨文件

## 3. Amis 契约

### 3.1 入口

- 弹层：`actionType: drawer`（或 `drawer` 动作）
- 内嵌预览：`type: 'drawer'`
- Amis 渲染器：`packages/amis/src/renderers/Drawer.tsx`
- 在线文档：[Vamis `/components/drawer`](/components/drawer)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 现状 |
|---|---|---|
| `position` | left/right/top/bottom | 已接，默认 right |
| `size` | xs/sm/md/lg/xl/空 | 已接，空 400px |
| `width` / `height` | 自定义尺寸 | 部分接（overlayFrameStyle） |
| `overlay` | 遮罩 | 默认 true |
| `showCloseButton` | 关闭 X | 默认 true |
| `closeOnEsc` / `closeOnOutside` | 关闭方式 | 默认 false |
| `actions` | 底部按钮 | 默认关闭+确认 |
| `data` | 抽屉数据 | merge 父层，关闭恢复 |
| `resizable` | 拖拽调整大小 | **未接** |
| `feedback` / 提交回写 | 目标能力 | 未完整 |

### 3.3 事件/动作

- 文档目标：`confirm` / `cancel`。
- 当前与 Dialog 共用 core action：`confirm` 先 `submitDialogForm` 再关闭；`cancel/close` 关闭当前层；**未统一派发 confirm/cancel 事件**。
- 关闭 X/Esc/遮罩走 overlay close，不触发 action confirm。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Drawer.vue`](../../../packages/vamis/src/renderers/Drawer.vue) | 仅 `type: drawer` 内嵌预览 |
| [`OverlayHost.vue`](../../../packages/vamis/src/OverlayHost.vue) | Sheet、方向/尺寸、遮罩/Esc/关闭、SchemaRenderer |
| [`overlay.ts`](../../../packages/vamis-core/src/overlay.ts) | 压栈/数据/关闭 |
| [`actions/run.ts`](../../../packages/vamis-core/src/actions/run.ts) | `drawer` / `closeDrawer` / `confirm` / `cancel` |
| [`drawer.ts`](../../../packages/vamis-core/src/utils/drawer.ts) | position/size/title/body/actions 纯函数 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | drawer/Sheet token |

### 4.2 数据流

```text
actionType: drawer
  → runAction('drawer') → overlay.openDrawer(schema, data)
  → OverlayHost: Sheet + SchemaRenderer(body/actions, extra=overlay.data)
  → confirm: submitDialogForm? → closeDrawer()
  → cancel/close/X/Esc/outside: closeDrawer()
```

- Drawer 没有返回值 Promise（与 Dialog 不同）；数据回写靠表单/动作。
- 多级抽屉共用栈；关闭当前层恢复上一层。
- 方向决定 width/height 限制；top/bottom 用高度。

## 5. 样式与边界

- 默认类：`.vamis-drawer`、Sheet 尺寸/方向相关；渲染器无 `<style>`。
- 尺寸/方向/遮罩/底栏走 token；深色单独核。
- 窄屏抽屉按方向铺满/限宽；长内容滚动区在 body。
- 作者 className 只落 `vamis-node`。

## 6. 当前状态与缺口

- 已对齐：position/size/overlay/showCloseButton/closeOnEsc/closeOnOutside、actions、body 表单、压栈、数据合并。
- 缺口：resizable 未接；confirm/cancel 事件未统一；feedback/提交回写未完整；多级抽屉/深色/焦点未逐项核。
- 对照：TODO 记录 drawer 主路径；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] OverlayHost / overlay / drawer 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（confirm/cancel 未统一）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Drawer 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page drawer` 桌面
- [ ] `pnpm compare --page drawer --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 四个方向 × 尺寸
- 遮罩/Esc/关闭按钮
- 多级压栈与数据恢复
- body form 提交/取消
- resizable 缺口

## 8. 后续

1. 补 resizable（需定拖拽边界/最小尺寸/持久化）。
2. 统一 confirm/cancel 事件（与 Dialog 共用）。
3. 多级抽屉焦点/深色/窄屏专项。

---

返回 [组件设计索引](README.md)
