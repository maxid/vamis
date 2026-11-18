# Grid Row Start / End 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/grid/row-start-end` · 源码：[grid/row-start-end.md](../../../../website/src/style/grid/row-start-end.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

子项怎么占行、从哪条线起止。父级先写 `display: grid` 和行模板（见 [Grid Template Rows](/style/grid/rows)）。`row-span-*` 跨 N 行；`row-span-full` 从 1 到 -1 铺满；`row-start-*` / `row-end-*` 钉在网格线上（4 行网格的线是 1–5）。舞台钉死 `h-80` + `grid-rows-4`，每行 70px。`row-span-11` 与 Amis helper 一样写成 `span 11 / span 1`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把跨行类打在子项上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：子项怎么占行、从哪条线起止。父级先写 `display: grid` 和行模板（见 [Grid Template Rows](/style/grid/rows)）。`row-span-*` 跨 N 行；`row-span-full` 从 1 到 -1 铺满；`row-start-*` / `row-end-*` 钉在网格线上（4 行网格的线是 1–5）。舞台钉死 `h-80` + `grid-rows-4`，每行 70px。`row-span-11` 与 Amis helper 一样写成 `span 11 / span 1`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把跨行类打在子项上。
本页共 **42** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `row-auto` | `grid-row: auto` |
| `row-span-1` | `grid-row: span 1 / span 1` |
| `row-span-2` | `grid-row: span 2 / span 2` |
| `row-span-3` | `grid-row: span 3 / span 3` |
| `row-span-4` | `grid-row: span 4 / span 4` |
| `row-span-5` | `grid-row: span 5 / span 5` |
| `row-span-6` | `grid-row: span 6 / span 6` |
| `row-span-7` | `grid-row: span 7 / span 7` |
| `row-span-8` | `grid-row: span 8 / span 8` |
| `row-span-9` | `grid-row: span 9 / span 9` |
| `row-span-10` | `grid-row: span 10 / span 10` |
| `row-span-11` | `grid-row: span 11 / span 1` |
| `row-span-12` | `grid-row: span 12 / span 12` |
| `row-span-full` | `grid-row: 1 / -1` |

> 完整 42 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
