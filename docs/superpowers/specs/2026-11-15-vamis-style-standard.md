# Vamis 样式规范

- 日期：2026-11-15
- 状态：部分落地。标尺、色号、图标、`:style`、表格原语、渲染器 `<style>` 已清到 0；lucide chrome 图标已清到 0；选择器里的数字 `font-weight` 已清到 0。模板里的 Tailwind 字号 / 语义色工具类（33 / 44 处）是存量，按 §9 的上限只许减
- 范围：`@vamis/ui` 的 token 与默认皮肤、`packages/vamis` 渲染器模板与内联样式。不管作者 `className`（helper 的行为精度见 [样式系统](./2026-10-21-vamis-style-system.md) §0.1）
- 关联：
  - [样式系统（设计由来）](./2026-10-21-vamis-style-system.md)、[主题 token](./2026-10-21-vamis-theme-shadcn.md)
  - 规则：`.cursor/rules/style.mdc`（判层、深色、图标字段）、`.cursor/rules/packages.mdc`（文件放哪）
  - 守卫：`packages/vamis-core/__tests__/style-system.test.ts`、`package-boundary.test.ts`

本文是写组件样式时照着做的条款。和别的文档冲突时，量的取值以本文和 `styles.css` 为准。

## 1. 一个量只有一处定义

同一个字号、色号、圆角、图标字形，全仓只写一次，别处引用。

```
主题色阶 themes.css        --colors-neutral-{text,fill,line}-1..11、--colors-brand-*、--borders-radius-*
        ↓ 只被引用
标尺 styles.css :root       --fontSize* / --fontWeight* / --borderRadius* / --text-* / --icon-* / --gap-* / --card …
        ↓ 只被引用
组件 token styles.css :root --table-font-size: var(--fontSizeSm)、--tooltip-bg: var(--card) …
        ↓ 只被引用
选择器 styles.css           .vamis-xxx { font-size: var(--table-font-size) }
```

- 上一层不认识下一层。选择器里不出现 px 字号和 hex；组件 token 不出现标尺里已有的字面量
- 换主题 = 换色阶（`html[data-theme]`），切深色 = `.dark` 换色阶。组件 token 和选择器不为主题写分支
- 作者 `className`（Tailwind / Amis helper）是另一条线，打在 `div.vamis-node`，不拿来表示默认样子

## 2. 标尺

全部挂在 `packages/vamis-ui/src/styles.css` 的 `:root`。名字和取值对齐 Amis `_properties.scss`。

### 2.1 字号 / 字重 / 行高

| token | 值 | 用在 |
|----|----|----|
| `--fontSizeXs` / `--fontSizeSm` | 12px | 表格数据格、页码、标签、辅助说明 |
| `--fontSizeBase` / `--fontSizeMd` | 14px | 正文、表单 label、输入、按钮、表头 |
| `--fontSizeLg` | 16px | 面板标题、移动端滚轮项 |
| `--fontSizeXl` | 18px | 弹层标题、月历翻页箭头 |
| `--fontWeightNormal` / `Md` / `Bold` | 400 / 500 / 700 | 正文 / 强调 / `.label` 这类粗标 |
| `--lineHeightBase` | 1.5 | 正文行高。14 的行盒是 21，不是 Tailwind `text-sm` 的 20 |

- 根上 `.vamis-root` 是 `14px / 1.5`，组件没有特别要求就继承，不重复写
- 标尺之外的字号（比如 10px 的图片错误提示）要起组件 token 并注明 Amis 出处，不直接写进选择器

### 2.2 文字色与图标色

