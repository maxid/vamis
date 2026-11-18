# Vamis 在线文档

- 日期：2026-10-24
- 状态：部分落地（与 Playground 同应用、同端口）。顶栏：**文档 | 组件 | 样式 | 示例 | 编辑器 | 对照**（对照整页跳 `/sdk/compare.html`，页内可返回首页）。`/style` 一等路由，侧栏为样式专用（开始 + Layout / Flex / Grid / … 辅助类）。`types/api` 已按 D3 管线对齐（`isApiOutdated`：无 `$` 的 initApi 只初始化拉一次；GET 不把数据域拼进 query；page/form/service/select/crud/chart/markdown 已接）。`types/schemanode` **92% 进行中**（模板 / Schema / 显隐 / SchemaArray / false；TS `SchemaObject` 仍宽松）。开始页保持快速开始 95%、SDK / FAQ 90%；ClassName 70%，API 92%；扩展保持自定义 55%、编辑器 35%、i18n 15%、调试 90%。文档核对不提升实现百分比。文档 ` ```schema ` 预览复用内核 `LazyComponent`（对齐 Amis `MdRenderer`：默认 `defaultVisible=false`，进视口才挂载；改 body 不重挂；SPA 切页按路径重建 Play，不沿用上一页 `visible`）。用法写在「配置与组件」`/concepts/schema#lazycomponent`。概念页「配置与组件」**95% 进行中**（含渲染错误边界与诊断）。概念页「模板」已对标 Amis 同名页（**95% 进行中**：`tpl` 按 HTML 插入、插值默认转义、标题/列表/链接在 `.vamis-html` 岛内补回、`|raw`、表达式、注意事项；不实现 lodash `<% %>`）。概念页「表达式」已对标 Amis 同名页（**95% 进行中**：`${}` 语法、公式函数、箭头函数、函数手册 include `@vamis/formula`；旧版纯 JS 仅兼容；D8 表达式诊断已接）。概念页「数据映射」已对标 Amis 同名页（**90% 进行中**：模板 / 链式 / `api.data` / `&` 展开 / `$table` 提取 / namespace / P0 与扩展过滤器均已接）。概念页「联动」已对标 Amis 同名页（**90% 进行中**：显隐/禁用、`source` 自动刷新、`sendOn`、主动 `reload`、提交回写、`form.target`、点号名、多目标、动态 `target`/`name`；`clearValueOnHidden` 已接）。概念页「事件动作」**95% 进行中**（章节与示例顺序全量对齐 Amis；静默 AJAX、validate、显示 / 启用状态、GETRENDERERDATA / GETRENDERERPROP 已恢复为活示例；监听器 debounce / track 已接；动作运行日志由 enableVamisDebug / vamisDebug=1 开启）。Definitions **100% 已完成**（顶级 `$ref`、本地覆盖、递归按需展开、未知引用诊断；无条件自引用与静态循环图检测不在当前范围）。生成器占位组件页（79）按 Amis 主路径改写活示例与三表；手写页缺章（示例 H2 + 事件/动作表）由 `gen-component-pages.mjs` 补进属性表前，不覆盖已改写正文。概念页「行为」**90% 进行中**（`type: action` 主路径、浏览器 / 打印 / 控制流与 Chart `clickAction` 已接）。概念页「样式」**90% 进行中**（`className` helper / `cssVars` / FormItem `size` / `registerTheme` / 指向 `/style` 与 `/sdk/compare.html`；色盘表与其余 `xxxClassName` 仍按组件推进）。概念页「数据域与数据链」**90% 进行中**（对标 Amis 同名页含「发生了什么」与 `__super`；接口与表单 `trackExpression` 已接，其它独立 Scope 见运行时语义 D1）。ClassName 高度 helper `h-full`、Page 组装容器用 div、嵌套 Form 降为 div、JS SDK `getComponentByName`/`doAction` 已按 P0 回写。主题相关文档已同步六色点（新增金色包）。Tabs 补脱离 Form 的 `name` 数据域活示例：已有值选中对应标签，切换写回当前数据域。Page 文档明确默认 `initApi` 遮罩 + Spinner，`silentPolling` 只隐藏轮询加载层。InputTree 补 `deferApi` / `deferField` 懒加载、子树合并与完成事件；可见节点按 Amis 拍平为单层 `ul > li` 并对齐行盒/缩进/选中态；树箭头与 folder/file 图标使用 amis-r 原 SVG，注册表合并上游 103 个 + Vamis 专用共 115 个；Options 契约页同步该支持范围。
- 范围：正文在 `website/src/`；运行时由 playground 在 5173 挂载。目录对齐 Amis zh-CN 侧栏；不拷贝 Amis 原文

## 口径

和 Amis 一样：**文档 / 组件 / 样式 / 示例** 在同一个开发服务器里。外壳共用 `max-w-[1800px]`、`px-4`、`h-screen`；文档页不再单独收窄正文。

