# 项目领域上下文 (CONTEXT)

> Vamis：Vue 3 低代码运行时。本文档是术语表与**进度真源**；任务结束必须回写「当前进度」和「后续计划」。

## 文档定位

| 文档类型 | 位置 | 用途 |
|---------|------|------|
| 术语与进度 | 本文件 | 领域语言、模块层次、当前进度、下一步 |
| AI 工作指引 | [AGENTS.md](AGENTS.md) | 命令、约定、收工回写；`CLAUDE.md` 只指向它 |
| 规格 | `docs/superpowers/specs/` | 运行时 / 语义 / 组件 TODO / 主题 / 在线文档 / JS SDK |
| 计划 | `docs/superpowers/plans/` | 可执行任务清单 |
| 在线文档 | `website/src` + playground 路由 | 与示例同端口；进度仍以本文件为准 |
| 对标查阅 | `.cursor/rules/amis-lookup.mdc` | Amis 仓相对位置（默认 `../amis`）；文档 / 样式 / 核心 / 组件怎么查 |
| 历史教训 | `.cursor/rules/lessons.mdc` | 稳定开发经验；**组件修复后必须去重回写**（不是进度流水） |

> **图表**：优先 mermaid。

## 模块层次

| 模块 | 路径 | 职责 |
|------|------|------|
| `@vamis/core` | `packages/vamis-core` | `registerRenderer`、IR、公式封装、Pinia hub、Scope/env/动作（契约仍在补） |
| `@vamis/formula` | `packages/vamis-formula` | 表达式 / 过滤器 / 内置函数（从 amis-formula 6.13.0 搬运） |
| `@vamis/ui` | `packages/vamis-ui` | shadcn-vue 原语与 CSS 变量（密度、状态色） |
| `vamis` | `packages/vamis` | Amis type 渲染器；`register.ts` + `extras/*.ts` |
| `@vamis/editor` | `packages/vamis-editor` | 树 / 画布 / 属性 / YAML |
| playground | `playground` | 文档（`/`）+ 组件（`/components`）+ 样式（`/style`）+ 示例（`/examples`） |
| 文档正文 | `website/src` | Markdown 真源；playground 在 5173 渲染 |
| `@vamis/sdk` | `packages/vamis-sdk` | JS SDK：`sdk.js` + `vamis.embed`；P0 已落地 |

## 术语表

| 术语 | 定义 |
|------|------|
| **Amis** | 百度 JSON 低代码引擎（6.13.0）。Vamis 对齐其 **schema 语义**，不复制 React/MST |
| **cxd 转写** | 不搬 `.cxd-*` 前缀和 Amis 主题 SCSS。cxd 的盒子、密度、helper、交互尽量像素级落到 shadcn-vue token、`cva` variants、Tailwind utility。主色走 `--primary`；云舍蓝是顶栏 5 色之一（默认），不是唯一主色、也不是禁用色。规则：`.cursor/rules/style.mdc` |
| **样式行为精度** | `/style` 活示例对标 Amis **计算样式与盒模型**：同一 class 落在同一元素、同一属性、同一值。范本 `space-x-6` = 后盒 `margin-left: 24px`，不是 Tailwind 前盒 `margin-inline-end`。禁止同名 utility 两套叠加。规则：`.cursor/rules/style.mdc` |
| **type** | Schema 节点种类（`page` / `form` / `crud`…）。侧栏 155 项见组件 TODO |
| **已注册 ≠ 语义完成** | `registerRenderer` 有调用只说明能 resolve；进度看文档主路径 |
| **IR 信封** | `apiVersion: lcdp.ir/v1` + `kind` + `metadata` + `spec`。与 LCDP IR 同形 |
| **UiPage** | Vamis 扩展 kind，`spec` 里放 Amis widget 树 |
| **FormDef / TableDef** | LCDP IR 已有 kind；可编译成 form / crud 预览 |
| **作者态** | YAML 与 JSON 并列，不强制 YAML。对象 / JSON 字符串 / YAML 字符串 / IR 信封都进同一运行时。规则：`.cursor/rules/site.mdc` |
| **YAML 1.2 Core** | YAML 字面量：bool/null/数字不加引号；`yes`/`On`/`012` 当字符串。不约束 JSON |
| **Scope / 数据链** | 数据域 + `__super`；D1 主路径已接（page/form/service/crud），`trackExpression` 去抖仍属 D9 |
| **env** | 运行时注入：`fetcher` / `notify` / `jumpTo` / `alert` / `confirm`；`trusted` 才跑 adaptor 字符串 |
| **onEvent** | 组件事件到动作注册表；D4 P0 已接 |
| **shadcn token** | 颜色走语义名；**盒子尽量像素级对齐 cxd**（32 控件 / 24 表单项 / 98 label / 40 表行），实现不引入 `cxd-` 前缀 |
| **默认自适应** | 特定组件铺满容器是默认，不必写 `size`/`w-full`。`size`/`className` 只是收窄或覆盖。规则：`.cursor/rules/component.mdc` |
| **组装容器** | schema 布局壳用 `div`（对齐 Amis），不用 `header`/`aside`/`section`；Form 仅顶层用 `<form>`，嵌套降为 `div`。规则：`.cursor/rules/component.mdc` |
| **kernel P0** | 语义设计 D1–D8：Scope、表达式过滤器、API 管线、事件对象、联动、表单路径值、渲染器契约、诊断 |
| **占位 / 精简** | 占位：明确未接入；精简：能绑值渲染但缺真实能力（`editor` Monaco 编辑器、地图、Office 预览等） |
| **JS SDK** | 任意 HTML 用 `vamis.embed` 挂运行时（对齐 Amis `amis.embed`）。规格见 [JS SDK](docs/superpowers/specs/2026-10-21-vamis-js-sdk.md)；P0 已落地 |

## 当前进度（2026-11-12）

回写时更新日期，并同步组件 TODO 汇总行、同步状态里的覆盖数字（若 type 有增减）。

