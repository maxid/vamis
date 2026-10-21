# Vamis 样式系统（Amis 水标 × shadcn 哲学）

- 日期：2026-10-21
- 状态：落地（token / 密度 / 盒子辅助类 / FormItem size / Table cell / IR `metadata.style`；`xxxClassName` 与 `registerTheme` 仍 P1）
- 关联：
  - [运行时语义设计](./2026-10-20-vamis-runtime-semantics-design.md) §13
  - [组件 P0 TODO](./2026-10-20-vamis-component-todo.md)
- 参考：
  - Amis 文档：`/Users/maxid/Develop/IdeaProjects/github/amis/docs/zh-CN/style`（`index` / `css-vars` / `state` / `responsive-design`）、`types/classname.md`
  - Amis 源码：`packages/amis-ui/scss/themes/{cxd,antd,ang,dark}`、`_properties.scss`、`_components.scss`
  - 在线文档 `http://localhost:8888/zh-CN/style/index` 本轮不可达，以本地文档与源码为准

水标指后台**信息密度、表单/表格/对话框可用性、状态清晰、可扫描**。**盒子数字对齐 cxd**（商业 YAML 才能套），配色独立。不搬 `cxd-` class，不编译 Amis SCSS。

## 1. Amis 样式系统（结论）

Amis 的样式不是一套设计系统原语，而是**巨型主题 CSS 包 + 组件级 CSS 变量 + 精简版 Tailwind 辅助类**。作者通过 schema 的 `className` / `xxxClassName` / `page.cssVars` 去改观感。

### 1.1 主题包（cxd / antd / ang / dark）

| 主题 | class 前缀 `$ns` | 观感 | 对 Vamis |
|------|------------------|------|----------|
| `cxd`（默认，云舍） | `cxd-` | 品牌蓝 `#2468f2`、中性灰阶 11 档、圆角 4px、控件 32px | **只学密度与层次**，不搬前缀与蓝按钮皮肤 |
| `antd` | `antd-` | Ant 红/金/绿、主色更靠 `#1677ff` 系 | 不做成命名主题包（D12 P1 `registerTheme`） |
| `ang` | `a-` | 偏紫链接触色 `#7266ba`，其余结构同套变量 | 同上 |
| `dark` | `dark-` | 中性色阶整体翻转，品牌仍偏蓝 | 对应 shadcn `.dark`，同一套语义名 |

四个主题是同一套 SCSS 组件，换的是 `:root` 里 `--colors-*` 色板和 `$ns`。Vamis 不复制这套包，只用 CSS 变量 + `.dark`。

### 1.2 CSS 变量分层

Amis 变量有三层：

1. **色板**：`--colors-brand-1…10`、`--colors-success-*`、`--colors-error-*`、`--colors-neutral-{text,fill,line}-1…11`
2. **语义**：`--primary` / `--success` / `--info` / `--warning` / `--danger` 及 `-onHover` / `-onActive`
3. **组件前缀**：`--Form-input-height`、`--TableCell-height`、`--Button--primary-bg`、`--Toast-*`

文档公开的常用变量（`style/css-vars.md`）是语义层。组件层在 `_properties.scss` / `_components.scss` 里有数百个。`page.cssVars` 可在运行时覆盖（不支持 IE11）。

Vamis 落地原则：语义层对照 shadcn token；组件层**折叠**进少数扩展 token（密度、表单、表格），不保留 `Form-` / `Table-` 前缀作为公共 API。

### 1.3 尺寸密度、间距、圆角、阴影

cxd 实测水标（`_cxd-variables.scss` + `_properties.scss` + `_components.scss`）：

| 量 | cxd 值 | 来源 |
|----|--------|------|
| 基字 | 14px（`--fonts-size-7`） | `--fontSizeBase` |
| 控件高 | 32px（`--sizes-base-16`） | `--Form-input-height` |
| 表单项间距 | 24px（`--sizes-base-12`） | `--Form-item-gap` |
| 横排 label 宽 | ~98px base / 136px md | `--Form--horizontal-label-width*` |
| 横排 label | 右对齐、颜色弱于值 | `--Form--horizontal-label-align` |
| 表格行高 | 40px（small 33 / large 61） | `--TableCell-height*` |
| 表头底 | 浅中性填充 | `--Table-thead-bg` |
| 圆角 | 4 / 6 / 8px | `--borders-radius-3/4/5` |
| 间距阶 | 4 / 8 / 12 / 16 / 20 / 24px | `--gap-xs…xl` |
| 阴影 | 输入几乎无阴影；浮层 `lg` | `--Form-input-boxShadow: none`、`--shadows-shadow-lg` |
| 动画 | 0.2s | `--animation-duration` |

