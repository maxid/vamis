# SDK 对照报告

- 日期：2026-10-24
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。
- 合计 **14** · 通过 **13** · 失败 **1**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 37 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 30 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（37）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-components-action-0` fontSize: Amis `14px` / Vamis `24px`
- `src-components-action-0` fontFamily: Amis `Helvetica Neue` / Vamis `system-ui`
- `src-components-action-0` bodyFont: Amis `Times` / Vamis `Helvetica Neue`
- `src-components-app-0` fontSize: Amis `12px` / Vamis `14px`
- `src-components-app-0` bodyFont: Amis `Times` / Vamis `Helvetica Neue`
- `button-level-primary` bodyFont: Amis `Times` / Vamis `Helvetica Neue`
- `src-components-button-0` fontSize: Amis `16px` / Vamis `24px`
- `src-components-button-0` fontFamily: Amis `Helvetica Neue` / Vamis `system-ui`
- `src-components-button-0` bodyFont: Amis `Times` / Vamis `Helvetica Neue`
- `style-two-buttons` bodyFont: Amis `Times` / Vamis `Helvetica Neue`
- `src-components-button-group-0` fontSize: Amis `16px` / Vamis `24px`
- `src-components-button-group-0` fontFamily: Amis `Helvetica Neue` / Vamis `system-ui`
- …其余 25 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。
- Amis SDK 把 html/body 钉成 PingFang SC；Vamis 走 --fonts-base-family 长栈，实际落到 Helvetica Neue。在 sdk 根 / embed 的 html,body 对齐 Amis 默认中文栈。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（30）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-components-action-0` page/body/0:action.rendered: Amis `false` / Vamis `true`
- `src-components-action-0` page/body/0:action.value: Amis `` / Vamis `弹出提示`
- `src-components-action-0` page/body/0:action.toast: Amis `false` / Vamis `true`
- `src-components-action-0` lineHeight: Amis `21px` / Vamis `32px`
- `src-components-action-0` fontWeight: Amis `400` / Vamis `600`
- `src-components-app-0` lineHeight: Amis `18px` / Vamis `20px`
- `button-level-primary` lineHeight: Amis `21px` / Vamis `20px`
- `button-level-primary` fontWeight: Amis `400` / Vamis `500`
- `src-components-button-0` lineHeight: Amis `24px` / Vamis `32px`
- `src-components-button-0` fontWeight: Amis `400` / Vamis `600`
- `style-two-buttons` lineHeight: Amis `21px` / Vamis `20px`
- `style-two-buttons` fontWeight: Amis `400` / Vamis `500`
- …其余 18 条见 last-report.json

整改：
- schema 树该结点要能在 DOM 里定位（name / label）。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- 点一下后动作效果应对齐 Amis（dialog / toast / setValue）。
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 14 | 1 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 功能 | 14 | 1 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `src-components-action-0` Action 行为按钮 #1 — page/body/0:action.rendered: Amis `false` / Vamis `true`；page/body/0:action.value: Amis `` / Vamis `弹出提示`；page/body/0:action.toast: Amis `false` / Vamis `true`

迭代：按 Amis 侧栏逐项实现 → `pnpm compare --bucket 样式 --section Spacing`（或 `compare:p0`）→ 评审报告 → 下一页。Vamis 样式可以比 Amis 多。`pnpm compare:p0` 是盒模型门禁。
