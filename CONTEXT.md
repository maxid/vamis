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

> **图表**：优先 mermaid。

## 模块层次

| 模块 | 路径 | 职责 |
|------|------|------|
| `@vamis/core` | `packages/vamis-core` | `registerRenderer`、IR、公式封装、Pinia hub、Scope/env/动作（契约仍在补） |
| `@vamis/formula` | `packages/vamis-formula` | 表达式 / 过滤器 / 内置函数（从 amis-formula 6.13.0 搬运） |
| `@vamis/ui` | `packages/vamis-ui` | shadcn-vue 原语与 CSS 变量（密度、状态色） |
| `vamis` | `packages/vamis` | Amis type 渲染器；`register.ts` + `extras/*.ts` |
| `@vamis/editor` | `packages/vamis-editor` | 树 / 画布 / 属性 / YAML |
| playground | `playground` | 文档（`/`）+ 组件（`/components`）+ 示例（`/examples`） |
| 文档正文 | `website/src` | Markdown 真源；playground 在 5173 渲染 |
| `@vamis/sdk` | `packages/vamis-sdk` | JS SDK：`sdk.js` + `vamis.embed`；P0 已落地 |

## 术语表

| 术语 | 定义 |
|------|------|
| **Amis** | 百度 JSON 低代码引擎（6.13.0）。Vamis 对齐其 **schema 语义**，不复制 React/MST/cxd |
| **type** | Schema 节点种类（`page` / `form` / `crud`…）。侧栏 155 项见组件 TODO |
| **已注册 ≠ 语义完成** | `registerRenderer` 有调用只说明能 resolve；进度看文档主路径 |
| **IR 信封** | `apiVersion: lcdp.ir/v1` + `kind` + `metadata` + `spec`。与 LCDP IR 同形 |
| **UiPage** | Vamis 扩展 kind，`spec` 里放 Amis widget 树 |
| **FormDef / TableDef** | LCDP IR 已有 kind；可编译成 form / crud 预览 |
| **作者态** | YAML 与 JSON 并列，不强制 YAML。对象 / JSON 字符串 / YAML 字符串 / IR 信封都进同一运行时 |
| **YAML 1.2 Core** | YAML 字面量：bool/null/数字不加引号；`yes`/`On`/`012` 当字符串。不约束 JSON |
| **Scope / 数据链** | 数据域 + `__super`；D1 主路径已接（page/form/service/crud），`trackExpression` 去抖仍属 D9 |
| **env** | 运行时注入：`fetcher` / `notify` / `jumpTo` / `alert` / `confirm`；`trusted` 才跑 adaptor 字符串 |
| **onEvent** | 组件事件到动作注册表；D4 P0 已接 |
| **shadcn token** | 颜色独立；**盒子对齐 cxd**（32 控件 / 24 表单项 / 98 label / 40 表行），不引入 `cxd-` |
| **默认自适应** | 特定组件铺满容器是默认，不必写 `size`/`w-full`。`size`/`className` 只是收窄或覆盖 |
| **组装容器** | schema 布局壳用 `div`（对齐 Amis），不用 `header`/`aside`/`section`；Form 仅顶层用 `<form>`，嵌套降为 `div`。规则：`.cursor/rules/assembly-containers.mdc` |
| **kernel P0** | 语义设计 D1–D8：Scope、表达式过滤器、API 管线、事件对象、联动、表单路径值、渲染器契约、诊断 |
| **占位 / 精简** | 占位：明确未接入；精简：能绑值渲染但缺真实能力（`editor` Monaco 编辑器、地图、Office 预览等） |
| **JS SDK** | 任意 HTML 用 `vamis.embed` 挂运行时（对齐 Amis `amis.embed`）。规格见 [JS SDK](docs/superpowers/specs/2026-10-21-vamis-js-sdk.md)；P0 已落地 |

## 当前进度（2026-10-22）

