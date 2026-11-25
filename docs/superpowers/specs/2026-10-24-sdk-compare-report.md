# SDK 对照报告

- 日期：2026-11-25
- 视口：移动 375×812（Amis <768 表单）
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **92** · 通过 **64** · 失败 **28**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 45 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 131 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（45）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-components-crud-6` fontSize: Amis `16px` / Vamis `14px`
- `src-components-crud-7` fontSize: Amis `16px` / Vamis `14px`
- `src-components-crud-10` fontSize: Amis `16px` / Vamis `14px`
- `src-components-crud-10` fontFamily: Amis `Helvetica Neue` / Vamis `Menlo`
- `src-components-crud-28` fontSize: Amis `16px` / Vamis `14px`
- `src-components-crud-34` fontSize: Amis `14px` / Vamis `12px`
- `src-components-crud-36` fontSize: Amis `14px` / Vamis `12px`
- `src-components-crud-37` fontSize: Amis `14px` / Vamis `12px`
- `src-components-crud-38` fontSize: Amis `14px` / Vamis `12px`
- `src-components-crud-39` fontSize: Amis `14px` / Vamis `12px`
- `src-components-crud-40` fontSize: Amis `14px` / Vamis `12px`
- `src-components-crud-41` fontSize: Amis `14px` / Vamis `12px`
- …其余 33 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。
- Amis 6.13 组件字栈是 --fonts-base-family（实测 Helvetica Neue）；html/body 未钉字族（body 是 Times）。只在 .vamis-root / .vamis-sdk 走 --fonts-base-family，不要把 html/body 钉成 PingFang SC。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（131）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-components-crud-6` lineHeight: Amis `30px` / Vamis `21px`
- `src-components-crud-8` page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-9` page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-10` page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-10` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-crud-10` fontWeight: Amis `400` / Vamis `700`
- `src-components-crud-11` lineHeight: Amis `32px` / Vamis `21px`
- `src-components-crud-12` page/body/0:form/body/0:group/body/1:input-text.value: Amis `amis` / Vamis ``
- `src-components-crud-12` page/body/1:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-12` page/body/2:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-28` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-crud-29` page/body/0:crud.named: Amis `false` / Vamis `true`
- …其余 119 条见 last-report.json

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- schema 树该结点要能在 DOM 里定位（name / label）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 92 | 28 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据展示 | 92 | 28 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `src-components-crud-8` CRUD 增删改查 #9 — page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-9` CRUD 增删改查 #10 — page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-10` CRUD 增删改查 #11 — page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-12` CRUD 增删改查 #13 — page/body/0:form/body/0:group/body/1:input-text.value: Amis `amis` / Vamis ``；page/body/1:crud.named: Amis `false` / Vamis `true`；page/body/2:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-29` CRUD 增删改查 #30 — page/body/0:crud.named: Amis `false` / Vamis `true`
- `src-components-crud-34` CRUD 增删改查 #35 — page/body/0:crud/headerToolbar/0:search-box.rendered: Amis `true` / Vamis `false`
- `src-components-crud-42` CRUD 增删改查 #43 — page/body/0:crud/itemActions/0:button.rendered: Amis `true` / Vamis `false`；page/body/0:crud/itemActions/1:button.rendered: Amis `true` / Vamis `false`
- `src-components-crud-43` CRUD 增删改查 #44 — page/body/0:crud/itemActions/0:button.rendered: Amis `true` / Vamis `false`；page/body/0:crud/itemActions/1:button.rendered: Amis `true` / Vamis `false`
- `src-components-crud-47` CRUD 增删改查 #48 — page/body/0:crud/headerToolbar/0:export-csv.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-csv.value: Amis `全量导出 CSV` / Vamis ``
- `src-components-crud-48` CRUD 增删改查 #49 — page/body/0:crud/headerToolbar/0:export-csv.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-csv.value: Amis `自定义导出 CSV` / Vamis ``
- `src-components-crud-50` CRUD 增删改查 #51 — page/body/0:crud/headerToolbar/0:export-excel.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel.value: Amis `只导出 engine 和  browser 列` / Vamis ``
- `src-components-crud-51` CRUD 增删改查 #52 — page/body/0:crud/headerToolbar/0:export-excel.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel.value: Amis `只导出 engine 和  browser 列` / Vamis ``
- `src-components-crud-52` CRUD 增删改查 #53 — page/body/0:crud/headerToolbar/0:export-excel.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel.value: Amis `导出 Excel` / Vamis ``
- `src-components-crud-53` CRUD 增删改查 #54 — page/body/0:crud/headerToolbar/0:export-excel.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel.value: Amis `导出 1, 4, 5 行` / Vamis ``
- `src-components-crud-54` CRUD 增删改查 #55 — page/body/0:crud/headerToolbar/0:export-excel.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel.value: Amis `全量导出 Excel` / Vamis ``
- `src-components-crud-55` CRUD 增删改查 #56 — page/body/0:crud/headerToolbar/0:export-excel.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel.value: Amis `自定义导出 Excel` / Vamis ``
- `src-components-crud-56` CRUD 增删改查 #57 — page/body/0:crud/headerToolbar/0:export-excel-template.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/0:export-excel-template.value: Amis `导出 Excel 模板` / Vamis ``
- `src-components-crud-60` CRUD 增删改查 #61 — page/body/1:crud.rendered: Amis `false` / Vamis `true`；page/body/1:crud.named: Amis `false` / Vamis `true`；page/body/1:crud.value: Amis `` / Vamis `未知类型：bulkActions运行时没有对应渲染器，已占位，页面继续执行。 未知类型：reload运行时没有对应渲染器，已占位，页面继续执行。刷新(actionType)事件动作(onEvent)已选 0 未知类型：(missing type)运行时没有对应渲染器，已占位，页面继续执行。 未知类型：(missing type)运行时没有对应渲染器，已占位，页面继续执行。 ID Rendering engine Browser Platform(s) Engine version CSS grade 暂无数据`；page/body/1:crud/headerToolbar/1:reload.rendered: Amis `true` / Vamis `false`；page/body/1:crud/headerToolbar/1:reload.value: Amis `刷新(type)` / Vamis ``
- `src-components-crud-61` CRUD 增删改查 #62 — page/body/0:crud.rendered: Amis `false` / Vamis `true`；page/body/0:crud.named: Amis `false` / Vamis `true`；page/body/0:crud.value: Amis `` / Vamis `未知类型：bulkActions运行时没有对应渲染器，已占位，页面继续执行。 未知类型：reload运行时没有对应渲染器，已占位，页面继续执行。刷新(actionType)事件动作(onEvent)已选 0 未知类型：(missing type)运行时没有对应渲染器，已占位，页面继续执行。 未知类型：(missing type)运行时没有对应渲染器，已占位，页面继续执行。 ID Rendering engine Browser Platform(s) Engine version CSS grade 暂无数据`；page/body/0:crud/headerToolbar/1:reload.rendered: Amis `true` / Vamis `false`；page/body/0:crud/headerToolbar/1:reload.value: Amis `刷新(type)` / Vamis ``
- `src-components-crud-81` CRUD 增删改查 #82 — page/body/0:crud.rendered: Amis `false` / Vamis `true`；page/body/0:crud.value: Amis `` / Vamis `已选 0批量操作 ID Rendering engine Browser Platform(s) Engine version CSS grade 暂无数据`
- …其余 8 条见 `compare/last-report.json`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --mobile` — 全局修完必须重跑全部移动端用例
- `pnpm compare --page "src-components-crud-8" --mobile` — 只重跑「src-components-crud-8」自身
- `pnpm compare --page "src-components-crud-9" --mobile` — 只重跑「src-components-crud-9」自身
- `pnpm compare --page "src-components-crud-10" --mobile` — 只重跑「src-components-crud-10」自身
- `pnpm compare --page "src-components-crud-12" --mobile` — 只重跑「src-components-crud-12」自身
- `pnpm compare --page "src-components-crud-29" --mobile` — 只重跑「src-components-crud-29」自身
- `pnpm compare --page "src-components-crud-34" --mobile` — 只重跑「src-components-crud-34」自身
- `pnpm compare --page "src-components-crud-42" --mobile` — 只重跑「src-components-crud-42」自身
- `pnpm compare --page "src-components-crud-43" --mobile` — 只重跑「src-components-crud-43」自身
- `pnpm compare --page "src-components-crud-47" --mobile` — 只重跑「src-components-crud-47」自身
- `pnpm compare --page "src-components-crud-48" --mobile` — 只重跑「src-components-crud-48」自身
- `pnpm compare --page "src-components-crud-50" --mobile` — 只重跑「src-components-crud-50」自身
- `pnpm compare --page "src-components-crud-51" --mobile` — 只重跑「src-components-crud-51」自身
- `pnpm compare --page "src-components-crud-52" --mobile` — 只重跑「src-components-crud-52」自身
- `pnpm compare --page "src-components-crud-53" --mobile` — 只重跑「src-components-crud-53」自身
- `pnpm compare --page "src-components-crud-54" --mobile` — 只重跑「src-components-crud-54」自身
- `pnpm compare --page "src-components-crud-55" --mobile` — 只重跑「src-components-crud-55」自身
- `pnpm compare --page "src-components-crud-56" --mobile` — 只重跑「src-components-crud-56」自身
- `pnpm compare --page "src-components-crud-60" --mobile` — 只重跑「src-components-crud-60」自身
- `pnpm compare --page "src-components-crud-61" --mobile` — 只重跑「src-components-crud-61」自身
- `pnpm compare --page "src-components-crud-81" --mobile` — 只重跑「src-components-crud-81」自身
- `pnpm compare --page "src-components-crud-82" --mobile` — 只重跑「src-components-crud-82」自身
- `pnpm compare --page "src-components-crud-83" --mobile` — 只重跑「src-components-crud-83」自身
- `pnpm compare --page "src-components-crud-84" --mobile` — 只重跑「src-components-crud-84」自身
- `pnpm compare --page "src-components-crud-85" --mobile` — 只重跑「src-components-crud-85」自身
- `pnpm compare --page "src-components-crud-86" --mobile` — 只重跑「src-components-crud-86」自身
- `pnpm compare --page "src-components-crud-87" --mobile` — 只重跑「src-components-crud-87」自身
- `pnpm compare --page "src-components-crud-88" --mobile` — 只重跑「src-components-crud-88」自身
- `pnpm compare --page "src-components-crud-91" --mobile` — 只重跑「src-components-crud-91」自身

