# Background Color 样式设计

> 状态：**进行中 55%** · 对应站点：`/style/background/background-color` · 源码：[background/background-color.md](../../../../website/src/style/background/background-color.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

背景色。优先用语义色 `bg-muted` / `bg-primary`（走 token）。调色盘如 `bg-blue-500` 与 Amis helper 同档 hex。`bg-none` 是 `background: none !important`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；按 helper 支持状态/响应式前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：背景色。优先用语义色 `bg-muted` / `bg-primary`（走 token）。调色盘如 `bg-blue-500` 与 Amis helper 同档 hex。`bg-none` 是 `background: none !important`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。
本页共 **104** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `bg-none` | `background: none !important` |
| `bg-transparent` | `background: transparent` |
| `bg-current` | `background: currentColor` |
| `bg-black` | `background: #000` |
| `bg-white` | `background: #fff` |
| `bg-primary` | `background: var(--primary)` |
| `bg-secondary` | `background: var(--secondary)` |
| `bg-success` | `background: var(--success)` |
| `bg-info` | `background: var(--info)` |
| `bg-warning` | `background: var(--warning)` |
| `bg-danger` | `background: var(--destructive)` |
| `bg-destructive` | `background: var(--destructive)` |
| `bg-muted` | `background: var(--muted)` |
| `bg-card` | `background: var(--card)` |

> 完整 104 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
