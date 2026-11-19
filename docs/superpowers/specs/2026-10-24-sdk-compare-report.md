# SDK 对照报告

- 日期：2026-11-19
- 视口：移动 375×812（Amis <768 表单）
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **25** · 通过 **24** · 失败 **1**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 6 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 8 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（6）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-components-dialog-3` fontSize: Amis `16px` / Vamis `14px`
- `src-components-dialog-5` fontSize: Amis `12px` / Vamis `14px`
- `src-components-dialog-10` fontSize: Amis `12px` / Vamis `14px`
- `src-components-dialog-11` fontSize: Amis `12px` / Vamis `14px`
- `src-components-dialog-14` fontSize: Amis `12px` / Vamis `14px`
- `src-components-dialog-21` fontSize: Amis `12px` / Vamis `14px`

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（8）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-components-dialog-2` page/body/0:crud/columns/6:button.rendered: Amis `true` / Vamis `false`
- `src-components-dialog-3` lineHeight: Amis `24px` / Vamis `32px`
- `src-components-dialog-5` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-dialog-10` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-dialog-11` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-dialog-14` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-dialog-20` lineHeight: Amis `18px` / Vamis `21px`
- `src-components-dialog-21` lineHeight: Amis `24px` / Vamis `21px`

整改：
- schema 树该结点要能在 DOM 里定位（name / label）。
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 25 | 1 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 反馈 | 25 | 1 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `src-components-dialog-2` Dialog 对话框 #3 — page/body/0:crud/columns/6:button.rendered: Amis `true` / Vamis `false`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --page "src-components-dialog-2" --mobile` — 只重跑「src-components-dialog-2」自身

