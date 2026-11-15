# Vamis 主题：Amis 样式系统 → shadcn token

- 日期：2026-10-21
- 状态：落地（token / 盒子辅助类 / IR metadata.style / 四套 `--colors-*` 主题包；JS `registerTheme` 仍 P1）
- 范围：token、密度、按钮/表单/表格/卡片/对话框。**盒子尽量像素级对齐 cxd**；主色走 `--primary`（云舍 pack 的 brand-5）；不搬 `cxd-` 前缀
- 关联：`2026-10-20-vamis-runtime-semantics-design.md` §13（D12）；标尺与条款见 [样式规范](./2026-11-15-vamis-style-standard.md)

## 1. Amis 样式系统要点

Amis 用 **CSS 变量主题** + 可选 **helper.css 辅助类**，不是组件内写死颜色。

| 层 | 是什么 | 代表 |
|---|---|---|
| 主题包 | 一套 CSS 变量 + 组件选择器前缀 | `cxd`（云舍，默认）、`antd`、`ang`、`dark` |
| 设计 token | `--colors-*` / `--fonts-*` / `--borders-*` / `--sizes-*` / `--shadows-*` | `_cxd-variables.scss` |
| 语义变量 | 把 token 接到组件 | `_properties.scss`：`--primary`、`--Form-input-height`、`--Table-*` |
| 页面覆盖 | `page.cssVars` | `{ "--primary": "#CD3632" }` |
| 辅助类 | 精简版 Tailwind：`m:` / `pc:`、`hover:` | `helper.css`，与主题文件分离 |
| 选择器前缀 | `.cxd-Button` 等 | **不搬前缀**；能力落到 token / variants / utility |

### 1.1 主题差异

- **cxd**：品牌蓝 `#2468f2`（`--colors-brand-5`），中性色 11 阶灰，圆角 4px，输入高度 32px，字号 14px。后台完成度最高。
- **antd**：更接近 Ant Design（表头 `#fafafa`、选中行浅蓝）。变量集相同，色阶不同。
- **dark**：中性色反相，品牌改为 `#1677ff`，错误/警告更亮，保证暗底对比。

### 1.2 关键量

| 角色 | Amis 变量 | 典型值（cxd） |
|---|---|---|
| 页面底 | `--body-bg` | `#fff` / fill-11 |
| 主色 | `--primary` / `--primary-onHover` / `--primary-onActive` | brand-5/6/4 |
| 状态色 | `--success` `--info` `--warning` `--danger` | 绿/蓝/橙/红，各带 hover/active |
| 文字 | `--text-color` `--text--muted-color` `--text--loud-color` | 14px 基线，muted 为中灰 |
| 边框/圆角 | `--borderColor` `--borderRadius` | line-8 / 4px |
| 间距 | `--gap-xs/sm/base/md/lg` | 4 / 8 / 12 / 16 / 20 |
| 阴影 | `--shadows-shadow-sm` … `2xl` | 轻投影，表格/弹层用 sm–lg |
| 表单 | `--Form-input-height` `--Form-fontSize` `--Form-label-*` | 32px / 14px / 水平标签右对齐 |
| 按钮 | `level`: primary / default / secondary / success / info / warning / danger / link / light | 层级靠 level，不是堆 class |
| 表格 | 表头浅底、行 hover、选中底、1px 分割 | 后台扫描密度 |
| 面板 | Page 标题在外，Form/CRUD 自己成 panel | 避免「卡套卡」 |

辅助类只是可选覆盖（`border-solid`、`rounded-xl`、`m:text-red-500`）。Vamis 用 Tailwind 本体覆盖，不引入 `helper.css`。

## 2. 映射到 shadcn 哲学

原则：**一套 CSS 变量，组件用 variant，不造第二套 `cxd-` 前缀。** 另一条：**默认自适应**——布局容器和表单控件不写 `size`/`className` 就吃满槽位，配置只用来收窄。

**判断标准**（遵循 / 违反 shadcn·Tailwind）见 `.cursor/rules/style.mdc` 文首：先分层（作者 class / 默认 chrome / 原语配方），再套闸门。默认 chrome 写 `p-4`、`bg-card` 是违反；窄屏 Form 留 Card 原语、底改 `--background` 是「留原语、换配方」，算遵循。不要把「不像 shadcn dashboard」当成越界。

