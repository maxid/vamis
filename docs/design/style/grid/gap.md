# Gap 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/grid/gap` · 源码：[grid/gap.md](../../../../website/src/style/grid/gap.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

格子之间的缝。写在 `display: grid` 或 `flex` 的容器上，不是子项 margin。`gap` 行列一起；`gap-x` 只列缝、`gap-y` 只行缝。档位是 Tailwind spacing（`gap-2` = 8px），不是 cxd `--gap-xs…xl`。舞台钉死 `w-80`（320px），两列时用相邻盒子的 left / top 对缝。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 gap 类打在内层 grid 上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：格子之间的缝。写在 `display: grid` 或 `flex` 的容器上，不是子项 margin。`gap` 行列一起；`gap-x` 只列缝、`gap-y` 只行缝。档位是 Tailwind spacing（`gap-2` = 8px），不是 cxd `--gap-xs…xl`。舞台钉死 `w-80`（320px），两列时用相邻盒子的 left / top 对缝。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 gap 类打在内层 grid 上。
本页共 **111** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `gap-px` | `gap: 0.0625rem;` |
| `gap-x-px` | `column-gap: 0.0625rem;` |
| `gap-y-px` | `row-gap: 0.0625rem;` |
| `gap-0` | `gap: 0;` |
| `gap-x-0` | `column-gap: 0;` |
| `gap-y-0` | `row-gap: 0;` |
| `gap-none` | `gap: 0;` |
| `gap-x-none` | `column-gap: 0;` |
| `gap-y-none` | `row-gap: 0;` |
| `gap-0.5` | `gap: 0.125rem;` |
| `gap-x-0.5` | `column-gap: 0.125rem;` |
| `gap-y-0.5` | `row-gap: 0.125rem;` |
| `gap-1` | `gap: 0.25rem;` |
| `gap-x-1` | `column-gap: 0.25rem;` |

> 完整 111 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

## 3. 实现

- [styles.css](../../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
- `resolveClassName` / `resolveCssVars`：作者值落地。

## 4. 缺口

主路径已对齐；深色/375px 视觉验收未成体系。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面、类表/变量表与实现入口已定位
- [x] 通道/前缀/落点边界已盘点
- [ ] 类名与计算值逐项核对
- [ ] 响应式/状态前缀组合可复现
- [ ] 浅色/深色视觉一致
- [ ] 375px 下演示不溢出
- [ ] 与相关样式页互链
