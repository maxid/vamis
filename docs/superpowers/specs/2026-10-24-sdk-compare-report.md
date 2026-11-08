# SDK 对照报告

- 日期：2026-11-08
- 视口：移动 375×812（Amis <768 表单）
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **19** · 通过 **2** · 失败 **17**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 19 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 61 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（19）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `components-form-input-date-0` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-1` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-2` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-3` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-4` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-5` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-6` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-7` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-8` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-9` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-10` fontSize: Amis `16px` / Vamis `14px`
- `components-form-input-date-11` fontSize: Amis `16px` / Vamis `14px`
- …其余 7 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（61）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `components-form-input-date-0` page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-0` lineHeight: Amis `24px` / Vamis `14px`
- `components-form-input-date-0` fontWeight: Amis `400` / Vamis `500`
- `components-form-input-date-1` page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-1` lineHeight: Amis `24px` / Vamis `14px`
- `components-form-input-date-1` fontWeight: Amis `400` / Vamis `500`
- `components-form-input-date-2` page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-2` lineHeight: Amis `24px` / Vamis `14px`
- `components-form-input-date-2` fontWeight: Amis `400` / Vamis `500`
- `components-form-input-date-3` page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-3` lineHeight: Amis `24px` / Vamis `14px`
- `components-form-input-date-3` fontWeight: Amis `400` / Vamis `500`
- …其余 49 条见 last-report.json

整改：
- schema 树该结点要能在 DOM 里定位（name / label）。
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- 点一下后动作效果应对齐 Amis（dialog / toast / setValue）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 19 | 17 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据输入 | 19 | 17 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `components-form-input-date-0` InputDate 日期选择器 #1 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-1` InputDate 日期选择器 #2 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-2` InputDate 日期选择器 #3 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-3` InputDate 日期选择器 #4 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-4` InputDate 日期选择器 #5 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/0:input-date.value: Amis `+1days` / Vamis `1794153600`
- `components-form-input-date-5` InputDate 日期选择器 #6 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/0:input-date.value: Amis `${DATEMODIFY(NOW(), 2, 'days')}` / Vamis `1794289293`
- `components-form-input-date-6` InputDate 日期选择器 #7 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-7` InputDate 日期选择器 #8 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-8` InputDate 日期选择器 #9 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-9` InputDate 日期选择器 #10 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-10` InputDate 日期选择器 #11 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-11` InputDate 日期选择器 #12 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-12` InputDate 日期选择器 #13 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-15` InputDate 日期选择器 #16 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/0:input-date.dialog: Amis `false` / Vamis `true`
- `components-form-input-date-16` InputDate 日期选择器 #17 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-17` InputDate 日期选择器 #18 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-18` InputDate 日期选择器 #19 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --mobile` — 全局修完必须重跑全部移动端用例
- `pnpm compare --page "components-form-input-date-0" --mobile` — 只重跑「components-form-input-date-0」自身
- `pnpm compare --page "components-form-input-date-1" --mobile` — 只重跑「components-form-input-date-1」自身
- `pnpm compare --page "components-form-input-date-2" --mobile` — 只重跑「components-form-input-date-2」自身
- `pnpm compare --page "components-form-input-date-3" --mobile` — 只重跑「components-form-input-date-3」自身
- `pnpm compare --page "components-form-input-date-4" --mobile` — 只重跑「components-form-input-date-4」自身
- `pnpm compare --page "components-form-input-date-5" --mobile` — 只重跑「components-form-input-date-5」自身
- `pnpm compare --page "components-form-input-date-6" --mobile` — 只重跑「components-form-input-date-6」自身
- `pnpm compare --page "components-form-input-date-7" --mobile` — 只重跑「components-form-input-date-7」自身
- `pnpm compare --page "components-form-input-date-8" --mobile` — 只重跑「components-form-input-date-8」自身
- `pnpm compare --page "components-form-input-date-9" --mobile` — 只重跑「components-form-input-date-9」自身
- `pnpm compare --page "components-form-input-date-10" --mobile` — 只重跑「components-form-input-date-10」自身
- `pnpm compare --page "components-form-input-date-11" --mobile` — 只重跑「components-form-input-date-11」自身
- `pnpm compare --page "components-form-input-date-12" --mobile` — 只重跑「components-form-input-date-12」自身
- `pnpm compare --page "components-form-input-date-15" --mobile` — 只重跑「components-form-input-date-15」自身
- `pnpm compare --page "components-form-input-date-16" --mobile` — 只重跑「components-form-input-date-16」自身
- `pnpm compare --page "components-form-input-date-17" --mobile` — 只重跑「components-form-input-date-17」自身
- `pnpm compare --page "components-form-input-date-18" --mobile` — 只重跑「components-form-input-date-18」自身

