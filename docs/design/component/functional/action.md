# Action 行为按钮 · `action` 设计

> 状态：**进行中 95%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/action) · Amis：`/zh-CN/components/action`
> 盘点日期：2026-11-18。本文是**研发设计文档**；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Action 不是普通按钮，是 Vamis 的**行为枢纽**：按钮/链接/菜单项只是外观，真正复杂的是 `actionType` 分支、事件拦截、确认/弹层/请求/复制/下载/倒计时/热键/容器模式。改 Action 的任何一处，都要同时考虑按钮、`button` 别名、Card/Dropdown 菜单项和 toolbar 里的同一份 Action.vue。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **点击时序**：`onClick`（trusted JS）→ `runOnEvent('click')` → 若 `event.prevented` 则不执行 action → `runAction({ actionType: kind })` → 成功后启动倒计时。顺序不能反。
2. **事件对象**：所有分支共用 `makeCtx` 的 `createVamisEvent` / `eventEvalData`；`click` / `mouseenter` / `mouseleave` 都要带 `event.data`，不要各拼一套。
3. **动作分支**：`actionType` 可来自 `kind`（`button` / `submit` / `reset` / `link` / `url` / `dialog` / `drawer` / `ajax` / `toast` / `copy` / `download` / `saveAs` / `email` / `confirm` 等）；具体执行在 core `runAction`，Action.vue 只做入口、禁用、loading、确认前状态。
4. **disabled / loading / countdown**：任一为真都不能执行 action；倒计时按 storage key 跨 mount 恢复，卸载清 timer；热键全局监听要清理。
5. **Tooltip 层级**：`tooltip` / `disabledTip` 走 `VamisOverlay`（`--z-tooltip` 1600），不能裁切；hover/click/focus 触发与 enterable 行为由 tooltip helper 统一。
6. **容器模式**：Action 可当容器（`body` / 子 schema）；容器自身不再触发点击 action，子节点由 `SchemaRenderer` 渲染。
7. **别名/宿主一致性**：`button` / `submit` / `reset` 是 Action 别名；Card action、Dropdown menu item、Table item action 复用同一渲染器，不能各写一套 action 语义。

### 1.2 边界用例

- `actionType` 缺失 / 未知；`kind` 与显式 `actionType` 冲突
- `event.preventDefault` 阻止点击 action；`onClick` JS 非 trusted / 抛错
- disabled + tooltip、loading + tooltip、倒计时中再次点击
- confirm 取消 / dialog 打开 / drawer 打开 / ajax 失败 / redirect / feedback
- copy 空内容 / 剪贴板拒绝；download/saveAs 无 url；email/link 空 href
- 热键重复绑定 / 卸载清理；倒计时跨 mount
- 容器 Action 内嵌 Action；Card/Dropdown/Table 行内复用
- 窄屏 icon-only、深色、菜单项样式

### 1.3 优先级

1. 点击/事件时序与 preventDefault
2. actionType 分支 + confirm/dialog/drawer/ajax
3. disabled/loading/countdown/hotkey
4. Tooltip/容器/宿主样式
5. 图标、菜单项、深色/窄屏

## 2. 复杂度

- 等级：**XL 特重**（Amis `Action.tsx` 781 行；Vamis 391 行 + core `actions/run.ts`）
- 依赖：`badge`、`icon`、`toast`、`tooltip-wrapper`、`tpl`
- 关键风险：行为分支多、确认/浮层/请求跨 core，回归面比 UI 大

## 3. Amis 契约

### 3.1 入口与源码

- 入口：`type: 'action'`，别名 `button` / `submit` / `reset`
- Amis 渲染器：`packages/amis/src/renderers/Action.tsx`
- 在线文档：[Vamis `/components/action`](/components/action) / Amis `/zh-CN/components/action`

### 3.2 外观/状态（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `label` / `icon` / `rightIcon` / `iconOnly` | 文案与图标 | 空 label + icon 默认方形 32×32；`level: link` 除外 |
| `level` / `primary` / `size` / `block` | 主题、尺寸、铺满 | 走 Button token；不要用 Action 自算 px |
| `loading` / `loadingOn` | loading 态 | loading 时禁用 action |
| `active` / `activeLevel` | 激活态 | 只影响外观，不触发 action |
| `disabled` / `disabledTip` | 禁用与提示 | disabled 时仍可显示 tooltip |
| `tooltip` / `tooltipPlacement` | 提示 | `VamisOverlay`，`--z-tooltip` 1600 |
| `countDown` | 倒计时 | storage 恢复、timer 清理；倒计时中禁用 |
| `hotKey` | 全局快捷键 | window keydown；卸载移除 |
| `body` / `children` | 容器模式 | 子节点递归，容器不执行自身 action |
| `className` / `style` | 作者覆盖 | 只落 `div.vamis-node`，不替代默认皮肤 |