后台观感来自**紧控件 + 弱标签 + 强状态 + 画布灰 / 面板白**，不是蓝色按钮本身。

### 1.4 状态色

`primary / secondary / success / info / warning / danger`，每色有 hover/active。Badge、Button `level`、Alert `level`、Toast 共用这套。文档辅助类还支持 `hover:` / `focus:` / `active:` / `disabled:` / `group-hover:`。

### 1.5 表单控件高度档

Amis 没有独立的 density 属性，高度绑在 `--Form-input-height`。按钮另有 `size: xs|sm|md|lg`。输入、Select、Number、Picker、ResultBox 都读同一个 `--Form-input-height`，所以后台对齐是「一条水平线」。

### 1.6 表格

表头浅底、单元格 40px、hover 浅底、可扫描数字用等宽。CRUD 工具栏在表外，表本身是一块白面板。

### 1.7 按钮 `level`

Amis `level`：`primary | secondary | success | info | warning | danger | light | dark | link | enhance`，默认是带边框的白底按钮（接近 outline）。`actionType: submit` 视作 primary。

### 1.8 自定义 `className` 约定

来自 `style/index.md`、`state.md`、`responsive-design.md`、`types/classname.md`：

- 字符串：`className: "text-danger"`
- 对象 + 表达式：`className: { "text-danger": "${status == 1}" }`
- 3.5+ 模板类名：`text-${status == 1 ? 'danger' : 'success'}`
- 辅助类是精简 Tailwind：`m-l-xs`、`rounded-xl`、`shadow-lg`、`flex`；状态前缀 `hover:` / `focus:` / `active:` / `disabled:`
- 响应式只保留 `m:` / `pc:`（不是 Tailwind 的 `sm:`/`md:`）
- 另有 `xxxClassName`（`panelClassName`、`bodyClassName`…）打在子节点

`resolveClassName` 已进内核：字符串 / 对象表达式 / 模板 / `m-t-xs` 阶 / `m:` `pc:`（仅 gap 辅助类）。`xxxClassName` 打到子节点、`registerTheme` 仍是 D12 P1。作者也可继续写普通 Tailwind 字符串。

## 2. shadcn 落地原则

1. Token 只活在 `:root` / `.dark` / `[data-density]`。组件写 `bg-background`、`text-muted-foreground`、`border-border`、`h-[var(--control-h)]`。
2. 变体用 `cva`，不写主题包、不写 `cxd-Button--primary`。
3. 缺的原语拷进 `packages/vamis-ui`（本轮补 `Slider`；Tooltip 已有）。渲染器组合它们。
4. 亮暗主题同一套语义名。
5. 禁止 `cxd-`，禁止引入 Amis SCSS。
6. 身份：IBM Plex 控制台。密度学 Amis，皮用 ink 语义色，不搬运云舍 `#2468f2` 像素。

## 3. Token 对照：哪些直接映射，哪些要扩展

### 3.1 直接对应 shadcn 语义 token

| Amis | shadcn / Vamis | 用法 |
|------|----------------|------|
| `--body-bg` | `--background` | 画布（略灰） |
| `--background`（表格等白底） | `--card` / `--popover` | 面板 |
| `--text-color` / `--text--loud-color` | `--foreground` | 主文字 |
| `--text--muted-color` | `--muted-foreground` | 标签、说明、placeholder |
| `--primary` | `--primary` | CTA、focus ring |
| `--secondary` | `--secondary` | 次按钮 |
| `--danger` | `--destructive` | 错误、危险按钮 |
| `--borderColor` | `--border` / `--input` | 线、输入边 |
| `--borderRadius` 4px | `--radius: 0.25rem` | 控件圆角 |
| `--link-color` | `--primary`（或未来 `--link`） | 链接 |
| `--fontSizeBase` 14px | `text-sm` + body `font-sans` | 正文字号 |
| `--fontFamilyBase` | `--font-sans`（IBM Plex Sans） | 签名字体 |
| `--fontFamilyMonospace` | `--font-mono`（IBM Plex Mono） | IR / 代码 |
| Layout aside 深底 | `--sidebar*` | Playground 色板、编辑器侧栏 |
| 浮层阴影 | `shadow-lg` on Dialog | 对话框 |
| 输入轻阴影 | `shadow-xs` on Input/Button outline | 控件 |