| token | 色阶 | 浅色 | 用在 |
|----|----|----|----|
| `--text-color`（= `--foreground` / `--text-loud`） | text-2 | `#151b26` | 正文、表头、表格数据 |
| `--text-secondary`（= `--muted-foreground`） | text-4 | `#5c5f66` | 表单 label、次要文字 |
| `--text-tertiary` | text-5 | `#84878c` | 说明、描述 |
| `--text-muted` | text-6 | `#b8babf` | 占位、禁用 |
| `--icon-color` / `--icon-hover-color` | text-5 / `--primary` | | chrome 图标默认色与悬停色 |
| `--icon-size` | 14px | | chrome 图标默认尺寸 |

shadcn 的 `--foreground` / `--muted-foreground` 只是这几档的别名，不是另一套灰。

### 2.3 面、边、语义色

| token | 取值 | 用在 |
|----|----|----|
| `--background` | 页面底 | Page、窄屏表单面板 |
| `--card`（= `--popover`） | fill-11；深色 `#17202d` | 升高面：卡片、下拉菜单、Tooltip、PopOver、勾选盒底、日期弹层 |
| `--fill-10` | fill-10 | 表头底、禁用底、斑马纹 |
| `--border` / `--input` | line-8 | 边线、控件描边 |
| `--primary` / `-hover` / `-active` | brand-5 / 4 / 3 | 品牌色。深色在 `@supports oklch` 里抬亮 |
| `--success` / `--warning` / `--destructive` / `--info` | 各色阶第 5 档 | 状态 |
| `--white` / `--black` | `#ffffff` / `#000000` | 不跟浅深色翻转的黑白：色块上的字、图片预览舞台 |

浮层和升高面的底一律 `var(--card)`，不写 `#fff`，也不各起一个带 hex 的 `--xxx-bg`。

### 2.4 圆角 / 间距 / 尺寸 / 层级

| token | 值 |
|----|----|
| `--borderRadiusSm` / `--borderRadius`（= `--radius`）/ `--borderRadiusMd` / `--borderRadiusLg` / `--borderRadiusFull` | 2 / 4 / 6 / 8 / 9999（跟主题包的 `--borders-radius-*` 走，深色包更小） |
| `--gap-xs` / `sm` / `base` / `md` / `lg` / `xl` | 4 / 8 / 12 / 16 / 20 / 24 |
| `--control-h` / `--button-h` | 32（密度切换会改） |
| `--z-dropdown` / `--z-modal`（= `--z-popover`）/ `--z-tooltip` / `--z-toast` | 1000 / 1400 / 1600 / 2000 |
| `--animation-duration` | 0.2s |

## 3. 色号

1. hex 只出现在两处：`themes.css` 的色阶，和 `styles.css` 里**色阶上没有**的 Amis 字面量 token（现有 31 条，例：`--table-modified-bg: #e8f0fe`、`--avatar-bg: #d1d5db`、`--code-dark-bg`）。后者注明 Amis 出处，条数只许减
2. 新增颜色先在色阶里找。找得到就 `var(--colors-…)`，或者直接用 §2 的角色名
3. 选择器（非 `--token:` 声明）里不写 hex。`var(--x, #fff)` 这种兜底也不写，它等于第二处定义
4. `.dark` 里只留「色阶翻转后不对」的覆盖。组件 token 已经引用色阶 / `--card` 的，深色不再重复写
5. 带 alpha 的色不进 CSS 变量，写 Vue inline style 的字面 `rgba()` / `hsla()`（旧 WebView 会把 8 位 hex 当实心色）
6. 渲染器 JS 里的 hex 只允许「色号本身是数据」：取色器预设、条码 / 二维码 / 签名的墨色、色块回退。名单在守卫里（6 个文件）

## 4. 图标

四条通道，各管各的，不混用。