| 顶栏 | 路由 | 内容 |
|------|------|------|
| 文档 | `/` | 开始（含 JS SDK）、概念、类型、扩展；`/docs` 重定向到首页 |
| 组件 | `/components` | 侧栏首位「组件介绍」（不进布局分组）+ 155 项 + 实时 Schema（YAML / JSON 双 Tab） |
| 样式 | `/style` | 对齐 Amis `/zh-CN/style`：快速开始 / CSS 变量 **70%** / 辅助类-响应式 / 辅助类-状态（**90%**，hover 全矩阵已进 SDK）+ Layout 的 `box-sizing` / `display` / `overflow` / `position` / `float` / `clear` / `top-right-bottom-left` / `visibility` / `z-index` + Flex 的 `direction` / `wrap` / `flex` / `grow` / `shrink` / `order` + Grid 的 `columns` / `column-start-end` / `rows` / `row-start-end` / `auto-flow` / `auto-columns` / `auto-rows` / `gap` + Box Alignment 全 9 页 + Spacing 全 3 页 + Sizing 全 2 页 + Typography 14 页 **90%** + Border Radius / Width / Style + Box Shadow / Opacity **90%**（`text-color` / `background-color` / `border-color` 仍 55%）。`.vamis-root` 走 `--fonts-base-family`、`14px` / `1.5`；浅色 `--border` 是 `#e8e9eb`。旧 `/docs/style` 重定向到这里 |
| 示例 | `/examples` | Playground 分类树 + 预览 |
| 编辑器 | `/editor` | 可视化骨架 |
| 对照 | `/sdk/compare.html` | Amis / Vamis SDK 对照（静态页，整页跳，不走 Vue Router）；页内「返回首页」 |
| 搜索 | ⌘K | 文档 / 组件 / 样式 / 示例索引；示例跳 `/examples?example=` |
| GitHub | 外链 | https://github.com/maxid/vamis |

