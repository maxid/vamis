# SDK 对照报告

- 日期：2026-11-18
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **2216** · 通过 **1901** · 失败 **315**（P0 1）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 178 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 264 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 793 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（178）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-start-getting-started-0` fontSize: Amis `14px` / Vamis `16px`
- `src-start-getting-started-1` fontSize: Amis `14px` / Vamis `16px`
- `src-components-pagination-3` fontSize: Amis `14px` / Vamis `12px`
- `src-components-tabs-29` fontSize: Amis `14px` / Vamis `12px`
- `src-components-action-31` fontSize: Amis `12px` / Vamis `14px`
- `src-components-service-0` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-1` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-7` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-8` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-11` fontSize: Amis `12px` / Vamis `14px`
- `src-components-nav-6` fontSize: Amis `16px` / Vamis `14px`
- `src-components-nav-14` fontSize: Amis `16px` / Vamis `14px`
- …其余 166 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。
- Amis 6.13 组件字栈是 --fonts-base-family（实测 Helvetica Neue）；html/body 未钉字族（body 是 Times）。只在 .vamis-root / .vamis-sdk 走 --fonts-base-family，不要把 html/body 钉成 PingFang SC。

### 样式 helper（264）

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
- …其余 252 条见 last-report.json

整改：
- 对标 Amis helper 计算字号（text-sm 实测 12px，不是 TW 0.875rem=14px）。以计算样式为准，不要只抄 markdown 表。
- schema className 工具类，对标 Amis helper SCSS / 计算样式。

### 组件（793）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-start-getting-started-0` lineHeight: Amis `21px` / Vamis `24px`
- `src-start-getting-started-1` lineHeight: Amis `21px` / Vamis `24px`
- `src-concepts-template-1` lineHeight: Amis `30.8px` / Vamis `33.6px`
- `src-concepts-template-2` lineHeight: Amis `30.8px` / Vamis `33.6px`
- `src-components-page-2` page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `src-components-pagination-2` lineHeight: Amis `24px` / Vamis `21px`
- `src-components-pagination-3` lineHeight: Amis `21px` / Vamis `32px`
- `src-components-tabs-9` page/body/0:tabs.named: Amis `false` / Vamis `true`
- `src-components-tabs-29` lineHeight: Amis `21px` / Vamis `18px`
- `src-components-portlet-0` lineHeight: Amis `21px` / Vamis `20px`
- `src-components-portlet-0` fontWeight: Amis `400` / Vamis `500`
- `src-components-portlet-2` lineHeight: Amis `21px` / Vamis `20px`
- …其余 781 条见 last-report.json

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- schema 树该结点要能在 DOM 里定位（name / label）。
- 点一下后动作效果应对齐 Amis（dialog / toast / setValue）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 156 | 0 |
| 组件 | 1589 | 315 |
| 样式 | 471 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 文档 / 概念 | 133 | 0 |
| 文档 / 开始 | 2 | 0 |
| 文档 / 扩展 | 2 | 0 |
| 文档 / 类型 | 19 | 0 |
| 组件 / 布局 | 115 | 2 |
| 组件 / 反馈 | 59 | 1 |
| 组件 / 功能 | 114 | 9 |
| 组件 / 其他 | 44 | 0 |
| 组件 / 数据输入 | 736 | 223 |
| 组件 / 数据展示 | 521 | 80 |
| 样式 / 开始 | 13 | 0 |
| 样式 / Backgrounds | 8 | 0 |
| 样式 / BORDERS | 33 | 0 |
| 样式 / Box Alignment | 67 | 0 |
| 样式 / Effect | 19 | 0 |
| 样式 / Flexbox | 30 | 0 |
| 样式 / Grid | 54 | 0 |
| 样式 / Layout | 72 | 0 |
| 样式 / Sizing | 28 | 0 |
| 样式 / Spacing | 49 | 0 |
| 样式 / Typography | 98 | 0 |

## P0 失败（驱动下一刀）

- `form-default` 默认 Form — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``

## 文档 smoke 失败（最多 20 条）

