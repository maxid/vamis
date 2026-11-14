# SDK 对照报告

- 日期：2026-11-14
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **11** · 通过 **6** · 失败 **5**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 0 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 15 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（0）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- 无。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（15）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-components-card-0` page/body/0:card/body/3:input-number.rendered: Amis `false` / Vamis `true`
- `src-components-card-0` page/body/0:card/body/3:input-number.named: Amis `false` / Vamis `true`
- `src-components-card-0` page/body/0:card/actions/0:button.rendered: Amis `false` / Vamis `true`
- `src-components-card-0` page/body/0:card/actions/0:button.dialog: Amis `false` / Vamis `true`
- `src-components-card-0` page/body/0:card/actions/1:button.rendered: Amis `false` / Vamis `true`
- `src-components-card-0` page/body/0:card/actions/1:button.dialog: Amis `false` / Vamis `true`
- `src-components-card-0` fontWeight: Amis `400` / Vamis `500`
- `src-components-card-1` page/body/0:card/body/3:input-number.named: Amis `false` / Vamis `true`
- `src-components-card-5` page/body/0:card/actions/2:dropdown-button/buttons/0:button.rendered: Amis `true` / Vamis `false`
- `src-components-card-5` page/body/0:card/actions/2:dropdown-button/buttons/0:button.dialog: Amis `true` / Vamis `false`
- `src-components-card-5` page/body/0:card/actions/2:dropdown-button/buttons/1:button.rendered: Amis `true` / Vamis `false`
- `src-components-card-6` page/body/0:card/actions/2:dropdown-button/buttons/0:button.rendered: Amis `true` / Vamis `false`
- …其余 3 条见 last-report.json

整改：
- schema 树该结点要能在 DOM 里定位（name / label）。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。
- 点一下后动作效果应对齐 Amis（dialog / toast / setValue）。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 11 | 5 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据展示 | 11 | 5 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `src-components-card-0` Card 卡片 #1 — page/body/0:card/body/3:input-number.rendered: Amis `false` / Vamis `true`；page/body/0:card/body/3:input-number.named: Amis `false` / Vamis `true`；page/body/0:card/actions/0:button.rendered: Amis `false` / Vamis `true`；page/body/0:card/actions/0:button.dialog: Amis `false` / Vamis `true`；page/body/0:card/actions/1:button.rendered: Amis `false` / Vamis `true`；page/body/0:card/actions/1:button.dialog: Amis `false` / Vamis `true`
- `src-components-card-1` Card 卡片 #2 — page/body/0:card/body/3:input-number.named: Amis `false` / Vamis `true`
- `src-components-card-5` Card 卡片 #6 — page/body/0:card/actions/2:dropdown-button/buttons/0:button.rendered: Amis `true` / Vamis `false`；page/body/0:card/actions/2:dropdown-button/buttons/0:button.dialog: Amis `true` / Vamis `false`；page/body/0:card/actions/2:dropdown-button/buttons/1:button.rendered: Amis `true` / Vamis `false`
- `src-components-card-6` Card 卡片 #7 — page/body/0:card/actions/2:dropdown-button/buttons/0:button.rendered: Amis `true` / Vamis `false`；page/body/0:card/actions/2:dropdown-button/buttons/0:button.dialog: Amis `true` / Vamis `false`；page/body/0:card/actions/2:dropdown-button/buttons/1:button.rendered: Amis `true` / Vamis `false`
- `src-components-card-10` Card 卡片 #11 — page/body/0:card/toolbar/1:dropdown-button/buttons/1:button.rendered: Amis `false` / Vamis `true`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --page "src-components-card-0"` — 只重跑「src-components-card-0」自身
- `pnpm compare --page "src-components-card-1"` — 只重跑「src-components-card-1」自身
- `pnpm compare --page "src-components-card-5"` — 只重跑「src-components-card-5」自身
- `pnpm compare --page "src-components-card-6"` — 只重跑「src-components-card-6」自身
- `pnpm compare --page "src-components-card-10"` — 只重跑「src-components-card-10」自身

