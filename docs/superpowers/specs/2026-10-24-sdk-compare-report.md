# SDK 对照报告

- 日期：2026-11-11
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **1161** · 通过 **1109** · 失败 **52**（P0 8）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 450 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 266 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 800 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（450）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-start-getting-started-0` fontSize: Amis `14px` / Vamis `24px`
- `src-start-getting-started-0` fontFamily: Amis `Helvetica Neue` / Vamis `system-ui`
- `src-start-getting-started-1` fontSize: Amis `14px` / Vamis `24px`
- `src-start-getting-started-1` fontFamily: Amis `Helvetica Neue` / Vamis `system-ui`
- `src-concepts-datascope-and-datachain-8` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-datascope-and-datachain-10` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-data-mapping-3` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-data-mapping-4` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-data-mapping-5` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-data-mapping-6` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-linkage-0` fontSize: Amis `12px` / Vamis `14px`
- `src-concepts-linkage-1` fontSize: Amis `12px` / Vamis `14px`
- …其余 438 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。
- Amis 6.13 组件字栈是 --fonts-base-family（实测 Helvetica Neue）；html/body 未钉字族（body 是 Times）。只在 .vamis-root / .vamis-sdk 走 --fonts-base-family，不要把 html/body 钉成 PingFang SC。
- compact 阶应对齐 Amis 5/10/15/20/30/40/50。现在 --gap-* 是 4/8/12/16/20/24。改 token 一处，m/p 整阶回来。

### 样式 helper（266）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- `style-layout-top-right-bottom-left-0` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-1` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-2` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-3` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-4` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-5` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-6` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-7` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-8` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-9` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-10` fontSize: Amis `12px` / Vamis `14px`
- `style-layout-top-right-bottom-left-11` fontSize: Amis `12px` / Vamis `14px`
- …其余 254 条见 last-report.json

整改：
- 对标 Amis helper 计算字号（text-sm 实测 12px，不是 TW 0.875rem=14px）。以计算样式为准，不要只抄 markdown 表。
- 缺档：补 Amis 同名 helper（m-l-n），不要用邻近档或 token 近似。
- 缺档：补 Amis 同名 helper（m-l-xxl），不要用邻近档或 token 近似。
- schema className 工具类，对标 Amis helper SCSS / 计算样式。

### 组件（800）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-start-getting-started-0` lineHeight: Amis `21px` / Vamis `32px`
- `src-start-getting-started-0` fontWeight: Amis `400` / Vamis `600`
- `src-start-getting-started-1` lineHeight: Amis `21px` / Vamis `32px`
- `src-start-getting-started-1` fontWeight: Amis `400` / Vamis `600`
- `src-concepts-datascope-and-datachain-8` lineHeight: Amis `18px` / Vamis `14px`
- `src-concepts-datascope-and-datachain-8` fontWeight: Amis `400` / Vamis `500`
- `src-concepts-datascope-and-datachain-10` lineHeight: Amis `18px` / Vamis `14px`
- `src-concepts-datascope-and-datachain-10` fontWeight: Amis `400` / Vamis `500`
- `src-concepts-template-0` lineHeight: Amis `30.8px` / Vamis `33.6px`
- `src-concepts-template-0` fontWeight: Amis `400` / Vamis `600`
- `src-concepts-template-1` lineHeight: Amis `30.8px` / Vamis `33.6px`
- `src-concepts-template-1` fontWeight: Amis `400` / Vamis `600`
- …其余 788 条见 last-report.json

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- schema 树该结点要能在 DOM 里定位（name / label）。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 105 | 0 |
| 组件 | 585 | 44 |
| 样式 | 471 | 8 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 文档 / 概念 | 84 | 0 |
| 文档 / 开始 | 2 | 0 |
| 文档 / 类型 | 19 | 0 |
| 组件 / 布局 | 84 | 0 |
| 组件 / 反馈 | 36 | 0 |
| 组件 / 功能 | 80 | 0 |
| 组件 / 其他 | 41 | 0 |
| 组件 / 数据输入 | 249 | 36 |
| 组件 / 数据展示 | 95 | 8 |
| 样式 / 开始 | 13 | 0 |
| 样式 / Backgrounds | 8 | 0 |
| 样式 / BORDERS | 33 | 0 |
| 样式 / Box Alignment | 67 | 0 |
| 样式 / Effect | 19 | 0 |
| 样式 / Flexbox | 30 | 0 |
| 样式 / Grid | 54 | 0 |
| 样式 / Layout | 72 | 0 |
| 样式 / Sizing | 28 | 0 |
| 样式 / Spacing | 49 | 8 |
| 样式 / Typography | 98 | 0 |