- 作者态 YAML 与 JSON 并列；` ```schema ` 在页面内交给 `VamisRoot` 真跑（可编辑即时预览），对齐 Amis `MdRenderer` + Play mini，不是截图。围栏可以是 YAML 或 JSON；**每个语义示例只写一份活围栏**，不要为对照再复制甲/乙孪生。**文案对标 Amis 主路径**，禁止甲/乙唯一后缀。切格式走「编辑 Schema」双 Tab。
- 文档 **编辑 Schema** 是 YAML / JSON 两个 Tab，改一边立刻同步另一边；解析失败时对侧与预览停在上一份有效 schema。按钮在预览**框外**右上，不进画布、不占 `pr-24`。桌面/移动在站点顶栏（浅色/深色旁），一次管整页示例，默认桌面（不 prefetch 移动 iframe，避免国内 GitHub Pages 跟首屏抢带宽）；移动走独立 `preview-frame.html` + **375×812** iframe + `env.mobileUI` + 手机壳；**整页一个 iframe**（`preview-frame-host` 固定挂 body，按交叉比例对齐当前手机屏，不要搬进壳里），入口只引 `preview-frame.css`（不要 playground 文档壳 `style.css`）；浅色/深色经 URL + BroadcastChannel 同步。编辑器用表单项 `editor`（`yaml-editor` / `json-editor`），`hideButtons` + `intellisense: schema`。Schema 感知来自 `registerRenderer` 自述（全部已注册 type 都有属性/事件/动作说明；按组件树定位封装节点的 `type`，对齐 monaco JSON Schema `$defs` / `if-then`），站点只消费。
- **默认自适应**：文档主路径示例不要先写 `size: full` / `w-full`。先给无 size 的表单，再给可选收窄。
- fence 支持 `scope` / `height`（如 ` ```schema: scope="form-item" height=300`）。`editor` 已接 `hideButtons` / `intellisense: schema` / `size: full`；文档编辑 Schema 用该组件而不是 textarea。低码应用同样写 `intellisense: schema` 或调用 `registerSchemaIntellisense`。`form/options` 手写页已按 Amis options 主路径补活示例（88%）。
- 介绍页 CRUD 打 playground mock `/api/mock2/sample`（engine/browser/platform/grade）。
- 组件页进度来自 P0 TODO。已注册 ≠ 语义完成。手写页（生成器白名单，见 `website/scripts/gen-component-pages.mjs`）：`page`、`container`、`collapse`、`divider`、`flex`、`grid`、`grid-2d`、`hbox`、`pagination`、`progress`、`status`、`pagination-wrapper`、`panel`、`tabs`、`wrapper`、`portlet`、`switch-container`、`action`、`app`、`button`、`button-group`、`breadcrumb`、`dropdown-button`、`service`、`each`、`tag`、`list`、`table`、`nav`、`anchor-nav`、`tooltip-wrapper`、`toast`、`spinner`、`alert`、`dialog`、`drawer`、`avatar`、`tasks`、`badge`、`remark`、`audio`、`wizard`、`web-component`、`amis`、`popover`、`table-view`、`calendar`、`card`、`cards`、`form`、`form/input-text`、`form/checkbox`、`form/radio`、`form/switch`、`form/hidden`、`form/input-file`、`form/input-image`、`form/textarea`、`form/transfer`、`form/picker`、`form/static`、`form/input-date-range`、`mapping`、`link`、`service`、`form/input-date`、`form/input-datetime`、`form/input-time`、`chart`、`code`、`editor`、`diff-editor`（生成器跳过）。Form / Chart 已按 Amis 补属性表 / 事件表 / 动作表。`code` 只读 monaco 展示，不收 `options`。`editor` / `diff-editor` 接同一宿主，`options` 写在 Editor 文档。Editor 文档基本用法用 `value`；`placeholder` 跟行号对齐，感知框不被外框裁切。`input-text` 文档按 Amis 章节写活示例（92%）。`input-date` 文档按 Amis 章节写活示例（92%）。
- 所有文档页（组件 / 类型 / 概念 / 开始 / 样式 / 扩展）标题正下方显示 `::: 实现进度 x% · 状态`；目录页（介绍、组件介绍）除外。口径见 `.cursor/rules/site.mdc`。「配置与组件」含内核 `LazyComponent` 用法（不是 schema type）。Playground 左侧菜单同步显示该百分比（按档位着色：100 绿 / ≥80 蓝 / ≥40 橙 / 其余红），组件页进度右侧跟 **P0 / P1 / P2**（TODO 速览：解锁主干 / 主路径容器 / 零被依赖）；筛选框支持 `P0` / `P1`，全量顺序 `#N` 仍可筛。顶栏「进度」开关可关百分比，默认开。
- GitHub Pages 发布同一套 playground：https://maxid.github.io/vamis/ 。`pnpm build` 按 md 路由写出 `path/index.html`（全静态，无 Node）；`VITE_BASE=/<repo>/`；`/api/mock2` 打进前端 JS。
- 嵌入分两条写：Vue `VamisRoot`；JS SDK `vamis.embed`（`/start/sdk` iframe 用站点根路径 `/sdk/hello.html`，渲染时加 `VITE_BASE`；禁止 `../../sdk/hello.html`，Pages 的 `sdk/index.html` 目录会解析成 `/docs/sdk/hello.html`。顶栏为桌面且外框宽 &lt; 768 时，这条 iframe 布局宽撑到 768 再 scale，避免内部媒体查询画成移动表单）。对照页 `/sdk/compare.html` 是 SDK dist 静态文件（随 `pnpm build` 拷进 `playground/dist/sdk/`）。用例按 Amis 侧栏 **文档 / 组件 / 样式** 分组，Vamis 可多（extra）。文档链接走 `withBase` 并整页跳，不要 `router.push`，否则 Pages 上会被 SPA 吃掉。Amis 栏仍拉 unpkg `amis@6.13.0`（`sdk.css` + `helper.css` + `iconfont.css` 并行）。对照页视口可切桌面 / 移动（`?vp=mobile`）。预览 iframe 按内容自适应，屏幕上夹 360–800px。
- 文档 / 组件 / 样式页右侧有「内容」TOC（对齐 Amis `Doc-toc` 能力）：从 markdown `h2`–`h4` 抽锚点，点击平滑滚动、滚动高亮当前项；`lg` 以下隐藏；没有标题时不占栏。不搬 `cxd-` / `Doc-toc` 类名。TOC 栏无左边框，与正文同一卡片。正文 / 侧栏 / TOC 滚动条默认隐藏，滚动时才显示。
- `/style` 活示例对标 Amis **计算样式 / 盒模型**（同一 class、同一元素、同一属性、同一值），不是截图像不像。口径：`.cursor/rules/style.mdc`。芯片/条带用 `bg-yellow-200`、舞台用 `bg-gray-200`，避免 `--muted` 贴 `--card`；语义色页仍演示 `bg-muted`。含 HTML 的样例下附 `type: code` / `language: html` 源码（Code 组件），与 `tpl` 同一段已缩进 HTML。

## 怎么跑

```bash
pnpm dev           # http://127.0.0.1:5173  （文档和示例同一进程）
pnpm dev -- --host # 0.0.0.0，手机走终端 Network 地址
pnpm docs:build    # 可选：VitePress 静态导出
pnpm --filter @vamis/docs gen   # 按 nav + TODO 重生组件页
VITE_BASE=/vamis/ pnpm build && VITE_BASE=/vamis/ pnpm preview   # 模拟 GitHub Pages 路径
```

手写页（介绍、快速开始、JS SDK、Form 总览、FormItem/Control/Options）不要被生成器覆盖。