shadcn 原有 `--background / --primary / --radius / --sidebar` 继续承担画布、品牌、圆角、壳层，不改名。

### 3.2 必须扩展的 token

shadcn 默认**没有**后台密度、四态状态色（只有 destructive）、表单横排宽、表格行高。这些是 Amis 水标的来源，要加：

| 扩展 token | 默认 compact | comfortable | 对应 Amis |
|------------|--------------|-------------|-----------|
| `--success` / `--success-foreground` | 绿 | 同名、略提亮 | `--success` |
| `--warning` / `--warning-foreground` | 琥珀 | 同名 | `--warning` |
| `--info` / `--info-foreground` | 蓝 | 同名 | `--info` |
| `--control-h` | **32px** | 36px | `--Form-input-height` |
| `--control-h-sm` / `--control-h-lg` | 28 / 36px | 32 / 44px | Button size |
| `--form-item-gap` | **24px** | 28px | `--Form-item-gap` |
| `--form-label-width` | **98px** | 136px | `--Form--horizontal-label-widthBase` |
| `--table-row-h` | **40px** | 52px | `--TableCell-height` |
| `--success-bg` 等 Toast 底 | 浅语义色 | 暗色下调饱和 | Toast 四态 |

密度开关：`data-density="compact"` **就是 cxd 默认盒子**（商业 YAML 按这档排版）。`"comfortable"` 是 Vamis 加的触控档，不参与 Amis 页面对齐。写在 `html` 上，所有 `h-[var(--control-h)]` 一起变。

### 3.3 盒子系统（必须与 cxd 同值）

商业页能直接吃 Amis YAML，靠的是格子，不是品牌色。`html` 根字号保持 **16px**（与 Amis `px2rem` 同基），下列数字用 **px 写死**，禁止再改成「大约」。

cxd 尺寸阶：`--sizes-base-n = n × 2px`，`--sizes-size-3…9 = 4/6/8/10/12/14/16px`。

| 角色 | cxd 变量 | 锁定值 | Vamis token |
|------|----------|--------|-------------|
| 间距阶 | `--gap-xs/sm/base/md/lg/xl` | 4 / 8 / 12 / 16 / 20 / 24 | 同名 |
| 控件高 | `--Form-input-height` = base-16 | **32** | `--control-h` |
| 控件左右 padding | `--Form-input-paddingX` = size-6 | 10 | `--control-px` |
| 表单项间距 | `--Form-item-gap` = base-12 | **24** | `--form-item-gap` |
| 横排 label 宽 | `--Form--horizontal-label-widthBase` = base-49 | **98** | `--form-label-width` |
| 横排 label 档 | Xs/Sm/Md/Lg | 50 / 70 / 136 / 200 | `--form-label-width-*` |
| 横排 label 与控件间隙 | `--Form--horizontal-label-gap` = base-8 | 16 | `--form-label-gap` |
| 控件宽度档 | `--Form-control-widthXs…Lg` | 80 / 160 / 200 / 240 / 320 | `--form-control-width-*` |
| 表格行高 | `--TableCell-height` | **40**（small 33 / large 61） | `--table-row-h` |
| 单元格左右 padding | `--TableCell-paddingX` = size-6 | 10 | `--table-cell-px` |
| 圆角 | `--borderRadius` = radius-3 | **4** | `--radius` |
| 边框 | `--borderWidth` | 1 | 1px |
| 正文字号 | `--fontSizeBase` = fonts-size-7 | **14** | `text-sm` |
| Page 内边距 | `--Page-body-padding` = gap-base | 12 | `--page-body-padding` |

`page.cssVars` 写 cxd 名时，经 `resolveCssVars` 映到上表。`size: xs\|sm\|md\|lg` 必须落到控件宽度档，不是只改字号。

辅助类 `m-t-md` / `p-l-xs` 的 xs…xl 也是这套 gap，不是 Tailwind `m-1` 的另一套阶。解析仍是 D12，但阶必须先锁死。

### 3.4 明确不搬

| Amis | 为什么不搬 |
|------|------------|
| `$ns: cxd-` 及所有 BEM | shadcn 用 `data-slot` + utility |
| `--Form-*` / `--Table-*` / `--Button--*` 里**非盒子**的颜色/阴影私有项 | 颜色独立生成；盒子已在 3.3 抽出 |
| 主题 CSS 包 cxd/antd/ang/dark | `.dark` + 未来 `registerTheme` |
| 云舍蓝 `#2468f2` | 配色可另起 |
| 辅助类文件 helper.css | 真 Tailwind；`m:`/`pc:` 与 `m-t-xs` 名字仍按 cxd 语义解析（D12） |
| SCSS mixin / 选择器结构 | 组件用 variants |

