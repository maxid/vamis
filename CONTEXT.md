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

## 当前进度（2026-10-24）

回写时更新日期，并同步组件 TODO 汇总行、同步状态里的覆盖数字（若 type 有增减）。

| 面 | 状态 | 说明 |
|----|------|------|
| type 名称覆盖 | 183 / 189（96.8%） | 见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md)；本轮补 `js-editor` / `ts-editor` 及语言族别名 |
| 组件语义（侧栏 155） | 已完成 **2** / 进行中 151 / 未开始 2，平均 **48%** | [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)；布局均 67%；`page` 已完成 95% / `container` 已完成 100%；`collapse` 85%；`divider` / `flex` 90%；`form` 68%；FormItem 48%；`select` 60%；`service`/`crud` 58%；`code` 92%；`editor` 85%；`diff-editor` 65%；`tpl`/`html` 85%；未开始：`popOver` 属性、`badge` 属性 |
| kernel D1–D8 | D1 / D2 / D3 / D4 / D5 P0 已落地；D7 注册信息已接 | Scope + Tpl 对齐 Amis innerHTML（插值默认转义）/P0 过滤器 + `requestApi` + 事件对象 + 动态 target + `test`/`weight`/`isolateScope`；D6/D8 与 D7 余项（错误边界）仍缺 |
| 视觉 | **cxd 转写** + **样式行为精度**：不搬前缀；helper 对标计算样式/盒模型，不是截图近似 | `/style` 首页 **50%**。Layout / Flex / Grid / Box Alignment / Spacing / Sizing / Typography 14 页 / Border Radius·Width·Style / Box Shadow / Opacity / `state` **90%** 已按盒模型对齐。`text-color` / `background-color` / `border-color` 仍 55%（色盘表）。Monaco hex 色块走装饰器 `line-height:.8em`，token 仍 inherit。仍缺色盘表逐页核、像素级 Panel、`registerTheme` |
| Playground | `/` 文档 + `/components` 组件 + `/style` 样式 + `/examples` 示例 | 同一 5173；顶栏：文档 \| 组件 \| 样式 \| 示例 \| 编辑器 \| **对照**（整页跳 `/sdk/compare.html`）；`pnpm build` 全静态 HTML，可发 GitHub Pages |
| JS SDK | P0 embed 已落地 | `pnpm sdk:build` → `sdk.js` + `sdk.css`；`getComponentByName` / `getComponents` / `doAction` 已接到根 ScopedContext。对照：样式看盒模型，**组件按 schema 树结点**对画出 / 值 / name / 动作。`pnpm compare --bucket 组件`，报告 [SDK 对照报告](docs/superpowers/specs/2026-10-24-sdk-compare-report.md) |
| 编辑器 | 可用骨架 | 色板+树+画布点选/拖拽；无插件市场 |
| 在线文档 | 已并入 playground | 顶栏「样式」`/style` 已对齐 Amis CssDocs（开始 + Layout…Effect）；概念页「模板」**95% 已完成**、「表达式 / 数据映射 / 联动」**90% 已完成**、「事件动作」**85% 进行中**、「行为」**80% 进行中**、「样式 / 数据域」**75% 进行中**；`pnpm dev` 首页即文档；` ```schema ` 进 `VamisRoot`；编辑 Schema 为 YAML/JSON 双 Tab 实时同步；文档/组件/样式页标题下「实现进度 · 状态」；右侧「内容」TOC（lg 以下隐藏，无左边框）；正文滚动条滚动时才显示 |
| 测试 | 源码用例 formula 185 + core 219 + sdk 46 | `pnpm typecheck` 已通过；SDK 对照目录 **747**。组件改树结点量测后，**功能**切片 14 条 **13 过 / 1 败**（Action toast 探测）。全局修完全量重跑，组件修完 `--page`；窄屏再 `--mobile`。 |

**最近交付**

- 对照全局（字体 / token）先放下，按 Amis 侧栏做组件：`flex` 主路径对齐 `justify` / `alignItems` / `alignContent` / `direction` / `items` / `mobile`。文档 **90% 进行中**。`divider` / `collapse` 已对齐主路径。
- 顶栏加 **对照** 入口（整页跳 `/sdk/compare.html`，带 `VITE_BASE`）；对照页标题右侧 **返回首页**。
- 对照下拉去掉重复和空用例：默认只收 Vamis 文档（不再混入 Amis `zh-CN/concepts`）；行首 ```schema 才收割，空 `{}` / 无子节点布局壳 / `type: code` 丢掉。同页标题按顺序 `#1…#n`。目录 **728**。
- 对照视口分 **桌面 / 移动**：按钮在 iframe 栏上方。桌面 iframe ≥768 排再缩进半栏；移动钉 375（Amis `sm` 窄屏表单）。URL `?vp=mobile`。Playwright `pnpm compare --mobile` / `pnpm compare:mobile`。全局修完桌面全量；动到 `m:` / 窄屏表单再跑移动端。
- 对照页 `compare-cases.js` **始终写完整目录**（文档 / 组件 / 样式）。`pnpm compare:p0` 只过滤 Playwright 跑哪些条，不再把下拉冲成 14 条功能用例。
- 对照页 Amis iframe 对齐官方 hello：`sdk.css` + `helper.css` + **`iconfont.css`** 在 `<head>` 并行拉，不再等 2.5MB `sdk.css` 串完再拉 JS。切用例时空白窗是加载顺序，不是主题没套上；云舍 Page 标题就是 16px/400、默认 Action 是白底描边。
- 对照重跑口径：**全局**修完必须 `pnpm compare` 全量；**组件**修完只跑自身 `pnpm compare --page button`（或 `--id`）。报告会列出建议命令。
- 组件对照改为 **schema 树结点级**：每个 type 结点对画出、运行时 value、`getComponentByName`、以及点过之后 dialog / toast / setValue。不再把「整页能画出」当成组件通过。`vamis.embed` 补 `getComponents()`。
- 对照页左右 iframe 按内容撑开高度（两边取较高的一侧），内页 `overflow: hidden`，尽量不出滚动条；切用例会先收回到最小高度再长高。
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

1. **组件同步（按 Amis 侧栏，全局字体/token 先不动）**：下一刀 **Grid**，然后 Grid 2D / HBox。组件修完只跑 `pnpm compare --page <type>`。
2. **P0 kernel D6 表单路径值**：`a.b[0].c` 读写、`clearValueOnHidden`。提交返回合并已接，不挡联动文档主路径。数据域页里「表单项写到 page 域」仍卡在这里。
3. **P0 kernel D8 诊断**：`env.debug`、未知 type 带 schema path、动作日志、渲染错误边界。对应文档 [调试](website/src/extend/debug.md)。
4. **D7 余项**：渲染器注入 `dispatch` / `reload`（RendererApi）；`editor` / `diff-editor` / Collapse 的组件动作仍缺。
5. **对照全局（暂缓）**：html/body 中文栈、`--fonts-base-family`、Button 字重。等组件主路径铺完再全量 `pnpm compare`。
6. **样式收尾（D12 余项）**：色盘表；Panel 像素级、其余 `xxxClassName`、`registerTheme`。

非本阶段：office/pdf 真实预览、TinyMCE、MST、完整 amis-editor。`.cxd-*` 前缀永不搬入产物；cxd 能力转写是目标，不是非目标。
