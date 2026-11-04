# SDK 对照报告

- 日期：2026-11-04
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **24** · 通过 **23** · 失败 **1**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 24 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 50 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（24）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `components-form-formitem-0` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-1` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-2` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-3` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-4` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-5` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-6` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-7` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-8` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-9` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-10` fontSize: Amis `12px` / Vamis `14px`
- `components-form-formitem-11` fontSize: Amis `12px` / Vamis `14px`
- …其余 12 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（50）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `components-form-formitem-0` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-formitem-0` fontWeight: Amis `400` / Vamis `500`
- `components-form-formitem-1` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-formitem-1` fontWeight: Amis `400` / Vamis `500`
- `components-form-formitem-2` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-formitem-2` fontWeight: Amis `400` / Vamis `500`
- `components-form-formitem-3` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-formitem-3` fontWeight: Amis `400` / Vamis `500`
- `components-form-formitem-4` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-formitem-4` fontWeight: Amis `400` / Vamis `500`
- `components-form-formitem-5` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-formitem-5` fontWeight: Amis `400` / Vamis `500`
- …其余 38 条见 last-report.json

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- schema 树该结点要能在 DOM 里定位（name / label）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 24 | 1 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据输入 | 24 | 1 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `components-form-formitem-13` FormItem 表单项通用 #14 — page/body/0:form.value: Amis `` / Vamis `父表单为静态 static: truetext1value初始配置了static: true, 但是后续可以使用动作切换状态text1 切换状态-text3value无配置，跟随父表单变化父表单 切换状态-提交`；page/body/0:form/body/0:input-text.rendered: Amis `false` / Vamis `true`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare` — 全局修完必须重跑全部用例
- `pnpm compare --page "components-form-formitem-13"` — 只重跑「components-form-formitem-13」自身