### 3.3 行为类型（由 core `runAction` 执行）

- `button` / `submit` / `reset`：表单提交/重置（由 form API 承接）
- `link` / `url` / `email`：跳转（`blank`、`htmlTarget`）
- `dialog` / `drawer`：浮层打开；确认/关闭/回写由 overlay 壳
- `ajax`：`requestApi`；`redirect` / `feedback` / loading
- `toast`：轻提示；`copy` / `download` / `saveAs`：剪贴板/文件
- `confirm`：确认 Modal；取消不执行后续
- 控制流：`switch` / `loop` / `parallel` 已接（D4 P1 之外）
- 未接/风险：按名字关闭祖先浮层、`nextCondition`、input-table 增行

### 3.4 事件

| 事件 | 参数 | 说明 |
|---|---|---|
| `click` | item / native event / data | 可 `preventDefault` 阻止 action |
| `mouseenter` | item / native | hover 触发；disabled 不派发 |
| `mouseleave` | item / native | hover 离开 |

`onClick` 字符串 JS 只在 `env.trusted` 执行；非 trusted 直接跳过，不当作普通 action。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Action.vue`](../../../../packages/vamis/src/renderers/Action.vue) | 点击/热键/倒计时/tooltip/容器、label/icon/loading 外观 |
| [`actions/run.ts`](../../../../packages/vamis-core/src/actions/run.ts) | `runAction` / `runActions`：confirm、dialog、ajax、toast、copy、link、控制流 |
| [`actions/event.ts`](../../../../packages/vamis-core/src/actions/event.ts) | 事件对象、preventDefault、trusted 判定 |
| [`action.ts` 工具](https://github.com/baidu/amis) | core 的 `actionKind` / `actionShowLabel` / `actionTooltipConfig` 等纯函数 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | Button/Action、Card action、Dropdown action、菜单项样式 |

### 4.2 点击链

```text
click / hotKey
  → disabled? loading? countdown? → return
  → onClick(trusted JS)  [false → return]
  → createVamisEvent + runOnEvent('click')
      → event.prevented? → return
  → runAction({ ...schema, actionType: kind })
      → confirm/dialog/drawer/ajax/toast/copy/link/...
  → success → startCountDown()
```

### 4.3 宿主差异

- 普通按钮：Button 外观 + 默认 action。
- `button` / `submit` / `reset`：别名，表单里 `submit` 是 native submit；嵌套 form 用 button + form.submit。
- Card action：`__cardAction` 标记，外观/语义仍走 Action.vue。
- Dropdown menu item：`isMenuItem` 影响布局/样式，不改变 action 分支。
- Table item action / toolbar action：数据域来自行/页面，action ctx 必须取当前 `useData`。

## 5. 样式与边界

- 默认皮肤类：`.vamis-card-action`、`.vamis-dropdown-action`（以及 Button 的 `.vamis-button` 系）。
- 渲染器无 `<style>`；按钮尺寸/主题走 Button token；不要给 Action 新增写死尺寸。
- `iconOnly` / 空 label / countdown 文案 / loading 文案切换要同时测 xs–lg。
- Tooltip 走 Overlay token，深色和 `--z-tooltip` 1600 用同一套；不要用 shadcn Tooltip 冒充。

## 6. 当前状态与缺口

- TODO：主路径 95%；`actionType`、level/size/icon、confirm、dialog/drawer、ajax、toast、copy、link/url/email/download/saveAs、countDown/hotKey、容器、tooltip/disabledTip、click/mouseenter/mouseleave、loading/active、clear/reset-and-submit 已对齐。
- 缺：按名字关闭祖先浮层、`nextCondition`、input-table 增行。
- 对照：TODO 记录 action 主路径；**本轮未重跑** `pnpm compare --page action`。
- 差异：`onClick` JS 只在 trusted 执行；Action 作为容器时子节点自己触发 action，不继承父点击。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口源码 / 文档章节已定位
- [x] Vamis 渲染器 / core actions 文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（Action/actions 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page action` 桌面
- [ ] `pnpm compare --page action --mobile`
- [ ] 深色 / 375px / 菜单项核对

### 验收重点

- preventDefault 是否真的阻止 action（不是只阻止 native）
- confirm/dialog/drawer/ajax 失败/取消都不残留 loading
- 倒计时/热键卸载清理
- Card/Dropdown/Table 三个宿主外观与数据域
- Tooltip 在 disabled/loading/countdown 下仍可见

## 8. 后续

1. 先补 `nextCondition` / 按名字关闭祖先浮层（需要 overlay 栈命名契约）。
2. input-table 增行归属 Action 还是 InputTable，先定边界再做。
3. 深色、菜单项、窄屏 icon-only 单独立项，不与 action 分支混刀。

---

返回 [组件设计索引](../README.md)