回写时更新日期，并同步组件 TODO 汇总行、同步状态里的覆盖数字（若 type 有增减）。

| 面 | 状态 | 说明 |
|----|------|------|
| type 名称覆盖 | 183 / 189（96.8%） | 见 [同步状态](docs/superpowers/specs/2026-10-20-amis-sync-status.md)；本轮补 `js-editor` / `ts-editor` 及语言族别名 |
| 组件语义（侧栏 155） | 已完成 **2** / 进行中 151 / 未开始 2，平均 **48%** | [组件 P0 TODO](docs/superpowers/specs/2026-10-20-vamis-component-todo.md)；布局均 62%；`page` 已完成 95% / `container` 已完成 100%；`code` 92%；`editor` 70%；`diff-editor` 65%；`tpl` 70%；未开始：`popOver` 属性、`badge` 属性 |
| kernel D1–D8 | D1 / D2 / D3 / D4 / D5 P0 已落地；D7 注册信息已接 | Scope + 模板转义/P0 过滤器 + `requestApi` + 事件对象 + 动态 target + `test`/`weight`/`isolateScope`；D6/D8 与 D7 余项（错误边界）仍缺 |
| 视觉 | 盒子数字对齐 cxd；配色独立；**默认自适应** | 字体走 Amis `--fonts-base-family` 系统栈（不嵌入 IBM Plex）；未写 `size` 即铺满；token + `m-t-xs` + `w-*`/`h-*`/`m:`/`pc:` + FormItem `size`（含 full，≥576px 钉档）+ Table cell；`xxxClassName` / `registerTheme` 仍 P1 |
| Playground | `/` 文档 + `/components` 组件 + `/examples` 示例 | 同一 5173；`pnpm build` 全静态 HTML，可发 GitHub Pages |
| JS SDK | P0 embed 已落地 | `pnpm sdk:build` → `sdk.js` + `sdk.css`；`getComponentByName` / `doAction` 已接到根 ScopedContext |
| 编辑器 | 可用骨架 | 色板+树+画布点选/拖拽；无插件市场 |
| 在线文档 | 已并入 playground | `pnpm dev` 首页即文档；` ```schema ` 进 `VamisRoot`；编辑 Schema 为 YAML/JSON 双 Tab 实时同步；文档/组件页标题下「实现进度 · 状态」；右侧「内容」TOC（lg 以下隐藏，无左边框）；正文滚动条滚动时才显示 |
| 测试 | 源码用例 formula 188 + core 140 + sdk 13 | `typecheck` 仍有既有错误；渲染器无组件级测试 |

**最近交付**

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
- 组装容器写成项目规则 `.cursor/rules/assembly-containers.mdc`（alwaysApply）：Page 壳用 `div`；Form 顶层 `<form>`、嵌套降 `div`；禁止 landmark 标签与嵌套 HTML `<form>`。已写入 AGENTS / CONTEXT 术语。
- Page 根 / header / aside 改回 `div` 组装（对齐 Amis，避免宿主 landmark 样式泄漏）；标题仍用 `h1`。Form 套在另一个 form 里默认 `div`，`wrapperComponent` 可覆盖；嵌套时默认提交按钮是 `type="button"`，Enter 不冒泡提交祖先表单。
- Page header/toolbar 默认 `mb-0`（对齐 Amis，不再写死 `mb-4`）。Form `panelClassName` 走 `cn()` 覆盖默认 `mb-[var(--panel-margin-bottom)]`，`mb-0` 会真正清掉下边距。
- 配置与组件「通过树形来实现布局」的树改回与 Amis 同形：Toolbar → Form、Grid 下两列 Panel（Tabs → Chart / Chart）、CRUD，不再把 Panel 链压成一行箭头。
- 补 Amis 高度 helper：`className: h-full` / `min-h-full` / `h-1/2` 与 `m:` `pc:` 写入 `helpers-height.css`。SchemaRenderer 用 `vamis-node.h-full` 把内层根拉满；Grid 列 `items-stretch`，Panel 吃满父槽。配置与组件布局示例两列 panel 已写回 `h-full`。
- 对标 Amis「配置与组件」收口 [配置与组件](website/src/concepts/schema.md)：`type` + 属性、组件树、`page` 唯一顶级、树形布局活示例。D7 注册信息 `test` / `weight` / `isolateScope` 已接；`form`/`service`/`crud` 用 `scope: 'self'` 保数据链。Tabs 认 `tab` 内容，Grid 未写 span 时均分，Form `actions: []` 不再画出默认提交。
- 按文档导航收口 kernel：D2 模板默认文本节点（`|raw` / `type: html` 才 `v-html`），P0 过滤器 `date`/`datetime`/`number`/`percent`/`truncate`/`json`/`default`；D5 动态 `target` / 多目标 / `name?a=${a}`，SDK `getComponentByName` / `doAction` 可调用。Tpl / Html / Date / Number 文档进度随之上调。
- 顶栏搜索快捷键 ⌘K 从 10px 等宽字改成 12px Command 图标 + 12px K。
- 文档页标题下统一显示「实现进度 · 完成状态」（与组件页同一套）；写入 `.cursor/rules/doc-progress.mdc`，并同步 [README.md](README.md) 当前状态。类型 / 概念 / 开始 / 样式 / 扩展手写页已补 banner；`types/api` 90% 已完成。
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
- 同步项目状态：`pnpm status -- --amis /Users/maxid/Develop/IdeaProjects/github/amis` 覆盖仍 181 / 189（95.8%）；amis master 仍停在 `43a33ee06`；同步文档基线改到 Vamis `f7aa2bb`。
- `@vamis/formula` 版权写成双声明：引擎原文仍是百度智能云爱速搭（MIT），包装与后续改动归 Vamis。
- 示例页右侧第三个 Tab 文案由「IR 源码」改为「Schema」。
- 对外文档去掉「围栏不是截图 / 真跑 / 编辑 Tab」这类站点说明，只留项目本身的内容。
- 站点首页改为文档：`/` 打开介绍页，示例挪到 `/examples`，旧 `/docs` 重定向到 `/`。
- 公式引擎搬进仓内 `@vamis/formula`（amis-formula 6.13.0 MIT）；`filterTpl` 走 parser，`${name|raw}` / `${name|html}` 可用。不再依赖 npm `amis-formula`。
- 文档「编辑 Schema」做成 YAML / JSON 两个 Tab，`syncAuthoringText` 双向实时同步；解析失败时对侧与预览停在上一份有效 schema。
- 布局对标起步：并行 `page` 70%、`container` 78%（仍进行中）。Page 接 initApi overlay / interval / aside / reload；Container 接 wrapperComponent / wrapperBody / 指针事件。文档手写活示例。
- 准则落地「作者态不强制 YAML」：YAML 与 JSON 并列；`parseSchemaText` / SDK / 编辑器都收；文档生成器与组件页去掉「不是 JSON」；Playground 源码可格式化为 YAML 或 JSON。
- 准则落地「默认自适应」：特定组件铺满容器不必写 `size`/`w-full`；Form 去掉 `max-w-3xl`；未写 size 挂 `vamis-control--fluid`；写入 AGENTS / 样式 spec §0 / `.cursor/rules/adaptive-default.mdc`；文档主路径先给无 size 表单。
- 样式宽度对标 Amis：`size: full` 占满；xs–lg 仅 ≥576px 钉死且 `max-width: 100%`；helper `w-*`/`min-w-*`/`max-w-*` 带 `m:`/`pc:`；横排窄屏 label 约 28%。
- JS SDK P0 落地：`packages/vamis-sdk` 打出 `sdk.js` / `sdk.css`；`vamis.embed` 支持 JSON / YAML / IR，以及 `updateSchema` / `updateProps` / `unmount`；无构建页 `hello.html` 与文档 iframe `/sdk/hello.html`。
- 规格锁定必须支持 JS SDK：任意 HTML `vamis.embed(container, schema, props?, env?)`，与 Vue `VamisRoot` 同一内核；不搬 `amisRequire` / `cxd.css`。
- 样式内核落地：`resolveClassName` / `resolveInlineStyle` / `resolveCssVars`；IR `metadata.style`（cssVars / density / className）；FormItem `size` 吃控件宽档；Table 吃 `--table-cell-px`；`m-t-xs` 等辅助类走 `--gap-*`。
- Playground 顶栏加上全站搜索（⌘K，覆盖文档 / 组件 / 示例）和 GitHub 仓库图标链接。
- Playground 顶栏色点可切换主题色（墨蓝 / 翠绿 / 琥珀 / 青空 / 玫红），只改 `--primary` 色相，状态色不动；写入 `localStorage`。
- 文档产品名统一为 **Vamis**；IR 只写 LCDP IR / `lcdp.ir/v1`，不再写外部平台名。
- Playground `pnpm build` 全静态导出：每个文档/组件路径一份 `index.html`，可发 GitHub Pages（`VITE_BASE=/<repo>/`）；`/api/mock2` 打进前端 JS。首次需 Settings → Pages 选 GitHub Actions。
- Playground `/` 与 `/docs` 共用同一外壳：`max-w-[1800px]`、相同左右 padding、主栏 `flex-1` 撑满；文档不再套 `max-w-3xl` 把内容栏收窄。
- 锁定商业对齐口径：配色可自生成；cxd **盒子系统**（2px 阶、32/24/98/40）写入 token 与样式 spec；横排 label 从 120px 改回 98px。
- 文档 ` ```schema ` 对齐 Amis Play mini：同一 `VamisRoot` 真跑 + 侧栏改 YAML 即时预览；介绍页换成打 `/api/mock2/sample` 的 CRUD（筛选/批量/删除/重置）。
- 文档并入 Playground：`pnpm dev` 的 5173 同时提供文档 / 组件 / 示例，顶栏对齐 Amis；Markdown 仍在 `website/src`。
- 增加 `AGENTS.md`、`CONTEXT.md`、`CLAUDE.md` 与项目规则 `.cursor/rules/update-progress.mdc`：每完成一项任务必须回写进度/完成状态，并写下后续计划。
- 组件 P0 TODO 按 amis 文档侧栏分类落地。
- Playground 改为分类树 + 组件/示例/IR 三 Tab。
- 主题层用 shadcn CSS 变量对齐 Amis 后台水标（不搬 cxd）。

## 后续计划

按「契约先于组件数量」排序。做完当前刀立刻改本段，把已完成的挪到「最近交付」。

1. **P0 kernel D6 表单路径值**：`a.b[0].c` 读写、提交返回合并进表单域。挡住联动剩余项和几乎全部表单项。数据域页里「表单项写到 page 域」也卡在这里。
2. **P0 kernel D8 诊断**：`env.debug`、未知 type 带 schema path、动作日志、渲染错误边界。对应文档 [调试](website/src/extend/debug.md)。
3. **D7 余项**：渲染器注入 `dispatch` / `reload`（RendererApi），不挡 Schema 文档主路径。
4. **布局下一对 `flex` + `grid`**：Page / Container 已完成；同样补文档示例与三张表。
5. **样式收尾（D12 余项）**：`xxxClassName` 打到子节点；`registerTheme`；locale / `replaceText`。不挡组件语义。然后清 `pnpm typecheck`。
6. **表单项 D7**：`editor` / `diff-editor` 的 `clear` / `reset` / `focus` / `componentId setValue` 仍要注册 `doAction`。

非本阶段：office/pdf 真实预览、TinyMCE、`.cxd-` 类名/云舍蓝、MST、完整 amis-editor。