| 通道 | 入口 | 什么时候用 |
|----|----|----|
| 作者图标 | `@vamis/core` `resolveIcon` + `IconMark` | schema 的 `icon` / `rightIcon`（FA class、URL、SVG 串、sprite） |
| chrome 图标 | `<VamisIcon name="…">`，字形登记在 `packages/vamis-ui/src/ui/vamis-icons.ts` | 组件自带的静态图标：勾、叉、翻页、拖拽手柄、搜索、上传、日历… 现登记 32 个 |
| 带状态的 chrome 图标 | 专用组件 `VamisCaret` / `VamisClear` / `VamisClose` / `VamisDateArrow` / `VamisPasswordToggle` / `VamisSpinnerMark` / `VamisTableIcon` / `VamisTableEmptyIcon` / `VamisGalleryToolIcon` | 有展开翻转、动画、明暗两态，或一族图标共用一套盒模型 |
| 数据图形 | 渲染器里的 `<svg>` | 画的是数据：进度环、迷你图、二维码、形状。只有 5 个文件 |

- 渲染器模板不写 chrome 的 `<svg>`，不拿 `×` `›` `▾` `+` 这类字符当图标（字符吃宿主字族，粗细和基线都不稳）
- 加图标：先找 Amis `packages/amis-ui/src/icons/<name>.svg`，把 `viewBox` 和 path 登记进 `vamis-icons.ts`，沿用 Amis 的名字并在注释里写出处。Amis 没有的才自己画
- 字形用 `currentColor`。尺寸和颜色写在调用处的 class 上，量走 `--icon-size` / `--icon-color` 或组件 token
- lucide 是存量（9 处：Toast / Alert 关闭、Wizard 勾、Select 编辑与删除、`Audio` 的播放 / 暂停 / 音量），新代码不再引入，动到就换成 `VamisIcon`

## 5. 模板里的 class

- 默认样子 = 语义 class `.vamis-<type>__<part>` + `styles.css` 里的规则
- 字号、文字色、底色、边色、圆角、阴影不用 Tailwind 工具类表达（`text-sm`、`text-muted-foreground`、`bg-accent`、`rounded-md`、`shadow-lg`…）。`text-sm` 的行高是 20，`text-muted-foreground` 也不落在 Amis 的灰阶角色上
- 纯布局的工具类可以留在模板：`flex`、`items-center`、`min-w-0`、`w-full`、`relative`
- 状态用 `is-xxx`（`is-active` / `is-disabled` / `is-checked`），不拼接 Tailwind 类名

## 6. `:style` 与 JS 里的样式

`:style` 是给「值在运行时才知道」的情况用的，不是皮肤的第二个家。

可以放：

- 作者在 schema 里写的值：`style`、`width`、`height`、`color`、`size`（头像边长、进度条颜色、列宽）
- 量出来的几何：浮层坐标、固定列偏移、缩进层级、进度百分比
- 带 alpha 的字面色（§3 第 5 条）

不可以放：

- 默认色、默认字号、默认圆角、默认间距这类常量。它们是皮肤，写 class + token。作者没写时让 CSS 的默认值生效，`:style` 里给 `undefined`，不要回落一个 hex
- 模板上的静态 `style="…"`

JS 需要引用主题色时写 `var(--token)` 字符串（`Status` 的状态色就是这样），不抄色值。要把运行时的量交给 CSS 用时，传自定义属性：`:style="{ '--depth': node.depth }"`，选择器里 `calc(var(--depth) * var(--gap-base))`。

## 7. 原语的配方

`@vamis/ui` 的原语保留 shadcn-vue 的 DOM 和 a11y，配方按 Amis 该 type 的契约来，并且**打在原语自己身上**（`[data-slot="…"]`），不打在某一个渲染器的外壳下面。

反例（已修）：表格的 Amis 配方原先全挂在 `.vamis-table-wrap [data-slot="table-cell"]` 下，只有 `Table` 渲染器带这个外壳。`CRUD` / `InputTable` / `Tasks` 直接用 `<Table>` 原语，吃到的是原语上的 shadcn 工具类 `text-sm` / `text-xs`，于是数据格 14、表头 12，正好和 `Table` 的表头 14、数据格 12 反过来。