## 4. 组件 variants 映射

### 4.1 Button `level` → `buttonVariants`

| Amis `level` / 动作 | shadcn variant |
|---------------------|----------------|
| `primary`、`submit` | `default` |
| 默认、未写 level | `outline` |
| `secondary` / `enhance` | `secondary` |
| `success` | `success` |
| `info` | `info` |
| `warning` | `warning` |
| `danger` / `error` | `destructive` |
| `light` | `ghost` |
| `link` | `link` |
| `size: xs\|sm\|lg` | `sizeToButtonSize` |

实现：`packages/vamis-ui/src/ui/button/index.ts` 的 `levelToVariant` / `sizeToButtonSize`；`Action` / `DropdownButton` 消费。

### 4.2 Alert / Badge / Status / Toast

- Alert `level` → `levelToAlertVariant`（default / success / warning / info / destructive）
- Status 值 `success|fail|pending|running|info` → Badge 同名语义色
- `env.notify` → vue-sonner，Toaster 绑定 `--success-*` / `--error-*` / `--warning-*` / `--info-*`

### 4.3 表单 / 表格

- `FormItem`：`mode: horizontal|inline` 时 label 右对齐、宽 `--form-label-width`、色 `muted-foreground`；必填 `*` 为 `destructive`
- 控件高一律 `--control-h`（Input / Select / Button / native select / Static 行）
- Table 原语：容器 `border bg-card`；表头 `bg-muted/50`；行高 `--table-row-h`

## 5. 渲染器约束

1. 能走 Button / Input / Table / Card / Alert / Badge / Select / Dialog / Slider 的，禁止再写一套裸 HTML 尺寸色。
2. 暂时必须用原生元素时（季度 `<select>`、文件区），套 `vamis-native-select` / `vamis-file-drop`，高度仍吃 `--control-h`。
3. Page 是画布，不再套一层 Card；Form 的 `wrapWithPanel` 才是面板。避免双卡片。
4. `page.cssVars` 经 `resolveCssVars` 映射到 shadcn 名（`--text-color` → `--foreground` 等）。对象 `className` / `m:`/`pc:` 仍 P1。

## 6. Playground

- 顶栏可切 **浅色 / 深色**、**紧凑 / 舒适**，写入 `html.dark` 与 `html[data-density]`，localStorage 记住。
- 色点展示 primary / success / warning / info / destructive，用来核对层次。
- 预览区 `bg-background`（画布），源码区 `bg-card`（面板）。

## 7. 验收标准

主路径对照 cxd **盒子数字**（32 / 24 / 98 / 40），配色不要求像云舍。

1. **密度**：正文 14px；输入/按钮 **32px**；表单项间距 **24px**；横排 label **98px**；表格行 **40px**；表头浅底。
2. **横排表单**：label 右对齐、固定宽、必填 `*` 为 destructive；placeholder 是 muted。
3. **状态**：成功/警告/信息/错误能分开（toast、badge、alert、按钮 level）。
4. **控件**：range / file / 下拉不是未修饰原生控件。
5. **反馈**：Dialog 标题+关闭+token 间距；Toast 四态着色。
6. **壳**：Playground 与 Editor 同源 token；画布灰、面板白。
7. **主题**：`.dark` 对比足够；紧凑/舒适切换时控件高度一起变；无 `cxd-` class。

未纳入本轮：`xxxClassName` 子节点、antd/ang 命名主题、`registerTheme`（D12 P1）。

## 8. 本轮落地清单

- `packages/vamis-ui/src/styles.css`：语义色 + 密度 token + `.vamis-native-select` / `.vamis-file-drop` / range
- `packages/vamis-ui/src/helpers.css`：`m-t-xs` / `p-l-md` 等走 `--gap-*`；`m:` / `pc:` 媒体查询
- 原语：Button / Input / Select / Table / Tabs / Slider / Sonner 吃 token；Table cell `px` 用 `--table-cell-px`
- 渲染器：FormItem `size` → `--form-control-width-*`；Page body 用 `--page-body-padding`
- 内核：`resolveClassName` / `resolveInlineStyle` / `resolveCssVars`；`SchemaRenderer` 挂 id/className/style
- IR：`metadata.style.cssVars` / `density` / `className`，`jsonToIr` 从 page.cssVars 提升，compile 时合并
- Playground：浅色/深色、紧凑/舒适；VamisRoot 不再写死 `data-density=compact`