| Amis | shadcn-vue / vamis-ui |
|---|---|
| `--body-bg` / `--background` | `--background` |
| `--text-color` / `--text--loud-color` | `--foreground` |
| `--text--muted-color` | `--muted-foreground` |
| `--primary` + onHover/onActive | `--primary` + `hover:bg-primary/90` |
| `--secondary` | `--secondary` |
| `--danger` | `--destructive` |
| `--success` / `--warning` / `--info` | `--success` / `--warning` / `--info`（补齐，仍走 token） |
| `--borderColor` | `--border` / `--input` |
| `--primary` 聚焦环 | `--ring` |
| `--borderRadius` 4px | `--radius: 0.25rem` |
| `--Tooltip-*` / `--borderRadiusLg` 8px | `:root --tooltip-*`（不是 shadcn `--popover` / `--radius`；选择器只 `var()`） |
| `--Badge-*` | `:root --badge-*`（不是 shadcn `Badge`；ribbon 切角 + dot `scale(0.8)→3.2`） |
| `--Remark-*` | `:root --remark-*`（不是 shadcn Tooltip；16px 问号徽标，悬停 `#ff9326`） |
| `--Form-input-height` 32px | 控件默认 `h-8`（16px 根下 = 32px） |
| `--fontSizeBase` 14px | `.vamis-root` `14px` / `line-height: 1.5`，**不改** `html` 根字号（避免 Tailwind rem 塌缩） |
| `--gap-*` | Tailwind spacing |
| `--shadows-*` | `shadow-xs/sm/md/lg` |
| `level: primary` | `variant="default"` |
| `level: default` | `outline`（白底描边） |
| `level: secondary` | 实心中灰 + 白字（`--button-secondary`，不改全局 `--secondary`） |
| `level: light` | 浅底深字（`--button-light`） |
| `level: dark` | 实心炭灰 + 白字（`--button-dark`） |
| `level: danger` | `destructive` |
| `level: success/warning/info` | 同名 variant；info 走 `--button-info`（cxd 与 primary 同色） |
| `level: link` | `link` |
| `page.cssVars` | 写到页面根 style；别名映射到 shadcn 名 |
| `m:` / `pc:` | 已接到间距 + 宽度 helper（&lt;768 / ≥768）；作者也可写 Tailwind `max-md:` / `md:` |
| `.cxd-Form` 等 | **禁止前缀**（盒子走 token，不走 BEM） |

组件变体是唯一皮肤入口。主题切换 = 换 `:root` / `[data-theme]` / `.dark` 的 `--colors-*` 色阶，不是换 class 前缀。`--primary` / `--success` / `--tag-*` 只 alias 色阶，禁止组件再写死 hex。Playground 顶栏只有一套主题控件：**云舍 / 仿 AntD / ang**（`html[data-theme]`）+ 浅色/深色（Amis 第四包 dark）。不要再并排 5 色点。`registerTheme` JS API 仍 P1。

## 3. 视觉方向（后台产品水标）

- 对象：YAML 生成的后台页（表单 / CRUD / 弹窗）。
- 受众：操作员填表、扫表、改一行数据。
- 签名：Amis 系统字体栈（`--fonts-base-family`）+ 32px 控件节奏。不嵌入 webfont / 商用字体文件。主色默认云舍 brand-5 `#2468f2`，走 `--primary`。
- 不做：奶油衬线、酸绿暗色、报纸细线；不做第二套主题 class。

light / dark 都写完整 semantic token。`color-scheme` 跟主题走。

## 4. 待决：Vamis chrome 圆角开关（2026-11-16）

**不要做成组件字段。** Page / Form 上的 `rounded: true` 只是过渡；直角还是圆角是整份运行时的优化，用**一个开关**切 Vamis 组装壳，不是每个 type 自己声明。

| 要 | 不要 |
|----|------|
| 默认对齐 Amis：Page **0**、Panel **4px**（`--radius`） | 默认改成 8px / Card `rounded-lg` |
| 一个开关（env / 根属性 / token，落地时再定）打开后，chrome 一起走 `--borderRadiusLg` | schema 上 `page.rounded` / `form.rounded` 各写一份 |
| 范围 = Vamis chrome：Page、Form 面板、Dialog / Drawer 壳、Card、CRUD / Panel 标题栏这类组装盒 | 作者 `className` helper（`rounded-md` 仍是 6px）；按钮、输入、Tooltip、Badge 自己的 Amis 圆角 |

落地时：开关进 token（例如根上 `data-vamis-radius=round` 改 `--page-radius` / `--panel-radius`），删组件 `rounded` 字段，对照默认仍关着以免盒模型相对 Amis 假红。