现在：`[data-slot="table-cell"]` 12、`[data-slot="table-head"]` 14 + 表头灰底、行悬停 `--table-hover-bg`，四个渲染器同一把标尺。原语模板里不再有字号和颜色的工具类。渲染器外壳下只留它独有的盒模型。

## 8. 文件落点

| 内容 | 位置 |
|----|----|
| 主题色阶 | `packages/vamis-ui/src/themes.css` |
| 标尺、组件 token、所有渲染器的默认皮肤 | `packages/vamis-ui/src/styles.css` |
| chrome 图标字形 | `packages/vamis-ui/src/ui/vamis-icons.ts` + `VamisIcon.vue` |
| 带状态的 chrome 图标 | `packages/vamis-ui/src/ui/Vamis*.vue` |
| 作者 helper | `packages/vamis-ui/src/helpers*.css` |

渲染器 `.vue` 不带 `<style>` 块（原有 16 个已全部迁入 `styles.css`）。迁移时注意：`scoped` 去掉后选择器变全局，属性选择器要补上自己的宿主前缀（`Grid` 的 `[data-col]` 曾会漏到表格的 `<col data-col>`）；`:deep()` / `:slotted()` 要展开成普通后代选择器。

## 9. 守卫

`pnpm test` 会跑。数字是上限，清掉一批就调小，不许调大。

| 检查 | 现状 |
|----|----|
| `styles.css` 选择器里的 hex | 0 |
| `var(--x, #hex)` 兜底 | 0 |
| 选择器里的 px `font-size` | 0 |
| 选择器里的数字 `font-weight` | 0 |
| 色阶外的 hex token | ≤ 31 |
| 标尺 token 各只定义一次 | 是 |
| 表格原语不带字号 / 颜色工具类，th 14 / td 12 在原语上 | 是 |
| 渲染器 `<style>` 块 | 0 |
| 渲染器里的 hex | 只在 6 个「色号是数据」的文件 |
| 模板静态 `style="…"`、JS style 对象里的皮肤常量 | 0 |
| 字符当图标 | 0（`IconPicker` 的可选值除外） |
| 渲染器内联 `<svg>` | 只在 5 个数据图形文件 |
| `VamisIcon` 用到的名字都已登记 | 是 |
| lucide 标签 | 0 |
| 模板 Tailwind 字号类（`text-xs`…`text-xl`） | ≤ 33 |
| 模板 Tailwind 语义色类 | ≤ 44 |

## 10. 写或改一个组件的样式

1. 先读 Amis：`scss/components/_<type>.scss` 和 `_properties.scss` 里它用到的变量
2. 每个量先在 §2 找角色。有就引用；没有再起组件 token，值引用色阶或标尺
3. 规则写进 `styles.css`，选择器只 `var()`
4. 图标查 `vamis-icons.ts`，没有就从 Amis 转写一个登记进去
5. 运行时的值走 `:style`，其余走 class
6. `pnpm test` → `pnpm sdk:build` → `pnpm compare --page <type>`（动了标尺或原语跑全量，窄屏再加 `--mobile`）
7. 文档站浅色、深色各看一遍，浮层要打开看

## 11. 还没做完的

- 模板里的 Tailwind 字号类 33 处、语义色类 44 处还在，下一批先 `FieldSet` / `InputRating` / `InputRichText` / `DatePartRange` / `BarCode` / `QRCode`。按渲染器迁成 `.vamis-xxx` + token
- `CRUD` 仍自己画单元格，表格的盒模型（单元格 padding、首末列 16）没有跟 `Table` 走。字号已经一致；彻底一致要让 CRUD 复用 `Table` 渲染器（Amis 就是 `type: mode || 'table'`）
- 选择器里数字 `font-weight: 600` 已并到 `--fontWeightNormal`（Amis `_typography.scss` 标题是 400，不加第四档）
- `ui/select/SelectItem.vue` 仍用 lucide `Check`（shadcn 原语内部，不进渲染器守卫）