- `src-components-page-2` Page 页面 #3 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `src-components-tabs-9` Tabs 选项卡 #10 — page/body/0:tabs.named: Amis `false` / Vamis `true`
- `src-components-action-24` Action 行为按钮 #25 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `src-components-service-2` Service 功能型容器 #3 — page/body/0:form/body/1:service/body/0:input-text.value: Amis `vamis` / Vamis ``；page/body/0:form/body/1:service/body/2:input-datetime.rendered: Amis `false` / Vamis `true`
- `src-components-service-9` Service 功能型容器 #10 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-10` Service 功能型容器 #11 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-11` Service 功能型容器 #12 — page/body/2:service.named: Amis `false` / Vamis `true`
- `src-components-service-12` Service 功能型容器 #13 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-13` Service 功能型容器 #14 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-nav-13` Nav 导航 #14 — page/body/1:nav.rendered: Amis `false` / Vamis `true`
- `src-components-nav-18` Nav 导航 #19 — page/body/0:container/body/2:container/body/0:nav.rendered: Amis `false` / Vamis `true`；page/body/0:container/body/2:container/body/0:nav.value: Amis `` / Vamis `Nav 1 Nav 2 Nav 2-1 Nav 2-2 Nav 3`
- `components-form-index-0` Form 表单 #1 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-4` Form 表单 #5 — page/body/0:container/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-15` Form 表单 #16 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-20` Form 表单 #21 — page/body/0:form/body/0:select.value: Amis `` / Vamis `["a","c"]`
- `components-form-index-21` Form 表单 #22 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-22` Form 表单 #23 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-23` Form 表单 #24 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-26` Form 表单 #27 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- `components-form-index-27` Form 表单 #28 — page/body/0:form/body/0:input-text.value: Amis `vamis` / Vamis ``
- …其余 294 条见 `compare/last-report.json`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare` — 全局修完必须重跑全部用例
- `pnpm compare --page "src-components-page-2"` — 只重跑「src-components-page-2」自身
- `pnpm compare --page "src-components-tabs-9"` — 只重跑「src-components-tabs-9」自身
- `pnpm compare --page "src-components-action-24"` — 只重跑「src-components-action-24」自身
- `pnpm compare --page "src-components-service-2"` — 只重跑「src-components-service-2」自身
- `pnpm compare --page "src-components-service-9"` — 只重跑「src-components-service-9」自身
- `pnpm compare --page "src-components-service-10"` — 只重跑「src-components-service-10」自身
- `pnpm compare --page "src-components-service-11"` — 只重跑「src-components-service-11」自身
- `pnpm compare --page "src-components-service-12"` — 只重跑「src-components-service-12」自身
- `pnpm compare --page "src-components-service-13"` — 只重跑「src-components-service-13」自身
- `pnpm compare --page "src-components-nav-13"` — 只重跑「src-components-nav-13」自身
- `pnpm compare --page "src-components-nav-18"` — 只重跑「src-components-nav-18」自身
- `pnpm compare --page "components-form-index-0"` — 只重跑「components-form-index-0」自身
- `pnpm compare --page "form-default"` — 只重跑「form-default」自身
- `pnpm compare --page "components-form-index-4"` — 只重跑「components-form-index-4」自身
- `pnpm compare --page "components-form-index-15"` — 只重跑「components-form-index-15」自身
- `pnpm compare --page "components-form-index-20"` — 只重跑「components-form-index-20」自身
- `pnpm compare --page "components-form-index-21"` — 只重跑「components-form-index-21」自身
- `pnpm compare --page "components-form-index-22"` — 只重跑「components-form-index-22」自身
- `pnpm compare --page "components-form-index-23"` — 只重跑「components-form-index-23」自身
- `pnpm compare --page "components-form-index-26"` — 只重跑「components-form-index-26」自身
- `pnpm compare --page "components-form-index-27"` — 只重跑「components-form-index-27」自身
- `pnpm compare --page "components-form-index-28"` — 只重跑「components-form-index-28」自身
- `pnpm compare --page "components-form-index-29"` — 只重跑「components-form-index-29」自身
- `pnpm compare --page "components-form-index-30"` — 只重跑「components-form-index-30」自身
- `pnpm compare --page "components-form-index-31"` — 只重跑「components-form-index-31」自身
- `pnpm compare --page "components-form-index-32"` — 只重跑「components-form-index-32」自身
- `pnpm compare --page "components-form-index-33"` — 只重跑「components-form-index-33」自身
- `pnpm compare --page "components-form-index-34"` — 只重跑「components-form-index-34」自身
- `pnpm compare --page "components-form-index-35"` — 只重跑「components-form-index-35」自身
- `pnpm compare --page "components-form-index-36"` — 只重跑「components-form-index-36」自身
- `pnpm compare --page "components-form-index-37"` — 只重跑「components-form-index-37」自身
- `pnpm compare --page "components-form-index-38"` — 只重跑「components-form-index-38」自身
- `pnpm compare --page "components-form-index-39"` — 只重跑「components-form-index-39」自身
- `pnpm compare --page "components-form-index-40"` — 只重跑「components-form-index-40」自身
- `pnpm compare --page "components-form-index-41"` — 只重跑「components-form-index-41」自身
- `pnpm compare --page "components-form-index-42"` — 只重跑「components-form-index-42」自身
- `pnpm compare --page "components-form-index-43"` — 只重跑「components-form-index-43」自身
- `pnpm compare --page "components-form-index-44"` — 只重跑「components-form-index-44」自身
- `pnpm compare --page "components-form-index-45"` — 只重跑「components-form-index-45」自身
- `pnpm compare --page "components-form-index-46"` — 只重跑「components-form-index-46」自身
- `pnpm compare --page "components-form-index-47"` — 只重跑「components-form-index-47」自身
- `pnpm compare --page "components-form-index-50"` — 只重跑「components-form-index-50」自身
- `pnpm compare --page "components-form-index-51"` — 只重跑「components-form-index-51」自身
- `pnpm compare --page "components-form-index-52"` — 只重跑「components-form-index-52」自身
- `pnpm compare --page "components-form-index-53"` — 只重跑「components-form-index-53」自身
- `pnpm compare --page "components-form-index-55"` — 只重跑「components-form-index-55」自身
- `pnpm compare --page "components-form-formitem-13"` — 只重跑「components-form-formitem-13」自身
- `pnpm compare --page "components-form-formitem-26"` — 只重跑「components-form-formitem-26」自身
- `pnpm compare --page "components-form-formitem-28"` — 只重跑「components-form-formitem-28」自身
- `pnpm compare --page "components-form-options-7"` — 只重跑「components-form-options-7」自身
- `pnpm compare --page "components-form-button-group-select-6"` — 只重跑「components-form-button-group-select-6」自身
- `pnpm compare --page "components-form-button-group-select-7"` — 只重跑「components-form-button-group-select-7」自身
- `pnpm compare --page "components-form-button-group-select-8"` — 只重跑「components-form-button-group-select-8」自身
- `pnpm compare --page "components-form-button-group-select-9"` — 只重跑「components-form-button-group-select-9」自身
- `pnpm compare --page "components-form-chain-select-2"` — 只重跑「components-form-chain-select-2」自身
- `pnpm compare --page "components-form-chain-select-3"` — 只重跑「components-form-chain-select-3」自身
- `pnpm compare --page "components-form-chain-select-4"` — 只重跑「components-form-chain-select-4」自身
- `pnpm compare --page "components-form-chain-select-5"` — 只重跑「components-form-chain-select-5」自身
- `pnpm compare --page "components-form-checkboxes-14"` — 只重跑「components-form-checkboxes-14」自身
- `pnpm compare --page "components-form-checkboxes-15"` — 只重跑「components-form-checkboxes-15」自身
- `pnpm compare --page "components-form-checkboxes-16"` — 只重跑「components-form-checkboxes-16」自身
- `pnpm compare --page "components-form-checkboxes-17"` — 只重跑「components-form-checkboxes-17」自身
- `pnpm compare --page "components-form-input-city-5"` — 只重跑「components-form-input-city-5」自身
- `pnpm compare --page "components-form-input-city-6"` — 只重跑「components-form-input-city-6」自身
- `pnpm compare --page "components-form-input-city-7"` — 只重跑「components-form-input-city-7」自身
- `pnpm compare --page "components-form-combo-3"` — 只重跑「components-form-combo-3」自身
- `pnpm compare --page "components-form-combo-4"` — 只重跑「components-form-combo-4」自身
- `pnpm compare --page "components-form-combo-6"` — 只重跑「components-form-combo-6」自身
- `pnpm compare --page "components-form-combo-7"` — 只重跑「components-form-combo-7」自身
- `pnpm compare --page "components-form-combo-15"` — 只重跑「components-form-combo-15」自身
- `pnpm compare --page "components-form-combo-19"` — 只重跑「components-form-combo-19」自身
- `pnpm compare --page "components-form-combo-20"` — 只重跑「components-form-combo-20」自身
- `pnpm compare --page "components-form-combo-22"` — 只重跑「components-form-combo-22」自身
- `pnpm compare --page "components-form-combo-23"` — 只重跑「components-form-combo-23」自身
- `pnpm compare --page "components-form-combo-24"` — 只重跑「components-form-combo-24」自身
- `pnpm compare --page "components-form-combo-25"` — 只重跑「components-form-combo-25」自身
- `pnpm compare --page "components-form-combo-26"` — 只重跑「components-form-combo-26」自身
- `pnpm compare --page "components-form-combo-27"` — 只重跑「components-form-combo-27」自身
- `pnpm compare --page "components-form-combo-28"` — 只重跑「components-form-combo-28」自身
- `pnpm compare --page "components-form-combo-29"` — 只重跑「components-form-combo-29」自身
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
- `pnpm compare --page "components-form-input-datetime-1"` — 只重跑「components-form-input-datetime-1」自身
- `pnpm compare --page "components-form-input-datetime-2"` — 只重跑「components-form-input-datetime-2」自身
- `pnpm compare --page "components-form-input-datetime-3"` — 只重跑「components-form-input-datetime-3」自身
- `pnpm compare --page "components-form-input-datetime-4"` — 只重跑「components-form-input-datetime-4」自身
- `pnpm compare --page "components-form-input-datetime-5"` — 只重跑「components-form-input-datetime-5」自身
- `pnpm compare --page "components-form-input-datetime-6"` — 只重跑「components-form-input-datetime-6」自身
- `pnpm compare --page "components-form-input-datetime-7"` — 只重跑「components-form-input-datetime-7」自身
- `pnpm compare --page "components-form-input-datetime-8"` — 只重跑「components-form-input-datetime-8」自身
- `pnpm compare --page "components-form-input-datetime-9"` — 只重跑「components-form-input-datetime-9」自身
- `pnpm compare --page "components-form-input-datetime-10"` — 只重跑「components-form-input-datetime-10」自身
- `pnpm compare --page "components-form-input-datetime-11"` — 只重跑「components-form-input-datetime-11」自身
- `pnpm compare --page "components-form-input-datetime-12"` — 只重跑「components-form-input-datetime-12」自身
- `pnpm compare --page "components-form-input-datetime-14"` — 只重跑「components-form-input-datetime-14」自身
- `pnpm compare --page "components-form-input-date-range-3"` — 只重跑「components-form-input-date-range-3」自身
- `pnpm compare --page "components-form-input-date-range-4"` — 只重跑「components-form-input-date-range-4」自身
- `pnpm compare --page "components-form-input-formula-0"` — 只重跑「components-form-input-formula-0」自身
- `pnpm compare --page "components-form-input-formula-1"` — 只重跑「components-form-input-formula-1」自身
- `pnpm compare --page "components-form-input-formula-2"` — 只重跑「components-form-input-formula-2」自身
- `pnpm compare --page "components-form-input-formula-5"` — 只重跑「components-form-input-formula-5」自身
- `pnpm compare --page "components-form-input-formula-6"` — 只重跑「components-form-input-formula-6」自身
- `pnpm compare --page "components-form-input-excel-8"` — 只重跑「components-form-input-excel-8」自身
- `pnpm compare --page "components-form-input-excel-9"` — 只重跑「components-form-input-excel-9」自身
- `pnpm compare --page "components-form-input-excel-10"` — 只重跑「components-form-input-excel-10」自身
- `pnpm compare --page "components-form-formula-3"` — 只重跑「components-form-formula-3」自身
- `pnpm compare --page "components-form-hidden-0"` — 只重跑「components-form-hidden-0」自身
- `pnpm compare --page "components-form-list-select-3"` — 只重跑「components-form-list-select-3」自身
- `pnpm compare --page "components-form-list-select-4"` — 只重跑「components-form-list-select-4」自身
- `pnpm compare --page "components-form-list-select-5"` — 只重跑「components-form-list-select-5」自身
- `pnpm compare --page "components-form-list-select-6"` — 只重跑「components-form-list-select-6」自身
- `pnpm compare --page "components-form-location-picker-4"` — 只重跑「components-form-location-picker-4」自身
- `pnpm compare --page "components-form-location-picker-5"` — 只重跑「components-form-location-picker-5」自身
- `pnpm compare --page "components-form-location-picker-6"` — 只重跑「components-form-location-picker-6」自身
- `pnpm compare --page "components-form-matrix-checkboxes-8"` — 只重跑「components-form-matrix-checkboxes-8」自身
- `pnpm compare --page "components-form-matrix-checkboxes-9"` — 只重跑「components-form-matrix-checkboxes-9」自身
- `pnpm compare --page "components-form-matrix-checkboxes-10"` — 只重跑「components-form-matrix-checkboxes-10」自身
- `pnpm compare --page "components-form-nestedselect-12"` — 只重跑「components-form-nestedselect-12」自身
- `pnpm compare --page "components-form-nestedselect-13"` — 只重跑「components-form-nestedselect-13」自身
- `pnpm compare --page "components-form-nestedselect-14"` — 只重跑「components-form-nestedselect-14」自身
- `pnpm compare --page "components-form-nestedselect-15"` — 只重跑「components-form-nestedselect-15」自身
- `pnpm compare --page "components-form-input-number-3"` — 只重跑「components-form-input-number-3」自身
- `pnpm compare --page "components-form-radio-0"` — 只重跑「components-form-radio-0」自身
- `pnpm compare --page "components-form-radio-1"` — 只重跑「components-form-radio-1」自身
- `pnpm compare --page "components-form-radio-2"` — 只重跑「components-form-radio-2」自身
- `pnpm compare --page "components-form-radios-7"` — 只重跑「components-form-radios-7」自身
- `pnpm compare --page "components-form-radios-8"` — 只重跑「components-form-radios-8」自身
- `pnpm compare --page "components-form-radios-9"` — 只重跑「components-form-radios-9」自身
- `pnpm compare --page "components-form-radios-10"` — 只重跑「components-form-radios-10」自身
- `pnpm compare --page "components-form-input-rating-6"` — 只重跑「components-form-input-rating-6」自身
- `pnpm compare --page "components-form-input-rating-7"` — 只重跑「components-form-input-rating-7」自身
- `pnpm compare --page "components-form-input-rating-8"` — 只重跑「components-form-input-rating-8」自身
- `pnpm compare --page "components-form-input-range-16"` — 只重跑「components-form-input-range-16」自身
- `pnpm compare --page "components-form-input-range-17"` — 只重跑「components-form-input-range-17」自身
- `pnpm compare --page "components-form-input-range-18"` — 只重跑「components-form-input-range-18」自身
- `pnpm compare --page "components-form-select-6"` — 只重跑「components-form-select-6」自身
- `pnpm compare --page "components-form-select-17"` — 只重跑「components-form-select-17」自身
- `pnpm compare --page "components-form-select-18"` — 只重跑「components-form-select-18」自身
- `pnpm compare --page "components-form-select-19"` — 只重跑「components-form-select-19」自身
- `pnpm compare --page "components-form-select-20"` — 只重跑「components-form-select-20」自身
- `pnpm compare --page "components-form-input-table-0"` — 只重跑「components-form-input-table-0」自身
- `pnpm compare --page "components-form-input-table-1"` — 只重跑「components-form-input-table-1」自身
- `pnpm compare --page "components-form-input-table-5"` — 只重跑「components-form-input-table-5」自身
- `pnpm compare --page "components-form-input-table-6"` — 只重跑「components-form-input-table-6」自身
- `pnpm compare --page "components-form-input-table-7"` — 只重跑「components-form-input-table-7」自身
- `pnpm compare --page "components-form-input-table-8"` — 只重跑「components-form-input-table-8」自身
- `pnpm compare --page "components-form-input-table-9"` — 只重跑「components-form-input-table-9」自身
- `pnpm compare --page "components-form-input-table-12"` — 只重跑「components-form-input-table-12」自身
- `pnpm compare --page "components-form-input-table-13"` — 只重跑「components-form-input-table-13」自身
- `pnpm compare --page "components-form-input-table-14"` — 只重跑「components-form-input-table-14」自身
- `pnpm compare --page "components-form-input-table-15"` — 只重跑「components-form-input-table-15」自身
- `pnpm compare --page "components-form-input-table-16"` — 只重跑「components-form-input-table-16」自身
- `pnpm compare --page "components-form-input-table-17"` — 只重跑「components-form-input-table-17」自身
- `pnpm compare --page "components-form-input-table-21"` — 只重跑「components-form-input-table-21」自身
- `pnpm compare --page "components-form-input-table-22"` — 只重跑「components-form-input-table-22」自身
- `pnpm compare --page "components-form-input-table-23"` — 只重跑「components-form-input-table-23」自身
- `pnpm compare --page "components-form-input-table-24"` — 只重跑「components-form-input-table-24」自身
- `pnpm compare --page "components-form-input-table-25"` — 只重跑「components-form-input-table-25」自身
- `pnpm compare --page "components-form-input-table-26"` — 只重跑「components-form-input-table-26」自身
- `pnpm compare --page "components-form-input-table-27"` — 只重跑「components-form-input-table-27」自身
- `pnpm compare --page "components-form-input-table-28"` — 只重跑「components-form-input-table-28」自身
- `pnpm compare --page "components-form-input-table-29"` — 只重跑「components-form-input-table-29」自身
- `pnpm compare --page "components-form-input-table-30"` — 只重跑「components-form-input-table-30」自身
- `pnpm compare --page "components-form-input-table-31"` — 只重跑「components-form-input-table-31」自身
- `pnpm compare --page "components-form-input-table-32"` — 只重跑「components-form-input-table-32」自身
- `pnpm compare --page "components-form-input-table-33"` — 只重跑「components-form-input-table-33」自身
- `pnpm compare --page "components-form-input-table-34"` — 只重跑「components-form-input-table-34」自身
- `pnpm compare --page "components-form-input-table-35"` — 只重跑「components-form-input-table-35」自身
- `pnpm compare --page "components-form-input-table-36"` — 只重跑「components-form-input-table-36」自身
- `pnpm compare --page "components-form-input-table-37"` — 只重跑「components-form-input-table-37」自身
- `pnpm compare --page "components-form-input-table-38"` — 只重跑「components-form-input-table-38」自身
- `pnpm compare --page "components-form-input-table-39"` — 只重跑「components-form-input-table-39」自身
- `pnpm compare --page "components-form-input-table-40"` — 只重跑「components-form-input-table-40」自身
- `pnpm compare --page "components-form-input-table-41"` — 只重跑「components-form-input-table-41」自身
- `pnpm compare --page "components-form-input-table-42"` — 只重跑「components-form-input-table-42」自身
- `pnpm compare --page "components-form-input-table-43"` — 只重跑「components-form-input-table-43」自身
- `pnpm compare --page "components-form-input-table-44"` — 只重跑「components-form-input-table-44」自身
- `pnpm compare --page "components-form-input-table-45"` — 只重跑「components-form-input-table-45」自身
- `pnpm compare --page "components-form-input-table-46"` — 只重跑「components-form-input-table-46」自身
- `pnpm compare --page "components-form-input-table-47"` — 只重跑「components-form-input-table-47」自身
- `pnpm compare --page "components-form-input-tag-0"` — 只重跑「components-form-input-tag-0」自身
- `pnpm compare --page "components-form-input-tag-1"` — 只重跑「components-form-input-tag-1」自身
- `pnpm compare --page "components-form-input-tag-2"` — 只重跑「components-form-input-tag-2」自身
- `pnpm compare --page "components-form-input-tag-3"` — 只重跑「components-form-input-tag-3」自身
- `pnpm compare --page "components-form-input-tag-4"` — 只重跑「components-form-input-tag-4」自身
- `pnpm compare --page "components-form-input-tag-5"` — 只重跑「components-form-input-tag-5」自身
- `pnpm compare --page "components-form-input-tag-6"` — 只重跑「components-form-input-tag-6」自身
- `pnpm compare --page "components-form-input-tag-7"` — 只重跑「components-form-input-tag-7」自身
- `pnpm compare --page "components-form-input-tag-8"` — 只重跑「components-form-input-tag-8」自身
- `pnpm compare --page "components-form-input-tag-9"` — 只重跑「components-form-input-tag-9」自身
- `pnpm compare --page "components-form-input-tag-10"` — 只重跑「components-form-input-tag-10」自身
- `pnpm compare --page "components-form-input-time-0"` — 只重跑「components-form-input-time-0」自身
- `pnpm compare --page "components-form-input-time-1"` — 只重跑「components-form-input-time-1」自身
- `pnpm compare --page "components-form-input-time-2"` — 只重跑「components-form-input-time-2」自身
- `pnpm compare --page "components-form-input-time-3"` — 只重跑「components-form-input-time-3」自身
- `pnpm compare --page "components-form-input-time-4"` — 只重跑「components-form-input-time-4」自身
- `pnpm compare --page "components-form-input-time-5"` — 只重跑「components-form-input-time-5」自身
- `pnpm compare --page "components-form-input-time-6"` — 只重跑「components-form-input-time-6」自身
- `pnpm compare --page "components-form-transfer-6"` — 只重跑「components-form-transfer-6」自身
- `pnpm compare --page "components-form-transfer-7"` — 只重跑「components-form-transfer-7」自身
- `pnpm compare --page "components-form-transfer-8"` — 只重跑「components-form-transfer-8」自身
- `pnpm compare --page "components-form-transfer-picker-0"` — 只重跑「components-form-transfer-picker-0」自身
- `pnpm compare --page "components-form-transfer-picker-1"` — 只重跑「components-form-transfer-picker-1」自身
- `pnpm compare --page "components-form-transfer-picker-2"` — 只重跑「components-form-transfer-picker-2」自身
- `pnpm compare --page "components-form-transfer-picker-3"` — 只重跑「components-form-transfer-picker-3」自身
- `pnpm compare --page "components-form-transfer-picker-4"` — 只重跑「components-form-transfer-picker-4」自身
- `pnpm compare --page "components-form-tabs-transfer-5"` — 只重跑「components-form-tabs-transfer-5」自身
- `pnpm compare --page "components-form-tabs-transfer-6"` — 只重跑「components-form-tabs-transfer-6」自身
- `pnpm compare --page "components-form-tabs-transfer-7"` — 只重跑「components-form-tabs-transfer-7」自身
- `pnpm compare --page "components-form-tabs-transfer-picker-1"` — 只重跑「components-form-tabs-transfer-picker-1」自身
- `pnpm compare --page "components-form-tabs-transfer-picker-2"` — 只重跑「components-form-tabs-transfer-picker-2」自身
- `pnpm compare --page "components-form-tabs-transfer-picker-3"` — 只重跑「components-form-tabs-transfer-picker-3」自身
- `pnpm compare --page "components-form-input-tree-20"` — 只重跑「components-form-input-tree-20」自身
- `pnpm compare --page "components-form-input-tree-28"` — 只重跑「components-form-input-tree-28」自身
- `pnpm compare --page "components-form-input-tree-29"` — 只重跑「components-form-input-tree-29」自身
- `pnpm compare --page "components-form-input-tree-30"` — 只重跑「components-form-input-tree-30」自身
- `pnpm compare --page "components-form-treeselect-14"` — 只重跑「components-form-treeselect-14」自身
- `pnpm compare --page "components-form-treeselect-15"` — 只重跑「components-form-treeselect-15」自身
- `pnpm compare --page "src-components-crud-0"` — 只重跑「src-components-crud-0」自身
- `pnpm compare --page "src-components-crud-8"` — 只重跑「src-components-crud-8」自身
- `pnpm compare --page "src-components-crud-9"` — 只重跑「src-components-crud-9」自身
- `pnpm compare --page "src-components-crud-10"` — 只重跑「src-components-crud-10」自身
- `pnpm compare --page "src-components-crud-12"` — 只重跑「src-components-crud-12」自身
- `pnpm compare --page "src-components-crud-28"` — 只重跑「src-components-crud-28」自身
- `pnpm compare --page "src-components-crud-29"` — 只重跑「src-components-crud-29」自身
- `pnpm compare --page "src-components-crud-34"` — 只重跑「src-components-crud-34」自身
- `pnpm compare --page "src-components-crud-41"` — 只重跑「src-components-crud-41」自身
- `pnpm compare --page "src-components-crud-42"` — 只重跑「src-components-crud-42」自身
- `pnpm compare --page "src-components-crud-43"` — 只重跑「src-components-crud-43」自身
- `pnpm compare --page "src-components-crud-47"` — 只重跑「src-components-crud-47」自身
- `pnpm compare --page "src-components-crud-48"` — 只重跑「src-components-crud-48」自身
- `pnpm compare --page "src-components-crud-50"` — 只重跑「src-components-crud-50」自身
- `pnpm compare --page "src-components-crud-51"` — 只重跑「src-components-crud-51」自身
- `pnpm compare --page "src-components-crud-52"` — 只重跑「src-components-crud-52」自身
- `pnpm compare --page "src-components-crud-53"` — 只重跑「src-components-crud-53」自身
- `pnpm compare --page "src-components-crud-54"` — 只重跑「src-components-crud-54」自身
- `pnpm compare --page "src-components-crud-55"` — 只重跑「src-components-crud-55」自身
- `pnpm compare --page "src-components-crud-56"` — 只重跑「src-components-crud-56」自身
- `pnpm compare --page "src-components-crud-60"` — 只重跑「src-components-crud-60」自身
- `pnpm compare --page "src-components-crud-61"` — 只重跑「src-components-crud-61」自身
- `pnpm compare --page "src-components-crud-62"` — 只重跑「src-components-crud-62」自身
- `pnpm compare --page "src-components-crud-81"` — 只重跑「src-components-crud-81」自身
- `pnpm compare --page "src-components-crud-82"` — 只重跑「src-components-crud-82」自身
- `pnpm compare --page "src-components-crud-83"` — 只重跑「src-components-crud-83」自身
- `pnpm compare --page "src-components-crud-84"` — 只重跑「src-components-crud-84」自身
- `pnpm compare --page "src-components-crud-85"` — 只重跑「src-components-crud-85」自身
- `pnpm compare --page "src-components-crud-86"` — 只重跑「src-components-crud-86」自身
- `pnpm compare --page "src-components-crud-87"` — 只重跑「src-components-crud-87」自身
- `pnpm compare --page "src-components-crud-88"` — 只重跑「src-components-crud-88」自身
- `pnpm compare --page "src-components-crud-91"` — 只重跑「src-components-crud-91」自身
- `pnpm compare --page "src-components-table2-1"` — 只重跑「src-components-table2-1」自身
- `pnpm compare --page "src-components-table2-2"` — 只重跑「src-components-table2-2」自身
- `pnpm compare --page "src-components-table2-14"` — 只重跑「src-components-table2-14」自身
- `pnpm compare --page "src-components-table2-15"` — 只重跑「src-components-table2-15」自身
- `pnpm compare --page "src-components-table2-68"` — 只重跑「src-components-table2-68」自身
- `pnpm compare --page "src-components-table2-69"` — 只重跑「src-components-table2-69」自身
- `pnpm compare --page "src-components-table2-70"` — 只重跑「src-components-table2-70」自身
- `pnpm compare --page "src-components-table2-71"` — 只重跑「src-components-table2-71」自身
- `pnpm compare --page "src-components-table2-72"` — 只重跑「src-components-table2-72」自身
- `pnpm compare --page "src-components-card-0"` — 只重跑「src-components-card-0」自身
- `pnpm compare --page "src-components-card-1"` — 只重跑「src-components-card-1」自身
- `pnpm compare --page "src-components-card-5"` — 只重跑「src-components-card-5」自身
- `pnpm compare --page "src-components-card-6"` — 只重跑「src-components-card-6」自身
- `pnpm compare --page "src-components-card-10"` — 只重跑「src-components-card-10」自身
- `pnpm compare --page "src-components-cards-4"` — 只重跑「src-components-cards-4」自身
- `pnpm compare --page "src-components-cards-5"` — 只重跑「src-components-cards-5」自身
- `pnpm compare --page "src-components-cards-6"` — 只重跑「src-components-cards-6」自身
- `pnpm compare --page "src-components-cards-7"` — 只重跑「src-components-cards-7」自身
- `pnpm compare --page "src-components-cards-8"` — 只重跑「src-components-cards-8」自身
- `pnpm compare --page "src-components-cards-9"` — 只重跑「src-components-cards-9」自身
- `pnpm compare --page "src-components-carousel-5"` — 只重跑「src-components-carousel-5」自身
- `pnpm compare --page "src-components-carousel-6"` — 只重跑「src-components-carousel-6」自身
- `pnpm compare --page "src-components-carousel-7"` — 只重跑「src-components-carousel-7」自身
- `pnpm compare --page "src-components-chart-0"` — 只重跑「src-components-chart-0」自身
- `pnpm compare --page "src-components-color-2"` — 只重跑「src-components-color-2」自身
- `pnpm compare --page "src-components-date-2"` — 只重跑「src-components-date-2」自身
- `pnpm compare --page "src-components-image-17"` — 只重跑「src-components-image-17」自身
- `pnpm compare --page "src-components-image-18"` — 只重跑「src-components-image-18」自身
- `pnpm compare --page "src-components-json-3"` — 只重跑「src-components-json-3」自身
- `pnpm compare --page "src-components-number-4"` — 只重跑「src-components-number-4」自身
- `pnpm compare --page "src-components-progress-8"` — 只重跑「src-components-progress-8」自身
- `pnpm compare --page "src-components-qrcode-9"` — 只重跑「src-components-qrcode-9」自身
- `pnpm compare --page "src-components-search-box-0"` — 只重跑「src-components-search-box-0」自身
- `pnpm compare --page "src-components-search-box-1"` — 只重跑「src-components-search-box-1」自身
- `pnpm compare --page "src-components-search-box-2"` — 只重跑「src-components-search-box-2」自身
- `pnpm compare --page "src-components-search-box-3"` — 只重跑「src-components-search-box-3」自身
- `pnpm compare --page "src-components-search-box-4"` — 只重跑「src-components-search-box-4」自身
- `pnpm compare --page "src-components-search-box-5"` — 只重跑「src-components-search-box-5」自身
- `pnpm compare --page "src-components-search-box-6"` — 只重跑「src-components-search-box-6」自身
- `pnpm compare --page "src-components-search-box-7"` — 只重跑「src-components-search-box-7」自身
- `pnpm compare --page "src-components-search-box-8"` — 只重跑「src-components-search-box-8」自身
- `pnpm compare --page "src-components-search-box-9"` — 只重跑「src-components-search-box-9」自身
- `pnpm compare --page "src-components-search-box-10"` — 只重跑「src-components-search-box-10」自身
- `pnpm compare --page "src-components-search-box-11"` — 只重跑「src-components-search-box-11」自身
- `pnpm compare --page "src-components-search-box-12"` — 只重跑「src-components-search-box-12」自身
- `pnpm compare --page "src-components-search-box-13"` — 只重跑「src-components-search-box-13」自身
- `pnpm compare --page "src-components-search-box-14"` — 只重跑「src-components-search-box-14」自身
- `pnpm compare --page "src-components-search-box-15"` — 只重跑「src-components-search-box-15」自身
- `pnpm compare --page "src-components-spinner-5"` — 只重跑「src-components-spinner-5」自身