| 面 | 状态 | 说明 |
|----|------|------|
| type 名称覆盖 | 184 / 189（97.4%） | 见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md)；本轮补 `pager` → `pagination` 别名 |
| 组件语义（侧栏 155） | 已完成 **3** / 进行中 152 / 未开始 0，平均 **59%** | [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)；布局均 90%；功能均 80%；数据输入均 53%；数据展示均 56%；反馈均 89%；其他均 84%；≥50% **113** 项；`page` 进行中 95%（未达标准：`pullRefresh`）/ `container` 已完成 100%；`toast` / `hidden` 已完成 100%；`action` / `button` 95%；`app` 80%；`button-group` / `breadcrumb` 85%；`dropdown-button` 88% / `nav` / `anchor-nav` 80%；`tooltip-wrapper` 92%；`spinner` 95%；`alert` 80%；`dialog` / `drawer` 85%；`popOver` 属性 90%；`avatar` 90%；`tasks` / `audio` / `wizard` 80%；`badge` 95%；`remark` 92%；`web-component` / `amis` 80%；`table-view` 85% / `calendar` 88%；`table2` 70%；`card` 70% / `cards` 75%；`image` 90%；`icon` 90%；`service` 75%；`collapse` / `tabs` / `portlet` 85%；`divider` / `flex` / `grid` / `grid-2d` / `hbox` / `pagination` / `pagination-wrapper` / `panel` / `wrapper` / `switch-container` 90%；`form` 80%；FormItem 90%；Options 88%；`input-text` 92%；`checkbox` 90%；`input-date` 92%；`select` 92%；`input-file` 88%；`input-number` 88%；`switch` 88%；`input-image` 80%；`crud` 65%；`list` 62%；`code` 92%；`editor` 85%；`diff-editor` 65%；`tpl` 92% / `html` 90%；`static` 65%；`table` 55% |
| kernel D1–D8 | D1 / D2 / D3 / D4 / D5 P0 已落地；D6 路径值 / `validateApi` / 提交 `errors` / `autoFill` P0 已接；D7 注册信息已接 | Scope + Tpl 对齐 Amis innerHTML（插值默认转义）/P0 过滤器 + `requestApi` + 事件对象 + 动态 target + `test`/`weight`/`isolateScope`；D6 余项（combo 独立域）与 D8、D7 余项（错误边界）仍缺 |
| 视觉 | **cxd 转写** + **样式行为精度**：不搬前缀；helper 对标计算样式/盒模型，不是截图近似 | `.vamis-root` 走 `--fonts-base-family`、`14px` / `line-height: 1.5`（html/body 不钉字族）；浅色 `--border` 对齐 Amis `#e8e9eb`；Button 默认字重 400。`/style` 首页 **50%**，CSS 变量 **65%**。Layout / Flex / Grid / Box Alignment / Spacing / Sizing / Typography 14 页 / Border Radius·Width·Style / Box Shadow / Opacity / `state` **90%** 已按盒模型对齐。`text-color` / `background-color` / `border-color` 仍 55%（色盘表）。仍缺色盘表逐页核、像素级 Panel、`registerTheme` |
| Playground | `/` 文档 + `/components` 组件 + `/style` 样式 + `/examples` 示例 | 同一 5173；顶栏：文档 \| 组件 \| 样式 \| 示例 \| 编辑器 \| **对照**（整页跳 `/sdk/compare.html`）；`pnpm build` 全静态 HTML，可发 GitHub Pages。本机默认只听 `127.0.0.1`；`pnpm dev -- --host` 听 `0.0.0.0`，手机用终端 Network 地址 |
| JS SDK | P0 embed 已落地 | `pnpm sdk:build` → `sdk.js`（小 loader）+ `sdk.esm.js` + chunks + `sdk.css`；`<script src="sdk.js">` / `vamis.embed` 契约不变。monaco / echarts 按需。日期走 **dayjs**（打进 bundle），不再依赖 moment。对照报告 [SDK 对照报告](docs/superpowers/specs/2026-10-24-sdk-compare-report.md) |
| 编辑器 | 可用骨架 | 色板+树+画布点选/拖拽；无插件市场 |
| 在线文档 | 已并入 playground | 顶栏「样式」`/style` 已对齐 Amis CssDocs（开始 + Layout…Effect）；概念页「模板」**95% 已完成**、「表达式 / 数据映射 / 联动」**90% 已完成**、「事件动作」**85% 进行中**、「行为」**80% 进行中**、「样式 / 数据域」**75% 进行中**；类型页 SchemaNode **92% 进行中**；`pnpm dev` 首页即文档；` ```schema ` 进 `VamisRoot`；编辑 Schema 为 YAML/JSON 双 Tab 实时同步；顶栏可切桌面 / 移动（默认桌面，管整页示例；移动 **375×812** iframe + 手机壳）；文档/组件/样式页标题下「实现进度 · 状态」；右侧「内容」TOC（lg 以下隐藏，无左边框）；正文滚动条滚动时才显示 |
| 测试 | 源码用例 formula 185 + core 635 + sdk 75 | `pnpm typecheck`：本刀无新增错误（仓内仍有 Card/Tpl/Wizard 等既有报错）。SDK 对照目录 **1161**。`radio` 桌面 **1/7**（P0 0；探针读 combo.value / radio.rendered，Amis 空、Vamis 有域）。`input-number` 桌面 **11/12**（P0 0；#3 探针读 Amis `input.value` `$111,111%`、Vamis `getValue()` 数字 `111111`）。`input-file` 桌面 **10/10**（原 3 条探针假红已修）。`popover` 桌面 **4/4**（P0 0，CRUD 底栏 1710 条 / `maxButtons: 9`）；`pagination` **4/4**；`list` helper 页 **7/7**；`crud` 介绍页 **0/1**（P0 0，headerToolbar 探针既有差异）。`select` 桌面 **13/18**、移动 **13/18**（P0 0；`defaultCheckAll` 对照 Amis 空值、动作示例 Amis `rendered` 空）。本刀 PopUp 边框 token / 取消确认 14px 不影响对照分。`spinner` 桌面 **7/7**。`toast` 桌面 **11/12**（P0 0；基本用法 Vamis 合并成一条「弹出提示」，Amis 仍是两条按钮）、移动上次 **12/12**。`formitem` 桌面 **29/30**、移动 **29/30**（P0 0；父表单 `static: true` 时 Amis 静态项无原生 `[name]`，对照 rendered/value 不等）。`remark` 桌面 **5/5**。`badge` 桌面 **12/12**。`tooltip` 桌面 **11/11**。`schemanode` 桌面 **5/5**。`options` 桌面 **38/39**、移动 **38/39**（P0 0；`selectFirst` Amis 空值 / Vamis `a`）。`dropdown-button` 桌面 **4/4**、移动 **4/4**。`action` 桌面 **38/38**、`button` **7/7**（P0 `button-icon-only` 32×32 / padding 0）。`form` 桌面 **4/7**、移动 **4/7**（P0 0；#1 Amis 输入项 `rendered` 空、#4/#5 Amis `form.value` 空，与底栏无关）。`input-date` 桌面 **2/19**、移动 **2/19**（P0 0；对照不探打开后的 sheet）。`calendar` 桌面 **6/6**。`checkbox` 桌面 **6/9**（P0 0）。`input-text` 桌面 **24/24**、移动 **24/24**。`input-password` 桌面 **0/2**（P0 0；Amis 未命中 `[name]`）。`card` **5/5**、`cards` **3/3**、`image` 桌面 **14/19**（P0 0；static-image 对照 Amis 空值、preview/zoom 示例 Amis `rendered` 空）、`dialog` **4/5**（P0 0；#1 Amis 点后 `rendered`/`dialog` 空）、`drawer` **6/6**、`tpl` **5/5**、`html` **1/1**、`icon` **8/8**、`avatar` **13/13**。`table2` 对照 9/11（P0 0）。`switch` 桌面 **14/14**、移动 **14/14**（P0 0）；`hidden` 桌面 **1/1**、移动 **1/1**（P0 0）；`input-image` 桌面 **12/12**、移动 **12/12**（P0 0）。全量 **1124 过 / 48 败**（P0 8 均为 `m-l-*` helper，HEAD 基线同样 8；本刀 input-image/input-file 新增 0 败）。全局修完全量重跑，组件修完 `--page`；窄屏再 `--mobile`。 |

**最近交付**

- `input-image` #24：对齐 Amis InputImage。复用 InputFile 上传管线（不另写一套）：`receiver` POST form-data、`autoUpload` / 手动上传 / `hideUploadButton`、`multiple` / `joinValues` / `extractValue` / `delimiter`、`accept` / `capture`、`maxSize` / `maxLength`、`limit` 尺寸校验、`frameImage` / `fixedSize`、`uploadBtnText`、`autoFill` / `initAutoFill`（源码默认 true）、`draggable` 排序、`change` / `remove` / `success` / `fail`、`clear`；缩略图 120 方块（`--input-image-*`，浅深 token）。文档按 Amis 章节改写（手动上传 / 隐藏按钮对齐双字段原例，多选 autoFill、其他表单项填充、initAutoFill、拖拽排序齐全）；缺 `crop` / `allowInput` / 预览画廊。对照桌面 **12/12**、移动 **12/12**（P0 0）。40% → **80%**；同刀修掉 `input-file` 3 条探针假红（10/10）。
- `hidden` #23：对齐 Amis Hidden。`wrap: false` 走 SchemaRenderer 新分支，不落 `.vamis-node` DOM；值由表单域初始化（`name` 路径 / `value` 表达式）并随提交，clear/reset 一并处理。文档按 Amis 章节改写（基本用法 + 属性 / 事件 / 动作表）。对照桌面 **1/1**、移动 **1/1**（P0 0）。70% → **100%**。
- `switch` #22：对齐 Amis Switch。`trueValue` / `falseValue`（宽松相等，默认 true/false）、`option`、`onText` / `offText`（字符串 / IconSchema / SchemaCollection）、`size` sm/md、`loading` / `loadingOn`（不可操作 + 滑块位转圈）、`change`、`clear` / `reset` / `setValue`、静态态；chrome `--switch-*`（44×20 / 滑块 16 + 2 边 / 30 圆角，浅 `#d4d6d9`、深 `#84878c`），不再用 shadcn Switch 皮。动作目标补跨数据域 `getComponentById`（`componentId` 从 form 外点 form 内，Amis 同款），文档沿用 Amis 的 `id` + `componentId` 写法与 ajax 异步示例；`hidden` 改回渲染 null（Amis 同款）。对照探针补表单项 `data-name` 定位 / 交互后读控件值 / 残留 toast 清理 / ajax 事件链不点。对照桌面 **14/14**、移动 **14/14**（P0 0）。65% → **88%**。
- 文档生成器把 `radio` / `switch` 加进手写白名单：`pnpm docs:build` 不再用生成器覆盖这两页。
- `radio` #21：对齐 Amis Radio（Combo 互斥圆点，不是 radios 组）。`trueValue` / `falseValue` / `option` / `optionType: button`（实心 brand）/ `change` / `clear` `reset` `setValue`。chrome `--radio-*`（18 圆 / 10 点）。Combo `comboApplyRadio` 写整列后返回 false，Radio 不再本地写字段。`input-table` 互斥未接。对照桌面 **1/7**（P0 0）。60% → **88%**。
- 对外发布材料：中英 README 首屏、`assets/readme/` 截图、`docs/marketing/`（检查清单 / GitHub 资料 / 渠道文案 / 长文 / npm 清单 / OG 卡）与社区文件（CONTRIBUTING / SECURITY / ROADMAP / CHANGELOG / issue & PR 模板）。未动运行时。
- `input-number` focus glow 打在 `.vamis-number-control`（包住单位 km），不再只亮输入壳。`displayMode: enhance` 对齐 Amis `inline-flex`，内层 90px，不再 `width:100%` 拉满。
- 对照页缓存戳改为产物 mtime（`__VAMIS_SDK_V__`），不再手写 `20261109j`。`sdk:build` 后刷新 `/sdk/compare.html` 就会拉新 `sdk.js` / 目录；切「移动」会重载 iframe。对照页没有文档站那种 HMR。
- 表单布局补 `mode: row` + Group 列盒：Combo 默认 `multiple: false`、内嵌 row 横排；Group ≥768 走 `Form-groupColumn` 均分。`width:100%` 相对列不再撑成整表宽。input-number 右侧步进长按对齐 rc-input-number（600ms / 200ms），enhance 两侧按钮不连加。
- `input-number` #20：对齐 Amis NumberControl。步进/精度/min-max、前后缀与千分位、单位、enhance、大数、resetValue / clearValueOnEmpty、change/blur/focus、clear/reset/setValue。chrome `--number-*`（高 32、handler 24、单位 56、pad 10）。对照桌面 **11/12**（P0 0）。55% → **88%**。
- `input-file` #19：对齐 Amis FileControl。`receiver` 默认 `/api/upload/file` POST form-data、`autoUpload` 默认 true、`accept` / `maxSize` / 多选 `joinValues`、`asBlob` / `asBase64`、拖拽 180 区、大于 5MB 走 start/chunk/finish、`change` / `success` / `fail` / `remove`、`clear`。文档主路径与四列表对齐。对照桌面 **7/10**（P0 0）。40% → **88%**。
- CRUD 切页对齐 Amis Table：`store.fetching` 时表格区盖 `Spinner overlay`（菱形标 + 浅遮罩/blur），底栏分页不盖。宿主是 `.vamis-crud-content`（`position: relative`），与 Page / Service 共用 `Spinner.vue`。
- CRUD 底栏按 Amis 两层：外层 `.Table-footToolbar` padding 12×4（盒 **54**），内层 `.Crud-toolbar` 40 / item 30 / float；`-10px` 抵 foot 的 padding，不再打在表格兄弟上（会叠进末行）。表体 `margin-bottom: gap-md` 16px，后面再跟组件不用改布局。
- CRUD 分页栏文字垂直居中：`前往` 改 `inline-flex` 居中（border-box 32 + 1px 边不要再叠 line-height 32）；页码 `ul` 去掉自身 12/32 行高 strut（否则统计/前往比数字高 1.4px）；统计行高改 32 与页码格同行。
- 表单 `static` PopOver 对齐 Amis `@PopOver({ position: 'right' })`：锚放大镜右缘，不再把 320 层 `center` 盖在整行控件槽上。
- List 盒模型对齐 Amis `List-items`：`div` 容器 `margin-right: 15px` / `margin-bottom: 8px`，行 padding 与斑马纹打在包装层 `.vamis-node`；list 字段 popOver 宿主 `display:block`，放大镜走 `svg.icon`（inline + `top: 0.125em`），不再用 flex/`display:block` svg 把行高吃掉约 7px。
- `popOver` 文档页剩余对齐：static/list 浮层锚 host（表单槽 100% 宽），不再因 14px 放大镜把 320 层甩出表单；CRUD 底栏改 `statistics` + `Pagination`（去掉默认导出/新增）；List 去掉默认「列表项」，hbox 列补 `ListItem-field` 标签。
- `popOver` 表格列定位对齐 Amis `targetOutter`：浮层相对整格 `td` 居中，不再跟放大镜点击点走。static / list / cards 仍以按钮/wrap 为锚。
- `popOver` 文档活示例对标 Amis 同名页：基本配置 CRUD 截断 + 精简写法、form / list / cards、更多配置 hover、`popOverEnableOn`。CRUD 无 type 列补 `PopOverHost`，卡片合成 tpl 带上 `popOver`。
- `popOver` #17：浮层走 `VamisOverlay`（`placement: center` 盖在触发器上）+ `--popover-layer-*`（320–640、`--z-popover` 1400）；放大镜 `VamisGalleryToolIcon zoom-in`；`textOverflow: ellipsis` 溢出才弹。缺 CRUD 默认工具栏像素。80% → **90%**。
- Image 放大工具栏对齐 Amis：白底圆角条 + 40×40 SVG（左/右旋转、放大、缩小、原始比例），文案只进 `data-tooltip`。关闭钮（Gallery / Dialog / Drawer）hover 向左滑出「关闭」（`tooltipIn` 从 margin:0 过渡）。
- Image 放大层对齐 Amis `Modal size=full`：黑舞台 1010×（视口-60）、关闭钮在面板右上（标题行即使空也占 18+18），不再缩成贴图的 320px 矮条。
- Form 管布局：`static-image` 不再给包装层 `inline-block`。horizontal / normal 的 `.vamis-node` 块级 100%，叶子 `.vamis-image` 才 inline-block。文档「显示模式」从 2×2 回到 Amis 那种一列、标签在左。
- `image` #16：放大预览（独立 Gallery，黑底白字）、`imageMode: original`、标题/说明拆分、`thumbRatio`、`href`、`clickAction`、click/preview/zoom、`static-image` 走 FormItem。文档主路径对齐。收工补：未注册 `actionType` + `componentId` 落到目标 `doAction`（文档「预览图片 / 放大图片」才能动）。缺 CRUD `enlargeWithGallary`。75% → **88%**。
- 文档移动预览单例 iframe 不再搬进手机壳：固定挂 body 按屏幕定位。先前 `appendChild` 换父级会让滚回视口时整页重载 preview-frame 资源。
- 文档侧栏 / 示例树筛选框有内容时右侧出现清除钮（共用 `VamisClear`），点一下清空并保持焦点。
- 文档移动预览：桌面默认不再 prefetch `preview-frame.html`（国内 GitHub Pages 跟首屏抢带宽）。切「移动」再拉。整页仍只挂一个 iframe；单帧约 7MB 对标 antd.mobile ~3MB 的拆注册表暂缓。
- 文档移动预览 iframe 不再打进 playground 文档壳 CSS：入口改 `preview-frame.css`（`@vamis/ui` + 页槽），生产 mock 动态 import。
- 文档移动预览 iframe `?dark&density&accent` 不再进表单 `debug`：PreviewFrame / SchemaPreview / Playground 预览关 `parseLocation`（对照 embed-case 同一闸门）。正式 embed 默认仍吃 location.search。同一页多个 form 会共享根域 query，不是表单之间没隔离。
- 样式规则补「遵循 / 违反 shadcn·Tailwind」判断标准：先分层（作者 class / 默认 chrome / 原语配方），默认 chrome 写工具类或硬套 shadcn 配方即违反；留原语换 token（窄屏 Form 贴 `--background`）算遵循。真源 `.cursor/rules/style.mdc`。
- 文档手机预览去掉 Tailwind `p-4` 灰包白卡：Page 槽走 `--page-body-padding` 16px，窄屏表单面板底改 `--background`（对齐 Amis Panel--form，不要 shadcn `--card` 升高一层）。
- 文档移动预览深色：后滚进视口的示例也会跟顶栏浅色/深色。主题写进 iframe URL 首屏，顶栏切色走 BroadcastChannel，不要只靠第一个 iframe 的 MutationObserver。
- 文档活示例桌面/移动改到站点顶栏（浅色/深色旁），一次切换整页示例。移动屏幕钉 **375×812**（对照 `--mobile` / iPhone X CSS，约 19.5:9），不要 500 矮框；独立 `preview-frame.html` + 手机壳，只给进视口的示例挂 iframe。默认桌面。
- `input-text` 多选 tag：关闭钮改 Amis `close.svg`（`VamisClose` 10px 线图，不要 `×` 文本）；省略只钉在 label `max-width: 60px`，短 OptionA 完整显示、长 OptionB 才省略。
- `input-text` `creatable: false` 选中后 focus 仍显示 label（Amis `TextControl-value`，不要只在 blur 写进 input）。多选一枚 tag 不再被 native `width:100%` 挤成两行高（`size=10` + `width:auto`）。
- DropDownButton `tooltip` 走 `VamisTooltipLayer`（对齐 Amis 外包 TooltipWrapper），不要原生 `title`。Tooltip `placement: top|left|right|bottom` 先指定边、主轴放不下翻对面，箭头 class 跟实际边。对照窄屏贴顶：Amis 裁在 `--top`，Vamis `--bottom` 翻到触发器下。不要再把这套 PopOver 翻层撤成贴边裁切。`sdk.js` loader 要把 `?v=` 抄到 `sdk.esm.js`。
- DropDownButton 菜单对齐 Amis `ul>li` 列表项：Action 在菜单里走 `isMenuItem`（`<a>` 无 Button 皮），不要把三个按钮横排成完整 Button。禁用项灰度 + not-allowed。
- `input-text` 拉 `source` 的 loading 画在控件右侧：`Spinner icon=reload size=sm`，对齐 Amis。Action 不再在 onClick 里自动转圈（只认 schema `loading` / `loadingOn`），「重新加载」按钮保持原样。
- `|json` 不再把 `undefined` 编成 `null`：空 `input-text` focus toast 对齐 Amis 空正文（只画图标），不要显示 `null`。真正的 `null` 仍是 `"null"`。写了 `msg` 但公式算出空时也不要回落「提示」。
- 撤回 `dropdown-button` / `input-text` 窄屏 `VamisPopUp`：对齐 Amis，两者贴触发器走 `VamisOverlay`。`options` 是前缀匹配提示，下拉按钮是就近展开，不是 Select 那种选完才确认的底栏。`dropdown-button` 85% → **80%**。
- 对照 `dialogOpen` 排除 `.vamis-popup` / `.vamis-date-sheet`（Select 底栏 `role="dialog"` 不要当成 Dialog 效果）。
- `table` / `table2` / CRUD 多选行间 1px：Tailwind `border-collapse: collapse` + `tr` `border-b` + 选中 `bg-accent` + checkbox `translate-y-0.5`，100% 缩放两行选中之间的横线会亚像素消失。改成 Amis `separate` + 线画在 td、选中底 `--table-checked-bg`（= `--card`）、勾不位移。单元格仍钉 40px，不要改成 41。
- 移动端 Select 普通多选行高对齐 Amis **37px**（36 line-height + 内层 `content-box` 1px 底边）。钉死 36 + 全局 `border-box` 会把线吃进裁切边，Chrome **100% 缩放**下变成亚像素看不见、一改缩放又出现。勾的垂直居中改 `margin-top: -8px`，不要 `translateY(-50%)` 开合成层。
- 移动端 Select 普通多选对齐 Amis：无左侧 Checkbox，选中项右侧 16px `check` 勾（`Select-option-mcheck`）；分组多选仍走 GroupedSelection 左侧勾选盒。
- 移动端 Select：滚轮 `menuTpl` 横向居中（独立 `__wheel-label`，不要 list 的 `flex:1`）；分组 GroupedSelection 组头 padding 12、子项 24（`gap-base * 2`），检索仍外 10 / 内 4×10。
- 表单 label 对齐 Amis：14px / `#5c5f66`（`--form-item-*`），桌面移动同一套。移动端不要跟 Panel title 抬到 16；不要 `text-foreground` / `text-muted-foreground`。分组 Select 底栏 400（PopUp），普通滚轮仍 320；移动端分组检索走底边线不是描边盒。
- 移动端 Select：普通单选才滚轮（`menuTpl` 进 slot，`${checked}` 是高亮行）；`selectMode: group` 走列表。窄屏表单面板对齐 Amis Panel--form：page padding 16、heading 8×12 / 40px、body 12、footer 0 12 12，再加 `width:auto; margin: 0 -12px 10px` 把面板吃到 343，Select 箭头才贴行右缘。
- 窄屏 Dialog 底栏均分：Action 的 `span.inline-block` 把 `width:100%` 卡在 54px。同时拉满 `[data-vamis-action]`。Collapse 窄屏箭头靠右 + `VamisCaret`；Tabs line 下划线拉满槽宽。
- 对照 `?vp=mobile`：顶层 `embed-case` 写 `env.mobileUI` 并钉 viewport 375；`compare.html` iframe 也带上 `vp=mobile`。手机开「桌面式网站」时 CSS 视口 ~980，不再误走桌面月历。不要用 UA 对抗桌面式。
- 移动端滚轮遮罩恢复 Amis 渐变：`hsla()` 写进 `PickerFade` inline style，绕过 lightningcss 编成 `#ffffffe6`。opacity 实心带会丢掉渐变；Amis 能渐变是因为产物里仍是字面 `hsla()`，不是 Tailwind「不适合移动端」。
- 表单清除钮统一 `VamisClear` + `.vamis-select__clear`（`input-text` / `input-date` / `select`），hover 走 `--select-clear-*`，不再用文字 `×`。
- 旧 WebView 提交钮掉成描边灰：`--primary` 是 `oklch()`，变量整段无效。默认改云舍蓝 `#2468f2`，5 色 oklch 放进 `@supports`；SDK 再追加 `@supports not` hex。
- 旧浏览器日期滚轮仍只露中间一行：源码 `hsla` 被 lightningcss 编成 `#ffffffe6`，WebView 当实心白。遮罩改成四条 `var(--cal-bg)` + `opacity` 带；对照 `embed-case` 给 `sdk.css` 加 `?v=` 冲缓存。
- 对照 URL 的 `engine` / `case` / `bucket` / `vp`、文档移动预览 `dark` / `density` / `accent` 曾经 `parseSearch` 并进表单 `debug`。`embed-case` 与文档 PreviewFrame / SchemaPreview 关 `parseLocation`；正式 `vamis.embed` 默认仍吃 location.search（对齐 Amis）。
- 对照 `/sdk` 开发机：`sdk.css` / `sdk.js` 用 `no-cache` + ETag（没改 304，`sdk:build` 后自动拉新），不要一年 immutable。带 hash 的 `assets/` 才长期缓存。gzipSync + Content-Length 仍保留。
- `embed-case.html` 顶层打开认 `?case=` / `?id=`（对照用例 id，也可写 `input-date` 这类片段），拉 `compare-cases.js` 后自己 embed；iframe 对照仍只吃 postMessage。手机可直接打开指定 case。
- Playground 支持 `pnpm dev -- --host`（或 `VAMIS_HOST=0.0.0.0`）监听全部网卡，手机可走局域网 IP 测窄屏；默认仍只绑 localhost。
- 窄屏日期滚轮对齐 Amis PickerColumn：鼠标滚轮/左键拖动不改值，只能点行选中；手指 touch 仍可滑。列区钉死 48×5=240，选中在第 3 行，横线等距；字号 16px/400；面板 `fontFamilyBase` + `1px solid var(--border)`。
- 表单窄屏 ≤767（Amis `media-breakpoint-down(sm)`，与 helper `m:` 同档）重新 layout：FormItem 标签 28% 与控件同行、底部分割线；日期/文本/Select 去边框；面板去灰底描边；底栏按钮 `flex:1` 拉满。所有表单控件自动吃到，不按 type 各写一套。`form` 75% → **78%**。对照桌面 iframe 768 仍走桌面。
- `input-date` 窄屏滚轮 PopUp 进出对齐 Amis：`is-in` / `is-out` 动画面板 **height 0**（贴底 overflow 像上滑/下滑），遮罩 opacity，`--animation-duration` 0.2s；关层等 animationend（500ms 兜底）再卸。不要 `translateY`。
- `input-date` 窄屏默认滚轮 PopUp：`mobile && !embed` 走 `DatePickerSheet`（320px、年/月/日[+时分秒]、取消/确认，复用 `CalendarWheel`）。输入只读、无 shortcuts。schema/env `mobileUI` 优先，否则 `matchMedia('(max-width: 768px)')`。桌面 1100 仍是月历 popover。进度 90% → **92%**（`input-datetime` 58% → 62%，`input-time` 55% → 60%）。未接 `mobileCalendarMode: calendar`、schedules。对照桌面/移动 `input-date` 仍 **2/19**（P0 0）。375 文档页点开为「选择年月日」滚轮，确认写入 `2026-11-08`。
- `checkbox` / Select 勾选 hover 改回 Amis：悬停 **label / option 文字** 也亮勾选盒（`.Checkbox:hover > i`；Select 的 Checkbox 是 option 整行）。只改盒子色，不改文案。先前只绑图标 `:hover`，是因为 Checkboxes/Select 用了无文字的勾选盒。
- `input-date` 限制范围：`minDate` / `maxDate` / `disabledDate` 在年、月面板也禁用范围外格子（对齐 Amis MonthsView / YearsView：该月/年没有任何合法天才禁）。日格子原先已接。对照桌面 `input-date` **2/19**（P0 0）。
- 月历标题箭头改用 Amis `right-arrow` / `right-double-arrow`（`VamisDateArrow` + `svg.icon`，nav `font-size: 18px`），不再自绘另一套 path。header 仍是 table-cell + 标题 inline。
- `input-date` / `calendar` 月历弹层色量化进 `--cal-*`（底/边 alias `--select-menu-*`；格子 hover `--cal-cell-hover-*`；非本月 `--cal-other`）。`.dark` 弹层跟 Select 菜单 `#17202d`，不再写死 `#fff`。进度 88% → **90%**（`calendar` 87% → 88%）。仍缺移动端 picker、schedules。对照桌面 `input-date` **2/19**（P0 0）、`calendar` **6/6**。
- `checkbox` option 改回 Amis `inline-block` + 勾选盒 `vertical-align: text-bottom`，图标与 option 文字底对齐；不再 `inline-flex` 居中（span 会吃满 21px 行高，光学偏）。
- `checkbox` 选中 hover 打在勾选图标本身（不是 option 行），色号 `--checkbox-checked-hover`（浅色抬 L = Amis brand-6）。表单勾、Checkboxes、Select 菜单勾共用；悬停选项文案不变浅。
- `checkbox` 按钮模式改成 Amis 同款：宿主 `label`、背景 transparent、选中只描边 + 左上角三角勾，不再实心蓝钮。
- `checkbox` #14：盒模型转写 Amis `_checks.scss`（`--checkbox-*` 16×16 / 圆角 2 / 勾 14；深色底 `#17202d`；禁用灰底不要 opacity）。`optionType: button` 改 32×min80 描边钮 + 左上角三角勾，不再用 shadcn Button。隐藏 input 不写 `name`（Amis 渲染器也不传，对照会命中 UA 隐藏盒）。`badge` 包 `BadgeHost`。进度 85% → **90%**（缺 themeCss）。
- 已推进组件的深色浮层回归表写进 [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)（不往 155 行主表加列）。`select` 已核；`checkbox` 默认皮已核；其余未核。优先有独立浮层的一行。
- 深色浮层收工口径写入规则：对照不切 `.dark`、不探 hover；组件刀必须浅+深手开 tooltip / PopOver。日期弹层已走 `--cal-*`；仍写死 `#fff` 的有桌面 Toast、`--remark-bg`。
- 深色主题覆盖 `--tooltip-*`；`maxTagCount` 溢出层跟下拉 `--select-menu-*`，不再白底深色标签。
- 分组单选下拉不再画右侧复选框，只靠 `is-active`（对齐 Amis `GroupedSelection`）。
- Select 多选可见 tag 悬停显示 label tooltip（`placement: top`），对齐 Amis `TooltipWrapper`。
- Select 清除图标默认浅灰（浅 `#d4d6d9` / 深 `#84878c`），hover 才加深，对齐 Amis `--Form-input-clearBtn-color`。
- Select 单行/多行共用 4×10 内边距；清除钮改 16px 图标，和箭头一起垂直居中。
- 多选折行不再把清除钮/箭头顶到上边（保持垂直居中）；`VamisOverlay` 观察触发器尺寸，全选变高后 PopOver 跟着底边走。
- `/api/mock2/form/getOptions` 默认选项对齐 Amis（A–Q 共 17 项）。多选未写 `maxTagCount` 时折行铺开，不再一律收成 `+N`。
- Select `overflowTagPopover` 溢出层改成可关闭的标签表格（对齐 `Select-overflow-wrapper`），文档 `maxTagCount` 与 Amis 一样设 100 才按宽度尽量多摆。触发器滚出视口时浮层跟着走，不再钉在屏幕底部。进度 **90%**。`selectMode: table` 仍未接。
- Select 双站对齐：分组下拉检索走 Transfer InputBox（32px、「请输入关键字」、右侧搜索图标）；选项 hover 刷小复选框边；多选按宽度收成 `+N`（`Number(undefined)` 不再误收成 `+N`，悬停走 Tooltip 明细）；`autoComplete` / `autoComplete3` mock 对齐 Amis `labelField`/`valueField`。进度 **90%**。table/tree/chained/associated 仍未接。
- Select `#13` 主路径：`menuTpl`（SchemaRenderer + extraData）、分组检索保树、`filterOption`（仅 `env.trusted`）、`searchApi`、`overlay` 宽/对齐（`%` 相对触发器）、`maxTagCount` `+N`、检索全选 `checkAllBySearch`、下拉 Spinner、focus/blur（含单选点选项关菜单）。文档按 Amis 章节改写，table/tree/chained/associated / defer / 人员点选标未接。进度 60% → **88%**。对照桌面 **13/18**（P0 0）。
- Spinner 默认标改成中心对称菱形：一枚原点四向裂开 → 依次连线 → 线消失 → 收回原点，2.7s `repeatCount="indefinite"`。开口 V + `begin` 链式会播完就停，也不是原点对称系统。色仍 `--primary`。进度 **95%**。后续再优先。
- Select 触发器 focus 与 InputText 共用 `--control-focus-glow`（Vamis 3px `color-mix`，不再是 1px 实线）。addOn 文案 focus 字色 `--control-focus-addon-color`（= `--primary`）；`borderMode: none` 无 glow、原生字色跟主题。无边框示例 `focus:text-primary`，不用 `indigo-700`。
- `input-text` chrome：hover 边走 `--primary`；half 保留圆角且深色仍用 `--card`（原生 input `appearance: none`，避免 UA 白底）；addOn 1px 竖缝；**文字/按钮 addOn 都 `transition: none`，先亮附加区再亮输入**。focus 3px glow 包整组。下拉 PopOver 默认 gap 4（只上下翻，不对左右开）；`input-date` / `dropdown-button` 也走 `VamisOverlay`。
- `input-text` #11：选择器检索对齐 Amis `matchSorter` CONTAINS（精确 / 前缀优先于包含、匹配高亮、多选「新增：」）；配了 `autoComplete` 不再本地过滤。建议下拉改 `VamisOverlay` `:gap="4"`。`input-password` 默认 `revealPassword` 显隐钮（Amis `view` / `invisible` 线图，`review` / `encrypt`）。进度 82% → **92%**，密码页 60% → **90%**。对照桌面 `input-text` **22/24**（P0 0）、`input-password` **0/2**（P0 0）。双站核过：密码钮切明文、选择器输入 `a` 只出 `aa` 且匹配字高亮、弹层 Teleport。
- Options 下拉选中 / 悬停跟顶栏 5 色：`--select-option-active-color: var(--primary)`，悬停底 `color-mix` 进白（浅 20%）/ 黑（深 50%）保色相，不要 mix 进 `#17202d`（会把翠绿拉成青）。菜单底/边仍只跟浅深色。对照 `options` **38/39**（P0 0，仍是 `selectFirst`）、`select` **1/1**。
- Options 下拉弹层与控件间距对齐 Amis `margin-top: 4px`：Select 的 `VamisOverlay` 改 `:gap="4"`（上翻同样 4px）。深色 `--select-menu-bg` 改 `#17202d`。
- Options 下拉项对标 Amis：选中蓝字（`#2468f2`）不是灰底；悬停才是 `#e6f0ff`；项高 32、左右垫 10px。弹层改 `--select-menu-*` token，深色走 `#17202d` / `#1677ff` / `#0040bf`，不再写死 `#fff`。
- Chrome 下拉箭头统一成 Amis `right-arrow-bold` 线图：抽出 `VamisCaret`，Select 展开时 svg `rotate(180deg)` + `--animation-duration` 0.2s，DropdownButton 90°→270°。去掉 CSS 实心三角和 `▾`/`▸`。作者 FA 图标仍走 `resolveIcon`。
- Toast 属性表补齐枚举：外层 / ToastItem 的 `position` 列出七档（含 `center`），`level` 写出 `info` / `success` / `error` / `warning`；默认值写明窄屏 `center`、超时 4000 / error 6000 / 窄屏 3000（跟源码，不抄 Amis 文档的 5000）。
- Options `#10` 接 `editable` / `removable`：下拉项悬停出铅笔与删除；编辑走 Dialog（默认标题「编辑选项」、`editControls` / `editApi` / `editDialog`），删除走 `deleteApi`（默认 method delete）+ 可选 `deleteConfirmText`。`openDialog` 返回 Promise，浮层 Form 登记 `submitDialogForm`，确认钮提交内层表单后 `closeDialog(result)`。文档按 Amis 主路径补编辑/删除/控制选项高度（虚拟列表标未接）。进度 75% → **88%**。对照桌面 `options` **38/39**（P0 0）、`select` **1/1**。双站核过：点编辑弹出「编辑选项」，把 A 改成 AA 后下拉项更新。
- 对照页用例下拉加搜索：`#case-q` 按标题 / 页名 / id 筛选（多词 AND），上一个/下一个只在筛出的列表里走。不改当前已加载用例，直到点选或只剩一条时按 Enter。
- Toast `title` / `body` 接 SchemaNode：有 `type` 的对象或节点数组不再经 `toastText` 抽成纯文本，弹出时 `SchemaRenderer` + 点击当时的 data 快照。文档补「Schema 节点」活示例、属性表链 [SchemaNode](/types/schemanode)、多位置补 `center`。对照桌面+移动 **12/12**。进度 90% → **100% 已完成**。
- FormItem 属性表对照源码复核：主路径字段已接；未接是 `labelAlign`、`static*ClassName`、`autoFill.showSuggestion` 族、`autoFill.silent`（表里曾写成已接，代码未读）。进度仍 **90%**。对照 `formitem` **29/30**（P0 0）。
- FormItem 默认校验信息围栏改成合法 JSON（双引号 key/值），文档 `type: code` 才能按「接口返回示例」那样高亮。对照 `formitem` **29/30**（P0 0）。
- FormItem 属性表改成与 Amis 同结构的四列（属性名 / 类型 / 默认值 / 说明），类型链到 `/types/` `/concepts/`，补齐 `autoFill.*` / `static*` 各字段；文末补「支持静态展示的表单项」清单。不抄 Amis 版本号和 `examples/form/switchDisplay`。对照 `formitem` **29/30**（P0 0）。
- FormItem「格式校验」按 Amis 主路径对齐业务（规则表粒度 / `$1` / 默认 `validate.*` key / `isUrl.schemes` / `addRule`），但改写成 Vamis：去掉 Amis `2.2.0`/`1.4.0` 版本列、「amis 会有…」、`github.com/baidu/amis`；locale 指向 `@vamis/core` 的 `validateLocaleZh`。对照 `formitem` **29/30**（P0 0）。
- Action `level: link` 去掉 shadcn `hover:underline`，字色改 `--link-color` `#2468f2`（Amis `--button-link-default-font-color`）。格式校验补默认 `validate.*` key 表（可写中文或 locale key），文档对齐「默认的校验信息」+「支持的格式校验」规则表。对照 `action` **38/38**，`formitem` **29/30**（P0 0）。
- FormItem 链接皮肤对齐 Amis：`--link-color` `#2468f2`、无下划线；`.vamis-root a` 放 `@layer base`（压过 UA / preflight inherit）。`type: link` 不再叠 `text-primary hover:underline`。格式校验按 Amis 主路径补对象 / 多规则中途终止 / 字符串形式 / `validationErrors` / `$1` / 规则表 / `isUrl.schemes`，默认文案抄 zh-CN（`请输入数字`）。对照 `formitem` **29/30**（P0 0）。双站核过：密码链接同色无下划线，提交 `abc` 报「请输入数字」，`$1` 替换成「同学，最少输入10以上的数字哈」。
- FormItem「内联模式」活示例对齐 Amis 6.13.0：`scope="body"` 完整 form（含 `group`），不再套 `scope="form-item"` 把默认项收成 horizontal。未写 `mode` 的「常规」标签在上；`mode: inline` 项并排且项内左右。`type: group` 横排并把 `mode` 传给子项。对照 `formitem` **23/24**（P0 0）。双站核过。
- 水平表单未写 `label` 仍占标签列（只有 `label: false` 才去掉）。`button-toolbar` 按 Amis `@FormItem` 包进表单项布局；`button` / `action` 不是表单项，不能在 form 里自动包（toolbar 里会套两层）。
- FormItem 补「限制选择器类组件的展示数量」：`staticSchema.limit` 不是自定义 schema，`input-tag` 静态走 `type: tags`（Words + inTag），默认 10、可展开/收起。`type: tags` 从 `tag` 别名拆开。对照 `formitem` **23/24**（P0 0）。进度 88% → **90%**。
- 表单禁用态对齐 Amis：去掉 shadcn `disabled:opacity-50`，改用 `--control-disabled-bg` `#f7f8fa` / 字色 `#b8babf`。实测禁用框 32 高、灰底、边框 `#e8e9eb`，与 Amis 同。`collectFormItems` 走进 `grid.columns`，姓名默认值 `amis` 能写进域。对照 `formitem` **22/23**（P0 0）、`input-text` **24/24**。
- FormItem 主路径 82% → **88%**：事件动作 `static` / `nonstatic` 走全局 `status-store`（按 id 再 name），覆盖高于 schema.static；`submitOnChange` 改值即提交；label 按 HTML 渲染。status 字典必须直接读 key，`hasOwnProperty` 建不了 Vue 依赖（点「展示态」不切静态）。textarea 把 `name` 落到原生控件。对照桌面 **21/22**（P0 0）。缺 `autoFill.showSuggestion`、combo/table 路径级报错。
- `remark` 主路径 92%：问号徽标转写 Amis `_remark.scss`（`--remark-*` 16px / 左缝 8px / 悬停 `#ff9326`），浮层复用 `VamisTooltipLayer` Teleport（`--z-tooltip` 1600），不再用 shadcn Tooltip。`content` 文本 / `{ title, body }`、`shape: circle`、变量、`placement`、自定义 `icon`、`mobileUI` Dialog 已接。对照桌面 **5/5**。缺 `themeCss`。
- `badge` 文字角标曾设 `content-box` 再叠 `height: size+2`，比 Amis 高 2px。Amis 是 `html { box-sizing: border-box }`，`size+2` 用来吃 1px 边。已去掉 content-box。进度 **95%**。缺 `themeCss`。
- TooltipWrapper 属性表 `body` 链到 [SchemaNode](/types/schemanode)。类型页按 Amis 主路径补齐模板 / Schema / 显隐 / SchemaArray（92%）。属性表类型列必须链到 `/types/`，不要纯文本。
- Overlay Tooltip 量收到 `:root --tooltip-*`，选择器只 `var()`，不再写死色/px，也不用 shadcn `--popover`。对照过了仍要并排开 Amis / Vamis 文档站（对照不探 hover 浮层）。`tooltip-wrapper` 进度 92%。缺 `themeCss`。
- 用 Amis 全量示例核对依赖图后再算：文档 ```schema **1882** 份 + examples 112。补 `nav.itemBadge`、`page.remark`、list/cards `popOver`、timeline→`card`、transfer/input-tree→Options；删 checkbox/radio `withBadge`、`table → checkbox`。主干序号未变（`icon` #1 … `action` #8，`form` #27、`crud` #64、`page` #65）。拓扑图只画主干；分 type 图改为开工前置闭包（全部祖先），避免只看直接依赖再踩 Action 研发把 chrome 当装饰。脚本 `scripts/audit-amis-examples.mjs`。
- 依赖图按构建依赖**全表**重算，不是只改 Action。补 `withBadge`、`labelRemark`→`remark`、Form `wrapWithPanel`、Spinner 宿主、Table `itemBadge`、`input-text` 选择器、`calendar` extends `input-date`。主干变成 `icon` #1 → `badge` #2 → `tpl` #3 → `tooltip-wrapper` #4 → `remark` #5 → FormItem #6 → `action` #8；`spinner` #12、`form` #27、`crud` #64。对照桌面 `action` 仍 **38/38**。
- Action `tooltip` / `disabledTip` 接 TooltipObject（tooltip-wrapper 字段：`title` / `content` / `tooltipTheme` / `showArrow` / delay / `trigger` / `offset` / `enterable`）。字符串仍可用。对象里的 `placement` 优先于 `tooltipPlacement`。禁用且未写 `disabledTip` 时不回落到 `tooltip`。浮层仍 Teleport，`--z-tooltip` 1600。对照桌面 `action` **38/38**。
- Action `mouseenter` / `mouseleave` 悬停一次只 toast 一条：`SchemaRenderer` 宿主对 `action` / `button` / `submit` / `reset` 跳过这两类事件（与 click 的 `SELF_CLICK_TYPES` 同理），只留按钮自己派发。mouseenter 不冒泡，子节点 `stopPropagation` 挡不住父级。
- Action 容器 tooltip 真正逃出文档预览 `overflow: hidden`：`VamisOverlay` Teleport 到 body、`--z-tooltip` 1600，打开后先 hidden 再定位以免 0,0 闪到左上。事件表对齐 Amis 6.13.0：`click` / `mouseenter` / `mouseleave` 三节活示例，`${event.context.nativeEvent.type}` 实测为 click / mouseenter / mouseleave。对照不要用 click 探 hover；无 label 容器 Action 按下标找节点并点内部 button。对照桌面 `action` **37/37**。
- `env.confirm` 对齐 Amis 6.13.0 `Alert.confirm`：去掉 Playground 原生 `window.confirm`。`confirm-store` + `ConfirmHost` 复用 Dialog 原语。实测盒模型与 Amis 同为 **500×164**、`top: 60`、padding `24px 0`、标题 14px/500、正文 margin `16px 0 24px`、页脚钮 72×32、无关闭 X、Esc / 点遮罩不关、确认 `danger`。对照桌面 `action` **34/34**。无 Host 才回落原生以免单测挂死。
- `#9 Options` 抽出可复用契约：`normalizeOptions` / `joinValues` / `extractValue` / `delimiter` / `source`（数据域 + 远程）/ `selectFirst` / `checkAll` / `labelField` / `valueField` / `clearable` / `searchable` / `creatable` / 选项 `autoFill`。`select` 接入 `useOptionsControl` + `VamisOverlay`。文档按 Amis options 主路径补活示例。进度 35% → 75%。对照桌面 `options` **31/32**（P0 0）、`select` **1/1**。缺 editable / removable / deferApi / 虚拟列表。
- 云端任务必须先批准：写入 `.cursor/rules/cloud-approval.mdc`（始终生效）并挂进 AGENTS。未经当轮明确批准禁止 Cloud Agent / 云端子代理；本机命令不受限。
- 历史教训独立成 `.cursor/rules/lessons.mdc`（始终生效）。组件修复后必须去重回写：先搜已有条目，同一根因只改「稳定做法」或追加 `触及`，禁止把「最近交付」搬过去。收工清单挂上 `update-progress.mdc` / AGENTS。已从规则禁止项与既往交付收成可复用经验（组装壳、浮层 Teleport、对照产物、Dialog 断点等）。
- 所有弹层翻转对齐 Amis Overlay `placement: auto`：下左 → 下右 → 上左 → 上右；视口底边剩余高度小于弹层则向上开。写进 `overlayPosition` / `VamisOverlay`，规则 `.cursor/rules/reuse-overlay.mdc`（所有 `VamisOverlay` 共用，禁止各写一套）。文档页贴底实测翻上（触发器底 627 / 视口 640，弹层 top 301）。对照桌面 `input-date` **2/19**（P0 0）。
- `input-date` 日历弹层盒模型对齐 Amis 6.13.0：内侧 `.rdt.rdtStatic.rdtOpen` **240×290**（Vamis `.vamis-cal`），`.DatePicker-popover` **242×292**、`padding: 0`、边框 `#f2f3f5`、select-outer 阴影。根因是弹层 8px padding + `min-width: 256px`，以及 Tailwind 清掉 td/th 的 UA `padding: 1px`。文档补齐观察句与 `popOverContainerSelector`。进度 85% → 88%。对照桌面 `input-date` **2/19**（P0 0）、`calendar` **6/6**。
- 日期/日历按 Amis 链收敛：抽出共享 `DateCalendarPanel`（`type: calendar` 与 `input-date` embed/弹层同一套月历）。非 embed 弹层走 `VamisOverlay` Teleport 到 `getModalContainer`（默认 body），z-index `--z-dropdown` **1000**，不再被文档预览 overflow 裁切。规则 `.cursor/rules/reuse-overlay.mdc`。`input-date` 82% → 85%，`calendar` 85% → 87%。对照桌面 `input-date` **2/19**（P0 0）、`calendar` **6/6**。
- SDK 生产打包不再依赖 moment：公式 / `|date` / InputDate 迁到 dayjs（utc / customParseFormat / isoWeek / quarter 等 plugin）。pnpm 严格隔离下 Vite 从 sdk 上下文解不到 workspace 源码的裸导入，补 `workspaceBareResolve`。`pnpm sdk:build` 与 playground 生产构建通过；formula 185 / core 476 / sdk 60 仍绿。
- `action` / `button` 空 label + `icon`（或 `iconOnly: true`）对齐 Amis 6.13.0 `Button--iconOnly`：`padding: 0`、`min-width`/`height` 跟档位（默认 **32×32**，xs/sm/md/lg = 22/30/32/38）。Font Awesome `<i>` 与 svg 都走正方形；有文案和 `level: link` 不切。进度 94% → 95%。
- `action` / `button` 文档站视觉对齐 Amis 6.13.0 cxd：`secondary` 实心中灰白字、`dark` 实心炭灰、`light` 浅底深字（不再 ghost）、`info` 走 `--primary`（cxd info=brand-5）。尺寸 xs/sm/md/lg 实测 22/30/32/38px（`--button-h-*`，不改控件 `--control-h`）；圆角 4px。主题/尺寸活示例改 `button-toolbar` 并排。dialog / confirm / ajax / toast / download 等改回活预览。进度 92% → 94%。对照桌面 `action` **34/34**、`button` **6/6**（P0 0）。
- `#8 input-date`：日历点选（不再用原生 `input[type=date]`）、`format`/`valueFormat` 默认 `X`、`inputFormat`/`displayFormat`、相对默认值（`+1days`/`today`）、`minDate`/`maxDate`（固定、相对、`$start`/`$end`）、`shortcuts`（预设与表达式）、`utc`、`embed`、`clearable`、`disabledDate`（`env.trusted`）、`change`/`focus`/`blur` 与 `clear`/`reset`/`setValue`。文档按 Amis 各章补活示例。进度 55% → 82%。薄别名 `input-datetime` 50% → 58%、`input-time` 45% → 55%。对照桌面 **2/19**、移动 **2/19**（P0 0）。未标 100%：移动端 picker、`popOverContainerSelector`、schedules。
- `#7 checkbox`：`trueValue`/`falseValue`（宽松相等）、`option` 与 `label` 分工、`optionType: button`、禁用/只读/静态、`change`（可 `preventDefault`）、`clear`/`reset`/`setValue`（`componentId` 点到本项；`id` 与 `name` 都可寻址）。文档覆盖 Amis 各章活示例。进度 60% → 85%。对照桌面 **6/9**（P0 0）。动作走 #1 已落地的 `runComponentAction`。
- `#6 input-text` 主路径对齐 Amis 6.13.0：`addOn`（position / 一体边框）、`clearable` / `resetValue`、`showCounter` / `maxLength`、`prefix`/`suffix` 映射、`borderMode`、`trimContents` / `clearValueOnEmpty` / `transform`、focus class 与 `inputControlClassName` / `nativeInputClassName`。事件 focus/blur/change/clear（选择器另有 click/enter）；动作 clear/reset/focus/setValue/reload。选择器 options/source/autoComplete/multiple/creatable 已打通主路径。文档按 Amis 章节补活示例。对照桌面 **24/24**、移动 **24/24**。进度 60% → 82%。`revealPassword` 与选择器检索精度仍缺。
- `action` / `button` 对齐 Amis 文档主路径缺口：`countDown` / `countDownTpl`、`hotKey`、Action 当容器 `body`、`download` / `saveAs`、ajax `redirect` / `feedback`、`blank`、`copyFormat`、`tooltip` / `disabledTip` / `tooltipPlacement`、`loading` / `loadingOn`、`active` / `activeLevel`、`clear` / `clear-and-submit` / `reset-and-submit`。控制流 `switch` / `loop` / `parallel` 仍标 D4 P1。进度 85% → 92%。对照桌面 `action` **29/29**、`button` **8/8**。
- `tpl` / `html` 接 `maxLine`（`-webkit-line-clamp`）与 `showNativeTitle`；文档补属性表、click / mouseenter / mouseleave。`icon` 文档补颜色字号、FA v5/v6、事件；`nativeEvent.target.className` 可供 click 公式读取。进度 tpl 85% → 92%、html 85% → 90%、icon 75% → 90%。
- FormItem 接 `validateApi`、提交接口 `errors`、无弹层 `autoFill`（`api` + `fillMapping`，改值 250ms 去抖）、form `debug`。文档补服务端校验 / 自动填充 / 及时读其他字段。进度 75% → 82%；`form` 70% → 75%。mock 补 `saveFormFailed` / `formitemFailed` / `formitemSuccess` / `autoUpdate`。
- FormItem 接 `static` / `staticOn` / `staticSchema`（空值 `-`），表单 `labelWidth` 落到 `--form-label-width`。文档补禁用 / 显隐 / 静态展示章节。进度 70% → 75%。
- FormItem `mode: inline`：包装层 `.vamis-node` 改为 `inline-block`（`:has(> .vamis-form-item--inline)` + schema `mode:inline`），项间距对齐 Amis `--Form-mode-inline-item-gap` 16px。水平表单里的内联项与 Amis 一样并排，不再竖排。
- FormItem 默认间距：表单项被包在 `div.vamis-node` 里，原先 `:last-child { margin-bottom: 0 }` 把每一项缝都清掉了。改成只清表单 body 最后一个节点，对齐 Amis `--Form-item-gap` 24px。密码显隐开关属 `input-password`，不在本契约。
- 按依赖综合分做 #1 FormItem：路径值 `a.b` / `a.b[0].c`、`requiredOn`、`validateOnChange`、`clearValueOnHidden`、默认值表达式、labelRemark。文档主路径对齐 Amis formitem 章节。进度 48% → 68%，仍缺 validateApi / autoFill / static。
- 组件 TODO 优先级改为「依赖拓扑 + 综合分」：`S = 被依赖 × 8 + 深度`，Kahn 就绪集里 S 大者先做（`scripts/component-priority.mjs`）。`action` 从原 #33 升到 #5，`form` #49 / `crud` #59 / `page` #60；无人依赖叶子从 #61 起。分类表 `P` 列仍是阶段 P0。
- 组件 TODO 增加「实现标准（强制）」：组件与文档必须对标或超越 amis 对等内容；`page` 因 `pullRefresh` 未接从「已完成」降为「进行中」，全局已完成 1 项（`container`）。
- 组件进度核对（2026-10-28）：155 行逐项复核（注册 / 渲染器文件 / amis·vamis 文档页 / 行内「缺」项源码回查），重算分类与汇总为数据输入 48%、数据展示 55%、反馈 84%、合计 59%、≥50% 108；修正 `form/static`（65%）、`table`（55%）生成页，生成器 `parseTodo` 适配 8 列并保留 icon/image 手写页。
- 组件 P0 TODO 每行补 `vamis 文档` / `amis 文档` 两列：vamis 相对 `http://localhost:5173`（`/components/...`），amis 相对 `http://localhost:8888`（`/zh-CN/components/...`）；无独立页标 `—`，附录按父文档归并。路径与 `website/src/components`、`../amis/docs/zh-CN/components` 文件逐一核对。
- 修 `pnpm build`：Playground 不再让 Tailwind 解析 `@fortawesome/fontawesome-free`（会找不到包、还把 webfont base64 进 CSS）。Font Awesome 跟 SDK 一样构建后注入 `fontawesome.css`。
- Image 增加 `thumbMode: h-stretch`（按 `height` 拉伸、宽度吃满父级）；`thumbMode` 走模板插值。Cards 瀑布流改成一张 `image`，用 `${index % 2 === 0 ? 'h-stretch' : 'cover'}` 混排，不再用 `visibleOn` 双节点。
- 复合示例先补基础组件：Image 插值 `height`/`width`，只写 height 时宽度吃满卡片（瀑布流拉满）；默认仍是 110px 缩略图。Container 恢复 Amis `wrapperBody`（flex 也包一层），同级子 container 换行，不再用 `display:contents` 把作者/点赞挤成一行。Icon 外层 `inline-block`，和点赞数字同行。
- Cards 瀑布流作者/点赞不再换行：flex 子 `container` 去掉 `w-full`（`vamis-container-contents`），`columnsCount` 配 `column-width: 200px` 避免窄预览把卡片挤到 110px。CRUD `mode: cards` 全选可来回勾选；`[card 模式](./card)` / `[Service](./service)` 落到 `/components/card`、`/components/service`。
- Cards 对齐 Amis 文档标注：Image 默认 110px 缩略图（不把 `${imageHeight}` 拉满卡片）；container `display:flex` 走 `contents` 让作者/点赞同一行；CRUD `mode: cards` 勾选框 + 全选 + `checkOnItemClick`。文档 `./card` / `./service` 相对链接按当前页解析到 `/components/…`，不再变成 `/docs./service`。
- Cards 文档示例对标 Amis 主路径：基本用法（含 platform/grade）、CRUD `mode: cards` 批量操作、瀑布流（图 + `type: container`）。拿掉误放的「设置头像文本背景」和「空列表」。CRUD 无 `api` 时从 `source` 吃页数据；Image 吃 `height` / `thumbMode`。
- 文档活示例「编辑 Schema」移到预览框上方外侧，去掉画布 `pr-24`，示例吃满框宽。
- Dialog 桌面宽度回归：窄屏适配时 `DialogContent` 被改成 `max-w-none`，再加运行时拼接 `min-[576px]:max-w-[500px]`（Tailwind 扫不到），桌面弹层拉满。改回完整字面量 `max-w-[500px]` + `.vamis-dialog--default { max-width: 500px }`，100% 只留在 `<576`。对照 `toastOpen` 只认 `.vamis-toast` 条目（空 Host 不算打开）。dialog 桌面+移动 **5/5**，toast **11/11**。动窄屏必须桌面+移动一起跑。
- Toast 状态图标与 Alert 共用 lucide（`levelToFeedbackIcon`：info / circle-check / triangle-alert / octagon-x），不再另画一套 Amis `alert-*` SVG。
- Toast 对齐 Amis：去掉 vue-sonner。桌面 400px 白底 bounce、状态色图标、可叠多条、点击关闭、hover 暂停。`isMobile()` = `max-width: 768px`（对照「桌面」iframe 768 也是这档）走暗底居中、40px 图标、一次一条、3000ms。`center` 不再映射成 `top-center`。Host 挂 `VamisApp` 并 Teleport 到 body。
- Dialog 窄屏对齐 Amis Modal `<576`：弹层拉满、底栏取消+确认横排均分（对照「移动」/ `m:`）。原先 Tailwind `sm:flex-row`（640）把按钮竖排且确认在上。
- Dialog / Drawer 内 `type: form` 对齐 Amis `renderBody`：默认横排、`wrapWithPanel: false`、不画默认「提交」。浮层 data 按层压栈，关掉后不留上一张卡片的字段。Cards 点眼睛看详情时用当前卡片数据。
- 图标对齐 Amis：`resolveIcon`（含 `.` 当图片、`<svg` 内联、否则 class）；Font Awesome + v4-shims 打进 `sdk.css`；删掉 CSS mask 画 `fa-*`。规则写入 `style.mdc` / `component.mdc`。
- Action 未写 `label` 不再补「按钮」（对齐 Amis：有 icon 就只画图标）。Cards 基本用法改回 `icon: fa fa-eye`。
- Card `actions.icon`：字段本来就往 Action 传；底栏 inline-flex，图标走 Font Awesome class。
- Cards 空态「暂无数据」对齐 Amis `Cards-placeholder`：100px 高、边框、圆角、居中。
- Cards：默认栅格同一行拉齐高度；`masonryLayout` 才按内容各算高度。avatarText 不再默认 uppercase。
- Cards 默认栅格对齐 Amis `Grid-col--sm6/md4/lg3`：≥576 两列、≥768 三列、≥992 四列（原先 768 才两列，对照半栏看起来少一列）。
- Dialog 关闭按钮 hover 出「关闭」提示：对齐 Amis `data-tooltip` / `data-position="left"`（Drawer 同样）。
- Card 多媒体：图不再钉 `max-width: 180px`，走 `media.className`（文档主路径 `w-36 h-24`）；有 media/secondary 时底栏两个操作横排留缝，不挤成一列。
- Card 头像按 Amis `Card-avtar`：`max-width: 200px`、图随内容，不再钉 50×50（那是 avatarText）。底栏 actions 整格 hover（`#f7f8fa` + 主色字），去掉按钮描边。
- 数据展示中档一批：`card` / `cards` 主路径 70%。Card：header 标题/副标题/描述/头像/`avatarText` hash 取色、`body` 字段或字符串、`useCardLabel` 默认 true、`actions`、`href` 优先于 `itemAction`、`media` 默认 left。Cards：`source` 默认 `$items`、空态「暂无数据」、`columnsCount`、`masonryLayout` CSS 分栏。对照 card **5/5**、cards **4/4**。缺勾选/拖拽。
- 生产构建拆包：站点首页不再整包 monaco（约 4MB）/ echarts。文档 markdown 按页懒加载；路由拆 Doc / 示例 / 编辑器。SDK 仍 `<script src="sdk.js">`，内部改 ES chunks（`sdk.esm.js` gzip ~277KB），monaco / echarts 用到才拉。
- `table2` 选择列 hover：未选边框变主色、已选/半选底变浅主色，勾选图标 0.2s scale；单选圆同样边框 hover。对齐 Amis Checkbox 各状态。
- Calendar largeMode：跨日条点后一天只弹当天重叠日程（对齐 Amis `DaysView` 占位 `bg-transparent` 可点，payload 用当天 `scheduleData`）。Dialog 默认 `top: 60px`（`--Modal-content-startMarginTop`），不再垂直居中。
- Calendar largeMode 日程条：内层绝对定位 + ellipsis，对齐 Amis `ScheduleCalendar-text-overflow`（超出格子显示「这是…」）。
- Calendar 紧凑月历补齐 Amis `.rdtPicker` 的 `padding: 4px`，外框底边才离开最后一行日期（全局 token 肉眼几乎看不出）。
- 对照全局：`.vamis-root` / SDK 根走 `--fonts-base-family` + `14px` / `1.5`；embed `html` 清掉 Tailwind preflight。浅色 `--border` 对齐 `#e8e9eb`；Button 400。全量 **878/908**。CSS 变量页 **65%**。
- 修 table-view 对照 7 例：`:root` 补 `--borderColor` / `--TableCell-padding*`（原先 var 未定义，边框和内边距整段失效）；`colspan`/`rowspan` 缺省不再写成 0（Vue 模板 `|` 被当成按位或）；caption 居中。本页 **85%**。
- Calendar 顶栏 `margin-top: -8px` 垂直居中（抵消 table border-spacing）；滚轮选中线用 Amis 0.5px hairline。对照 calendar **6/6**。
- Calendar：滚轮可点非中间项；显示模式不高亮 value 那天；largeMode 外框 / 40px 星期行 / 日期居中 + hover。
- Calendar 窄屏年/月选择改成 Amis 滚轮：月份带年列、无滚动条、当前项居中，上下渐浅。
- Calendar 非本月日期用 Amis `#b8babf`，不再走偏深的 `--muted-foreground`。
- Calendar 日程点贴在日期格底（不挡数字）；`bg-secondary` 条用 Amis 灰 `#5c5f66`，白字可读。
- Calendar 顶栏改 SVG 箭头；点「年 / 月」切视图（窄屏 取消/确认）；点击日程点弹出「日程」表。`table` 能解析 `data: '${scheduleData}'`。
- Calendar `largeMode` 跨日连条：起始格 `width: N00%` 溢出到后续日，同周占位、周一重新起条，每格最多 3 条 + `N 更多`。
- 数据展示（中档一批）：`table-view` 80%、`calendar` 80%。Calendar 周一 7 列紧凑月历（禁止 helper `grid-cols-7`，Amis 该 class 实际 6 列）。对照 table-view **7/7**、calendar **5/5**。目录 **907**。
- 其他：`web-component` 80%（`tag` 默认 div、`props` 字符串 `${}`、`body`）、`amis` 80%（`schema` / `value` / `name`、JSON 字符串、`props` 盖到内层）。对照 web-component **2/2**、amis **3/3**。目录 **897**。跳过 Custom。
- `avatar` 对照 **13/13**（目录 **893**）。先前 1 败是 `onError: return true`：对照 `vamis.embed` 未开 `trusted`，字符串函数体不跑、结点 value 空。对照页现与文档预览一样传 `env.trusted: true`；SDK 默认仍关。文档主路径 90%（src 真图、fa-user、`$var`、gap 缩放、ribbon）。剩余 lineHeight 21/20、toast 字重走对照全局暂缓。
- 对照收割写进规则 `.cursor/rules/compare.mdc`：`compare-cases.js` / `dist/sdk.js` 不进 git，换机器不会自动更新。改完组件必须本机 `pnpm sdk:build`（运行时）+ `pnpm compare --page <type>`，收工清单与 AGENTS 已挂上。
- 文档活示例文案对标 Amis 主路径（按钮 / Nav 1 / 提示类文案 / HOT / 第一步·Step 2·Step 3），去掉残留的甲/乙/丙唯一后缀。对照目录仍 **886**：badge **7/7**、dropdown-button **4/4**、wizard **4/4**、nav **3/3**、pagination-wrapper **2/2**、button-group **4/4**、tasks **3/3**、spinner **5/5**。
- 文档活示例：每个语义示例只留一份 schema 围栏，去掉 JSON/YAML 甲乙孪生（对照解析后本就会去重）。切格式走「编辑 Schema」双 Tab。目录 **969 → 886**。`badge` 对照 **7/7**。
- 补 `TYPE_CATALOGS.popover`：侧栏文档 type 不是独立渲染器，但补全目录要有自述，否则 `schema-completions` 报缺 catalog。
- 其他：`badge` 80%（不是独立 type；挂 avatar / action / tpl / link / icon；mode 默认 dot、`text: 0` 隐藏、overflowCount、visibleOn、ribbon）。对照 **14/14**。目录 **969**。下一刀 **其他** web-component / amis 占位。
- 功能：`popOver` 80%（不是独立 type；挂 static / table 列 / tpl / list·cards；字符串精简写法、`trigger` click、`showIcon` 放大镜、`popOverEnableOn`、`mode` dialog/drawer）。对照 **8/8**。目录 **958**。
- 其他：`audio` 80%（inline 默认 true、controls / rates、时间 0:00）、`wizard` 80%（steps、上一步/下一步/完成、`startStep` 字符串、mode）。对照 audio **7/7**、wizard **9/9**。目录 **951**。
- 其他：`avatar` 80%（src > text > icon、shape/size/fit/gap、badge 数字或 `{mode,text}`）、`tasks` 80%（status 0–5、列名、上线/重试）、`badge` 属性 40%（挂在 avatar）。对照 avatar **13/13**、tasks **7/7**、badge **3/3**。目录 **936**。
- `dialog` / `drawer` 主路径 80%：`actionType` 打开 overlay、`size` / `position`、默认取消+确认、`showCloseButton` 默认 true、`closeOnEsc` / `closeOnOutside` 默认 false、嵌套压栈。对照 dialog **11/11**、drawer **13/13**。目录 **916**。
- `alert` 主路径 80%：`level` 默认 info、`title` / `body`、`showIcon` / `showCloseButton` 默认 false、`actions`、表达式 `level`。对照 **11/11**。目录 **894**。下一刀 **Dialog / Drawer**。
- `spinner` 主路径 80%：`show` / `showOn`、`size` sm|lg|空（16/48/32px）、`overlay` 源码默认 false、`tip` / `tipPlacement`、`delay`、`body` 容器。裸 spinner `inline-block`。对照 **11/11**。目录 **884**。
- `toast` 主路径 80%：`actionType: toast` 吃 `toast.items` / `position` / `timeout` / `closeButton` / `showIcon` / `allowHtml`，默认 `top-center`。对照 **15/15**。目录 **874**。
- 对照 iframe 按内容自适应，**屏幕上**夹 **360–800px**（半栏 scale 后仍保证可视 360，内页 `height:100%` 给下拉/浮层留空；超 800 内页滚动）。`tooltip-wrapper` 主路径 80%，对照 12/12。目录 **860**。下一刀 **Toast**（跳过 Custom / popOver）。
- 对照全局（字体 / token）先放下，按 Amis 侧栏一批做完再对照：`dropdown-button` 80%（三角改 CSS，对照按 `label` 定位 6/6）、`service` 75%（3/3）、`nav` 80%（4/4）、`anchor-nav` 80%（5/5）。目录 **848**。下一刀 **TooltipWrapper**（跳过 Custom / popOver）。
- 对照全局（字体 / token）先放下，按 Amis 侧栏一批做完再对照：`app` 80%、`button` 85%、`button-group` 85%、`breadcrumb` 85%。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`action` 主路径对齐 `level` / `primary`、`size`、URL `icon`、`confirmTitle`、dialog / drawer / copy / email。文档 **85% 进行中**。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`switch-container` 主路径对齐 `items[].body` / `visibleOn` 取首个命中、`style`、宿主 click/mouseenter/mouseleave。文档 **90% 进行中**。布局类主路径已齐。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`portlet` 主路径对齐 `tabs` / `source`、`description`、`hideHeader`、默认分隔线、全局与 tab 级 `toolbar`、`mountOnEnter` 默认 false。文档 **85% 进行中**。`wrapper` / `tabs` / `panel` / `pagination-wrapper` / `pagination` / `hbox` / `grid-2d` / `grid` / `flex` / `divider` / `collapse` 已对齐主路径。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`wrapper` 主路径对齐默认 `size: md` 内边距、`xs`–`lg` / `none`、`style` 对象与 `${style}`、`wrap`。文档 **90% 进行中**。`tabs` / `panel` / `pagination-wrapper` / `pagination` / `hbox` / `grid-2d` / `grid` / `flex` / `divider` / `collapse` 已对齐主路径。
- 对照页加 **上一个 / 下一个** 切用例（当前筛选列表内到头停住，显示 `N / total`，输入框外可用左右方向键）。下拉仍在，但不用在几百条里滚。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`tabs` 主路径对齐 `tabs[].body` / `tab`、`source` 动态、`activeKey` / `hash`、`disabled`、`mountOnEnter`、`change`。文档 **85% 进行中**。`panel` / `pagination-wrapper` / `pagination` / `hbox` / `grid-2d` / `grid` / `flex` / `divider` / `collapse` 已对齐主路径。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`panel` 主路径对齐 `title` / `header` / `body` / `footer` / `actions`、`affixFooter`。文档 **90% 进行中**。`pagination-wrapper` / `pagination` / `hbox` / `grid-2d` / `grid` / `flex` / `divider` / `collapse` 已对齐主路径。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`pagination-wrapper` 主路径对齐 `inputName` / `outputName` 客户端切片、`perPage`、`position`、内嵌 `pagination`。文档 **90% 进行中**。`pagination` / `hbox` / `grid-2d` / `grid` / `flex` / `divider` / `collapse` 已对齐主路径。
- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`pagination` 主路径对齐 `layout` / `mode` / `size` / `maxButtons` / 省略号跳页 / `change` 事件。文档 **90% 进行中**。补 `pager` 别名，覆盖 **184 / 189（97.4%）**。`hbox` / `grid-2d` / `grid` / `flex` / `divider` / `collapse` 已对齐主路径。
- 顶栏加 **对照** 入口（整页跳 `/sdk/compare.html`，带 `VITE_BASE`）；对照页标题右侧 **返回首页**。
- 对照下拉去掉重复和空用例：默认只收 Vamis 文档（不再混入 Amis `zh-CN/concepts`）；行首 ```schema 才收割，空 `{}` / 无子节点布局壳 / `type: code` 丢掉。同页标题按顺序 `#1…#n`。目录 **728**。
- 对照视口分 **桌面 / 移动**：按钮在 iframe 栏上方。桌面 iframe ≥768 排再缩进半栏；移动钉 375（Amis `sm` 窄屏表单）。URL `?vp=mobile`。Playwright `pnpm compare --mobile` / `pnpm compare:mobile`。全局修完桌面全量；动到 `m:` / 窄屏表单再跑移动端。
- 对照页 `compare-cases.js` **始终写完整目录**（文档 / 组件 / 样式）。`pnpm compare:p0` 只过滤 Playwright 跑哪些条，不再把下拉冲成 14 条功能用例。
- 对照页 Amis iframe 对齐官方 hello：`sdk.css` + `helper.css` + **`iconfont.css`** 在 `<head>` 并行拉，不再等 2.5MB `sdk.css` 串完再拉 JS。切用例时空白窗是加载顺序，不是主题没套上；云舍 Page 标题就是 16px/400、默认 Action 是白底描边。
- 对照重跑口径：**全局**修完必须 `pnpm compare` 全量；**组件**修完只跑自身 `pnpm compare --page button`（或 `--id`）。报告会列出建议命令。
- 组件对照改为 **schema 树结点级**：每个 type 结点对画出、运行时 value、`getComponentByName`、以及点过之后 dialog / toast / setValue。不再把「整页能画出」当成组件通过。`vamis.embed` 补 `getComponents()`。
- 对照页左右 iframe 按内容撑开高度（两边取较高的一侧），**屏幕上**夹 360–800px（半栏缩进后仍保证 360）；超过 800 内页滚动。切用例会先收到最小高度再长高。
- 对照用例按 Amis 文档侧栏分成 **文档 / 组件 / 样式**（`website/nav.mjs`）。Vamis 可以比 Amis 多（尤其是样式），多出来的页标 extra、对照页下拉前缀 `+`。`pnpm compare --bucket 样式 --section Spacing` 切一片跑；对照页有文档/组件/样式筛选。迭代回路：完成一侧栏项 → 跑该片对照 → 评审报告 → 下一页。
- 对照差异按 **全局 / 样式 helper / 组件** 分类汇总（对照页 + 报告），并带整改建议。全局先动 token / sdk 根，helper 补缺档，组件只改该 type。
- 对照页字体量测改读正文节点 + 实际 used face（canvas 解析栈），并对照 `body` 字体。指定栈都是 `-apple-system` 时不再漏掉 Amis html `PingFang SC` 或 `text-sm` 12px vs 14px；smoke 有字体差时判定为「字体差」，不挡 Playwright 文档 smoke。
- GitHub Pages 上对照页可用：`pnpm build` 把 `compare.html` / `embed-case.html` / `compare-cases.js` 拷进 `/sdk/`；文档链接带 `VITE_BASE` 并整页跳，避免 SPA 吃掉静态 HTML。Amis 栏仍依赖 unpkg。
- 对照页结果表补上字体信息：字号 / 行高 / 字体栈（hover 看完整 family）。字体差异标红并写进备注，不挡盒模型 / smoke 判定。
- 对照页结果表按用例 `measure` 换列：盒模型显示同一行/缝/盒子，smoke 显示状态/摘要；判定也跟当前用例走。
- SDK 对照自动化：`pnpm compare:p0` / `pnpm compare` 用 Playwright 对同一份 schema 跑 `amis.embed` / `vamis.embed`，写 [对照报告](docs/superpowers/specs/2026-10-24-sdk-compare-report.md)。本轮全量 **793**（P0 14 + 文档收割 779）**785 过 / 8 败**；文档 smoke 全过，失败全是 compact helper 阶（`m-l-sm` 10 vs 8，`m-l` 15 vs 12，`m-l-xxl` / `m-l-n` 未实现）。`--all` 再加 Amis 组件文档。判定是 Vamis 对齐 Amis **实测**。
- SDK 对照页 `/sdk/compare.html` 提供 **编辑 Schema**：YAML / JSON 两个 Tab，改一边立刻同步；解析失败时对侧与预览停在上一份能跑的 schema。改完把同一份对象 postMessage 给已挂好的 `amis.embed` / `vamis.embed`，不重载 SDK。用例下拉按组列出全部收割 case。
- SDK 根 `.vamis-sdk` 去掉 `background: var(--background)`。`--background` 是略灰的 shadcn 画布（`oklch(0.97)`），Amis embed / `.cxd-Page` 是白底；涂在 SDK 根上会在白 iframe 里多出一块灰框。画布仍由宿主 html/body 决定。
- SDK 对照已能量到真实盒子：`/sdk/compare.html` 同一份 schema 左右 `amis.embed`（unpkg `amis@6.13.0`）与 `vamis.embed`。默认两按钮两边都同一行、缝 0px；`className: m-l` 两边都同一行，但 Amis **15px**、Vamis **12px**（`--gap-base`）。Amis iframe 改为等到按钮出现再量，不再被 unpkg 慢加载误报「找不到」。
- Page 内容区去掉 `space-y-3`；`button` / `action` 的 `div.vamis-node` 改为 `inline-block`，两个按钮默认并排（对齐 Amis「样式」基本使用），`className: m-l` 才能拉开缝。
- 概念组未完成页对标 Amis 同名文档补活示例：「事件动作」**85% 进行中**（`onEvent` / 常用动作 / 事件对象 / `preventDefault` / `stopPropagation` / `ignoreError` / `expression`；控制流与广播仍缺）、「行为」**80% 进行中**（`type: action` 主路径；`clickAction` 未接）、「样式」**75% 进行中**（`className` / `cssVars` / `size` / 指向 `/style`）、「数据域与数据链」**75% 进行中**（补「发生了什么」与 `__super` 活示例；D6 / D9 / D10 仍挡）。
- 规则补上 Amis 对照仓相对位置（默认同级 `../amis`，不写本机绝对路径）以及文档 / 样式 / 核心 / 组件怎么查：`.cursor/rules/amis-lookup.mdc`。
- 项目规则按域合并：站点 → `.cursor/rules/site.mdc`，样式 → `style.mdc`，组件 → `component.mdc`。收工清单仍是 `update-progress.mdc`。
- `/style` Background / Border / Effect：`rounded-md` = 6px（不是 `--radius`）、`border-8` / `border-double`、Amis `shadow-lg` 第二层 `-2px`/`0.05`、补 `opacity-5`…`95` 与 `bg-none`。Radius / Width / Style / Shadow / Opacity **90%**；`background-color` / `border-color` 仍 **55%**（色盘表）。
- `/style/typography/font-family`：`font-sans` / `serif` / `mono` 改回 Amis helper 硬编码字栈（不再走 `--font-sans` token）。page / body 默认仍是 `--fonts-base-family`。
- `/style/typography` 14 页对标 Amis：字号走 `$fontSizes`（`text-lg` = 20px，不是 TW v3）；空白类名是 `white-space-*`；`tracking-wide` 计算值是 `normal`；补 `text-md` / `leading-3`～`10` / `list-inside` / `overflow-clip` 与 `m:` / `pc:`。`text-color` 仍 **55%**（色盘表）。其余 **90% 已完成**。
- `/style/sizing` 两页对标 Amis：Width / Height 独立活示例 + 组合；`w-16` = 64px、`w-1/2` 在 `w-80` 舞台 160px、`h-full` 在 `h-32` 舞台 128px；`max-h-none` 与 Amis 一样是 `max-height: 0`。各页 **90% 已完成**。
- `/style/spacing` 三页对标 Amis：Padding / Margin / Space Between 独立活示例 + 组合；档位是 Tailwind rem（`p-4` = 16px），不是 `--gap-xs`；`space-x-6` 仍是后续兄弟 `margin-left: 24px`；补 `*-none` / `*-18` / 负 margin / `mx-auto` 与 `m:` / `pc:`。各页 **90% 已完成**。
- `/style/box-alignment` 余 8 页对标 Amis：Justify Items / Self、Align Content / Items / Self、Place Content / Items / Self 独立活示例 + 组合；补 `justify-items-auto` / `place-items-auto` / `place-content-around|evenly` 与 `m:` / `pc:`。各页 **90% 已完成**。
- `/style/box-alignment/justify-content` 对标 Amis Justify Content：`justify-start` / `end` / `center` / `between` / `around` / `evenly` 独立活示例 + 组合；值是 `flex-start` / `flex-end`；补 `m:` / `pc:`。本页 **90% 已完成**。
- 修 `pnpm typecheck`：`SchemaObject.title` 对齐 Amis（`false` 隐藏 / 对象走子渲染器），顺带收紧 alert/confirm、编辑器树、iframe 的字符串用法。
- `/style/grid/gap` 对标 Amis Gap：`gap-*` / `gap-x-*` / `gap-y-*` 独立活示例 + 组合；档位是 Tailwind spacing（`gap-2` = 8px），不是 `--gap-xs`；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/auto-rows` 对标 Amis Grid Auto Rows：`auto-rows-auto` / `min` / `max` / `fr` 独立活示例 + 四档组合；`auto-rows-fr` 三行均分 96px；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/auto-columns` 对标 Amis Grid Auto Columns：`auto-cols-auto` / `min` / `max` / `fr` 独立活示例 + 四档组合；`auto-cols-fr` 三列均分 96px；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/auto-flow` 对标 Amis Grid Auto Flow：`grid-flow-row` / `col` / `row-dense` / `col-dense` 独立活示例 + 行列组合；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/row-start-end` 对标 Amis Grid Row Start / End：`row-span-*` / `row-start-*` / `row-end-*` 独立活示例 + 组合；`row-span-11` 与 Amis 一样是 `span 11 / span 1`；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/rows` 对标 Amis Grid Template Rows：`grid-rows-1`…`6` / `none` 独立活示例 + 四列组合；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/column-start-end` 对标 Amis Grid Column Start / End：`col-span-*` / `col-start-*` / `col-end-*` 独立活示例 + 组合；`col-span-11` 与 Amis 一样是 `span 11 / span 1`；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/grid/columns` 对标 Amis Grid Template Columns：`grid-cols-1`…`12` / `none` 独立活示例 + 四行组合；`grid-cols-7` 与 Amis 一样是 6 列；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/flex/order` 对标 Amis Flex Order：`order-1`…`order-12` / `order-first` / `order-last` 独立活示例 + 三行组合；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/flex/shrink` 对标 Amis Flex Shrink：`flex-shrink` / `flex-shrink-0` 独立活示例 + 三行组合；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/flex/grow` 对标 Amis Flex Grow：`flex-grow` / `flex-grow-0` 独立活示例 + 三行组合；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/flex/flex` 对标 Amis Flex：`flex-1` / `flex-auto` / `flex-initial` / `flex-none` 独立活示例 + 四行组合；补 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/flex/wrap` 对标 Amis Flex Wrap：`flex-wrap` / `flex-wrap-reverse` / `flex-nowrap` 独立活示例 + 三向组合；补 reverse / nowrap 的 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/flex/direction` 对标 Amis Flex Direction：`flex-row` / `flex-row-reverse` / `flex-col` / `flex-col-reverse` 独立活示例 + 四向组合；补 reverse 的 `m:` / `pc:`。本页 **90% 已完成**。
- `/style` 活示例下 HTML 源码围栏改为 `value: |-`，去掉 Code 展示末尾多出来的空行。
- `/style/layout/z-index` 对标 Amis Z-Index：`z-0`…`z-50` / `z-auto` 独立活示例 + 五卡叠层组合；补 `z-auto` 与 `m:` / `pc:`。本页 **90% 已完成**。
- `/style` 每个含 HTML 的活示例下附已格式化源码：复用 `type: code` / `language: html`（Code 组件）；`tpl: |` 也改成多行缩进。inline / inline-block 相邻节点不拆行，避免空白缝。
- `/style/layout/visibility` 对标 Amis Visibility：`visible` / `invisible` 独立活示例 + 与 `hidden` 占位对比；`m:` / `pc:` 已进 helper，不支持状态前缀。本页 **90% 已完成**。
- `/style/layout/top-right-bottom-left` 对标 Amis：`top|right|bottom|left|inset|inset-x|inset-y` 独立活示例 + 含块边/角组合；档位写入 `helpers-inset.css`（含负值 / auto / 分数 / `m:` / `pc:`）。本页 **90% 已完成**。
- 修 `/style` 活示例灰条贴卡片：`--muted` 与 `--card` 过近，填充改 `bg-yellow-200`、舞台改 `bg-gray-200`；语义色页仍演示 `bg-muted`。盒模型 class 未改。
- `/style/layout/position` 对标 Amis Position：`static` / `relative` / `absolute` / `sticky` / `fixed` 独立活示例 + 相对含块四角组合；`m:` / `pc:` 已进 helper。本页 **90% 已完成**。
- `/style/layout/overflow` 对标 Amis Overflow：12 条 `overflow` / `overflow-x|y` 独立活示例 + 横滚竖裁组合；补齐 hidden/visible/scroll 单轴和 `m:` / `pc:`。本页 **90% 已完成**。
- `/style/layout/display` 对标 Amis Display：block / inline / flex / grid / contents / hidden / flow-root / table 独立活示例 + table-* 列宽组合；`m:` / `pc:` 补齐 Amis 那套 display。本页 **90% 已完成**。
- `/style/layout/clear` 对标 Amis Clear：`clear-left|right|both|none` 独立活示例 + 左右浮不同高组合；`m:` / `pc:` 已进 helper。盒模型为同一元素上的 `clear`。本页 **90% 已完成**。
- 修 `/style/layout/float` 图下多空一行：`tpl` 不再套 `leading-relaxed`（1.625 → 22.75px），行高回到与 Amis 一致的 21px，绕排只空一行。
- 修文档 Markdown 列表序号：Preflight 清掉 `ol/ul` 的 `list-style`，`.doc-prose` 还原 `decimal` / `disc` 和左内边距；嵌套、引用、分割线一并补上。
- 修站点内容区滚动时 html/body 滚动条闪现：`scrollIntoView` 改为只滚文章/TOC 容器；`html,body,#app` 锁 `overflow:hidden`；Monaco overflow 宿主改为 `position:fixed`，避免撑高文档。
- 修 Monaco hex 色块被 inherit 拉高：token 仍 `line-height: inherit`，色块 `.colorpicker-color-decoration` 排除 inherit、写回 Monaco 的 `line-height:.8em`。重新打开 `colorDecorators`，色块可点出色板。
- `/style/state` 对标 Amis 状态页：**90% 已完成**。`hover:` / `active:`（含 `.is-active`）/ `focus:` / `disabled:` / `group-hover:` / `pc:hover:` / `m:hover:` 写入 `helpers-palette.css`；HTML 岛还原 UA button；`class="Button"` 只转写壳，不搬 `cxd-Button`。
- Monaco 内层 token 仍 `inherit`（压 Tailwind）；继承根钉在宿主 `--vscode-editor-line-height`（默认 20px）。色块不走 inherit。
- `/style/layout/float` 对标 Amis Floats：左浮/右浮/不浮动 + `pc:` 响应式活示例，盒模型 `w-32` 128px、`m-4` 1rem、≥768px 才 `float`。本页 **90% 已完成**。
- 样式对标口径升到 **行为精度**：后续 `/style` 按计算样式/盒模型对齐（同一元素、同一属性、同一值），现并入 `.cursor/rules/style.mdc`。范本仍是 `space-x-6` → 后盒 `margin-left: 24px`。
- 修两处回归：`space-x-6` 对齐 Amis（第二个盒子 `margin-left: 24px`），并清掉 Tailwind v4 写在第一个盒子上的 `margin-inline-end`，避免 24+24 叠成 48px。`.hidden` 改放到 `@layer components`，不再压过 `lg:block`，文档 TOC 回来。
- `/style/layout/box-sizing` 对标 Amis 同名页：左右 `box-border` 128px / `box-content` 160px。HTML 岛内去掉 Preflight 默认 `border-style:solid`，`border-4` 未配 `border-solid` 时不画边（不再多一圈蓝边）。本页 **90% 已完成**。
- 按观感下调 `/style` 进度（首页 80%→**45%**）。对标 Amis 活示例：Form 默认标题「表单」、默认只画提交、标题栏灰底；`className: text-green-700` 落到标签；调色盘（gray/red/yellow/green/blue/cyan/indigo/purple/pink 50–900）写入 `helpers-palette.css`，文档表按完整色阶生成。
- 对标 Amis `/style`：布局 / 语义色 helper 打进 `helpers-utility.css`（SDK 也能用）；`m:`/`pc:` 接到 display/flex/语义色，并加 Tailwind `@custom-variant`。颜色 / 背景 / 边框表补「示例效果」列。`cssVars` 对齐 `--primary-onHover`。Form / FormItem / Panel 接 `xxxClassName`；Container 写了 `bodyClassName` 不再强加 `space-y-3`。
- 更正「配色钉死云舍蓝」：云舍蓝只是顶栏 5 种主题色之一（云舍蓝 / 翠绿 / 琥珀 / 青空 / 玫红，默认色点），不是唯一主色、也不是禁用色。顶栏色点文案「墨蓝」改为「云舍蓝」。
- 更正「不搬 cxd-」口径：只禁止 `.cxd-*` 前缀和主题 SCSS；cxd 的盒子、密度、helper、交互尽量像素级转写到 shadcn-vue / Tailwind。写入术语 **cxd 转写**（现并入 `.cursor/rules/style.mdc`），并改掉 AGENTS / README / 样式 spec / 组件页模板里「不追像素」「只学密度」的旧说法。
- 顶栏补「样式」入口（文档 \| 组件 \| **样式** \| 示例 \| 编辑器），路由 `/style` 一等，侧栏对齐 Amis CssDocs。开始四页按 Amis 结构改写；辅助类目录（Layout / Flex / Grid / Box Alignment / Spacing / Sizing / Typography / Backgrounds / Borders / Effect）用生成器写出，不拷贝 Amis helper.md。旧 `/docs/style` 重定向到 `/style`。
- 清掉 `pnpm typecheck`：playground tsconfig 排除测试文件、补 `nav.d.mts`，并收窄 SchemaNode / 表单项 `label` / fetcher / Monaco 0.57 类型。`vue-tsc --noEmit` 现为 0 错误。
- 概念页「联动」对标 Amis 同名页：**90% 已完成**。`visibleOn` / `disabledOn`、select `source` 自动刷新、`sendOn`、主动 `reload`、提交回写、`form.target`、点号 `form.select`、逗号多目标、动态 `target` / `name` 已在 5173 核对。提交回写显隐用 `${id !== undefined}`（公式没有 `typeof`）。`clearValueOnHidden` 仍等 D6。
- 概念页「数据映射」对标 Amis 同名页：**90% 已完成**。模板字符串 / 链式取值 / `api.data` / `&` 展开 / `$table` 数组提取 / namespace / P0 过滤器均可跑。`dataMapping` 补上 `$rows` 提取。其余过滤器仍 P1。
- 概念页「表达式」对标 Amis 同名页：**90% 已完成**。使用场景、`${}` 语法、公式 / `ARRAYMAP` 箭头函数、函数手册（include `@vamis/formula` `doc.md`）均可跑。旧版纯 JS 仅兼容，不写入新示例（D2）。表达式诊断仍属 D8。
- 模板 HTML 岛：`.vamis-html` 只挂在 tpl/html 的 `v-html` 上，补回 `h1`–`h6` / `p` / `ul` / `ol` / `a` / 表格。不打 `vamis-root`，不改 `button`/`input`，shadcn 控件不受影响。
- `each` 去掉竖排壳，tpl 默认 inline。换行对齐 Amis：`inline: false` 独占一行，模板里 `<br>` 硬换行。`tpl`/`html` **85%**，`each` **70%**。
- JS SDK 文档 iframe 改为站点根路径 `/sdk/hello.html` 并加上 `VITE_BASE`。Pages 上相对 `../../sdk/hello.html` 会落到 `/docs/sdk/hello.html`，被当成文档 404。SDK 未构建时 iframe 提示先 `pnpm --filter @vamis/sdk build`，不再套 SPA「没有这份文档」。
- Pages 构建：SDK `dist/assets` 是目录（Monaco worker），playground 用 `copyFileSync` 会 EISDIR。改为 `fs.cpSync(..., { recursive: true })`。
- Pages CI：`monaco-editor` 只装在 `packages/vamis` 后，SDK 测试找不到根目录 CSS。Vite 别名改指向 `packages/vamis/node_modules/monaco-editor`。
- 为全部已注册组件补上智能感知自述（属性 / 事件 / 动作）。`registerRenderer` 按 type 自动并入；同名 `size`（dialog / editor / 表单项）与 `options`（select / editor）走当前节点。可在「编辑 Schema」里换 type 核对。
- Schema 智能感知改为组件自述：`registerRenderer({ name, description, schema, isFormItem, alias })` 注册即补全 / 悬停，不必再另维护一份平行目录。`isFormItem` 自动带表单项字段，别名共用同一套说明。
- 悬停 `"type": "form"` 不再套 Editor 的 `json-editor` 别名说明：`type` 键/值都展示当前节点的组件文档（Form 表单）。
- Schema 智能感知改为**组件树**：用 YAML/JSON AST 定位封装节点的 `type`，JSON Schema 用 `$defs` + `if/then` 分支（对齐 monaco-editor）。同名 `size` / `options` / `change` / `setValue` 走该组件自己的属性/事件/动作说明，不再用扁平目录串文档。
- Schema YAML/JSON 智能感知收进包：`@vamis/core` 持有 type/字段文档目录，`vamis` 导出 `registerSchemaIntellisense` / `mountFormEditor`。补全和悬停带文档级说明；低码应用写 `intellisense: schema` 或自行挂 Monaco 即可复用。站点「编辑 Schema」只消费，不自建目录。
- 文档「编辑 Schema」侧栏不能直接挂 `Editor.vue`：缺 `VamisRoot` 的 env 时 `useEnv()` 抛错，Sheet 只剩空白遮罩。现包一层 `VamisRoot`，Editor 无 env 时回退 `createDefaultEnv`。
- Editor 增加 `hideButtons`（藏全屏按钮；表单 body 全开时也不画默认提交/重置）、`size: full`、`intellisense: schema`（YAML/JSON 按已注册 type 与常见字段补全）。文档「编辑 Schema」从 textarea 换成该组件。
- Editor 感知框挂带 `--vscode-*` 主题的 overflow 宿主（不再直接挂 `body`，背景回来了）；全屏 Teleport 到 `body`，不被 Play 卡片 `overflow-hidden` 裁住。
- Editor 占位跟 Monaco 行号对齐（不再用 `text-sm` / `top-2` 页面样式）；感知框 `fixedOverflowWidgets` + 外框 `overflow: visible`，不再被圆角框裁切。
- Editor 语法高亮：表单项 `value` 回填进表单域（有 `name` 时不再丢掉 schema 初值）；文档基本用法改用 `value`，`placeholder` 单独成「占位」节（灰色浮层不是 token 高亮）。
- `code` 不再收 `options`（展示组件）；表单项 `editor` / `diff-editor` 接到同一套 Monaco 宿主，`options` 写在 Editor 文档。补齐 `js-editor` / `ts-editor` 及语言族别名。
- `code` 对齐 Amis：点击不出现编辑光标、不聚焦、不高亮当前行（只读展示，不是编辑器）。行号 / 折叠 / 感知仍默认关。
- `code` 默认关掉行号、折叠、悬停与补全；`lineNumbers` / `folding` / `options` 才打开。修好 `wordWrap`：编辑器 `min-w-0` 并按容器宽度两遍 layout，不再被长行撑开导致折行失效。
- `code` 文档多行 `value` 改成 YAML `|` 块标量；`stringifyYaml` 含换行的字符串不再打成 `"...\n..."`，编辑 Schema 的 YAML Tab 与文档同源。
- `code` 改为只读 Monaco 编辑器。`customLang` 规则 inherit 进共享主题，滚动回来高亮不再被全局 `setTheme` 冲掉。文档围栏进视口才挂载。`editor` / `diff-editor` 仍待接同一实例。
- `LazyComponent` 用法写进 [配置与组件](website/src/concepts/schema.md)，不另开扩展页。默认行为、Vue 包法、Form `lazyLoad` / Chart `unMountOnHidden`、文档 Play 可见才挂。不是 schema type，也没有全局「等可见才 initApi」开关。
- 文档 SPA 切页对齐 Amis MdRenderer：`DocView` 按 `route.path` 销毁并重建 Play/`LazyComponent`，切页前正文 `scrollTop` 归零。菜单在「配置与组件」和「数据域与数据链」之间切换时，离屏 `initApi` 不再沿用上一页的可见状态立刻发出。
- Form / Chart 文档补齐属性表、事件表、动作表（对齐 Amis 三套表；未接线标明）。`lazyLoad` / `unMountOnHidden` 写进属性表（Amis 源码有、官方文档未列）。内核 `LazyComponent` 默认 `defaultVisible: false`、`unMountOnHidden: false`。没有全局「等进视口才 initApi」开关。
- 对齐 Amis 远程接口生命周期：补 `isApiOutdated`。page/form `initApi`、service `api`、select `source`、crud/crud2 `api`、chart `api`、markdown `src` 在 url 不含 `$` 时只在挂载拉一次，数据更新不再重拉。`interval` 和显式 `reload` 仍会重拉。SchemaRenderer 不再因 schema 引用变化重建 Scope。wizard / mapping / nav / log / tasks / app 远程接口尚未接入。
- 对标 Amis「数据域与数据链」：概念页按同名文档改写活示例。原 90% 已完成偏高，降为 **70% 进行中**。inherit 节点不再因 `data` 建域；service 数据链遮蔽修好；表单提交 merge `id`；`static-tpl` 别名；`extra-data` 不再盖 `__prev` / `__changeReason`；`ajax` 记 `api`。`trackExpression` / CRUD filter 独立域 / 表单项写 page 域仍缺。
- 概念页「配置与 Schema」更名为 **配置与组件**（对齐 Amis 侧栏，路径仍是 `/concepts/schema`），并保留两种外形、书写规则、渲染管线（`parseSchemaText` → `jsonToIr` → `compileIrToWidget` → `SchemaRenderer`）。
- 组装容器写成项目规则（现并入 `.cursor/rules/component.mdc`）：Page 壳用 `div`；Form 顶层 `<form>`、嵌套降 `div`；禁止 landmark 标签与嵌套 HTML `<form>`。已写入 AGENTS / CONTEXT 术语。
- Page 根 / header / aside 改回 `div` 组装（对齐 Amis，避免宿主 landmark 样式泄漏）；标题仍用 `h1`。Form 套在另一个 form 里默认 `div`，`wrapperComponent` 可覆盖；嵌套时默认提交按钮是 `type="button"`，Enter 不冒泡提交祖先表单。
- Page header/toolbar 默认 `mb-0`（对齐 Amis，不再写死 `mb-4`）。Form `panelClassName` 走 `cn()` 覆盖默认 `mb-[var(--panel-margin-bottom)]`，`mb-0` 会真正清掉下边距。
- 配置与组件「通过树形来实现布局」的树改回与 Amis 同形：Toolbar → Form、Grid 下两列 Panel（Tabs → Chart / Chart）、CRUD，不再把 Panel 链压成一行箭头。
- 补 Amis 高度 helper：`className: h-full` / `min-h-full` / `h-1/2` 与 `m:` `pc:` 写入 `helpers-height.css`。SchemaRenderer 用 `vamis-node.h-full` 把内层根拉满；Grid 列 `items-stretch`，Panel 吃满父槽。配置与组件布局示例两列 panel 已写回 `h-full`。
- 对标 Amis「配置与组件」收口 [配置与组件](website/src/concepts/schema.md)：`type` + 属性、组件树、`page` 唯一顶级、树形布局活示例。D7 注册信息 `test` / `weight` / `isolateScope` 已接；`form`/`service`/`crud` 用 `scope: 'self'` 保数据链。Tabs 认 `tab` 内容，Grid 未写 span 时均分，Form `actions: []` 不再画出默认提交。
- 按文档导航收口 kernel：D2 模板默认文本节点（`|raw` / `type: html` 才 `v-html`），P0 过滤器 `date`/`datetime`/`number`/`percent`/`truncate`/`json`/`default`；D5 动态 `target` / 多目标 / `name?a=${a}`，SDK `getComponentByName` / `doAction` 可调用。Tpl / Html / Date / Number 文档进度随之上调。
- 顶栏搜索快捷键 ⌘K 从 10px 等宽字改成 12px Command 图标 + 12px K。
- 文档页标题下统一显示「实现进度 · 完成状态」（与组件页同一套）；现并入 `.cursor/rules/site.mdc`，并同步 [README.md](README.md) 当前状态。类型 / 概念 / 开始 / 样式 / 扩展手写页已补 banner；`types/api` 90% 已完成。
- kernel D3 API 管线 P0：`requestApi`（sendOn / cache / adaptor / `responseData` / `replaceData` / `messages` / GET `api.data` / `dataType` / GraphQL）。form / page / crud / service / select / ajax 已接；page/form/service/select 支持 url / `trackExpression` 自动刷新。文档 [API](website/src/types/api.md) 对标 Amis `types/api`。字符串 adaptor 仅 `env.trusted`（Playground 默认开）。
- Remark 默认改为方形（对齐 Amis 未写 `shape`）；`shape: circle` 才是圆。问号色 `muted-foreground/55`，hover 仍走 warning。
- Remark 问号改用 Amis 同款 SVG（12×12 viewBox，基线 y=10.5，铺满 16px 圆），不再用过小的描边图标。
- 修 Page `remark`：没有副标题时会画两个问号；图标改成圆形徽标（hover 走 warning），不再用幽灵按钮上的裸 `?`。
- kernel D1 Scope + D4 事件对象 P0：显式数据域（`__super` / URL query / 容器才建子域）、`VamisEvent`（`preventDefault` / `stopPropagation` / `setData` / `__rendererData`）、动作改注册表。Page / Container 文档主路径因此标已完成（page 95%，container 100%）。
- 文档页滚动条默认隐藏、滚动时才显示；右侧 TOC 去掉 aside 左边框，和正文连成一块。
- 站点文档右侧加「内容」TOC（对齐 Amis `Doc-toc`）：markdown `h2`–`h4` 补锚点，点击平滑滚动、滚动高亮；`lg` 以下隐藏；没标题不占栏。覆盖 `/`、`/docs/*`、`/components/*`。
- Page / Container 对标 Amis 文档：补齐示例与属性表、事件表、动作表。Page 接 `css` 块、remark 图标、`reload`/`setValue` 的 `dataMergeMode: override`、`event.data`；公式层加 `|json` / `|default` 与 `this.xxx`。仍被 D1/D4 挡住，不能标已完成。
- 组件侧栏把「组件介绍」挪到分组外第一项，不再挂在「布局」里。
- 正文字体改用 Amis `--fonts-base-family` 系统栈（PingFang / 微软雅黑 / -apple-system），等宽对齐 `--fontFamilyMonospace`；去掉 `@fontsource/ibm-plex-*`，不在产物里打包字体文件。`cssVars` 的 `--fonts-base-family` / `--fontFamilyBase` 会映到 `--font-sans`。
- 同步项目状态：`pnpm status -- --amis ../amis` 覆盖仍 181 / 189（95.8%）；amis master 仍停在 `43a33ee06`；同步文档基线改到 Vamis `f7aa2bb`。
- `@vamis/formula` 版权写成双声明：引擎原文仍是百度智能云爱速搭（MIT），包装与后续改动归 Vamis。
- 示例页右侧第三个 Tab 文案由「IR 源码」改为「Schema」。
- 对外文档去掉「围栏不是截图 / 真跑 / 编辑 Tab」这类站点说明，只留项目本身的内容。
- 站点首页改为文档：`/` 打开介绍页，示例挪到 `/examples`，旧 `/docs` 重定向到 `/`。
- 公式引擎搬进仓内 `@vamis/formula`（amis-formula 6.13.0 MIT）；`filterTpl` 走 parser，`${name|raw}` / `${name|html}` 可用。不再依赖 npm `amis-formula`。
- 文档「编辑 Schema」做成 YAML / JSON 两个 Tab，`syncAuthoringText` 双向实时同步；解析失败时对侧与预览停在上一份有效 schema。
- 布局对标起步：并行 `page` 70%、`container` 78%（仍进行中）。Page 接 initApi overlay / interval / aside / reload；Container 接 wrapperComponent / wrapperBody / 指针事件。文档手写活示例。
- 准则落地「作者态不强制 YAML」：YAML 与 JSON 并列；`parseSchemaText` / SDK / 编辑器都收；文档生成器与组件页去掉「不是 JSON」；Playground 源码可格式化为 YAML 或 JSON。
- 准则落地「默认自适应」：特定组件铺满容器不必写 `size`/`w-full`；Form 去掉 `max-w-3xl`；未写 size 挂 `vamis-control--fluid`；写入 AGENTS / 样式 spec §0 / `.cursor/rules/component.mdc`；文档主路径先给无 size 表单。
- 样式宽度对标 Amis：`size: full` 占满；xs–lg 仅 ≥576px 钉死且 `max-width: 100%`；helper `w-*`/`min-w-*`/`max-w-*` 带 `m:`/`pc:`；横排窄屏 label 约 28%。
- JS SDK P0 落地：`packages/vamis-sdk` 打出 `sdk.js` / `sdk.css`；`vamis.embed` 支持 JSON / YAML / IR，以及 `updateSchema` / `updateProps` / `unmount`；无构建页 `hello.html` 与文档 iframe `/sdk/hello.html`。
- 规格锁定必须支持 JS SDK：任意 HTML `vamis.embed(container, schema, props?, env?)`，与 Vue `VamisRoot` 同一内核；不搬 `amisRequire` / 不单独引入 `cxd.css`（能力打进 `sdk.css` 的 token / Tailwind）。
- 样式内核落地：`resolveClassName` / `resolveInlineStyle` / `resolveCssVars`；IR `metadata.style`（cssVars / density / className）；FormItem `size` 吃控件宽档；Table 吃 `--table-cell-px`；`m-t-xs` 等辅助类走 `--gap-*`。
- Playground 顶栏加上全站搜索（⌘K，覆盖文档 / 组件 / 示例）和 GitHub 仓库图标链接。
- Playground 顶栏色点可切换主题色（云舍蓝 / 翠绿 / 琥珀 / 青空 / 玫红），只改 `--primary` 色相，状态色不动；写入 `localStorage`。云舍蓝是其中一种（默认）。
- 文档产品名统一为 **Vamis**；IR 只写 LCDP IR / `lcdp.ir/v1`，不再写外部平台名。
- Playground `pnpm build` 全静态导出：每个文档/组件路径一份 `index.html`，可发 GitHub Pages（`VITE_BASE=/<repo>/`）；`/api/mock2` 打进前端 JS。首次需 Settings → Pages 选 GitHub Actions。
- Playground `/` 与 `/docs` 共用同一外壳：`max-w-[1800px]`、相同左右 padding、主栏 `flex-1` 撑满；文档不再套 `max-w-3xl` 把内容栏收窄。
- 锁定商业对齐口径：配色可自生成；cxd **盒子系统**（2px 阶、32/24/98/40）写入 token 与样式 spec；横排 label 从 120px 改回 98px。
- 文档 ` ```schema ` 对齐 Amis Play mini：同一 `VamisRoot` 真跑 + 侧栏改 YAML 即时预览；介绍页换成打 `/api/mock2/sample` 的 CRUD（筛选/批量/删除/重置）。
- 文档并入 Playground：`pnpm dev` 的 5173 同时提供文档 / 组件 / 示例，顶栏对齐 Amis；Markdown 仍在 `website/src`。
- 增加 `AGENTS.md`、`CONTEXT.md`、`CLAUDE.md` 与项目规则 `.cursor/rules/update-progress.mdc`：每完成一项任务必须回写进度/完成状态，并写下后续计划。
- 组件 P0 TODO 按 amis 文档侧栏分类落地。
- Playground 改为分类树 + 组件/示例/IR 三 Tab。
- 主题层用 shadcn CSS 变量对齐 Amis 后台水标（不搬 `cxd-` 前缀；能力转写到 token）。

## 后续计划

按「契约先于组件数量」排序。做完当前刀立刻改本段，把已完成的挪到「最近交付」。

1. **组件同步按全表构建依赖 + 解锁分 U 推进**：主干 `icon` #1（90%）→ `badge` #2（95%）→ `tpl` #3（92%）→ `tooltip-wrapper` #4（92%）→ `remark` #5（92%）→ FormItem #6（90%）→ `toast` #7（100%）→ `action` #8（95%）。`select` #13 已到 92%（移动端 PopUp 已接）；`checkbox` #14 90%；`input-date` #15 92%；`image` #16 90%；`popOver` #17 90%；`input-file` #19 88%；`input-number` #20 88%；`radio` #21 88%；`switch` #22 88%（缺 themeCss）；`hidden` #23 已完成 100%。下一刀 `input-image` #24 80%（缺 crop / allowInput / 预览画廊，不挡）。下一刀 `textarea` #25（60%）。`form` #27 80%。`radio` 余项 `themeCss` / `input-table` 互斥，不挡。`dropdown-button` / `input-text` 窄屏贴触发器走 Overlay，不要再接 PopUp。手机「桌面式」对照已靠 `?vp=mobile` → `env.mobileUI`，不要用 UA 对抗。schedules 已在 `calendar`。`spinner` 菱形标暂缓再优先。每刀收工除对照外，文档站再切一次「深色」打开 tooltip / 下拉 / PopOver（对照不探 hover、不切 `.dark`）。`switch` / `remark` / `badge` / `tooltip-wrapper` / `checkbox` 余项 `themeCss`，不挡；`hidden` 已 100% 无余项。FormItem 余项 `autoFill.showSuggestion` / combo 路径报错 / combo 独立域，不挡下一刀。收工必须并排开两边文档站。Action 余项：控制流 `switch` / `loop` / `parallel`（D4 P1）、按名字关祖先浮层、`nextCondition`。不要先做零被依赖段的展示叶子。完整顺序见 TODO「依赖与优先级」。缺一不得标 100%。跳过 Custom 与 office/pdf。做完 `pnpm sdk:build` + `pnpm compare --page …`，再开两边同路径页。SDK 打包已不再依赖 moment。
2. **P0 kernel D6 余项**：路径值 / `clearValueOnHidden` / `requiredOn` / `validateOnChange` / `validateApi` / 提交 `errors` / `autoFill` 已接到 Form。还缺 combo 独立域。数据域页里「表单项写到 page 域」仍可能卡 Scope。
3. **P0 kernel D8 诊断**：`env.debug`、未知 type 带 schema path、动作日志、渲染错误边界。对应文档 [调试](website/src/extend/debug.md)。
4. **D7 余项**：渲染器注入 `dispatch` / `reload`（RendererApi）；`editor` / `diff-editor` / Collapse 的组件动作仍缺。
5. **样式收尾（D12 余项）**：色盘表；Panel 像素级、其余 `xxxClassName`、`registerTheme`。helper `bg-secondary` 仍绑 shadcn `--secondary`（不要改成 Amis `#5c5f66`，会冲掉 Button/Badge）；日历条走 `--cal-bar`。**深色浮层回归**按组件 TODO「深色浮层回归」表打勾（优先有独立浮层的一行）。日期弹层已走 `--cal-*`；桌面 Toast `#fff` / `#151b26`、`--remark-bg` / `--text-loud` / `--fill-9` 未进 `.dark`。做法是补 token 覆盖，不要每个渲染器再写一套 `.dark .vamis-xxx`。
6. **暂缓：文档移动预览体积**（对标 antd.mobile 文档约 3MB）。单例 iframe 后仍约 7MB，大头是全量 `register.ts` + helper CSS。滚回视口不再重载（iframe 固定挂 body）。国内访问 GitHub Pages（github.io）本身慢，体积会直接拖体验；桌面已改为不预拉 iframe。以后要砍再拆注册表 / 按需渲染器，不要另打 mobile SDK。Actions Pages 没有 `gh-pages` 分支，jsDelivr 镜像也挂不上，换源另说。
7. **对外发布执行（非运行时）**：材料见 `docs/marketing/`；P0 阻塞 = npm 构建与发布、演示站自定义域名、GitHub About / topics / 社交预览。渠道与投放由作者执行；首发前按 `docs/marketing/00-launch-checklist.md` 验收。

非本阶段：office/pdf 真实预览、TinyMCE、MST、完整 amis-editor。`.cxd-*` 前缀永不搬入产物；cxd 能力转写是目标，不是非目标。