## P0 失败（驱动下一刀）

- `helper-m-l` className: m-l — gap: Amis `15` / Vamis `12`
- `helper-m-l-lg` className: m-l-lg — gap: Amis `30` / Vamis `20`
- `helper-m-l-md` className: m-l-md — gap: Amis `20` / Vamis `16`
- `helper-m-l-n` className: m-l-n — gap: Amis `-15` / Vamis `0`
- `helper-m-l-sm` className: m-l-sm — gap: Amis `10` / Vamis `8`
- `helper-m-l-xl` className: m-l-xl — gap: Amis `40` / Vamis `24`
- `helper-m-l-xxl` className: m-l-xxl — gap: Amis `50` / Vamis `0`
- `style-two-buttons-ml` 第二个按钮 className: m-l 拉开缝 — gap: Amis `15` / Vamis `12`

## 文档 smoke 失败（最多 20 条）

- `components-form-formitem-13` FormItem 表单项通用 #14 — page/body/0:form/body/0:input-text.rendered: Amis `false` / Vamis `true`
- `components-form-options-7` Options 选择器表单项 #8 — page/body/0:form/body/0:select.value: Amis `` / Vamis `a`
- `components-form-input-date-0` InputDate 日期选择器 #1 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-1` InputDate 日期选择器 #2 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-2` InputDate 日期选择器 #3 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-3` InputDate 日期选择器 #4 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-4` InputDate 日期选择器 #5 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/0:input-date.value: Amis `+1days` / Vamis `1794412800`
- `components-form-input-date-5` InputDate 日期选择器 #6 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/0:input-date.value: Amis `${DATEMODIFY(NOW(), 2, 'days')}` / Vamis `1794541974`
- `components-form-input-date-6` InputDate 日期选择器 #7 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-7` InputDate 日期选择器 #8 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-8` InputDate 日期选择器 #9 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-9` InputDate 日期选择器 #10 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-10` InputDate 日期选择器 #11 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-11` InputDate 日期选择器 #12 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-12` InputDate 日期选择器 #13 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`；page/body/0:form/body/1:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-15` InputDate 日期选择器 #16 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-16` InputDate 日期选择器 #17 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-17` InputDate 日期选择器 #18 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-date-18` InputDate 日期选择器 #19 — page/body/0:form/body/0:input-date.rendered: Amis `false` / Vamis `true`
- `components-form-input-datetime-0` InputDatetime 日期时间选择器 #1 — page/body/0:form/body/0:input-datetime.rendered: Amis `false` / Vamis `true`
- …其余 24 条见 `compare/last-report.json`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare` — 全局修完必须重跑全部用例
- `pnpm compare --page "components-form-formitem-13"` — 只重跑「components-form-formitem-13」自身
- `pnpm compare --page "components-form-options-7"` — 只重跑「components-form-options-7」自身
- `pnpm compare --page "components-form-input-date-0"` — 只重跑「components-form-input-date-0」自身
- `pnpm compare --page "components-form-input-date-1"` — 只重跑「components-form-input-date-1」自身
- `pnpm compare --page "components-form-input-date-2"` — 只重跑「components-form-input-date-2」自身
- `pnpm compare --page "components-form-input-date-3"` — 只重跑「components-form-input-date-3」自身
- `pnpm compare --page "components-form-input-date-4"` — 只重跑「components-form-input-date-4」自身
- `pnpm compare --page "components-form-input-date-5"` — 只重跑「components-form-input-date-5」自身
- `pnpm compare --page "components-form-input-date-6"` — 只重跑「components-form-input-date-6」自身
- `pnpm compare --page "components-form-input-date-7"` — 只重跑「components-form-input-date-7」自身
- `pnpm compare --page "components-form-input-date-8"` — 只重跑「components-form-input-date-8」自身
- `pnpm compare --page "components-form-input-date-9"` — 只重跑「components-form-input-date-9」自身
- `pnpm compare --page "components-form-input-date-10"` — 只重跑「components-form-input-date-10」自身
- `pnpm compare --page "components-form-input-date-11"` — 只重跑「components-form-input-date-11」自身
- `pnpm compare --page "components-form-input-date-12"` — 只重跑「components-form-input-date-12」自身
- `pnpm compare --page "components-form-input-date-15"` — 只重跑「components-form-input-date-15」自身
- `pnpm compare --page "components-form-input-date-16"` — 只重跑「components-form-input-date-16」自身
- `pnpm compare --page "components-form-input-date-17"` — 只重跑「components-form-input-date-17」自身
- `pnpm compare --page "components-form-input-date-18"` — 只重跑「components-form-input-date-18」自身
- `pnpm compare --page "components-form-input-datetime-0"` — 只重跑「components-form-input-datetime-0」自身
- `pnpm compare --page "components-form-input-file-3"` — 只重跑「components-form-input-file-3」自身
- `pnpm compare --page "components-form-input-file-8"` — 只重跑「components-form-input-file-8」自身
- `pnpm compare --page "components-form-input-file-9"` — 只重跑「components-form-input-file-9」自身
- `pnpm compare --page "components-form-hidden-0"` — 只重跑「components-form-hidden-0」自身
- `pnpm compare --page "components-form-input-number-3"` — 只重跑「components-form-input-number-3」自身
- `pnpm compare --page "components-form-radio-0"` — 只重跑「components-form-radio-0」自身
- `pnpm compare --page "components-form-radio-1"` — 只重跑「components-form-radio-1」自身
- `pnpm compare --page "components-form-radio-2"` — 只重跑「components-form-radio-2」自身
- `pnpm compare --page "components-form-select-6"` — 只重跑「components-form-select-6」自身
- `pnpm compare --page "components-form-select-14"` — 只重跑「components-form-select-14」自身
- `pnpm compare --page "components-form-select-15"` — 只重跑「components-form-select-15」自身
- `pnpm compare --page "components-form-select-16"` — 只重跑「components-form-select-16」自身
- `pnpm compare --page "components-form-select-17"` — 只重跑「components-form-select-17」自身
- `pnpm compare --page "components-form-input-tag-0"` — 只重跑「components-form-input-tag-0」自身
- `pnpm compare --page "components-form-input-time-0"` — 只重跑「components-form-input-time-0」自身
- `pnpm compare --page "components-form-transfer-picker-0"` — 只重跑「components-form-transfer-picker-0」自身
- `pnpm compare --page "src-components-table2-1"` — 只重跑「src-components-table2-1」自身
- `pnpm compare --page "src-components-table2-2"` — 只重跑「src-components-table2-2」自身
- `pnpm compare --page "src-components-card-0"` — 只重跑「src-components-card-0」自身
- `pnpm compare --page "src-components-image-3"` — 只重跑「src-components-image-3」自身
- `pnpm compare --page "src-components-image-4"` — 只重跑「src-components-image-4」自身
- `pnpm compare --page "src-components-image-13"` — 只重跑「src-components-image-13」自身
- `pnpm compare --page "src-components-image-17"` — 只重跑「src-components-image-17」自身
- `pnpm compare --page "src-components-image-18"` — 只重跑「src-components-image-18」自身
- `pnpm compare --page "helper-m-l-n"` — 只重跑「helper-m-l-n」自身
- `pnpm compare --page "helper-m-l-xxl"` — 只重跑「helper-m-l-xxl」自身

