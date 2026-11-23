# SDK 对照报告

- 日期：2026-11-22
- 视口：移动 375×812（Amis <768 表单）
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **16** · 通过 **14** · 失败 **2**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 0 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 2 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（0）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- 无。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（2）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `components-form-treeselect-14` page/body/0:form/body/0:tree-select.rendered: Amis `false` / Vamis `true`
- `components-form-treeselect-15` page/body/0:form/body/0:tree-select.rendered: Amis `false` / Vamis `true`

整改：
- schema 树该结点要能在 DOM 里定位（name / label）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 16 | 2 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据输入 | 16 | 2 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `components-form-treeselect-14` TreeSelect 树形选择器 #15 — page/body/0:form/body/0:tree-select.rendered: Amis `false` / Vamis `true`
- `components-form-treeselect-15` TreeSelect 树形选择器 #16 — page/body/0:form/body/0:tree-select.rendered: Amis `false` / Vamis `true`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --page "components-form-treeselect-14" --mobile` — 只重跑「components-form-treeselect-14」自身
- `pnpm compare --page "components-form-treeselect-15" --mobile` — 只重跑「components-form-treeselect-15」自身

