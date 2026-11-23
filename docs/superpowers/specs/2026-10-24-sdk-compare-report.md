# SDK 对照报告

- 日期：2026-11-23
- 视口：移动 375×812（Amis <768 表单）
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **31** · 通过 **26** · 失败 **5**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 2 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 10 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（2）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `components-form-input-tree-18` fontSize: Amis `14px` / Vamis `16px`
- `components-form-input-tree-19` fontSize: Amis `12px` / Vamis `16px`

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（10）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `components-form-input-tree-18` lineHeight: Amis `18px` / Vamis `24px`
- `components-form-input-tree-19` page/body/0:form/body/0:input-tree/toolbar/0:button.toast: Amis `true` / Vamis `false`
- `components-form-input-tree-20` page/aside/0:flex/items/0:input-tree.rendered: Amis `false` / Vamis `true`
- `components-form-input-tree-20` page/aside/0:flex/items/0:input-tree.named: Amis `false` / Vamis `true`
- `components-form-input-tree-20` page/aside/0:flex/items/0:input-tree.value: Amis `` / Vamis `Folder A`
- `components-form-input-tree-28` page/body/0:form/body/0:input-tree.rendered: Amis `false` / Vamis `true`
- `components-form-input-tree-29` page/body/0:form/body/0:input-tree.rendered: Amis `false` / Vamis `true`
- `components-form-input-tree-30` page/body/0:form/body/0:search-box.rendered: Amis `true` / Vamis `false`
- `components-form-input-tree-30` page/body/0:form/body/1:input-tree.rendered: Amis `false` / Vamis `true`
- `components-form-input-tree-30` page/body/0:form/body/1:input-tree.value: Amis `` / Vamis `Folder Afile Afile Bfile Cfile D`

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- 点一下后动作效果应对齐 Amis（dialog / toast / setValue）。
- schema 树该结点要能在 DOM 里定位（name / label）。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 31 | 5 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据输入 | 31 | 5 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `components-form-input-tree-19` InputTree 树形选择框 #20 — page/body/0:form/body/0:input-tree/toolbar/0:button.toast: Amis `true` / Vamis `false`
- `components-form-input-tree-20` InputTree 树形选择框 #21 — page/aside/0:flex/items/0:input-tree.rendered: Amis `false` / Vamis `true`；page/aside/0:flex/items/0:input-tree.named: Amis `false` / Vamis `true`；page/aside/0:flex/items/0:input-tree.value: Amis `` / Vamis `Folder A`
- `components-form-input-tree-28` InputTree 树形选择框 #29 — page/body/0:form/body/0:input-tree.rendered: Amis `false` / Vamis `true`
- `components-form-input-tree-29` InputTree 树形选择框 #30 — page/body/0:form/body/0:input-tree.rendered: Amis `false` / Vamis `true`
- `components-form-input-tree-30` InputTree 树形选择框 #31 — page/body/0:form/body/0:search-box.rendered: Amis `true` / Vamis `false`；page/body/0:form/body/1:input-tree.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-tree.value: Amis `` / Vamis `Folder Afile Afile Bfile Cfile D`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --mobile` — 全局修完必须重跑全部移动端用例
- `pnpm compare --page "components-form-input-tree-19" --mobile` — 只重跑「components-form-input-tree-19」自身
- `pnpm compare --page "components-form-input-tree-20" --mobile` — 只重跑「components-form-input-tree-20」自身
- `pnpm compare --page "components-form-input-tree-28" --mobile` — 只重跑「components-form-input-tree-28」自身
- `pnpm compare --page "components-form-input-tree-29" --mobile` — 只重跑「components-form-input-tree-29」自身
- `pnpm compare --page "components-form-input-tree-30" --mobile` — 只重跑「components-form-input-tree-30」自身

