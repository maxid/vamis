# Text Color 样式设计

> 状态：**进行中 55%** · 对应站点：`/style/typography/text-color` · 源码：[typography/text-color.md](../../../../website/src/style/typography/text-color.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

优先用主题语义色（`text-primary` / `text-success` / `text-danger`）。调色盘与 Amis helper 同档 hex（`text-green-700` = `#047857`），SDK 也能用。`text-danger` 同时保留类名，并映射到 `text-destructive`。完整色阶见表；逐档核还在色盘表。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层 `<p>` 上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；按 helper 支持状态/响应式前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：优先用主题语义色（`text-primary` / `text-success` / `text-danger`）。调色盘与 Amis helper 同档 hex（`text-green-700` = `#047857`），SDK 也能用。`text-danger` 同时保留类名，并映射到 `text-destructive`。完整色阶见表；逐档核还在色盘表。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层 `<p>` 上。
本页共 **102** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `text-transparent` | `color: transparent` |
| `text-current` | `color: currentColor` |
| `text-black` | `color: #000` |
| `text-white` | `color: #fff` |
| `text-primary` | `color: var(--primary)` |
| `text-secondary` | `color: var(--secondary-foreground)` |
| `text-success` | `color: var(--success)` |
| `text-info` | `color: var(--info)` |
| `text-warning` | `color: var(--warning)` |
| `text-destructive` | `color: var(--destructive)` |
| `text-foreground` | `color: var(--foreground)` |
| `text-muted-foreground` | `color: var(--muted-foreground)` |
| `text-gray-50` | `color: #f9fafb` |
| `text-gray-100` | `color: #f3f4f6` |

> 完整 102 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

## 3. 实现

- [styles.css](../../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
- `resolveClassName` / `resolveCssVars`：作者值落地。

## 4. 缺口

色盘表未逐项对齐；颜色 token 映射仍缺。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面、类表/变量表与实现入口已定位
- [x] 通道/前缀/落点边界已盘点
- [ ] 类名与计算值逐项核对
- [ ] 响应式/状态前缀组合可复现
- [ ] 浅色/深色视觉一致
- [ ] 375px 下演示不溢出
- [ ] 与相关样式页互链
