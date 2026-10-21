# Vamis 主题：Amis 样式系统 → shadcn token

- 日期：2026-10-21
- 状态：落地（token / 盒子辅助类 / IR metadata.style；`registerTheme` 仍 P1）
- 范围：token、密度、按钮/表单/表格/卡片/对话框。**盒子数字对齐 cxd**；配色独立；不含 `cxd-` 类名
- 关联：`2026-10-20-vamis-runtime-semantics-design.md` §13（D12）

## 1. Amis 样式系统要点

Amis 用 **CSS 变量主题** + 可选 **helper.css 辅助类**，不是组件内写死颜色。

| 层 | 是什么 | 代表 |
|---|---|---|
| 主题包 | 一套 CSS 变量 + 组件选择器前缀 | `cxd`（云舍，默认）、`antd`、`ang`、`dark` |
| 设计 token | `--colors-*` / `--fonts-*` / `--borders-*` / `--sizes-*` / `--shadows-*` | `_cxd-variables.scss` |
| 语义变量 | 把 token 接到组件 | `_properties.scss`：`--primary`、`--Form-input-height`、`--Table-*` |
| 页面覆盖 | `page.cssVars` | `{ "--primary": "#CD3632" }` |
| 辅助类 | 精简版 Tailwind：`m:` / `pc:`、`hover:` | `helper.css`，与主题文件分离 |
| 选择器前缀 | `.cxd-Button` 等 | **Vamis 不复刻** |

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
| `--Form-input-height` 32px | 控件默认 `h-8`（16px 根下 = 32px） |
| `--fontSizeBase` 14px | `text-sm`，**不改** `html` 根字号（避免 Tailwind rem 塌缩） |
| `--gap-*` | Tailwind spacing |
| `--shadows-*` | `shadow-xs/sm/md/lg` |
| `level: primary` | `variant="default"` |
| `level: default/light` | `outline` / `ghost` |
| `level: danger` | `destructive` |
| `level: success/warning/info` | 同名 variant |
| `level: link` | `link` |
| `page.cssVars` | 写到页面根 style；别名映射到 shadcn 名 |
| `m:` / `pc:` | 已接到间距 + 宽度 helper（&lt;768 / ≥768）；作者也可写 Tailwind `max-md:` / `md:` |
| `.cxd-Form` 等 | **禁止**（盒子走 token，不走 BEM） |

组件变体是唯一皮肤入口。主题切换 = 换 `:root` / `.dark` 变量，不是换 class 前缀。Playground 顶栏色点改 `html[data-accent]` 的 `--accent-h`，从而带动 `--primary` / `--ring`；成功/警告/危险仍是固定语义色。

## 3. 视觉方向（后台产品水标）

- 对象：YAML 生成的后台页（表单 / CRUD / 弹窗）。
- 受众：操作员填表、扫表、改一行数据。
- 签名：Amis 系统字体栈（`--fonts-base-family`）+ 32px 控件节奏。不嵌入 webfont / 商用字体文件。主色用墨蓝（不是抄 `#2468f2`，也不是安全橙）。
- 不做：奶油衬线、酸绿暗色、报纸细线；不做第二套主题 class。

light / dark 都写完整 semantic token。`color-scheme` 跟主题走。
